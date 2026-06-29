import { PAGINATION } from "@/lib/constants";

export interface PageParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function parsePageParams(input: {
  page?: string | number | null;
  pageSize?: string | number | null;
}): PageParams {
  const page = Math.max(1, Number(input.page) || 1);
  const requested = Number(input.pageSize) || PAGINATION.defaultPageSize;
  const pageSize = Math.min(Math.max(1, requested), PAGINATION.maxPageSize);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPageMeta(params: PageParams, total: number): PageMeta {
  return {
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}
