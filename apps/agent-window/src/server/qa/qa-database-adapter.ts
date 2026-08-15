import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type {
  AdapterResult,
  CapabilityAdapter,
  CapabilityDefinition,
  ExecutionContext,
} from "../platform/capability-types.js";

const DEFAULT_MAX_ROWS = 1000;
const DEFAULT_TIMEOUT_MS = 15_000;

export interface DatabaseValidationResult {
  rowCount: number;
  rows: Array<Record<string, unknown>>;
}

export interface DatabaseValidationExecutor {
  run(sql: string, options: { maxRows: number; timeoutMs: number }): Promise<DatabaseValidationResult>;
}

/**
 * An operator-curated, read-only validation. The SQL is authored server-side and
 * is never supplied by the model or user. A validation typically selects the
 * offending rows so that zero rows means "pass".
 */
export interface DatabaseValidation {
  id: string;
  projectId: string;
  description?: string;
  sql: string;
  maxRows: number;
  expectZeroRows?: boolean;
  /** Row data may contain sensitive values, so it is withheld unless opted in. */
  returnRows: boolean;
}

function cleanText(value: unknown, max = 200): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function loadValidations(): DatabaseValidation[] {
  const path = process.env.QA_DATABASE_VALIDATIONS_PATH?.trim();
  if (!path) return [];
  const resolved = resolve(path);
  if (!existsSync(resolved)) return [];
  try {
    const document = YAML.parse(readFileSync(resolved, "utf8")) as Record<string, unknown> | undefined;
    const entries = Array.isArray(document?.validations) ? document.validations : [];
    return entries
      .map((raw): DatabaseValidation | undefined => {
        const record = (raw ?? {}) as Record<string, unknown>;
        const id = cleanText(record.id, 100);
        const projectId = cleanText(record.projectId, 100);
        const sql = typeof record.sql === "string" ? record.sql.trim() : "";
        if (!id || !projectId || !sql) return undefined;
        const maxRowsRaw = Number(record.maxRows ?? DEFAULT_MAX_ROWS);
        return {
          id,
          projectId,
          description: cleanText(record.description, 500) || undefined,
          sql,
          maxRows: Number.isFinite(maxRowsRaw) ? Math.max(1, Math.min(maxRowsRaw, 10_000)) : DEFAULT_MAX_ROWS,
          expectZeroRows: record.expectZeroRows === true,
          returnRows: record.returnRows === true,
        };
      })
      .filter((validation): validation is DatabaseValidation => Boolean(validation));
  } catch {
    return [];
  }
}

/** Reports whether the database executor is configured for live validation. */
export function databaseAdapterMode(): "live" | "mock" {
  return process.env.QA_DATABASE_URL?.trim() && loadValidations().length > 0 ? "live" : "mock";
}

/** Real executor. Runs each validation inside a read-only transaction. */
export class PgDatabaseValidationExecutor implements DatabaseValidationExecutor {
  constructor(private readonly connectionString = process.env.QA_DATABASE_URL?.trim()) {}

  async run(sql: string, options: { maxRows: number; timeoutMs: number }): Promise<DatabaseValidationResult> {
    if (!this.connectionString) throw new Error("QA_DATABASE_URL is not configured.");
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: this.connectionString, max: 2, statement_timeout: options.timeoutMs });
    const client = await pool.connect();
    try {
      await client.query("BEGIN TRANSACTION READ ONLY");
      const result = await client.query(sql);
      await client.query("ROLLBACK");
      const rows = (result.rows as Array<Record<string, unknown>>).slice(0, options.maxRows);
      return { rowCount: typeof result.rowCount === "number" ? result.rowCount : rows.length, rows };
    } finally {
      client.release();
      await pool.end().catch(() => undefined);
    }
  }
}

/**
 * Executes an allowlisted, read-only QA data validation against an approved
 * database. Only server-curated SQL from {@link loadValidations} can run; the
 * model supplies a validationId, never SQL. Row data is withheld by default.
 * Falls back to an honest mock when no database or allowlist is configured.
 */
export class DatabaseValidationAdapter implements CapabilityAdapter {
  readonly id = "qa-database-read-adapter";

  constructor(
    private readonly fallback: CapabilityAdapter,
    private readonly executor: DatabaseValidationExecutor = new PgDatabaseValidationExecutor(),
  ) {}

  async execute(
    definition: CapabilityDefinition,
    context: ExecutionContext,
    payload: Record<string, unknown>,
  ): Promise<AdapterResult> {
    if (definition.id !== "qa.database.validation.read") {
      return this.fallback.execute(definition, context, payload);
    }

    const configured = Boolean(process.env.QA_DATABASE_URL?.trim());
    const validations = loadValidations();
    if (!configured || validations.length === 0) {
      return {
        ok: true,
        mode: "mock",
        externalSideEffect: false,
        data: {
          simulated: true,
          note: "No approved database connection or validation allowlist is configured, so no query was executed. Set QA_DATABASE_URL and QA_DATABASE_VALIDATIONS_PATH to enable live read-only validation.",
        },
      };
    }

    const validationId = cleanText(payload.validationId, 100);
    if (!validationId) {
      return { ok: false, mode: "live", externalSideEffect: false, error: "A validationId is required. Call listQaCapabilities/project config for allowlisted validation ids." };
    }

    const validation = validations.find(
      (item) => item.id === validationId && item.projectId.toLowerCase() === context.projectId.toLowerCase(),
    );
    if (!validation) {
      return { ok: false, mode: "live", externalSideEffect: false, error: `Validation ${validationId} is not on the approved allowlist for ${context.projectId}.` };
    }

    try {
      const result = await this.executor.run(validation.sql, { maxRows: validation.maxRows, timeoutMs: DEFAULT_TIMEOUT_MS });
      const passed = validation.expectZeroRows === undefined ? undefined : (validation.expectZeroRows ? result.rowCount === 0 : result.rowCount > 0);
      return {
        ok: true,
        mode: "live",
        externalSideEffect: false,
        data: {
          validationId: validation.id,
          description: validation.description,
          rowCount: result.rowCount,
          passed,
          rows: validation.returnRows ? result.rows.slice(0, validation.maxRows) : undefined,
          readOnly: true,
          source: "postgres",
          note: validation.returnRows
            ? "Read-only validation executed against the approved database."
            : "Read-only validation executed; row data withheld (only the count and verdict are returned).",
        },
      };
    } catch (error) {
      return { ok: false, mode: "live", externalSideEffect: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
