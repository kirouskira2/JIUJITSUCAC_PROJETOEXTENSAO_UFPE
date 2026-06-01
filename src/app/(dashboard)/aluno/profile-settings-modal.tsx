"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { updateProfile } from "@/actions/profiles";
import { Profile } from "@/lib/schemas";

export function ProfileSettingsModal({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(profile.phone || "");
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await updateProfile({
      profileId: profile.id,
      phone,
      emergencyContact
    });

    if (res.success) {
      toast.success("Perfil atualizado com sucesso!");
      setOpen(false);
    } else {
      toast.error(res.error || "Erro ao atualizar perfil");
    }
    
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#2C2C2E] bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm font-semibold text-neutral-900 dark:text-[#F2F2F7]" />}>
          <Settings className="w-4 h-4 text-neutral-500" />
          Editar Perfil
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações da Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Celular / WhatsApp</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="(DD) 9XXXX-XXXX" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contato de Emergência</Label>
            <Input 
              id="emergencyContact" 
              value={emergencyContact} 
              onChange={(e) => setEmergencyContact(e.target.value)} 
              placeholder="(DD) 9XXXX-XXXX" 
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
