/**
 * Skeleton Loaders reutilizáveis para estados de carregamento.
 * Substituem spinners genéricos por "ghosts" do layout real.
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Skeleton base com animação pulse */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-neutral-200 dark:bg-[#1C1C1E]",
        className
      )}
    />
  );
}

/** Skeleton para uma linha de tabela de alunos */
export function UserTableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-5 w-20 rounded" />
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-5 w-16 rounded" />
      </td>
      <td className="py-4 px-6">
        <Skeleton className="h-5 w-20 rounded" />
      </td>
      <td className="py-4 px-6 text-center">
        <Skeleton className="h-5 w-10 mx-auto rounded-full" />
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

/** Skeleton para a tabela completa de alunos */
export function UserTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface-container">
      {/* Search skeleton */}
      <div className="p-4">
        <Skeleton className="h-12 w-full max-w-sm rounded-lg" />
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-neutral-50 dark:bg-[#1c1b1b]">
            {["Aluno", "Função", "Faixa", "Categoria", "Ativo", "Gerenciar"].map((h) => (
              <th key={h} className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <UserTableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Skeleton para um card de estatística do dashboard */
export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border p-6 bg-surface-container">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/** Skeleton para a grade de stats do dashboard */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton para card mobile de aluno */
export function UserCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-4" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-5 w-20 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-6 w-16 rounded" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#2C2C2E" }}>
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton para lista de histórico */
export function HistoryListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 flex items-center gap-4" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}
