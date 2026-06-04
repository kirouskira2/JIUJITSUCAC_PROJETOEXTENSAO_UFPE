import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { ProfileSettingsModal } from "../profile-settings-modal";
import { BELT_BADGE_STYLES } from "@/lib/constants";

export default async function AlunoSettingsPage() {
  const { data: sessionData } = await getSession();
  const profile = sessionData?.profile;
  if (!profile) redirect("/login");

  const beltColor = BELT_BADGE_STYLES[profile.belt] ?? BELT_BADGE_STYLES["Branca"];
  const initial = profile.fullName.charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6 px-4 md:px-0">

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <Link
          href="/aluno"
          className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors hover:border-red-500 bg-white dark:bg-[#1C1C1E] border-neutral-200 dark:border-[#2C2C2E] text-red-600"
        >
          <IconArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Configurações
          </h1>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Gerencie seu perfil e dados pessoais.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] overflow-hidden p-6 flex flex-col gap-5 bg-white dark:bg-[#111111]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[120px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.15) 0%, transparent 70%)" }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-2 border-neutral-200 dark:border-[#2C2C2E] bg-neutral-100 dark:bg-[#1C1C1E]">
            <span className="font-display text-2xl font-black text-neutral-900 dark:text-white">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
              {profile.fullName}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-[#8E8E93] break-all">{profile.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-7 rounded-full flex items-center px-3 gap-1.5 shrink-0 border"
                style={{ background: beltColor.bg, borderColor: beltColor.border }}
              >
                <span className="text-[10px] font-bold uppercase" style={{ color: beltColor.text }}>
                  {profile.belt}
                </span>
              </div>
              <span className="text-xs text-neutral-400 uppercase font-bold">
                {profile.category === "academico" ? "Extensionista" : "Aluno"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end relative z-10">
          <ProfileSettingsModal profile={profile} />
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 bg-white dark:bg-[#111111]">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F2F2F7] mb-3">Informações da Conta</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-[#8E8E93]">Celular</span>
            <span className="text-neutral-900 dark:text-[#F2F2F7] font-medium">{profile.phone || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-[#8E8E93]">Contato de Emergência</span>
            <span className="text-neutral-900 dark:text-[#F2F2F7] font-medium">{profile.emergencyContact || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-[#8E8E93]">Papel</span>
            <span className="text-neutral-900 dark:text-[#F2F2F7] font-medium uppercase">{profile.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-[#8E8E93]">Status</span>
            <span className={`font-bold ${profile.isActive ? "text-green-600 dark:text-[#34C759]" : "text-red-500"}`}>
              {profile.isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
