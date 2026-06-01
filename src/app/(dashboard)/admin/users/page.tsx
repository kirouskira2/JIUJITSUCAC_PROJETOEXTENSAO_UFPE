import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { listProfiles } from "@/actions/profiles";
import { UserTable } from "@/components/user-table";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminUsersPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  // Na Fase 5 isso receberá os searchParams para filtragem real
  const { data: profiles } = await listProfiles({});

  // Mapear os profiles vindos do Zod (camelCase) para o formato esperado pela UserTable
  const mappedProfiles = (profiles || []).map(p => ({
    id: p.id,
    full_name: p.fullName,
    email: p.email,
    cpf: p.cpf,
    role: p.role,
    belt: p.belt,
    category: p.category,
    is_active: p.isActive
  }));

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
            Gestão de Alunos
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Gerencie alunos, monitores e administradores do tatame.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-[#2C2C2E] p-6 bg-white dark:bg-[#111111]">
        <UserTable initialProfiles={mappedProfiles} currentUserId={sessionData.profile.id} />
      </div>
    </div>
  );
}
