import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/actions/dashboard";
import { AttendanceChart } from "@/components/attendance-chart";
import { listWorkouts } from "@/actions/workouts";
import { listPrinciples } from "@/actions/principles";
import { WorkoutEditModal } from "@/components/workout-edit-modal";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IconUsers, IconBarbell, IconChartBar, IconTarget, IconChevronRight, IconIdBadge, IconCertificate, IconClipboardList } from "@tabler/icons-react";
import Link from "next/link";
import { BELT_COLORS } from "@/lib/constants";

export default async function AdminDashboardPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  const { data: stats } = await getDashboardStats({});
  const totalStudents = stats?.totalStudents || 0;

  const { data: workoutsData } = await listWorkouts({});
  const todayWorkout = workoutsData?.[0] ?? null;

  const { data: principlesData } = await listPrinciples();
  const principles = principlesData || [];

  const kpis = [
    {
      icon: <IconUsers className="w-5 h-5" style={{ color: "#dc2626" }} />,
      label: "Total de Alunos",
      value: stats?.totalStudents || 0,
      sub: `${stats?.activeStudents || 0} ativos`,
      subColor: "#34C759",
    },
    {
      icon: <IconBarbell className="w-5 h-5" style={{ color: "#dc2626" }} />,
      label: "Treinos Registrados",
      value: stats?.totalWorkouts || 0,
      sub: "total",
      subColor: "#8E8E93",
    },
    {
      icon: <IconChartBar className="w-5 h-5" style={{ color: "#dc2626" }} />,
      label: "Média de Presença",
      value: stats?.averageAttendance || 0,
      sub: "/ treino",
      subColor: "#8E8E93",
    },
    {
      icon: <IconTarget className="w-5 h-5" style={{ color: "#dc2626" }} />,
      label: "Alunos Frequentes",
      value: stats?.studentsByCategory?.frequente || 0,
      sub: "categoria frequente",
      subColor: "#8E8E93",
    },
  ];

  const categories = [
    { label: "Frequentes", value: stats?.studentsByCategory?.frequente || 0, color: "#dc2626" },
    { label: "Acadêmicos", value: stats?.studentsByCategory?.academico || 0, color: "#0A84FF" },
    { label: "Visitantes", value: stats?.studentsByCategory?.visitante || 0, color: "#8E8E93" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">

      {/* === Header === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Painel de Comando
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Visão geral do projeto Jiu-Jitsu para Todos.
          </p>
        </div>
      </div>

      {/* === Acesso Rápido === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { 
            href: "/admin/users", 
            label: "Gestão de Alunos", 
            description: "Cadastros, inativações e edição de perfis.",
            icon: IconIdBadge,
          },
          { 
            href: "/admin/reports", 
            label: "Relatórios de Extensão", 
            description: "Exporte horas e acompanhe os certificados.",
            icon: IconCertificate,
          },
        ].map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex items-start gap-4 transition-all hover:border-[#dc2626]/50 hover:-translate-y-1 group bg-white dark:bg-[#111111]"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-500 dark:text-[#8E8E93] group-hover:bg-[#dc2626]/10 group-hover:text-[#dc2626] transition-colors shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-sans font-bold text-sm text-neutral-900 dark:text-[#F2F2F7] group-hover:text-[#dc2626] transition-colors">{label}</h3>
              <p className="text-xs text-neutral-500 dark:text-[#8E8E93] mt-0.5 leading-relaxed">{description}</p>
            </div>
            <IconChevronRight className="w-4 h-4 mt-1 text-neutral-400 group-hover:text-[#dc2626] transition-transform group-hover:translate-x-1 shrink-0" />
          </Link>
        ))}
      </div>

      {/* === Banner Treino do Dia (Admin) === */}
      {todayWorkout ? (
        <Link href="/admin/workouts" className="block">
          <div className="w-full relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#2C2C2E] p-6 md:p-8 flex flex-col gap-3 bg-white dark:bg-[#111111] cursor-pointer group hover:border-red-500/50 transition-colors">
            {/* Red glow background */}
            <div
              className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
              style={{ background: "rgba(220,38,38,0.15)" }}
            />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500 flex items-center gap-2">
                  🥋 Treino do Dia (Ativo)
                </span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-[#8E8E93] flex items-center gap-1 group-hover:text-red-500 transition-colors">
                  <IconClipboardList className="w-4 h-4" /> Gestão de Treinos <IconChevronRight className="w-4 h-4" />
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7] group-hover:text-red-500 transition-colors">
                {todayWorkout.techniqueName}
              </h2>
              <div className="flex flex-col gap-1 mt-2 max-w-3xl">
                <span className="text-sm font-bold text-neutral-700 dark:text-[#E5E5EA]">
                  Princípio {principles.find(p => p.id === todayWorkout.principleId)?.number}: {principles.find(p => p.id === todayWorkout.principleId)?.titlePt}
                </span>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-[#8E8E93] line-clamp-2 md:line-clamp-none">
                  {todayWorkout.techniqueWhat}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="w-full rounded-2xl border border-dashed border-red-500/30 p-6 text-center flex flex-col items-center justify-center gap-3 bg-red-500/5">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500">
            ⚠️ Nenhum Treino Cadastrado
          </span>
          <p className="text-sm text-neutral-600 dark:text-[#8E8E93]">
            Você ou um monitor precisam registrar o treino do dia para iniciar o check-in dos alunos.
          </p>
          <Link 
            href="/admin/workouts"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Registrar Treino Agora
          </Link>
        </div>
      )}

      {/* === KPI Cards === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="relative rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-2 overflow-hidden group transition-colors hover:border-[#dc2626]/50 bg-white dark:bg-[#111111]"
          >
            {/* Faint icon bg */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {kpi.icon}
            </div>
            <div className="flex items-center gap-2">
              {kpi.icon}
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">
                {kpi.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-black text-neutral-900 dark:text-[#F2F2F7]">
                {kpi.value}
              </span>
              <span className="text-xs font-semibold" style={{ color: kpi.subColor }}>
                {kpi.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* === Main Content Row === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Categorias & Faixas */}
        <div className="flex flex-col gap-6">
          {/* Categorias */}
          <div className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-4 bg-white dark:bg-[#111111]">
            <h2 className="font-sans font-bold text-base text-neutral-900 dark:text-[#F2F2F7]">
              Categorias
            </h2>
            <div className="flex flex-col gap-4">
              {categories.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="text-neutral-500 dark:text-[#8E8E93]">{label}</span>
                    <span className="font-mono font-bold" style={{ color }}>{value}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-neutral-200 dark:bg-[#2C2C2E]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${totalStudents ? (value / totalStudents) * 100 : 0}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faixas */}
          <div className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-4 bg-white dark:bg-[#111111] flex-1">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-base text-neutral-900 dark:text-[#F2F2F7]">
                Distribuição por Faixa
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats?.studentsByBelt?.map((belt) => (
                <div
                  key={belt.belt}
                  className="rounded-xl p-4 flex flex-col items-center gap-2 border border-neutral-200 dark:border-[#2C2C2E] transition-colors hover:border-[#dc2626]/30 bg-neutral-50 dark:bg-[#1C1C1E]"
                >
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      background: BELT_COLORS[belt.belt] || "#F2F2F7",
                      borderColor: "#2C2C2E",
                    }}
                  />
                  <span className="text-xs uppercase tracking-wide font-bold text-neutral-500 dark:text-[#8E8E93]">
                    {belt.belt}
                  </span>
                  <span className="font-display text-3xl font-black text-neutral-900 dark:text-[#F2F2F7]">
                    {belt.count}
                  </span>
                </div>
              ))}
              {(!stats?.studentsByBelt || stats.studentsByBelt.length === 0) && (
                <div className="col-span-full text-center py-8 text-sm rounded-xl border border-dashed border-neutral-300 dark:border-[#2C2C2E] text-neutral-500 dark:text-[#8E8E93]">
                  Nenhum dado de faixa ainda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Gráfico de Presenças, Treino e Módulos */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-neutral-200 dark:border-[#2C2C2E] p-5 flex flex-col gap-4 bg-white dark:bg-[#111111]">
            <h2 className="font-sans font-bold text-base text-neutral-900 dark:text-[#F2F2F7]">
              Presenças por Semana
            </h2>
            <div className="h-[280px] w-full flex-1">
              <AttendanceChart data={stats?.attendanceByWeek || []} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
