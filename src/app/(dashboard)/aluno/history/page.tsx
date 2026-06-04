import { getMyAttendance } from "@/actions/checkin";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { DeleteCheckinButton } from "./delete-checkin-button";

export default async function HistoryPage() {
  const { data: attendanceList } = await getMyAttendance({});
  const total = attendanceList?.length || 0;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/aluno"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center shrink-0 transition-colors hover:border-[#dc2626] hover:text-[#dc2626] bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-500 dark:text-[#8E8E93]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
              Meu Histórico
            </h1>
            <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
              {total} presenças registradas no tatame
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {attendanceList && attendanceList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendanceList.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-border p-4 flex items-center gap-4 transition-colors hover:border-[#dc2626]/30 bg-surface-container"
            >
              {/* Date */}
              <div
                className="w-14 h-14 rounded-xl border border-border flex flex-col items-center justify-center shrink-0 bg-neutral-100 dark:bg-[#1C1C1E]"
              >
                <span className="font-mono text-lg font-bold leading-none text-[#dc2626]">
                  {new Date(item.checkedInAt).toLocaleDateString("pt-BR", { day: "2-digit" })}
                </span>
                <span className="text-xs uppercase text-neutral-500 dark:text-[#8E8E93]">
                  {new Date(item.checkedInAt).toLocaleDateString("pt-BR", { month: "short" })}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-neutral-900 dark:text-[#F2F2F7]">
                  {item.workout?.techniqueName || "Treino Livre"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-neutral-500 dark:text-[#8E8E93]">
                    {new Date(item.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {item.workout?.principle && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#e9c349] border border-amber-200 dark:border-amber-500/20 truncate max-w-[120px]"
                    >
                      P.{item.workout.principle.number} — {item.workout.principle.titlePt}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions (Hygiene + Delete) */}
              <div className="shrink-0 flex items-center gap-3">
                {item.hygieneConfirmed ? (
                  <span title="Higiene confirmada">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-[#34C759]" />
                  </span>
                ) : (
                  <span title="Sem higiene confirmada">
                    <XCircle className="w-5 h-5 text-neutral-400 dark:text-[#48484A]" />
                  </span>
                )}
                <DeleteCheckinButton attendanceId={item.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-3xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center gap-3 bg-neutral-50 dark:bg-transparent"
        >
          <span className="text-4xl">🥋</span>
          <p className="font-display text-xl font-black uppercase text-neutral-900 dark:text-[#F2F2F7]">
            Nenhuma presença ainda
          </p>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Faça seu primeiro check-in no tatame!
          </p>
          <Link
            href="/aluno/scanner"
            className="mt-2 h-10 px-6 rounded-full text-sm font-semibold flex items-center gap-2 bg-[#dc2626] text-white hover:opacity-90 transition-opacity"
          >
            Abrir Scanner QR
          </Link>
        </div>
      )}
    </div>
  );
}
