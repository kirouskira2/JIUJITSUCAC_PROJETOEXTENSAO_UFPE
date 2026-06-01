import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getStudentsReadyForGraduation } from "@/actions/graduation";
import { CeremonyClient } from "./ceremony-client";

export default async function AdminCeremonyPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  // Buscar todos os alunos, mas filtrar apenas os que bateram 100% da meta
  const { data: studentsReady } = await getStudentsReadyForGraduation();
  
  const eligibleCandidates = (studentsReady || []).filter(c => c.attendanceCount >= c.requiredClasses);

  return (
    <div className="w-full h-full flex flex-col py-6 max-w-6xl mx-auto">
      <CeremonyClient candidates={eligibleCandidates} />
    </div>
  );
}
