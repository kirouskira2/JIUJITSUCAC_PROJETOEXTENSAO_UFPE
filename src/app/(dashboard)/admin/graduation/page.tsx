import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Medal, History, ChevronRight, UserCheck } from "lucide-react";
import { getStudentsReadyForGraduation, getGraduationHistory } from "@/actions/graduation";

// Helper para cor da faixa
const getBeltColor = (belt: string) => {
  const colors: Record<string, string> = {
    "Branca": "#F2F2F7",
    "Cinza": "#8E8E93",
    "Amarela": "#FFCC00",
    "Laranja": "#FF9500",
    "Verde": "#34C759",
    "Azul": "#0A84FF",
    "Roxa": "#BF5AF2",
    "Marrom": "#A2845E",
    "Preta": "#1C1C1E"
  };
  return colors[belt] || "#F2F2F7";
};

export default async function AdminGraduationPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  // Buscar dados reais
  const { data: studentsReady } = await getStudentsReadyForGraduation();
  const { data: fullHistory } = await getGraduationHistory();

  const candidates = studentsReady || [];
  const recentPromotions = (fullHistory || []).slice(0, 5); // Apenas as 5 últimas na tela principal

  // Filtrar os alunos que já bateram 100% da meta para mostrar em destaque
  const readyCount = candidates.filter(c => c.attendanceCount >= c.requiredClasses).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6" style={{ borderBottom: "1px solid #2C2C2E" }}>
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight" style={{ color: "#F2F2F7" }}>
            Módulo de Graduação
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
            Acompanhe o progresso e realize a cerimônia de graduação.
          </p>
        </div>
        <Link 
          href="/admin/graduation/ceremony"
          className="h-[54px] px-6 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors hover:bg-red-700 w-full md:w-auto"
          style={{ background: "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(220,38,38,0.2)" }}
        >
          <span>🥋 INICIAR CERIMÔNIA</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg" style={{ color: "#F2F2F7" }}>Fila de Graduação (≥ 80% da meta)</h3>
            <span className="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5" style={{ background: "#2a2a2a", color: "#8E8E93", borderColor: "#2C2C2E" }}>
              <UserCheck className="w-3.5 h-3.5" />
              {candidates.length} Acompanhamentos
            </span>
          </div>

          <div className="space-y-3">
            {candidates.map(candidate => {
              const isReady = candidate.attendanceCount >= candidate.requiredClasses;
              const percentage = Math.min(100, Math.round((candidate.attendanceCount / candidate.requiredClasses) * 100));

              return (
                <div 
                  key={candidate.profile.id} 
                  className={`rounded-xl border p-4 flex flex-col sm:flex-row items-center gap-4 transition-colors group ${isReady ? 'border-[#34C759]' : 'hover:border-[#dc2626]'}`}
                  style={{ background: "#111111", borderColor: isReady ? "#34C759" : "#2C2C2E" }}
                >
                  {/* Avatar Placeholder */}
                  <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-surface shrink-0" style={{ borderColor: isReady ? "#34C759" : "#2C2C2E" }}>
                    <span className="font-bold text-xl" style={{ color: "#F2F2F7" }}>{candidate.profile.fullName.charAt(0)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h4 className="font-semibold text-base" style={{ color: "#F2F2F7" }}>{candidate.profile.fullName}</h4>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border" style={{ background: getBeltColor(candidate.profile.belt || "Branca"), borderColor: "#2C2C2E" }}></span>
                        <span className="text-xs uppercase font-semibold" style={{ color: "#8E8E93" }}>{candidate.profile.belt || "Branca"}</span>
                      </div>
                      <ArrowRight className="w-4 h-4" style={{ color: "#48484A" }} />
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border" style={{ background: getBeltColor(candidate.nextBelt), borderColor: "#2C2C2E" }}></span>
                        <span className="text-xs uppercase font-bold" style={{ color: getBeltColor(candidate.nextBelt) }}>{candidate.nextBelt}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 w-full max-w-[200px] h-1.5 rounded-full overflow-hidden mx-auto sm:mx-0" style={{ background: "#2C2C2E" }}>
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: isReady ? "#34C759" : "#dc2626" }}></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="font-mono text-2xl font-bold leading-none" style={{ color: isReady ? "#34C759" : "#F2F2F7" }}>
                      {candidate.attendanceCount}/{candidate.requiredClasses}
                    </div>
                    <div className="text-[10px] uppercase font-semibold mt-1 mb-3" style={{ color: "#8E8E93" }}>
                      Aulas
                    </div>
                    {isReady ? (
                      <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(52, 199, 89, 0.1)", color: "#34C759" }}>
                        Apto
                      </span>
                    ) : (
                      <span className="text-xs font-semibold" style={{ color: "#8E8E93" }}>
                        Faltam {candidate.requiredClasses - candidate.attendanceCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {candidates.length === 0 && (
              <div className="text-center py-12 border rounded-xl border-dashed" style={{ borderColor: "#2C2C2E" }}>
                <p style={{ color: "#8E8E93" }}>Nenhum aluno próximo da meta de graduação no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mini Stats Card */}
          <div className="border rounded-xl p-6 relative overflow-hidden" style={{ background: "#131313", borderColor: "#2C2C2E" }}>
            <div className="absolute -right-4 -top-4 opacity-30 transform rotate-12 pointer-events-none" style={{ color: "#353534" }}>
              <Medal className="w-32 h-32" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 relative z-10" style={{ color: "#8E8E93" }}>
              Alunos Aptos (100%)
            </h3>
            <div className="font-display text-5xl font-black relative z-10" style={{ color: readyCount > 0 ? "#34C759" : "#e9c349" }}>
              {readyCount}
            </div>
          </div>

          {/* Historical Section */}
          <div className="border rounded-xl p-6 flex flex-col h-full" style={{ background: "#1c1b1b", borderColor: "#2C2C2E" }}>
            <h3 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: "#F2F2F7" }}>
              <History className="w-5 h-5" style={{ color: "#8E8E93" }} />
              Últimas Graduações
            </h3>
            
            {recentPromotions.length > 0 ? (
              <ul className="space-y-4 flex-1">
                {recentPromotions.map((promo) => (
                  <li key={promo.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0" style={{ borderColor: "rgba(44,44,46,0.5)" }}>
                    <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: getBeltColor(promo.newBelt) }}></div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#F2F2F7" }}>
                        {promo.profileName} <span className="font-normal text-xs ml-1" style={{ color: "#8E8E93" }}>→ {promo.newBelt}</span>
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "#48484A" }}>
                        {new Date(promo.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm py-4 flex-1" style={{ color: "#8E8E93" }}>Nenhuma graduação registrada ainda.</p>
            )}

            <Link 
              href="/admin/graduation/history"
              className="w-full mt-4 py-3 border-t text-center text-xs font-bold uppercase tracking-wider transition-colors hover:text-red-700 block" 
              style={{ color: "#dc2626", borderColor: "#2C2C2E" }}
            >
              Ver Histórico Completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
