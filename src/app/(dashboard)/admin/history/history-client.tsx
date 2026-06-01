"use client";

import React, { useState } from "react";
import { AttendanceWithWorkout } from "@/lib/schemas";
import { deleteCheckin } from "@/actions/checkin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2Icon, UserIcon, CalendarIcon, CheckCircle2 } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AdminHistoryClient({ initialData }: { initialData: AttendanceWithWorkout[] }) {
  const [history, setHistory] = useState<AttendanceWithWorkout[]>(initialData);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await deleteCheckin(id);
    if (res.success) {
      toast.success("Treino apagado com sucesso!");
      setHistory(prev => prev.filter(h => h.id !== id));
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao apagar treino");
    }
    setDeletingId(null);
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Histórico Global</h2>
          <p className="text-muted-foreground mt-1">
            Visualização de todos os treinos registrados (Últimos 30 dias).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground p-12 bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            Nenhum check-in registrado nos últimos 30 dias.
          </div>
        ) : (
          history.map((record, index) => (
            <BlurFade key={record.id} delay={0.05 * index} inView>
              <MagicCard className="h-full group">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500/10 text-blue-500 p-1.5 rounded-full">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">
                        {record.profile?.fullName?.split(" ")[0] || "Aluno"}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(record.checkedInAt).toLocaleDateString('pt-BR')} - {new Date(record.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </CardDescription>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 w-9 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent"
                      disabled={deletingId === record.id}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-[#111] border-neutral-200 dark:border-neutral-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apagar registro de treino?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja apagar o check-in de <strong>{record.profile?.fullName}</strong> do dia {new Date(record.checkedInAt).toLocaleDateString('pt-BR')}?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(record.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {deletingId === record.id ? "Apagando..." : "Sim, apagar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900/50 p-3 space-y-2">
                    <p className="text-sm font-medium">Treino Registrado:</p>
                    <div className="flex items-start justify-between text-xs text-muted-foreground">
                      <span>Princípio:</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">#{record.workout?.principle?.number}</span>
                    </div>
                    {record.hygieneConfirmed && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-2">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Higiene confirmada</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </MagicCard>
            </BlurFade>
          ))
        )}
      </div>
    </div>
  );
}
