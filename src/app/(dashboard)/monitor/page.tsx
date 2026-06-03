import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getTodayWorkout } from "@/actions/checkin";
import Link from "next/link";
import { ScanLine, BookOpen, CalendarDays, LogOut, AlertCircle, ChevronRight } from "lucide-react";

export default async function MonitorHomePage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "monitor") {
    redirect("/admin");
  }

  const { data: workoutData } = await getTodayWorkout();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2 pb-4" style={{ borderBottom: "1px solid #2C2C2E" }}>
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter" style={{ color: "#F2F2F7" }}>
          Área do Monitor
        </h1>
        <p className="text-sm" style={{ color: "#8E8E93" }}>
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
            href="/monitor/workout"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Registrar Treino
          </Link>
        </div>
      ) : (
        <div className="w-full relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#2C2C2E] p-6 md:p-8 flex flex-col gap-3 bg-white dark:bg-[#111111]">
          {/* Red glow background */}
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
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
              {workoutData.workout.techniqueName}
            </h2>
            <div className="flex flex-col gap-1 mt-2 max-w-3xl">
              <span className="text-sm font-bold text-neutral-700 dark:text-[#E5E5EA]">
                Princípio {workoutData.principle?.number}: {workoutData.principle?.titlePt}
              </span>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-[#8E8E93] line-clamp-2 md:line-clamp-none">
                {workoutData.workout.techniqueWhat}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Ações */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <Link 
          href="/monitor/scanner"
          className="col-span-2 sm:col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center text-center gap-4 transition-colors hover:border-[#dc2626]/50 group"
          style={{ background: "#111111", borderColor: "#2C2C2E" }}
        >
          <div
            className="w-16 h-16 rounded-full border flex items-center justify-center transition-colors group-hover:bg-[#dc2626] group-hover:border-[#dc2626]"
            style={{ background: "#1C1C1E", borderColor: "#2C2C2E" }}
          >
            <ScanLine className="w-8 h-8 transition-colors group-hover:text-white" style={{ color: "#8E8E93" }} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-black" style={{ color: "#F2F2F7" }}>Bater Ponto</h3>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>Escanear QR Code da parede</p>
          </div>
        </Link>

        <Link 
          href="/monitor/workout"
          className="col-span-2 sm:col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center text-center gap-4 transition-colors hover:border-[#dc2626]/50 group"
          style={{ background: "#111111", borderColor: "#2C2C2E" }}
        >
          <div
            className="w-16 h-16 rounded-full border flex items-center justify-center transition-colors group-hover:bg-[#dc2626] group-hover:border-[#dc2626]"
            style={{ background: "#1C1C1E", borderColor: "#2C2C2E" }}
          >
            <BookOpen className="w-8 h-8 transition-colors group-hover:text-white" style={{ color: "#8E8E93" }} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-black" style={{ color: "#F2F2F7" }}>Gerir Treino</h3>
            <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>Editar técnica atual</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <Link 
          href="/monitor/history"
          className="rounded-2xl border p-4 flex items-center justify-between transition-colors hover:border-[#dc2626]/50 group"
          style={{ background: "#111111", borderColor: "#2C2C2E" }}
        >
          <span className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5" style={{ color: "#8E8E93" }} />
            <span className="font-semibold text-sm" style={{ color: "#F2F2F7" }}>Histórico do Tatame</span>
          </span>
          <ChevronRight className="w-4 h-4 transition-colors group-hover:text-[#dc2626]" style={{ color: "#8E8E93" }} />
        </Link>

        <form action="/auth/signout" method="POST" className="w-full">
          <button 
            type="submit"
            className="w-full rounded-2xl border p-4 flex items-center justify-between transition-colors hover:border-[#FF3B30]/50 group"
            style={{ background: "#111111", borderColor: "#2C2C2E" }}
          >
            <span className="flex items-center gap-3">
              <LogOut className="w-5 h-5" style={{ color: "#8E8E93" }} />
              <span className="font-semibold text-sm" style={{ color: "#F2F2F7" }}>Sair da Conta</span>
            </span>
            <ChevronRight className="w-4 h-4 transition-colors group-hover:text-[#FF3B30]" style={{ color: "#8E8E93" }} />
          </button>
        </form>
      </div>

    </div>
  );
}
