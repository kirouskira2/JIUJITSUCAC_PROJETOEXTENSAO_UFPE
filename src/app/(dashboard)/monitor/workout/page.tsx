import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getTodayWorkout } from "@/actions/checkin";
import Link from "next/link";
import { ArrowLeft, Edit3, QrCode, AlertCircle } from "lucide-react";

export default async function MonitorWorkoutPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin" && sessionData?.profile.role !== "monitor") {
    redirect("/aluno");
  }

  const { data: todayWorkoutData } = await getTodayWorkout();
  const workout = todayWorkoutData?.workout;
  const principle = todayWorkoutData?.principle;

  if (!workout) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 py-12 px-4 text-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-neutral-900 dark:text-[#F2F2F7]">
          Nenhum Treino Registrado Hoje
        </h2>
        <p className="text-sm text-neutral-500 dark:text-[#8E8E93] max-w-sm">
          Registre a técnica e o princípio do dia para que os alunos possam fazer check-in.
        </p>
        <Link
          href="/monitor/workout/edit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Registrar Treino do Dia
        </Link>
        <Link href="/monitor" className="text-xs text-neutral-500 dark:text-[#8E8E93] hover:underline">
          ← Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6 px-4 md:px-0">

      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Link
          href="/monitor"
          className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors hover:border-red-500 bg-surface-container border-border text-red-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Treino do Dia
          </h1>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Visualize os detalhes da aula de hoje.
          </p>
        </div>
        <Link
          href="/monitor/workout/edit"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-container hover:border-red-500/50 transition-colors text-sm font-bold text-neutral-900 dark:text-[#F2F2F7]"
        >
          <Edit3 className="w-4 h-4 text-red-600 dark:text-red-500" />
          Editar
        </Link>
      </div>

      {/* Workout Card */}
      <div className="relative rounded-3xl overflow-hidden border border-border p-6 md:p-8 bg-surface-container">
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
          style={{ background: "rgba(220,38,38,0.12)" }}
        />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-red-600 dark:bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
              Treino Ativo
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
            {workout.techniqueName}
          </h2>

          {/* Principle */}
          {principle && (
            <div className="rounded-xl border border-border p-4 bg-neutral-50 dark:bg-[#0A0A0A]">
              <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                Princípio #{principle.number}
              </span>
              <h3 className="font-display text-lg font-black text-neutral-900 dark:text-[#F2F2F7] mt-1">
                {principle.titlePt}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#8E8E93] italic mt-0.5">{principle.titleEn}</p>
            </div>
          )}

          {/* Technique Details */}
          <div className="space-y-4 mt-2">
            {workout.techniqueWhat && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93] mb-1">O quê?</h4>
                <p className="text-sm leading-relaxed text-neutral-900 dark:text-[#E5E5EA]">{workout.techniqueWhat}</p>
              </div>
            )}
            {workout.techniqueWhy && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93] mb-1">Por quê?</h4>
                <p className="text-sm leading-relaxed text-neutral-900 dark:text-[#E5E5EA]">{workout.techniqueWhy}</p>
              </div>
            )}
            {workout.techniqueHow && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93] mb-1">Como?</h4>
                <p className="text-sm leading-relaxed text-neutral-900 dark:text-[#E5E5EA]">{workout.techniqueHow}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Link */}
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-sm text-neutral-500 dark:text-[#8E8E93] text-center max-w-sm">
          Exiba o QR Code no CT para que os alunos façam check-in pelo celular.
        </p>
        <Link
          href="/monitor/workout/qr"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-neutral-900 dark:bg-[#F2F2F7] text-white dark:text-[#111111] hover:opacity-90 transition-opacity"
        >
          <QrCode className="w-5 h-5" />
          Exibir QR Code
        </Link>
      </div>
    </div>
  );
}
