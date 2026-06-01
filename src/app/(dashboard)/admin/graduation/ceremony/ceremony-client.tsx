"use client";

import { useState, useTransition } from "react";
import { GraduationCandidate } from "@/actions/graduation";
import { promoteBelt } from "@/actions/profiles";
import { ArrowLeft, ArrowRight, Medal, CheckCircle2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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

export function CeremonyClient({ candidates }: { candidates: GraduationCandidate[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-24 h-24 rounded-full border flex items-center justify-center mb-4" style={{ borderColor: "#2C2C2E", background: "#1C1C1E" }}>
          <UserCheck className="w-10 h-10" style={{ color: "#8E8E93" }} />
        </div>
        <h2 className="font-display text-3xl font-black uppercase tracking-tight" style={{ color: "#F2F2F7" }}>
          Nenhum Aluno Apto
        </h2>
        <p style={{ color: "#8E8E93" }}>Não há alunos com 100% da meta de aulas batida no momento.</p>
        <Link 
          href="/admin/graduation"
          className="mt-6 px-6 py-3 rounded-full font-semibold transition-colors border"
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
        >
          Voltar para Graduação
        </Link>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];
  const isLast = currentIndex === candidates.length - 1;
  const alreadyPromoted = promotedIds.has(currentCandidate.profile.id);

  const handlePromote = () => {
    startTransition(async () => {
      const result = await promoteBelt({ 
        targetUserId: currentCandidate.profile.id, 
        newBelt: currentCandidate.nextBelt, 
        notes: "Cerimônia de Graduação" 
      });

      if (result.success) {
        toast({
          title: "Promovido! 🥋",
          description: `${currentCandidate.profile.fullName} agora é faixa ${currentCandidate.nextBelt}!`,
        });
        setPromotedIds(prev => new Set(prev).add(currentCandidate.profile.id));
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao promover aluno",
          variant: "destructive"
        });
      }
    });
  };

  const nextCandidate = () => {
    if (!isLast) setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-8 h-full min-h-[70vh]">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid #2C2C2E" }}>
        <Link 
          href="/admin/graduation"
          className="px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold transition-colors hover:border-[#dc2626]"
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
        >
          <ArrowLeft className="w-4 h-4" /> Cancelar Cerimônia
        </Link>
        <div className="text-sm font-bold uppercase tracking-wider" style={{ color: "#8E8E93" }}>
          Cerimônia Ao Vivo
        </div>
      </div>

      {/* Main Ceremony Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-[2rem] border relative overflow-hidden shadow-2xl flex flex-col items-center text-center p-10 sm:p-16 transition-all" style={{ background: "#111111", borderColor: alreadyPromoted ? "#34C759" : "#2C2C2E" }}>
          
          {/* Background Glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${alreadyPromoted ? '#34C759' : getBeltColor(currentCandidate.nextBelt)} 0%, transparent 60%)` }}></div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <span className="text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1 rounded-full border" style={{ borderColor: "#2C2C2E", color: "#8E8E93", background: "#1C1C1E" }}>
              Aluno {currentIndex + 1} de {candidates.length}
            </span>

            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-xl mb-6 bg-surface" style={{ borderColor: alreadyPromoted ? "#34C759" : getBeltColor(currentCandidate.profile.belt || "Branca") }}>
              <span className="font-display font-black text-5xl" style={{ color: "#F2F2F7" }}>
                {currentCandidate.profile.fullName.charAt(0)}
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mb-2" style={{ color: "#F2F2F7" }}>
              {currentCandidate.profile.fullName}
            </h2>

            <p className="text-sm uppercase font-semibold tracking-wider mb-8" style={{ color: "#8E8E93" }}>
              {currentCandidate.attendanceCount} / {currentCandidate.requiredClasses} Aulas Concluídas
            </p>

            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12 w-full">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "#8E8E93" }}>Atual</span>
                <div className="w-24 h-6 rounded border shadow-inner" style={{ background: getBeltColor(currentCandidate.profile.belt || "Branca"), borderColor: "#2C2C2E" }}></div>
                <span className="text-xs font-semibold" style={{ color: "#F2F2F7" }}>{currentCandidate.profile.belt || "Branca"}</span>
              </div>
              
              <ArrowRight className="w-8 h-8 opacity-50" style={{ color: "#8E8E93" }} />
              
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "#8E8E93" }}>Nova</span>
                <div className="w-24 h-6 rounded border shadow-lg" style={{ background: getBeltColor(currentCandidate.nextBelt), borderColor: "#2C2C2E" }}></div>
                <span className="text-xs font-bold" style={{ color: getBeltColor(currentCandidate.nextBelt) }}>{currentCandidate.nextBelt}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {alreadyPromoted ? (
              <div className="w-full flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-lg font-bold" style={{ color: "#34C759" }}>
                  <CheckCircle2 className="w-6 h-6" /> Promovido com sucesso!
                </div>
                {isLast ? (
                  <ShimmerButton 
                    onClick={() => router.push("/admin/graduation")}
                    className="mt-4 px-8 h-14 rounded-full w-full max-w-sm"
                    background="#F2F2F7"
                    shimmerColor="rgba(0,0,0,0.1)"
                    shimmerSize="0.05em"
                  >
                    <span className="flex items-center justify-center gap-2 text-center text-base font-bold tracking-tight text-black relative z-10">
                      FINALIZAR CERIMÔNIA
                    </span>
                  </ShimmerButton>
                ) : (
                  <button 
                    onClick={nextCandidate}
                    className="mt-4 px-8 h-14 rounded-full font-bold flex items-center justify-center gap-2 transition-colors border w-full max-w-sm hover:bg-[#1C1C1E]"
                    style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
                  >
                    PRÓXIMO ALUNO <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <ShimmerButton 
                onClick={handlePromote}
                disabled={isPending}
                className="w-full max-w-sm h-14 rounded-full transition-all disabled:opacity-50"
                background="rgba(0, 0, 0, 1)"
                shimmerColor="#ffffff"
                shimmerSize="0.05em"
              >
                <span className="flex items-center justify-center gap-2 text-center text-lg font-bold tracking-tight text-white relative z-10">
                  <Medal className="w-6 h-6" />
                  {isPending ? "PROMOVENDO..." : "CONFIRMAR GRADUAÇÃO"}
                </span>
              </ShimmerButton>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
