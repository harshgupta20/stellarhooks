/** Domain error with an HTTP status, thrown by services and translated by route handlers. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const Errors = {
  unauthorized: (message = "Authentication required") => new ApiError(401, message, "unauthorized"),
  forbidden: (message = "You do not have access to this resource") =>
    new ApiError(403, message, "forbidden"),
  notFound: (resource = "Resource") => new ApiError(404, `${resource} not found`, "not_found"),
  conflict: (message: string) => new ApiError(409, message, "conflict"),
  badRequest: (message: string, details?: unknown) =>
    new ApiError(400, message, "bad_request", details),
  validation: (details: unknown) =>
    new ApiError(422, "Validation failed", "validation_error", details),
  tooManyRequests: (message = "Too many requests") =>
    new ApiError(429, message, "rate_limited"),
  internal: (message = "Something went wrong") => new ApiError(500, message, "internal_error"),
};
