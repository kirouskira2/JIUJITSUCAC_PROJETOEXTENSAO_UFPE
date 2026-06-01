"use client";

import React, { useState, useMemo } from "react";
import { AttendanceWithWorkout } from "@/lib/schemas";
import { deleteCheckin } from "@/actions/checkin";
import { toast } from "sonner";
import { Trash2Icon, UserIcon, CalendarIcon, CheckCircle2 } from "lucide-react";
import { IconSearch } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@/components/ui/alert-dialog";

export function AdminHistoryClient({ initialData }: { initialData: AttendanceWithWorkout[] }) {
  const [history, setHistory] = useState<AttendanceWithWorkout[]>(initialData);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      const nameMatch = record.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
      const recordDate = new Date(record.checkedInAt).toISOString().split('T')[0];
      const startMatch = startDate ? recordDate >= startDate : true;
      const endMatch = endDate ? recordDate <= endDate : true;
      return nameMatch && startMatch && endMatch;
    });
  }, [history, searchTerm, startDate, endDate]);

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  async function handleDelete(id: string) {
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
            Histórico Global
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Visualização de todos os check-ins registrados.
          </p>
        </div>
      </div>

      {/* Filters (Like Reports) */}
      <div className="rounded-2xl border p-6 relative overflow-hidden group transition-colors bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#2C2C2E]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500">
            <IconSearch className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Filtros de Histórico</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Buscar Aluno</label>
            <input 
              type="text"
              placeholder="Digite o nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 rounded-lg px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Período (Data)</label>
            <div className="flex gap-2 items-center">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-12 rounded-lg px-3 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
              />
              <span className="text-neutral-500 dark:text-[#8E8E93]">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-12 rounded-lg px-3 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-full text-center text-muted-foreground p-12 bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800"
            >
              Nenhum check-in encontrado com os filtros atuais.
            </motion.div>
          ) : (
            filteredHistory.map((record, index) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="relative group h-[180px]"
              >
                {/* Delete background action */}
                <div className="absolute inset-y-0 right-0 w-24 bg-red-600 rounded-2xl flex items-center justify-end pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Draggable Card */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: -80, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset }) => {
                    if (offset.x < -60) {
                      confirmDelete(record.id);
                    }
                  }}
                  className="bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#2C2C2E] rounded-2xl p-5 relative z-10 w-full h-full cursor-grab active:cursor-grabbing flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-[#F2F2F7]">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-lg text-neutral-900 dark:text-[#F2F2F7]">
                          {record.profile?.fullName?.split(" ")[0] || "Aluno"}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-[#8E8E93] flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(record.checkedInAt).toLocaleDateString('pt-BR')} às {new Date(record.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-neutral-50 dark:bg-[#1C1C1E] p-3 space-y-2 border border-neutral-100 dark:border-[#2C2C2E]">
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#8E8E93]">
                      <span>Princípio do Treino:</span>
                      <span className="font-bold text-neutral-900 dark:text-[#F2F2F7]">#{record.workout?.principle?.number || '?'}</span>
                    </div>
                    {record.hygieneConfirmed && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Higiene confirmada</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#111] border-neutral-200 dark:border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar registro de treino?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Você removerá a presença deste aluno do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
