import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { listWorkouts } from "@/actions/workouts";
import { listPrinciples } from "@/actions/principles";
import { redirect } from "next/navigation";
import { WorkoutsClient } from "./workouts-client";

export const metadata: Metadata = {
  title: "Gestão de Treinos | JJCAC",
};

export default async function AdminWorkoutsPage() {
  const sessionData = await getSession();
  if (!sessionData.success || !sessionData.data) redirect("/auth/login");
  if (sessionData.data.profile.role !== "admin") redirect("/aluno");

  // Busca todos os treinos (para o admin gerenciar) e a lista de princípios
  const workoutsRes = await listWorkouts({});
  const principlesRes = await listPrinciples();

  return (
    <WorkoutsClient 
      initialWorkouts={workoutsRes.success && workoutsRes.data ? workoutsRes.data : []} 
      principles={principlesRes.success && principlesRes.data ? principlesRes.data : []} 
    />
  );
}
