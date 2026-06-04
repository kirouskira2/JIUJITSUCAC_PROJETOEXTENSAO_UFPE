"use client";

import { useState, useTransition } from "react";
import { registerCheckin } from "@/actions/checkin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { OfflineCheckinStore } from "@/lib/offline-checkin-store";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Hand, Shirt, Droplet, Footprints, ShieldPlus, CheckCircle2, Circle } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface HygieneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId?: string;
  workoutId: string;
  qrCodeToken?: string;
  onSuccess?: (principleOfDay: { number: number; titlePt: string; titleEn: string; description: string } | null) => void;
}

const HYGIENE_ITEMS = [
  {
    id: "nails",
    label: "Unhas cortadas",
    description: "Mãos e pés aparados",
    icon: Hand,
  },
  {
    id: "uniform",
    label: "Kimono limpo",
    description: "Lavado e sem odor",
    icon: Shirt,
  },
  {
    id: "hydration",
    label: "Hidratação",
    description: "Garrafa de água abastecida",
    icon: Droplet,
  },
  {
    id: "feet",
    label: "Pés limpos",
    description: "Uso de chinelo fora do tatame",
    icon: Footprints,
  },
  {
    id: "health",
    label: "Saúde em dia",
    description: "Sem lesões ou sintomas de gripe",
    icon: ShieldPlus,
  },
];

export function HygieneModal({
  open,
  onOpenChange,
  profileId,
  workoutId,
  qrCodeToken,
  onSuccess,
}: HygieneModalProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const totalItems = HYGIENE_ITEMS.length;
  const allChecked = checkedCount === totalItems;

  const handleToggle = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAcceptAll = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    const allChecks = HYGIENE_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
    setChecks(allChecks);
  };

  const handleConfirm = () => {
    if (!allChecked) return;
    setErrorMsg(null);

    // Se estiver offline, salva no IndexedDB local
    if (typeof window !== "undefined" && !navigator.onLine) {
      startTransition(async () => {
        try {
          await OfflineCheckinStore.savePending({
            profileId,
            workoutId,
            hygieneConfirmed: true,
            qrCodeToken,
          });

          if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
          toast({
            title: "Check-in salvo offline! 📴",
            description: "Você está sem internet. Sua presença foi salva localmente e será sincronizada assim que você se conectar à rede! Oss!",
          });
          onOpenChange(false);
          onSuccess?.(null);
        } catch (err: any) {
          toast({
            title: "Erro ao salvar offline",
            description: err.message || "Tente novamente.",
            variant: "destructive",
          });
        }
      });
      return;
    }

    startTransition(async () => {
      const result = await registerCheckin({
        profileId,
        workoutId,
        qrCodeToken,
        hygieneConfirmed: true,
      });

      if (result.success) {
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        toast({
          title: "Check-in realizado! ✅",
          description: "Sua presença foi registrada com sucesso. Oss!",
        });
        onOpenChange(false);
        onSuccess?.(result.data?.principleOfDay ?? null);
      } else {
        setErrorMsg(result.error || "Erro desconhecido ao tentar fazer check-in.");
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-2xl border-t border-border rounded-t-3xl sm:rounded-3xl p-0 gap-0 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col w-full max-w-lg mt-auto sm:mt-0 mb-0 sm:mb-auto h-[90vh] sm:h-auto border-x-0 sm:border-x border-b-0 sm:border-b">
        
        {/* Drag Handle (Mobile) */}
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-4 mb-2 sm:hidden" />

        <div className="p-6 flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <header className="mb-6 flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <DialogTitle className="font-display text-3xl font-bold text-foreground tracking-tight">
                Antes de entrar no tatame
              </DialogTitle>
              {!allChecked && (
                <button 
                  onClick={handleAcceptAll}
                  className="shrink-0 text-xs font-bold uppercase tracking-wider transition-colors hover:text-red-700 mt-2" 
                  style={{ color: "#dc2626" }}
                >
                  Marcar Todos
                </button>
              )}
            </div>
            <p className="font-sans text-muted-foreground mt-1">
              Confirme os protocolos de higiene para garantir um ambiente seguro para todos.
            </p>
          </header>

          {/* Checklist */}
          <div className="flex flex-col gap-3 mb-8 flex-1">
            {HYGIENE_ITEMS.map((item) => {
              const isChecked = checks[item.id];
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 group",
                    isChecked 
                      ? "bg-primary/10 border-primary" 
                      : "bg-card border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-foreground block">
                        {item.label}
                      </span>
                      <span className="font-sans text-muted-foreground text-sm">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {isChecked ? (
                    <CheckCircle2 className="w-6 h-6 text-primary scale-110 transition-transform" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground transition-transform" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Box */}
          {errorMsg && (
            <div className="mb-4 p-4 rounded-xl bg-destructive/15 border border-destructive/30 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-destructive/20 p-2 rounded-full shrink-0">
                <ShieldPlus className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-destructive font-sans">Falha no Check-in</span>
                <span className="text-sm text-destructive/90 font-sans mt-0.5">{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto pt-4 bg-background/95 pb-safe">
            <ShimmerButton
              onClick={handleConfirm}
              disabled={!allChecked || isPending}
              className={cn(
                "w-full h-[54px] rounded-full",
                (!allChecked || isPending) && "opacity-50 cursor-not-allowed"
              )}
              background={allChecked && !isPending ? "rgba(0, 0, 0, 1)" : "#2C2C2E"}
              shimmerColor={allChecked && !isPending ? "#ffffff" : "transparent"}
              shimmerSize="0.05em"
            >
              <span className="flex items-center justify-center gap-2 text-center text-base font-semibold tracking-tight text-white relative z-10">
                {isPending ? "REGISTRANDO..." : "CONFIRMAR PRESENÇA"}
              </span>
            </ShimmerButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
