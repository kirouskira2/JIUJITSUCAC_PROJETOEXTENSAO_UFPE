import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getTodayWorkout } from "@/actions/checkin";
import Link from "next/link";
import { ScanLine, BookOpen, CalendarDays, AlertCircle, ChevronRight, Megaphone } from "lucide-react";
import { EventsFeed } from "@/components/events-feed";

export default async function MonitorHomePage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "monitor") {
    redirect("/admin");
  }

  const { data: workoutData } = await getTodayWorkout();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-6 px-4 md:px-0">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
          Monitor
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
          Olá, {sessionData?.profile.fullName.split(" ")[0]}! 🥋
        </h1>
        <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
          Gerencie o tatame, registre treinos e escaneie alunos.
        </p>
      </div>

      {/* Banner Treino do Dia (Monitor) */}
      {!workoutData?.workout ? (
        <div className="w-full rounded-2xl border border-dashed border-red-500/30 p-6 flex flex-col items-center justify-center gap-3 bg-red-500/5 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Nenhum Treino Ativo
          </span>
          <p className="text-sm text-neutral-600 dark:text-[#8E8E93]">
            Você precisa registrar a técnica e o princípio do dia antes de iniciar os check-ins.
          </p>
          <Link 
            href="/monitor/workout/edit"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Registrar Treino
          </Link>
        </div>
      ) : (
        <div className="w-full relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#2C2C2E] p-6 flex flex-col gap-3 bg-white dark:bg-[#111111]">
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
            style={{ background: "rgba(220,38,38,0.15)" }}
          />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse bg-red-600 dark:bg-red-500" />
                🥋 Treino Ativo
              </span>
              <Link
                href="/monitor/workout"
                className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-500 hover:underline flex items-center gap-1"
              >
                Ver detalhes <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
              {workoutData.workout.techniqueName}
            </h2>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm font-bold text-neutral-700 dark:text-[#E5E5EA]">
                Princípio {workoutData.principle?.number}: {workoutData.principle?.titlePt}
              </span>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-[#8E8E93] line-clamp-2">
                {workoutData.workout.techniqueWhat}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Ações */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          href="/monitor/scanner"
          className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:border-red-500/50 group bg-white dark:bg-[#111111]"
        >
          <div className="w-14 h-14 rounded-full border border-neutral-200 dark:border-[#2C2C2E] flex items-center justify-center transition-colors group-hover:bg-red-600 group-hover:border-red-600 bg-neutral-50 dark:bg-[#1C1C1E]">
            <ScanLine className="w-7 h-7 text-neutral-500 dark:text-[#8E8E93] transition-colors group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-neutral-900 dark:text-[#F2F2F7]">Bater Ponto</h3>
            <p className="text-xs mt-0.5 text-neutral-500 dark:text-[#8E8E93]">QR Code da parede</p>
          </div>
        </Link>

        <Link 
          href="/monitor/workout"
          className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col items-center justify-center text-center gap-3 transition-colors hover:border-red-500/50 group bg-white dark:bg-[#111111]"
        >
          <div className="w-14 h-14 rounded-full border border-neutral-200 dark:border-[#2C2C2E] flex items-center justify-center transition-colors group-hover:bg-red-600 group-hover:border-red-600 bg-neutral-50 dark:bg-[#1C1C1E]">
            <BookOpen className="w-7 h-7 text-neutral-500 dark:text-[#8E8E93] transition-colors group-hover:text-white" />
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-neutral-900 dark:text-[#F2F2F7]">Treino do Dia</h3>
            <p className="text-xs mt-0.5 text-neutral-500 dark:text-[#8E8E93]">Visualizar técnica</p>
          </div>
        </Link>
      </div>

      {/* Links Secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link 
          href="/monitor/history"
          className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-4 flex items-center justify-between transition-colors hover:border-red-500/50 group bg-white dark:bg-[#111111]"
        >
          <span className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93]" />
            <span className="font-semibold text-sm text-neutral-900 dark:text-[#F2F2F7]">Histórico do Tatame</span>
          </span>
          <ChevronRight className="w-4 h-4 transition-colors group-hover:text-red-500 text-neutral-400 dark:text-[#8E8E93]" />
        </Link>

        <Link 
          href="/aluno/events"
          className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-4 flex items-center justify-between transition-colors hover:border-red-500/50 group bg-white dark:bg-[#111111]"
        >
          <span className="flex items-center gap-3">
            <Megaphone className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93]" />
            <span className="font-semibold text-sm text-neutral-900 dark:text-[#F2F2F7]">Eventos e Avisos</span>
          </span>
          <ChevronRight className="w-4 h-4 transition-colors group-hover:text-red-500 text-neutral-400 dark:text-[#8E8E93]" />
        </Link>
      </div>

      {/* === Mural de Avisos === */}
      <EventsFeed />

    </div>
  );
}
