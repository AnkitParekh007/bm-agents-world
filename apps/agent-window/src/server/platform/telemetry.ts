import {
  SpanStatusCode,
  context as otelContext,
  trace,
  type Attributes,
  type Span,
} from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";

const SERVICE_NAME = "bm-agents-world-agent-window";
const tracer = trace.getTracer("bm-agents-world", "0.1.0");
let sdk: NodeSDK | undefined;
let initialized = false;

function truthy(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() ?? "");
}

export function telemetryEnabled(): boolean {
  if (process.env.OTEL_SDK_DISABLED?.trim().toLowerCase() === "true") return false;
  return truthy(process.env.BM_OTEL_ENABLED)
    || Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim())
    || Boolean(process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim());
}

export function initTelemetry(): void {
  if (initialized) return;
  initialized = true;
  if (!telemetryEnabled()) return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim();
  const exporter = new OTLPTraceExporter(endpoint ? { url: endpoint } : undefined);
  sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME?.trim() || SERVICE_NAME,
    traceExporter: exporter,
  });
  sdk.start();
}

export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;
  const active = sdk;
  sdk = undefined;
  await active.shutdown();
}

function safeAttributes(attributes?: Record<string, unknown>): Attributes | undefined {
  if (!attributes) return undefined;
  const output: Attributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      output[key] = value;
    } else if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
      output[key] = value as string[];
    }
  }
  return output;
}

function recordFailure(span: Span, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  span.recordException(error instanceof Error ? error : new Error(message));
  span.setStatus({ code: SpanStatusCode.ERROR, message });
}

export function currentTraceContext(): { traceId?: string; spanId?: string } {
  const current = trace.getSpan(otelContext.active())?.spanContext();
  if (!current || !trace.isSpanContextValid(current)) return {};
  return { traceId: current.traceId, spanId: current.spanId };
}

export function startActiveSpan<T>(
  name: string,
  attributes: Record<string, unknown> | undefined,
  fn: (span: Span) => T,
): T {
  return tracer.startActiveSpan(name, { attributes: safeAttributes(attributes) }, (span) => {
    try {
      const result = fn(span);
      if (result && typeof (result as PromiseLike<unknown>).then === "function") {
        return (Promise.resolve(result as PromiseLike<unknown>)
          .then((value) => {
            span.setStatus({ code: SpanStatusCode.OK });
            return value;
          })
          .catch((error) => {
            recordFailure(span, error);
            throw error;
          })
          .finally(() => span.end())) as T;
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      recordFailure(span, error);
      span.end();
      throw error;
    }
  });
}

export function telemetryRuntimeStatus() {
  return {
    enabled: telemetryEnabled(),
    serviceName: process.env.OTEL_SERVICE_NAME?.trim() || SERVICE_NAME,
    exporter: telemetryEnabled() ? "otlp-http" : "disabled",
    endpointConfigured: Boolean(
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim()
      || process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim(),
    ),
  };
}
