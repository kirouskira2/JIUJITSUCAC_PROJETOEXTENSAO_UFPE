import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "../../admin/reports/reports-client";

export default async function MonitorReportsPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "monitor" && sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">
      <ReportsClient 
        isExtensionistOnly={true} 
        currentUserId={sessionData.profile.id}
        currentUserName={sessionData.profile.fullName}
      />
    </div>
  );
}
