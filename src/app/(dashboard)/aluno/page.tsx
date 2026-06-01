import { getSession } from "@/actions/auth";
import { getMyAttendance } from "@/actions/checkin";
import { listWorkouts } from "@/actions/workouts";
import Link from "next/link";
import { IconQrcode, IconChevronRight, IconCircleCheck, IconHistory, IconBook } from "@tabler/icons-react";
import { BELT_BADGE_STYLES } from "@/lib/constants";

export default async function AlunoHomePage() {
  const { data: sessionData } = await getSession();
  const profile = sessionData?.profile;
  if (!profile) return null;

  const { data: attendanceData } = await getMyAttendance({});
  const attendanceCount = attendanceData?.length || 0;

  const { data: workoutsData } = await listWorkouts({});
  const todayWorkout = workoutsData?.[0] ?? null;

  const beltColor = BELT_BADGE_STYLES[profile.belt] ?? BELT_BADGE_STYLES["Branca"];
  const initial = profile.fullName.charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">

      {/* === Header === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Configurações
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Gerencie seu perfil e acompanhe seus dados no projeto.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === Coluna Esquerda: Perfil e QR === */}
        <div className="flex flex-col gap-6">

          {/* === HERO: Perfil === */}
      <div
        className="relative rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] overflow-hidden p-6 flex flex-col gap-4 bg-white dark:bg-[#111111]"
      >
        {/* Red glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[120px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.18) 0%, transparent 70%)" }}
        />

        <div className="flex items-center gap-4 relative z-10">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-2 border-neutral-200 dark:border-[#2C2C2E] bg-neutral-100 dark:bg-[#1C1C1E]"
          >
            <span className="font-display text-3xl font-black text-neutral-900 dark:text-white">{initial}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="font-display text-2xl font-black uppercase leading-tight truncate text-neutral-900 dark:text-[#F2F2F7]"
            >
              {profile.fullName}
            </h1>
              <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">{profile.email}</p>
          </div>

          {/* Belt Badge */}
          <div
            className="h-8 rounded-full flex items-center px-3 gap-1.5 shrink-0 border"
            style={{
              background: beltColor.bg,
              borderColor: beltColor.border,
            }}
          >
            <span className="text-xs font-bold uppercase" style={{ color: beltColor.text }}>
              {profile.belt}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 relative z-10">
          <div
            className="flex-1 rounded-xl p-3 border border-neutral-200 dark:border-[#2C2C2E] bg-neutral-100 dark:bg-[#1C1C1E] flex flex-col items-center gap-1"
          >
            <span className="font-mono text-3xl font-bold text-red-600 dark:text-red-500">{attendanceCount}</span>
            <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-[#8E8E93]">Treinos</span>
          </div>
          <div
            className="flex-1 rounded-xl p-3 border border-neutral-200 dark:border-[#2C2C2E] bg-neutral-100 dark:bg-[#1C1C1E] flex flex-col items-center gap-1"
          >
            <span className="font-mono text-3xl font-bold text-green-600 dark:text-[#34C759]">{profile.category === "academico" ? "EXT" : "ALU"}</span>
            <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-[#8E8E93]">Perfil</span>
          </div>
          <div
            className="flex-1 rounded-xl p-3 border border-neutral-200 dark:border-[#2C2C2E] bg-neutral-100 dark:bg-[#1C1C1E] flex flex-col items-center gap-1"
          >
            <span className="font-mono text-3xl font-bold text-neutral-900 dark:text-[#F2F2F7]">
              {profile.isActive ? "ON" : "OFF"}
            </span>
            <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-[#8E8E93]">Status</span>
          </div>
        </div>
      </div>

      {/* === CTA: Scanner QR (Oculto para Admin) === */}
      {profile.role !== "admin" && (
        <Link
          href="/aluno/scanner"
          className="flex items-center justify-center gap-3 h-[54px] rounded-full font-bold text-base transition-all active:scale-[0.97] hover:opacity-90"
          style={{
            background: "#dc2626",
            color: "#fff",
            boxShadow: "0 0 24px rgba(220,38,38,0.35)",
          }}
        >
          <IconQrcode className="w-5 h-5" />
          ABRIR SCANNER QR
        </Link>
      )}
        </div> {/* End Left Col */}

        {/* === Coluna Direita: Ferramentas e Treinos === */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* === Treino do Dia === */}
      {todayWorkout && (
        <div
          className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-3 bg-white dark:bg-[#111111]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
              🥋 Treino do Dia
            </span>
            <span className="text-xs text-neutral-500 dark:text-[#8E8E93]">
              {new Date(todayWorkout.date).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <h2 className="font-display text-2xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
            {todayWorkout.techniqueName}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-[#8E8E93]">
            {todayWorkout.techniqueWhat.slice(0, 100)}…
          </p>
        </div>
      )}

      {/* === Actions rápidas === */}
      <div className="grid grid-cols-2 gap-3">
        {[
          ...(profile.role !== "admin" ? [{ href: "/aluno/history", label: "Histórico", icon: IconHistory }] : []),
          { href: "/aluno/principios", label: "32 Princípios", icon: IconBook },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-4 flex items-center justify-between transition-colors hover:border-[#dc2626]/50 group bg-white dark:bg-[#111111]"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg"><Icon className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93]" /></span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-[#F2F2F7]">{label}</span>
            </span>
            <IconChevronRight className="w-4 h-4 group-hover:text-[#dc2626] transition-colors text-neutral-400 dark:text-[#8E8E93]" />
          </Link>
        ))}
      </div>

      {/* === Aluno Extensionista === */}
      {profile.category === "academico" && (
        <div
          className="rounded-2xl border p-5 flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
        >
          <IconCircleCheck className="w-5 h-5 shrink-0 mt-0.5 text-green-600 dark:text-[#34C759]" />
          <div>
            <p className="font-semibold text-sm mb-1 text-neutral-900 dark:text-[#F2F2F7]">Aluno Extensionista</p>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-[#8E8E93]">
              Suas presenças e resumos de treino são registrados automaticamente para horas complementares.
            </p>
          </div>
        </div>
      )}

        </div> {/* End Right Col */}
      </div> {/* End Grid */}
    </div>
  );
}
