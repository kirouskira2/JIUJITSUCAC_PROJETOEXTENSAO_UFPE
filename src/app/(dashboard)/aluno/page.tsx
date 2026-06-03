import { getSession } from "@/actions/auth";
import { getMyAttendance, getTodayWorkout } from "@/actions/checkin";
import Link from "next/link";
import { IconQrcode, IconChevronRight, IconCircleCheck, IconHistory } from "@tabler/icons-react";
import { BELT_BADGE_STYLES } from "@/lib/constants";
import { ProfileSettingsModal } from "./profile-settings-modal";

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

      {/* === Banner Treino do Dia === */}
      {todayWorkout ? (
        <div className="w-full relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#2C2C2E] p-6 md:p-8 flex flex-col gap-3 bg-white dark:bg-[#111111]">
          {/* Red glow background */}
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
            style={{ background: "rgba(220,38,38,0.15)" }}
          />
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500 flex items-center gap-2">
              🥋 Treino do Dia
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
              {todayWorkout.techniqueName}
            </h2>
            <div className="flex flex-col gap-1 mt-2 max-w-3xl">
              <span className="text-sm font-bold text-neutral-700 dark:text-[#E5E5EA]">Princípio {workoutData?.principle?.number}: {workoutData?.principle?.titlePt}</span>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-[#8E8E93] line-clamp-2 md:line-clamp-none">
                {todayWorkout.techniqueWhat}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-2xl border border-dashed border-neutral-300 dark:border-[#2C2C2E] p-6 text-center flex flex-col items-center justify-center gap-2 bg-neutral-50/50 dark:bg-black/20">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#8E8E93]">
            🥋 Treino do Dia
          </span>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            O treino de hoje ainda não foi registrado pelo professor.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === Coluna Esquerda: Perfil e QR === */}
        <div className="flex flex-col gap-6">

          {/* === HERO: Perfil === */}
      <div
        className="relative rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] overflow-hidden p-5 md:p-6 flex flex-col gap-5 bg-white dark:bg-[#111111]"
      >
        {/* Red glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[120px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.18) 0%, transparent 70%)" }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
          {/* Avatar */}
          <div
            className="w-20 h-20 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 border-2 border-neutral-200 dark:border-[#2C2C2E] bg-neutral-100 dark:bg-[#1C1C1E]"
          >
            <span className="font-display text-3xl font-black text-neutral-900 dark:text-white">{initial}</span>
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h1
              className="font-display text-2xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]"
            >
              {profile.fullName}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-[#8E8E93] break-all">{profile.email}</p>
            
            {/* Belt Badge - shown on mobile below the name, or inline on desktop */}
            <div className="mt-3 flex items-center gap-2">
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
          </div>

          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex justify-center sm:justify-end">
            <ProfileSettingsModal profile={profile} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div
            className="rounded-xl p-2 sm:p-3 bg-neutral-50 dark:bg-[#1C1C1E] border border-neutral-100 dark:border-[#2C2C2E] flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-500">{attendanceCount}</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 dark:text-[#8E8E93] mt-1">Treinos</span>
          </div>
          <div
            className="rounded-xl p-2 sm:p-3 bg-neutral-50 dark:bg-[#1C1C1E] border border-neutral-100 dark:border-[#2C2C2E] flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-base sm:text-lg lg:text-xl font-bold text-green-600 dark:text-[#34C759]">{profile.category === "academico" ? "EXTENSIONISTA" : "ALUNO"}</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 dark:text-[#8E8E93] mt-1">Perfil</span>
          </div>
          <div
            className="rounded-xl p-2 sm:p-3 bg-neutral-50 dark:bg-[#1C1C1E] border border-neutral-100 dark:border-[#2C2C2E] flex flex-col items-center justify-center text-center"
          >
            <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-[#F2F2F7]">
              {profile.isActive ? "ON" : "OFF"}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wide text-neutral-500 dark:text-[#8E8E93] mt-1">Status</span>
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

      {/* === Actions rápidas === */}
      {profile.role !== "admin" && (
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/aluno/history"
            className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-4 flex items-center justify-between transition-colors hover:border-[#dc2626]/50 group bg-white dark:bg-[#111111]"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg"><IconHistory className="w-5 h-5 text-neutral-500 dark:text-[#8E8E93]" /></span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-[#F2F2F7]">Histórico</span>
            </span>
            <IconChevronRight className="w-4 h-4 group-hover:text-[#dc2626] transition-colors text-neutral-400 dark:text-[#8E8E93]" />
          </Link>
        </div>
      )}

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
