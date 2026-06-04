import { getSession } from "@/actions/auth";
import { getMyAttendance, getTodayWorkout } from "@/actions/checkin";
import Link from "next/link";
import { IconQrcode, IconChevronRight, IconHistory, IconBook2, IconSettings } from "@tabler/icons-react";
import { BELT_BADGE_STYLES } from "@/lib/constants";
import { EventsFeed } from "@/components/events-feed";

export default async function AlunoHomePage() {
  const { data: sessionData } = await getSession();
  const profile = sessionData?.profile;
  if (!profile) return null;

  const { data: attendanceData } = await getMyAttendance({});
  const attendanceCount = attendanceData?.length || 0;

  const { data: workoutData } = await getTodayWorkout();
  const todayWorkout = workoutData?.workout;

  const beltColor = BELT_BADGE_STYLES[profile.belt] ?? BELT_BADGE_STYLES["Branca"];
  const initial = profile.fullName.charAt(0).toUpperCase();
  const isExtensionista = profile.category === "academico";

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4 md:px-0">

      {/* === Header === */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
            {isExtensionista ? "Extensionista" : "Aluno"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Olá, {profile.fullName.split(" ")[0]}! 🥋
          </h1>
        </div>
        <Link
          href="/aluno/settings"
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-surface-container text-neutral-500 dark:text-[#8E8E93] hover:border-red-500 transition-colors shrink-0"
          title="Configurações"
        >
          <IconSettings className="w-5 h-5" />
        </Link>
      </div>

      {/* === Stats Row (Compacto) === */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-3xl border border-border bg-surface-container p-4 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500">{attendanceCount}</span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93] mt-1 font-bold">Treinos</span>
        </div>
        <div className="rounded-3xl border border-border bg-surface-container p-4 flex flex-col items-center justify-center text-center">
          <div
            className="h-7 rounded-full flex items-center px-3 gap-1.5 shrink-0 border"
            style={{ background: beltColor.bg, borderColor: beltColor.border }}
          >
            <span className="text-[10px] font-bold uppercase" style={{ color: beltColor.text }}>
              {profile.belt}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93] mt-1 font-bold">Faixa</span>
        </div>
        <div className="rounded-3xl border border-border bg-surface-container p-4 flex flex-col items-center justify-center text-center">
          <span className={`font-mono text-lg font-bold ${profile.isActive ? "text-green-600 dark:text-[#34C759]" : "text-neutral-400"}`}>
            {profile.isActive ? "Ativo" : "Inativo"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93] mt-1 font-bold">Status</span>
        </div>
      </div>

      {/* === Banner Treino do Dia === */}
      {todayWorkout ? (
        <div className="w-full relative rounded-2xl overflow-hidden border border-border p-6 flex flex-col gap-3 bg-surface-container">
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
            style={{ background: "rgba(220,38,38,0.15)" }}
          />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse bg-red-600 dark:bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                Treino do Dia
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
              {todayWorkout.techniqueName}
            </h2>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm font-bold text-neutral-700 dark:text-[#E5E5EA]">
                Princípio {workoutData?.principle?.number}: {workoutData?.principle?.titlePt}
              </span>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-[#8E8E93] line-clamp-2">
                {todayWorkout.techniqueWhat}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-3xl border border-dashed border-border p-6 text-center flex flex-col items-center justify-center gap-2 bg-surface-container">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#8E8E93]">
            🥋 Treino do Dia
          </span>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            O treino de hoje ainda não foi registrado pelo professor.
          </p>
        </div>
      )}

      {/* === CTA: Scanner QR (Destaque) === */}
      {profile.role !== "admin" && (
        <Link
          href="/aluno/scanner"
          className="flex items-center justify-center gap-3 h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.97] hover:opacity-90 bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]"
        >
          <IconQrcode className="w-6 h-6" />
          ABRIR SCANNER — BATER PONTO
        </Link>
      )}

      {/* === Grid de Ações Rápidas === */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link
          href="/aluno/history"
          className="rounded-3xl border border-border p-4 flex items-center gap-3 transition-colors hover:border-red-500/50 group bg-surface-container"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1C1E] flex items-center justify-center shrink-0 group-hover:bg-red-500/10 transition-colors">
            <IconHistory className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93] group-hover:text-red-500 transition-colors" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-neutral-900 dark:text-[#F2F2F7] block">Histórico</span>
            <span className="text-[10px] text-neutral-400 dark:text-[#636366]">Suas presenças</span>
          </div>
        </Link>

        <Link
          href="/aluno/principios"
          className="rounded-3xl border border-border p-4 flex items-center gap-3 transition-colors hover:border-red-500/50 group bg-surface-container"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1C1E] flex items-center justify-center shrink-0 group-hover:bg-red-500/10 transition-colors">
            <IconBook2 className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93] group-hover:text-red-500 transition-colors" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-neutral-900 dark:text-[#F2F2F7] block">32 Princípios</span>
            <span className="text-[10px] text-neutral-400 dark:text-[#636366]">Metodologia</span>
          </div>
        </Link>

        <Link
          href="/aluno/events"
          className="rounded-3xl border border-border p-4 flex items-center gap-3 transition-colors hover:border-red-500/50 group bg-surface-container col-span-2 md:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1C1E] flex items-center justify-center shrink-0 group-hover:bg-red-500/10 transition-colors">
            <IconChevronRight className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93] group-hover:text-red-500 transition-colors" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-neutral-900 dark:text-[#F2F2F7] block">Eventos</span>
            <span className="text-[10px] text-neutral-400 dark:text-[#636366]">Mural completo</span>
          </div>
        </Link>
      </div>

      {/* === Extensionista Badge === */}
      {isExtensionista && (
        <div className="rounded-3xl border p-4 flex items-center gap-3 bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/20">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <span className="text-green-600 dark:text-[#34C759] text-lg">✓</span>
          </div>
          <div>
            <p className="font-bold text-sm text-neutral-900 dark:text-[#F2F2F7]">Extensionista UFPE</p>
            <p className="text-xs text-neutral-600 dark:text-[#8E8E93]">
              Suas presenças geram horas complementares automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* === Mural de Avisos === */}
      <EventsFeed />

    </div>
  );
}
