"use client";

import React, { useState, useMemo } from "react";
import { AttendanceWithWorkout } from "@/lib/schemas";
import { deleteCheckin } from "@/actions/checkin";
import { toast } from "sonner";
import { Trash2Icon, CalendarIcon, CheckCircle2 } from "lucide-react";
import { IconSearch } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function AdminHistoryClient({ initialData, pagination }: { initialData: AttendanceWithWorkout[]; pagination: PaginationInfo | null }) {
  const [history, setHistory] = useState<AttendanceWithWorkout[]>(initialData);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const filteredHistory = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return history.filter((record) => {
      const p = record.profile;
      const nameMatch = p?.fullName?.toLowerCase().includes(term);
      const emailMatch = p?.email?.toLowerCase().includes(term);
      const categoryMatch = p?.category?.toLowerCase().includes(term);
      const beltMatch = p?.belt?.toLowerCase().includes(term);
      const recordDate = new Date(record.checkedInAt).toISOString().split('T')[0];
      const startMatch = startDate ? recordDate >= startDate : true;
      const endMatch = endDate ? recordDate <= endDate : true;
      return (nameMatch || emailMatch || categoryMatch || beltMatch) && startMatch && endMatch;
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
            Histórico de Presença Geral
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Visualização de todos os check-ins registrados na academia.
          </p>
        </div>
      </div>

      {/* Filters (Like Reports) */}
      <div className="rounded-3xl border p-6 relative overflow-hidden group transition-colors bg-surface-container border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500">
            <IconSearch className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Filtros de Histórico</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Buscar por nome, e-mail, faixa ou categoria</label>
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-neutral-500 dark:text-[#8E8E93]" />
              <input 
                type="text"
                placeholder="Nome, e-mail, faixa, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 rounded-lg pl-10 pr-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Período (Data)</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-12 rounded-lg px-3 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
              />
              <span className="hidden sm:block text-neutral-500 dark:text-[#8E8E93]">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-12 rounded-lg px-3 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
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
              className="col-span-full text-center text-muted-foreground p-12 bg-white/50 dark:bg-black/20 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800"
            >
              Nenhum check-in encontrado com os filtros atuais.
            </motion.div>
          ) : (
            filteredHistory.map((record, index) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: index * 0.02 } }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ layout: { type: "spring", bounce: 0, duration: 0.3 } }}
                className="relative group"
              >
                <motion.div
                  className="bg-surface-container border border-border rounded-3xl p-5 relative z-10 w-full flex flex-col gap-3 group hover:border-red-500/40 transition-colors"
                >
                  {/* Header: Avatar + Nome + Delete */}
                  <div className="flex items-start justify-between">
                    {/* Clicável → Perfil do Aluno */}
                    <Link
                      href={record.profile?.id ? `/admin/users/${record.profile.id}` : "#"}
                      className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity flex-1 min-w-0"
                      title="Ver perfil do aluno"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-neutral-100 dark:bg-[#1C1C1E] border border-border text-neutral-900 dark:text-[#F2F2F7] font-bold text-sm">
                        {record.profile?.fullName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-base text-neutral-900 dark:text-[#F2F2F7] truncate">
                          {record.profile?.fullName || "Aluno"}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-[#8E8E93] truncate">
                          {record.profile?.email || ""}
                        </p>
                      </div>
                    </Link>

                    {/* Delete */}
                    <button 
                      onClick={() => confirmDelete(record.id)}
                      className="ml-2 w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:hover:text-red-300 transition-colors shrink-0 z-20"
                      title="Apagar registro"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges: faixa + categoria */}
                  <div className="flex flex-wrap gap-1.5">
                    {record.profile?.belt && (
                      <span className="text-[10px] font-bold uppercase tracking-wider border border-border px-2 py-0.5 rounded-full text-neutral-700 dark:text-[#8E8E93] bg-surface-container">
                        {record.profile.belt}
                      </span>
                    )}
                    {record.profile?.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider border border-border px-2 py-0.5 rounded-full text-neutral-700 dark:text-[#8E8E93] bg-surface-container">
                        {record.profile.category === "academico" ? "Extensionista" : record.profile.category === "frequente" ? "Aluno" : "Visitante"}
                      </span>
                    )}
                  </div>

                  {/* Footer: data + princípio + higiene */}
                  <div className="rounded-xl bg-surface-container p-3 space-y-2 border border-neutral-100 dark:border-[#2C2C2E]">
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#8E8E93]">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(record.checkedInAt).toLocaleDateString('pt-BR')} às {new Date(record.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
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

      {/* Controles de Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 pb-8">
          <button
            disabled={!pagination.hasPreviousPage}
            onClick={() => router.push(`?page=${currentPage - 1}`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-neutral-100 dark:bg-[#1C1C1E] border border-border text-neutral-900 dark:text-[#F2F2F7] hover:bg-neutral-200 dark:hover:bg-[#2C2C2E]"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm font-semibold text-neutral-500 dark:text-[#8E8E93]">
            Página {pagination.page} de {pagination.totalPages} ({pagination.totalCount} registros)
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => router.push(`?page=${currentPage + 1}`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-neutral-100 dark:bg-[#1C1C1E] border border-border text-neutral-900 dark:text-[#F2F2F7] hover:bg-neutral-200 dark:hover:bg-[#2C2C2E]"
          >
            Próxima
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
