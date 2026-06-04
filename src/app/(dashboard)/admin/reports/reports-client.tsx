"use client";

import { useState } from "react";
import { IconSearch, IconFileDescription, IconDownload, IconUsers, IconRefresh } from "@tabler/icons-react";
import { getReportCSVData, generateExtensionReport, ExtensionReportStats } from "@/actions/reports";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface ReportsClientProps {
  students?: {
    id: string;
    fullName: string;
  }[];
  isExtensionistOnly?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

export function ReportsClient({ students = [], isExtensionistOnly, currentUserId, currentUserName }: ReportsClientProps) {
  const [profileId, setProfileId] = useState(currentUserId || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("all");
  const [stats, setStats] = useState<ExtensionReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRecalculate = async () => {
    setIsLoading(true);
    const result = await generateExtensionReport({
      profileId: profileId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: category !== "all" ? category : undefined
    });

    if (result.success && result.data) {
      setStats(result.data);
      toast({
        title: "Preview Atualizado",
        description: "Os dados foram recalculados com sucesso."
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao calcular",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    const result = await getReportCSVData({
      profileId: profileId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: category !== "all" ? category : undefined
    });

    if (result.success && result.data) {
      if (result.data.length === 0) {
        toast({ title: "Vazio", description: "Nenhum dado encontrado para os filtros." });
        setIsLoading(false);
        return;
      }

      const headers = Object.keys(result.data[0]).join(",");
      const rows = result.data.map((row: Record<string, string | number>) => Object.values(row).map(val => `"${val}"`).join(","));
      const csvContent = [headers, ...rows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio_extensao_${new Date().getTime()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportado",
        description: "Arquivo CSV baixado com sucesso."
      });
    } else {
      toast({ title: "Erro", description: "Falha ao gerar CSV.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleExportPDF = () => {
    if (!profileId) {
      toast({
        title: "Seleção Necessária",
        description: "Por favor, selecione um aluno específico para gerar a declaração de horas nominal.",
        variant: "destructive"
      });
      return;
    }
    
    // Abre a rota de impressão (isolada do dashboard) em nova aba
    window.open(`/print/extensao/${profileId}`, '_blank');
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6" style={{ borderBottom: "1px solid #2C2C2E" }}>
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
            {isExtensionistOnly ? "Meus Relatórios" : "Relatórios Gerais"}
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            {isExtensionistOnly 
              ? "Gere sua declaração de horas de extensão acadêmica."
              : "Gere e gerencie horas de extensão acadêmica para alunos."}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto print:hidden">
          <button 
            onClick={handleExportCSV}
            disabled={isLoading}
            className="flex-1 md:flex-none h-[54px] px-6 rounded-full border font-bold flex items-center justify-center gap-2 transition-colors hover:bg-neutral-100 dark:hover:bg-[#1C1C1E] disabled:opacity-50 text-neutral-900 dark:text-[#F2F2F7] border-border"
          >
            <IconFileDescription className="w-5 h-5" />
            Exportar CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none h-[54px] px-6 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-[0_4px_20px_rgba(220,38,38,0.3)] bg-red-600 text-white"
          >
            <IconDownload className="w-5 h-5" />
            Imprimir (PDF)
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configurator Column */}
        <div className="lg:col-span-2 space-y-6 print:hidden">
          
          {/* Individual Report Card */}
          <div className="rounded-3xl border p-6 relative overflow-hidden group transition-colors bg-surface-container border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500">
                <IconSearch className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Filtros por Aluno</h3>
            </div>
            
            <div className={`grid grid-cols-1 gap-4 ${isExtensionistOnly ? "" : "md:grid-cols-2"}`}>
              {!isExtensionistOnly && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Selecionar Aluno</label>
                  <div className="relative">
                    <select 
                      value={profileId}
                      onChange={(e) => setProfileId(e.target.value)}
                      className="w-full h-12 rounded-lg px-4 text-sm font-medium outline-none border transition-colors appearance-none bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600"
                    >
                      <option value="">Todos os Alunos</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Período (Data)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-12 rounded-lg px-3 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                  <span className="text-neutral-500 dark:text-[#8E8E93]">-</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-12 rounded-lg px-3 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* General Report Card (Only for Admin) */}
          {!isExtensionistOnly && (
            <div className="rounded-3xl border p-6 relative overflow-hidden group transition-colors bg-surface-container border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-[#0A84FF]">
                  <IconUsers className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Filtros Gerais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Filtrar por Programa</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 rounded-lg px-4 text-sm font-medium outline-none border transition-colors appearance-none bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-blue-600 dark:focus:border-[#0A84FF]"
                  >
                    <option value="all">Todos os Alunos</option>
                    <option value="Departamento de Ed. Física">Departamento de Ed. Física</option>
                    <option value="Bolsistas de Extensão">Bolsistas de Extensão</option>
                    <option value="Comunidade">Comunidade</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleRecalculate}
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-900 dark:text-[#F2F2F7] hover:bg-neutral-200 dark:hover:bg-[#2C2C2E]"
                >
                  Atualizar Preview
                </button>
              </div>
            </div>
          )}

          {/* Update Preview Button for Extensionist */}
          {isExtensionistOnly && (
            <button 
              onClick={handleRecalculate}
              disabled={isLoading}
              className="h-[54px] w-full rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-900 dark:text-[#F2F2F7] hover:bg-neutral-200 dark:hover:bg-[#2C2C2E] border border-border"
            >
              <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Preview das Horas
            </button>
          )}

        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1 print:col-span-3 print:border-none print:shadow-none">
          <div className="rounded-3xl border p-6 h-full flex flex-col relative overflow-hidden shadow-2xl print:border-2 bg-surface-container border-border">
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Preview (Ao vivo)</h3>
              <div className="w-2.5 h-2.5 rounded-full animate-pulse print:hidden bg-red-600" />
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 relative z-10">
              <div className="w-32 h-32 flex items-center justify-center relative">
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={stats?.totalHours || 0}
                  gaugePrimaryColor="#dc2626"
                  gaugeSecondaryColor="rgba(142,142,147,0.2)"
                  className="w-full h-full text-transparent"
                >
                  <div className="flex flex-col items-center justify-center absolute inset-0">
                    <span className="font-mono text-5xl font-bold text-neutral-900 dark:text-[#F2F2F7]">
                      {stats?.totalHours || 0}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-[#8E8E93]">Horas</span>
                  </div>
                </AnimatedCircularProgressBar>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-[#8E8E93]">
                  Calculado para <strong className="text-neutral-900 dark:text-[#F2F2F7]">
                    {stats?.studentName || (isExtensionistOnly ? currentUserName : (category !== "all" ? category : "Todos os alunos"))}
                  </strong>
                </p>
                <p className="text-xs mt-1 text-neutral-500 dark:text-[#48484A]">
                  Período: {stats?.startDate || "Início"} - {stats?.endDate || "Atual"}
                </p>
                <p className="text-[10px] mt-4 uppercase tracking-wider font-bold text-neutral-500 dark:text-[#8E8E93]">
                  Baseado em {stats?.totalClasses || 0} presenças registradas
                </p>
              </div>
            </div>

            <button 
              onClick={handleRecalculate}
              disabled={isLoading}
              className="w-full h-[54px] mt-8 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors border relative z-10 hover:border-neutral-400 dark:hover:border-[#8E8E93] print:hidden disabled:opacity-50 bg-white dark:bg-[#131313] border-border text-neutral-900 dark:text-[#F2F2F7]"
            >
              <IconRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Recalcular
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
