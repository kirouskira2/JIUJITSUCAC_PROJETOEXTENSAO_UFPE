import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";
import { listProfiles } from "@/actions/profiles";

export default async function AdminReportsPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  const { data: profiles } = await listProfiles({});

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">
      <ReportsClient students={profiles || []} />
    </div>
  );
}
