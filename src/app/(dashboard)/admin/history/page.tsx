import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { getAllAttendancePaginated } from "@/actions/checkin";
import { AdminHistoryClient } from "./history-client";

export const metadata: Metadata = {
  title: "Histórico de Presença Geral | JJCAC",
};

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sessionData = await getSession();

  if (!sessionData.success || !sessionData.data) {
    redirect("/auth/login");
  }

  const { profile } = sessionData.data;

  if (profile.role !== "admin") {
    redirect("/aluno");
  }

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  // Busca paginada — últimos 30 dias como padrão
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const historyRes = await getAllAttendancePaginated({ 
    startDate: thirtyDaysAgo, 
    endDate: new Date(),
    page: currentPage,
    pageSize: 30,
  });

  const attendance = historyRes.success && historyRes.data ? historyRes.data.data : [];
  const pagination = historyRes.success && historyRes.data ? historyRes.data.pagination : null;

  return <AdminHistoryClient initialData={attendance} pagination={pagination} />;
}
