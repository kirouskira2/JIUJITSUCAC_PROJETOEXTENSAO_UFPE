"use client";

import { useState, useTransition } from "react";
import { promoteBelt } from "@/actions/profiles";
import { useToast } from "@/hooks/use-toast";
import { BELT_ORDER } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileRow {
  id: string;
  full_name: string;
  belt: string;
}

interface BeltPromotionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: ProfileRow | null;
  onSuccess: (userId: string, newBelt: string) => void;
}

export function BeltPromotionModal({
  open,
  onOpenChange,
  selectedUser,
  onSuccess,
}: BeltPromotionModalProps) {
  const [newBelt, setNewBelt] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Sync newBelt when modal opens with a different user
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && selectedUser) {
      setNewBelt(selectedUser.belt);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    if (!selectedUser || !newBelt) return;

    startTransition(async () => {
      const result = await promoteBelt({
        targetUserId: selectedUser.id,
        newBelt,
        notes: "Promoção via Painel Admin",
      });
      if (result.success) {
        toast({
          title: "Graduação realizada! 🥋",
          description: `${selectedUser.full_name} foi graduado para faixa ${newBelt}.`,
        });
        onSuccess(selectedUser.id, result.data?.newBelt ?? newBelt);
        onOpenChange(false);
      } else {
        toast({
          title: "Erro na graduação",
          description: result.error || "Não foi possível atualizar a faixa.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border sm:rounded-2xl" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold" style={{ color: "#F2F2F7" }}>Graduar Aluno</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm" style={{ color: "#8E8E93" }}>
            Selecione a nova faixa para <strong style={{ color: "#F2F2F7" }}>{selectedUser?.full_name}</strong>.
          </p>
          <select 
            value={newBelt} 
            onChange={(e) => e.target.value && setNewBelt(e.target.value)}
            className="w-full h-12 rounded-lg px-4 text-sm outline-none border transition-colors appearance-none"
            style={{ background: "#0F0F0F", borderColor: "#2C2C2E", color: "#F2F2F7" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#0A84FF")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2C2C2E")}
          >
            <option value="" disabled>Selecione a faixa</option>
            {BELT_ORDER.map(belt => (
              <option key={belt} value={belt}>{belt}</option>
            ))}
          </select>
          <button
            onClick={handleConfirm}
            disabled={isPending || newBelt === selectedUser?.belt}
            className="mt-4 h-12 rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center justify-center disabled:opacity-50"
            style={{ background: "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(220,38,38,0.2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
          >
            {isPending ? "SALVANDO..." : "CONFIRMAR GRADUAÇÃO"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
