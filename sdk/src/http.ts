import type { PageMeta } from "./types";

/** Error thrown for any non-2xx API response. */
export class StellarPlatformError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "StellarPlatformError";
  }
}

interface Envelope<T> {
  data: T | null;
  error: { message: string; code: string; details?: unknown } | null;
  meta?: PageMeta;
}

export interface HttpClientOptions {
  /** API base URL, e.g. https://your-app.vercel.app. */
  baseUrl?: string;
  /** Optional custom fetch implementation (defaults to global fetch). */
  fetch?: typeof fetch;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(
    private readonly apiKey: string,
    options: HttpClientOptions = {},
  ) {
    if (!apiKey) throw new StellarPlatformError(0, "An API key is required", "missing_api_key");
    this.baseUrl = (options.baseUrl ?? "http://localhost:3000").replace(/\/$/, "");
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  private buildQuery(params?: object): string {
    if (!params) return "";
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : "";
  }

  async request<T>(
    method: string,
    path: string,
    opts: { query?: object; body?: unknown } = {},
  ): Promise<{ data: T; meta?: PageMeta }> {
    const res = await this.fetchImpl(`${this.baseUrl}/api/v1${path}${this.buildQuery(opts.query)}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    let envelope: Envelope<T> | null = null;
    try {
      envelope = (await res.json()) as Envelope<T>;
    } catch {
      // non-JSON
    }

    if (!res.ok || !envelope || envelope.error) {
      const err = envelope?.error;
      throw new StellarPlatformError(
        res.status,
        err?.message ?? `Request failed with status ${res.status}`,
        err?.code ?? "request_failed",
        err?.details,
      );
    }

    return { data: envelope.data as T, meta: envelope.meta };
  }
}
