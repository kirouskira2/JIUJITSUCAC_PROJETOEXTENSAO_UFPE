import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getAllAttendance } from "@/actions/checkin";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default async function MonitorHistoryPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin" && sessionData?.profile.role !== "monitor") {
    redirect("/aluno");
  }

  const { data: attendanceList } = await getAllAttendance({});
  const total = attendanceList?.length || 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4" style={{ borderBottom: "1px solid #2C2C2E" }}>
        <Link
          href="/monitor"
          className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors hover:border-[#dc2626]"
          style={{ background: "#1C1C1E", borderColor: "#2C2C2E", color: "#dc2626" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight" style={{ color: "#F2F2F7" }}>
            Histórico do Tatame
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
            {total} presenças registradas no total
          </p>
        </div>
      </div>

      {/* List */}
      {attendanceList && attendanceList.length > 0 ? (
        <div className="flex flex-col gap-2">
          {attendanceList.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border p-4 flex items-center gap-4 transition-colors hover:border-[#dc2626]/30"
              style={{ background: "#111111", borderColor: "#2C2C2E" }}
            >
              {/* Date */}
              <div
                className="w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0"
                style={{ background: "#1C1C1E", borderColor: "#2C2C2E" }}
              >
                <span className="font-mono text-lg font-bold leading-none" style={{ color: "#dc2626" }}>
                  {new Date(item.checkedInAt).toLocaleDateString("pt-BR", { day: "2-digit" })}
                </span>
                <span className="text-xs uppercase" style={{ color: "#8E8E93" }}>
                  {new Date(item.checkedInAt).toLocaleDateString("pt-BR", { month: "short" })}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: "#F2F2F7" }}>
                  {item.profile?.fullName || "Aluno"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-medium" style={{ color: "#8E8E93" }}>
                    {new Date(item.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {item.workout?.principle && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(233,195,73,0.1)", color: "#e9c349", border: "1px solid rgba(233,195,73,0.2)" }}
                    >
                      P.{item.workout.principle.number}
                    </span>
                  )}
                </div>
              </div>

              {/* Hygiene badge */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                {item.hygieneConfirmed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" style={{ color: "#34C759" }} />
                    <span className="text-[10px] uppercase font-bold" style={{ color: "#34C759" }}>Higiene Ok</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" style={{ color: "#48484A" }} />
                    <span className="text-[10px] uppercase font-bold" style={{ color: "#48484A" }}>Sem Info</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl border border-dashed flex flex-col items-center justify-center py-16 text-center gap-3"
          style={{ borderColor: "#2C2C2E" }}
        >
          <span className="text-4xl">🥋</span>
          <p className="font-display text-xl font-black uppercase" style={{ color: "#F2F2F7" }}>
            Nenhum check-in ainda
          </p>
          <p className="text-sm" style={{ color: "#8E8E93" }}>
            As presenças dos alunos aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
