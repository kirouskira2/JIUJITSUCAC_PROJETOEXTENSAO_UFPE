import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { listPrinciples } from "@/actions/principles";
import { getTodayWorkout } from "@/actions/checkin";
import { WorkoutForm } from "@/components/workout-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function WorkoutFormPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin" && sessionData?.profile.role !== "monitor") {
    redirect("/aluno");
  }

  const { data: principles } = await listPrinciples();
  const { data: todayWorkoutData } = await getTodayWorkout();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <Link
          href="/monitor"
          className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors hover:border-[#dc2626] bg-white dark:bg-[#1C1C1E] border-neutral-200 dark:border-[#2C2C2E] text-red-600 dark:text-[#dc2626]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Treino do Dia
          </h1>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Registre ou atualize utilizando a Metodologia Shading.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border p-6 bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#2C2C2E]">
        <WorkoutForm 
          principles={principles || []} 
          initialWorkout={todayWorkoutData?.workout || undefined}
        />
        
        {todayWorkoutData?.workout && (
          <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-[#2C2C2E] flex flex-col items-center">
            <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-[#F2F2F7] mb-2">QR Code do Treino</h3>
            <p className="text-sm text-neutral-500 dark:text-[#8E8E93] text-center max-w-sm mb-6">
              Exiba o QR Code no CT para que os alunos possam fazer o check-in através do próprio celular.
            </p>
            <Link
              href="/monitor/workout/qr"
              className="flex items-center justify-center gap-2 w-full max-w-xs h-12 rounded-full font-bold transition-all hover:opacity-90 bg-neutral-900 dark:bg-[#F2F2F7] text-white dark:text-[#111111]"
            >
              Exibir QR Code Estático
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
