"use client";

import { useState } from "react";
import Link from "next/link";
import { registerCheckin } from "@/actions/checkin";
import { IconCircleCheck, IconHandStop, IconDroplet, IconShoe, IconHeartbeat, IconShirt, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CheckCircle2 } from "lucide-react";

const HYGIENE_ITEMS = [
  { id: "nails", icon: <IconHandStop className="w-5 h-5" />, label: "Unhas cortadas", sub: "Mãos e pés aparados" },
  { id: "kimono", icon: <IconShirt className="w-5 h-5" />, label: "Kimono limpo", sub: "Lavado e sem odor" },
  { id: "water", icon: <IconDroplet className="w-5 h-5" />, label: "Hidratação", sub: "Garrafa de água abastecida" },
  { id: "feet", icon: <IconShoe className="w-5 h-5" />, label: "Pés limpos", sub: "Uso de chinelo fora do tatame" },
  { id: "health", icon: <IconHeartbeat className="w-5 h-5" />, label: "Saúde em dia", sub: "Sem lesões ou sintomas de gripe" },
];

interface Props {
  profileId: string;
  workoutId: string | null;
  profileName: string;
}

export function CheckinClientPage({ profileId, workoutId, profileName }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const allChecked = HYGIENE_ITEMS.every((item) => checked[item.id]);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = async () => {
    if (!profileId || !workoutId) {
      setErrorMsg("Nenhum treino registrado para hoje.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const result = await registerCheckin({
      profileId,
      workoutId,
      hygieneConfirmed: true,
    });
    if (result.success) {
      setStatus("success");
    } else {
      setErrorMsg(result.error || "Erro ao confirmar presença.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] px-6 gap-8 text-center">
        {/* Success glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full" style={{ background: "rgba(52,199,89,0.08)", filter: "blur(80px)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 w-full">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(52,199,89,0.15)" }} />
            <IconCircleCheck className="w-20 h-20 relative z-10" style={{ color: "#34C759", filter: "drop-shadow(0 0 15px rgba(52,199,89,0.4))" }} />
          </div>

          <div>
            <h1 className="font-display text-4xl font-black" style={{ color: "#F2F2F7" }}>Presença confirmada!</h1>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>Seu check-in foi registrado com sucesso.</p>
          </div>

          {/* Principle of the day card */}
          <div className="w-full rounded-3xl border p-5 text-left flex flex-col gap-3 relative overflow-hidden" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, #2C2C2E, transparent)" }} />
            <div className="flex items-center gap-2">
              <IconStar className="w-4 h-4 text-[#e9c349]" />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#e9c349" }}>Princípio do Dia</span>
            </div>
            <h2 className="font-sans font-semibold text-lg" style={{ color: "#F2F2F7" }}>Princípio #14: Respeito</h2>
            <div className="border-l-4 pl-3 py-1" style={{ borderColor: "#dc2626" }}>
              <p className="text-sm italic leading-relaxed" style={{ color: "#8E8E93" }}>
                &ldquo;O tatame é um reflexo da vida. O respeito que você demonstra aqui constrói o caráter que você leva para o mundo.&rdquo;
              </p>
            </div>
          </div>

          <Link
            href="/aluno"
            className="w-full h-[54px] rounded-full flex items-center justify-center font-semibold text-base transition-all"
            style={{ background: "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(220,38,38,0.25)" }}
          >
            IR PARA MEU PERFIL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col" style={{ background: "#050505" }}>
      {/* Bottom sheet style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div
          className="w-full max-w-md rounded-t-[32px] border-t shadow-2xl pointer-events-auto flex flex-col pt-4 pb-8 px-6"
          style={{
            background: "rgba(28,28,30,0.95)",
            backdropFilter: "blur(24px)",
            borderColor: "#2C2C2E",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "#353534" }} />

          <h1 className="font-display text-3xl font-black" style={{ color: "#F2F2F7" }}>
            Antes de entrar no tatame
          </h1>
          <p className="text-sm mt-1 mb-5" style={{ color: "#8E8E93" }}>
            Confirme os protocolos de higiene para garantir um ambiente seguro para todos.
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {HYGIENE_ITEMS.map((item) => {
              const isChecked = !!checked[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className="flex items-center justify-between p-4 rounded-xl border transition-all text-left"
                  style={{
                    background: isChecked ? "rgba(220,38,38,0.08)" : "#111111",
                    borderColor: isChecked ? "#dc2626" : "#2C2C2E",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: isChecked ? "#dc2626" : "#2a2a2a", color: isChecked ? "#fff" : "#8E8E93" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <span className="block font-semibold text-sm" style={{ color: "#F2F2F7" }}>{item.label}</span>
                      <span className="text-xs" style={{ color: "#8E8E93" }}>{item.sub}</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className="w-6 h-6 shrink-0 transition-all"
                    style={{
                      color: isChecked ? "#dc2626" : "#48484A",
                      transform: isChecked ? "scale(1)" : "scale(0.85)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {status === "error" && (
            <p className="text-xs text-center mb-3" style={{ color: "#FF3B30" }}>{errorMsg}</p>
          )}

          <ShimmerButton
            onClick={handleConfirm}
            disabled={!allChecked || status === "loading"}
            className={cn(
              "w-full h-[54px] rounded-full",
              (!allChecked || status === "loading") && "opacity-50 cursor-not-allowed"
            )}
            background={allChecked ? "rgba(0, 0, 0, 1)" : "#2a2a2a"}
            shimmerColor={allChecked ? "#ffffff" : "transparent"}
            shimmerSize="0.05em"
          >
            <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
              {status === "loading" ? "CONFIRMANDO..." : "CONFIRMAR PRESENÇA"}
            </span>
          </ShimmerButton>
        </div>
      </div>

      {/* Background content */}
      <div className="h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-display text-2xl font-black uppercase" style={{ color: "#F2F2F7" }}>
            Check-in do Tatame
          </h2>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>{profileName}</p>
        </div>
      </div>
    </div>
  );
}
