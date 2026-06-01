import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getAllAttendance } from "@/actions/checkin";
import { AdminHistoryClient } from "./history-client";

export const metadata: Metadata = {
  title: "Histórico Global | JJCAC",
};

export default async function AdminHistoryPage() {
  const sessionData = await getSession();

  if (!sessionData.success || !sessionData.data) {
    redirect("/auth/login");
  }

  const { profile } = sessionData.data;

  if (profile.role !== "admin") {
    redirect("/aluno");
  }

  // Busca todo o histórico (sem filtros de data inicialmente, ou últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const historyRes = await getAllAttendance({ startDate: thirtyDaysAgo, endDate: new Date() });
  const attendance = historyRes.success && historyRes.data ? historyRes.data : [];

  return <AdminHistoryClient initialData={attendance} />;
}
