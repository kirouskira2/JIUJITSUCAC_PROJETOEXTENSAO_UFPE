import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Medal } from "lucide-react";
import { getGraduationHistory } from "@/actions/graduation";

export default async function AdminGraduationHistoryPage() {
  const { data: sessionData } = await getSession();

  if (sessionData?.profile.role !== "admin") {
    redirect("/aluno");
  }

  const { data: history } = await getGraduationHistory();
  const records = history || [];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-6" style={{ borderBottom: "1px solid #2C2C2E" }}>
        <Link 
          href="/admin/graduation"
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors hover:border-[#dc2626]"
          style={{ background: "#1C1C1E", borderColor: "#2C2C2E", color: "#F2F2F7" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight" style={{ color: "#F2F2F7" }}>
            Histórico Completo
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8E8E93" }}>
            Registro de todas as graduações e promoções da academia.
          </p>
        </div>
      </div>

      <div className="rounded-xl border flex flex-col overflow-hidden" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
        {/* Search/Filter Bar */}
        <div className="p-4 flex items-center gap-4 border-b" style={{ borderColor: "#2C2C2E", background: "#1C1C1E" }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#8E8E93" }} />
            <input 
              type="text" 
              placeholder="Buscar por nome de aluno..." 
              className="w-full h-10 rounded-lg pl-10 pr-4 text-sm outline-none border transition-colors focus:border-[#dc2626]"
              style={{ background: "#0F0F0F", borderColor: "#2C2C2E", color: "#F2F2F7" }}
            />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8E8E93" }}>
            {records.length} Registros
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: "1px solid #2C2C2E", background: "#1c1b1b" }}>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: "#8E8E93" }}>Data</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: "#8E8E93" }}>Aluno</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: "#8E8E93" }}>Graduação</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider" style={{ color: "#8E8E93" }}>Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2C2E]">
              {records.map(record => (
                <tr key={record.id} className="transition-colors group hover:bg-[#1C1C1E]">
                  <td className="py-4 px-6 font-mono text-sm" style={{ color: "#8E8E93" }}>
                    {new Date(record.date).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 font-semibold" style={{ color: "#F2F2F7" }}>
                    {record.profileName}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span style={{ color: "#8E8E93" }}>{record.previousBelt}</span>
                      <span style={{ color: "#48484A" }}>→</span>
                      <span style={{ color: "#F2F2F7" }}>{record.newBelt}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm" style={{ color: "#8E8E93" }}>
                    {record.notes || "-"}
                  </td>
                </tr>
              ))}
              
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2" style={{ color: "#8E8E93" }}>
                      <Medal className="w-8 h-8 opacity-50" />
                      <span className="font-semibold text-sm">Nenhum histórico encontrado.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
