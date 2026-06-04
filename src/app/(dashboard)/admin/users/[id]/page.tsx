import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { getProfile } from "@/actions/profiles";
import { getAllAttendance } from "@/actions/checkin";
import { redirect, notFound } from "next/navigation";
import { BELT_BADGE_STYLES } from "@/lib/constants";
import Link from "next/link";
import { IconArrowLeft, IconCalendar, IconMedal, IconMail, IconId, IconPhone } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Perfil do Aluno | JJCAC",
};

export default async function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sessionData = await getSession();
  if (!sessionData.success || !sessionData.data) redirect("/auth/login");
  if (sessionData.data.profile.role !== "admin") redirect("/aluno");

  const profileRes = await getProfile({ profileId: id });
  if (!profileRes.success || !profileRes.data) notFound();

  const profile = profileRes.data;
  const beltStyle = BELT_BADGE_STYLES[profile.belt] ?? BELT_BADGE_STYLES["Branca"];
  const initial = profile.fullName.charAt(0).toUpperCase();

  // Buscar presenças deste aluno (últimos 90 dias)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const historyRes = await getAllAttendance({ startDate: ninetyDaysAgo, endDate: new Date(), profileId: id });
  const userAttendance = historyRes.success && historyRes.data ? historyRes.data : [];

  const categoryLabel = profile.category === "academico" ? "Extensionista" : profile.category === "frequente" ? "Aluno" : "Visitante";
  const roleLabel = profile.role === "admin" ? "Professor" : profile.role === "monitor" ? "Monitor" : "Aluno";

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6">

      {/* Back */}
      <Link
        href="/admin/history"
        className="flex items-center gap-2 text-sm font-semibold text-neutral-500 dark:text-[#8E8E93] hover:text-red-500 dark:hover:text-red-400 transition-colors w-fit"
      >
        <IconArrowLeft className="w-4 h-4" />
        Voltar ao Histórico
      </Link>

      {/* Hero Card */}
      <div className="relative rounded-3xl border border-border overflow-hidden p-6 bg-surface-container">
        {/* Red glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[120px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.15) 0%, transparent 70%)" }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-2"
            style={{ borderColor: beltStyle.border, background: beltStyle.bg }}
          >
            <span className="font-display text-3xl font-black" style={{ color: beltStyle.text }}>{initial}</span>
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
              {profile.fullName}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className="text-xs font-bold uppercase px-3 py-1 rounded-full border"
                style={{ background: beltStyle.bg, color: beltStyle.text, borderColor: beltStyle.border }}
              >
                {profile.belt}
              </span>
              {roleLabel !== categoryLabel && (
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border border-border text-neutral-700 dark:text-[#8E8E93] bg-surface-container">
                  {roleLabel}
                </span>
              )}
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border border-border text-neutral-700 dark:text-[#8E8E93] bg-surface-container">
                {categoryLabel}
              </span>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${profile.isActive ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"}`}>
                {profile.isActive ? "Ativo" : "Bloqueado"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-neutral-100 dark:border-[#2C2C2E] relative z-10">
          <InfoItem icon={<IconMail className="w-4 h-4" />} label="E-mail" value={profile.email} />
          <InfoItem icon={<IconId className="w-4 h-4" />} label="CPF" value={profile.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"} />
          <InfoItem icon={<IconPhone className="w-4 h-4" />} label="Telefone" value={profile.phone || "—"} />
          <InfoItem icon={<IconMedal className="w-4 h-4" />} label="Instituição" value={profile.institution || "—"} />
          <InfoItem icon={<IconId className="w-4 h-4" />} label="Matrícula" value={profile.enrollmentId || "—"} />
          <InfoItem icon={<IconCalendar className="w-4 h-4" />} label="Cadastro" value={new Date(profile.createdAt).toLocaleDateString("pt-BR")} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Presenças (90 dias)" value={userAttendance.length} />
        <StatCard label="Horas de Extensão" value={`${(userAttendance.length * 1.5).toFixed(1)}h`} />
        <StatCard label="Último Check-in" value={userAttendance.length > 0 ? new Date(userAttendance[0].checkedInAt).toLocaleDateString("pt-BR") : "—"} />
      </div>

      {/* Histórico Individual */}
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
          Histórico de Presenças
        </h3>

        {userAttendance.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-3xl border border-dashed border-border bg-neutral-50 dark:bg-[#111111]">
            <IconCalendar className="w-8 h-8 text-neutral-400 dark:text-[#48484A]" />
            <p className="text-sm font-semibold text-neutral-500 dark:text-[#8E8E93]">Nenhuma presença registrada nos últimos 90 dias.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {userAttendance.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-border bg-surface-container p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-red-600 dark:text-red-500">
                      #{record.workout?.principle?.number || "?"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-[#F2F2F7] truncate">
                      {record.workout?.techniqueName || "Treino"}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-[#8E8E93]">
                      {new Date(record.checkedInAt).toLocaleDateString("pt-BR")} às {new Date(record.checkedInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {record.hygieneConfirmed && (
                  <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2 py-0.5 rounded-full shrink-0">
                    Higiene ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container border border-neutral-100 dark:border-[#2C2C2E]">
      <div className="text-neutral-400 dark:text-[#636366] mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-[#8E8E93]">{label}</p>
        <p className="text-sm font-medium text-neutral-900 dark:text-[#F2F2F7] break-all">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-container p-4 flex flex-col items-center justify-center text-center gap-1">
      <span className="font-mono text-2xl font-bold text-red-600 dark:text-red-500">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">{label}</span>
    </div>
  );
}
