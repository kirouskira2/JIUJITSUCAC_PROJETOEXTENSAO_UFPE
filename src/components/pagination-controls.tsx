"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  // Gera array de páginas visíveis (max 5 ao redor da atual)
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | "...")[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev && i - prev > 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      {/* Contador */}
      <span className="text-xs font-medium" style={{ color: "#8E8E93" }}>
        {from}–{to} de {totalCount} registros
      </span>

      {/* Botões de navegação */}
      <div className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1C1C1E]"
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          aria-label="Página anterior"
        >
          <IconChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        {getVisiblePages().map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs" style={{ color: "#8E8E93" }}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={`w-9 h-9 rounded-lg border text-xs font-bold transition-colors ${
                p === page
                  ? "border-red-600 bg-red-600/10 text-red-500"
                  : "hover:bg-[#1C1C1E]"
              }`}
              style={p !== page ? { borderColor: "#2C2C2E", color: "#F2F2F7" } : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Próxima */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1C1C1E]"
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          aria-label="Próxima página"
        >
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
