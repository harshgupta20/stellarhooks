import { type ApiResponseBody } from "@/server/http/api-response";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Fetch JSON from our own API and unwrap the { data, error } envelope.
 * Throws ApiClientError on a non-2xx / error response.
 */
export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  let body: ApiResponseBody<T> | null = null;
  try {
    body = (await res.json()) as ApiResponseBody<T>;
  } catch {
    // Non-JSON response.
  }

  if (!res.ok || !body || body.error) {
    const err = body?.error;
    throw new ApiClientError(
      res.status,
      err?.message ?? `Request failed with status ${res.status}`,
      err?.code ?? "request_failed",
      err?.details,
    );
  }

  return body.data;
}
