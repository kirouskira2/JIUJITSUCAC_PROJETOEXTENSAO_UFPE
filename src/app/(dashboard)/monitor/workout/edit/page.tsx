import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { listPrinciples } from "@/actions/principles";
import { getTodayWorkout } from "@/actions/checkin";
import { WorkoutForm } from "@/components/workout-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function WorkoutEditPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin" && sessionData?.profile.role !== "monitor") {
    redirect("/aluno");
  }

  const { data: principles } = await listPrinciples();
  const { data: todayWorkoutData } = await getTodayWorkout();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6 px-4 md:px-0">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <Link
          href="/monitor/workout"
          className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors hover:border-red-500 bg-white dark:bg-[#1C1C1E] border-neutral-200 dark:border-[#2C2C2E] text-red-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            {todayWorkoutData?.workout ? "Editar Treino" : "Registrar Treino"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Utilize a Metodologia Shading para definir a técnica do dia.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border p-6 bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#2C2C2E]">
        <WorkoutForm 
          principles={principles || []} 
          initialWorkout={todayWorkoutData?.workout || undefined}
          redirectOnSuccess={sessionData?.profile.role === "admin" ? "/admin/workouts" : "/monitor/workout"}
        />
      </div>
    </div>
  );
}
