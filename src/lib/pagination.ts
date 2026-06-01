/**
 * Utilitários de paginação para Server Actions.
 * 
 * Padrão: limit/offset com retorno de metadados de página.
 */

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Valores padrão de paginação */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Calcula o range de offset para a query do Supabase.
 * Retorna [from, to] para usar com `.range(from, to)`.
 */
export function getPaginationRange(params: PaginationParams): { from: number; to: number; page: number; pageSize: number } {
  const page = Math.max(1, params.page || DEFAULT_PAGE);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
  
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  return { from, to, page, pageSize };
}

/**
 * Cria o objeto de metadados de paginação a partir do count total.
 */
export function buildPaginationMeta(page: number, pageSize: number, totalCount: number) {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
