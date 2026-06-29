import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "./errors";

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiErrorBody {
  message: string;
  code: string;
  details?: unknown;
}

export type ApiResponseBody<T> =
  | { data: T; error: null; meta?: ApiMeta }
  | { data: null; error: ApiErrorBody };

export function ok<T>(data: T, init?: { status?: number; meta?: ApiMeta }): NextResponse {
  return NextResponse.json<ApiResponseBody<T>>(
    { data, error: null, ...(init?.meta ? { meta: init.meta } : {}) },
    { status: init?.status ?? 200 },
  );
}

export function created<T>(data: T): NextResponse {
  return ok(data, { status: 201 });
}

function errorResponse(status: number, body: ApiErrorBody): NextResponse {
  return NextResponse.json<ApiResponseBody<never>>({ data: null, error: body }, { status });
}

/**
 * Translate any thrown value into a typed JSON error response. Zod and ApiError
 * map to precise status codes; everything else is a 500.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return errorResponse(422, {
      message: "Validation failed",
      code: "validation_error",
      details: error.flatten(),
    });
  }
  if (error instanceof ApiError) {
    return errorResponse(error.status, {
      message: error.message,
      code: error.code,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
  }
  console.error("[api] unhandled error:", error);
  return errorResponse(500, { message: "Something went wrong", code: "internal_error" });
}
