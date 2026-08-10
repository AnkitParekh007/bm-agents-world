const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 2_000_000;

export interface SafeHttpResponse<T> {
  status: number;
  data: T;
}

export class SafeHttpError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "SafeHttpError";
    this.status = status;
  }
}

export async function safeJsonRequest<T>(
  url: string,
  options: {
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
    maxBytes?: number;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<SafeHttpResponse<T>> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      method: options.method ?? "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new SafeHttpError(`Response exceeded ${maxBytes} bytes`, response.status);
    }

    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) {
      throw new SafeHttpError(`Response exceeded ${maxBytes} bytes`, response.status);
    }

    if (!response.ok) {
      const detail = text.trim().slice(0, 600);
      throw new SafeHttpError(
        `Upstream ${options.method ?? "GET"} failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`,
        response.status,
      );
    }

    if (!text.trim()) return { status: response.status, data: undefined as T };

    try {
      return { status: response.status, data: JSON.parse(text) as T };
    } catch {
      throw new SafeHttpError("Upstream response was not valid JSON", response.status);
    }
  } catch (error) {
    if (error instanceof SafeHttpError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new SafeHttpError("Upstream request timed out");
    }
    throw new SafeHttpError(error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timeout);
  }
}

export async function safeGetJson<T>(
  url: string,
  options: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    maxBytes?: number;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<SafeHttpResponse<T>> {
  return safeJsonRequest<T>(url, { ...options, method: "GET" });
}
