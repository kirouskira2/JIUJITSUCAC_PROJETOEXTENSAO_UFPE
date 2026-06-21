"use client";

import { useState, useTransition } from "react";
import { toggleUserActive, promoteToMonitor, promoteToAdmin, demoteToAluno, deleteProfiles } from "@/actions/profiles";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { IconSearch, IconAlertCircle, IconMedal, IconUserShield, IconUserUp, IconTrash } from "@tabler/icons-react";
import { RoleBadge } from "@/components/role-badge";
import { BeltPromotionModal } from "@/components/belt-promotion-modal";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  cpf: string | null;
  role: string;
  belt: string;
  category: string;
  is_active: boolean;
}

interface UserTableProps {
  initialProfiles: ProfileRow[];
  currentUserId: string;
}

export function UserTable({ initialProfiles, currentUserId }: UserTableProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [selectedUserForBelt, setSelectedUserForBelt] = useState<ProfileRow | null>(null);
  const [beltModalOpen, setBeltModalOpen] = useState(false);

  const [filterRole, setFilterRole] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBelt, setFilterBelt] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch = (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
                          (p.cpf || "").includes(search.replace(/\D/g, ""));
    
    const matchesRole = filterRole === "all" || p.role === filterRole;
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    const matchesBelt = filterBelt === "all" || p.belt.toLowerCase() === filterBelt.toLowerCase();
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && p.is_active) || 
                         (filterStatus === "blocked" && !p.is_active);
    
    return matchesSearch && matchesRole && matchesCategory && matchesBelt && matchesStatus;
  });

  // --- Action Handlers ---

  const handleToggleActive = (userId: string) => {
    if (userId === currentUserId) return; 
    
    startTransition(async () => {
      const result = await toggleUserActive({ targetUserId: userId });
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === userId ? { ...p, is_active: result.data?.isActive ?? p.is_active } : p
          )
        );
        toast({
          title: "Status atualizado",
          description: `Conta ${result.data?.isActive ? "ativada" : "bloqueada"} com sucesso.`,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível alterar o status.",
          variant: "destructive",
        });
      }
    });
  };

  const handlePromote = (userId: string, userName: string) => {
    startTransition(async () => {
      const result = await promoteToMonitor({ targetUserId: userId });
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === userId ? { ...p, role: "monitor" } : p
          )
        );
        toast({
          title: "Promoção realizada!",
          description: `${userName} foi promovido(a) a Monitor.`,
        });
      } else {
        toast({
          title: "Erro na promoção",
          description: result.error || "Não foi possível promover o aluno.",
          variant: "destructive",
        });
      }
    });
  };

  const handlePromoteToAdmin = (userId: string, userName: string) => {
    startTransition(async () => {
      const result = await promoteToAdmin({ targetUserId: userId });
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === userId ? { ...p, role: "admin" } : p
          )
        );
        toast({
          title: "Promoção realizada!",
          description: `${userName} foi promovido(a) a Professor.`,
        });
      } else {
        toast({
          title: "Erro na promoção",
          description: result.error || "Não foi possível promover a professor.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDemote = (userId: string, userName: string) => {
    startTransition(async () => {
      const result = await demoteToAluno({ targetUserId: userId });
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === userId ? { ...p, role: "aluno" } : p
          )
        );
        toast({
          title: "Alteração realizada!",
          description: `${userName} agora é um aluno.`,
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível rebaixar o usuário.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Tem certeza que deseja apagar ${selectedIds.length} aluno(s)? Essa ação exige a chave de segurança de Administrador do servidor (Service Role Key).`)) return;

    startTransition(async () => {
      const res = await deleteProfiles(selectedIds);
      if (res.success) {
        setProfiles(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        toast({ title: "Alunos apagados", description: `${selectedIds.length} aluno(s) apagado(s) com sucesso.` });
      } else {
        toast({ title: "Erro na exclusão", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleBeltSuccess = (userId: string, newBelt: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === userId ? { ...p, belt: newBelt } : p
      )
    );
  };

  // --- Action Buttons (shared between desktop & mobile) ---

  const renderActionButtons = (profile: ProfileRow, compact = false) => (
    <>
      <button
        onClick={() => {
          setSelectedUserForBelt(profile);
          setBeltModalOpen(true);
        }}
        disabled={isPending}
        className={`${compact ? "px-2 py-1.5 text-[10px] w-full justify-center" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
        style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0A84FF"; e.currentTarget.style.color = "#0A84FF"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
      >
        <IconMedal className="w-3 h-3" /> Graduar
      </button>
      {profile.role === "aluno" && (
        <button
          onClick={() => handlePromote(profile.id, profile.full_name)}
          disabled={isPending}
          className={`${compact ? "px-2 py-1.5 text-[10px] w-full justify-center" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0A84FF"; e.currentTarget.style.color = "#0A84FF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
        >
          <IconUserUp className="w-3 h-3" /> Monitor
        </button>
      )}
      {profile.role !== "admin" && (
        <button
          onClick={() => handlePromoteToAdmin(profile.id, profile.full_name)}
          disabled={isPending}
          className={`${compact ? "px-2 py-1.5 text-[10px] w-full justify-center" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
        >
          <IconUserShield className="w-3 h-3" /> Prof.
        </button>
      )}
      {(profile.role === "admin" || profile.role === "monitor") && profile.id !== currentUserId && (
        <button
          onClick={() => handleDemote(profile.id, profile.full_name)}
          disabled={isPending}
          className={`${compact ? "px-2 py-1.5 text-[10px] w-full justify-center" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ea580c"; e.currentTarget.style.color = "#ea580c"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
          title="Remover privilégios e tornar Aluno"
        >
          <IconUserShield className="w-3 h-3 rotate-180" /> Rebaixar
        </button>
      )}
    </>
  );

  // --- Render ---

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-3 w-full items-start md:items-center">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs" role="search" aria-label="Buscar alunos">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-neutral-500 dark:text-[#8E8E93]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            aria-label="Buscar por nome ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl pl-10 pr-4 text-sm outline-none transition-colors border bg-surface-container border-border text-neutral-900 dark:text-[#F2F2F7] placeholder:text-neutral-400 dark:placeholder:text-[#636366] focus:border-red-600 dark:focus:border-[#dc2626]"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Função */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface-container text-neutral-900 dark:text-[#F2F2F7] text-sm font-medium px-3 pr-8 outline-none appearance-none cursor-pointer focus:border-red-600 dark:focus:border-[#dc2626] transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="all">Todas Funções</option>
            <option value="admin">Professor</option>
            <option value="monitor">Monitor</option>
            <option value="aluno">Aluno</option>
          </select>

          {/* Faixa */}
          <select
            value={filterBelt}
            onChange={(e) => setFilterBelt(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface-container text-neutral-900 dark:text-[#F2F2F7] text-sm font-medium px-3 pr-8 outline-none appearance-none cursor-pointer focus:border-red-600 dark:focus:border-[#dc2626] transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="all">Todas Faixas</option>
            <option value="branca">Branca</option>
            <option value="azul">Azul</option>
            <option value="roxa">Roxa</option>
            <option value="marrom">Marrom</option>
            <option value="preta">Preta</option>
          </select>

          {/* Categoria */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface-container text-neutral-900 dark:text-[#F2F2F7] text-sm font-medium px-3 pr-8 outline-none appearance-none cursor-pointer focus:border-red-600 dark:focus:border-[#dc2626] transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="all">Todas Categorias</option>
            <option value="frequente">Frequente (Aluno)</option>
            <option value="academico">Acadêmico (Ext.)</option>
            <option value="visitante">Visitante</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-xl border border-border bg-surface-container text-neutral-900 dark:text-[#F2F2F7] text-sm font-medium px-3 pr-8 outline-none appearance-none cursor-pointer focus:border-red-600 dark:focus:border-[#dc2626] transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="blocked">Bloqueados</option>
          </select>

          {/* Botão limpar filtros */}
          {(filterRole !== "all" || filterBelt !== "all" || filterCategory !== "all" || filterStatus !== "all" || search !== "") && (
            <button
              onClick={() => { setFilterRole("all"); setFilterBelt("all"); setFilterCategory("all"); setFilterStatus("all"); setSearch(""); }}
              className="h-10 px-3 rounded-xl border border-red-500/30 bg-surface-container text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors whitespace-nowrap"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Floating Action Bar para Deleção em Lote */}
      {selectedIds.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 w-full">
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
            {selectedIds.length} aluno(s) selecionado(s)
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={isPending}
            className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <IconTrash className="w-4 h-4" /> <span className="hidden sm:inline">Apagar Selecionados</span><span className="sm:hidden">Apagar</span>
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border overflow-x-auto bg-surface-container">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-neutral-50 dark:bg-[#1c1b1b]">
              <th className="py-4 px-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-border text-red-600 focus:ring-red-600 cursor-pointer"
                  checked={filteredProfiles.length > 0 && selectedIds.length === filteredProfiles.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(filteredProfiles.map(p => p.id));
                    else setSelectedIds([]);
                  }}
                />
              </th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Aluno</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">CPF</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Função</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Faixa</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Categoria</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-center text-neutral-500 dark:text-[#8E8E93]">Ativo</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right text-neutral-500 dark:text-[#8E8E93]">Gerenciar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-[#2C2C2E]">
            {filteredProfiles.map((profile) => (
              <tr key={profile.id} className={`transition-colors group hover:bg-[#1C1C1E] ${selectedIds.includes(profile.id) ? "bg-surface-container dark:bg-red-500/10" : ""}`}>
                <td className="py-4 px-4 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border text-red-600 focus:ring-red-600 cursor-pointer"
                    checked={selectedIds.includes(profile.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(prev => [...prev, profile.id]);
                      else setSelectedIds(prev => prev.filter(id => id !== profile.id));
                    }}
                  />
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm" style={{ color: "#F2F2F7" }}>{profile.full_name}</span>
                    <span className="text-xs" style={{ color: "#8E8E93" }}>{profile.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-xs font-mono" style={{ color: "#8E8E93" }}>
                    {profile.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '—'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <RoleBadge role={profile.role} />
                </td>
                <td className="py-4 px-6">
                  <span className="text-xs font-bold uppercase border px-2 py-1 rounded" style={{ background: "#131313", color: "#F2F2F7", borderColor: "#2C2C2E" }}>
                    {profile.belt}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded" style={{ background: "#131313", color: "#8E8E93", borderColor: "#2C2C2E" }}>
                    {profile.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <Switch
                    checked={profile.is_active}
                    onCheckedChange={() => handleToggleActive(profile.id)}
                    disabled={isPending || profile.id === currentUserId}
                  />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {renderActionButtons(profile)}
                  </div>
                </td>
              </tr>
            ))}
            {filteredProfiles.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2" style={{ color: "#8E8E93" }}>
                    <IconAlertCircle className="w-8 h-8 opacity-50" />
                    <span className="font-semibold text-sm">Nenhum aluno encontrado.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className={`rounded-xl border p-4 flex flex-col gap-4 transition-colors ${selectedIds.includes(profile.id) ? "bg-surface-container dark:bg-red-500/10 border-red-500/30" : "bg-surface-container border-border"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 rounded border-border text-red-600 focus:ring-red-600 cursor-pointer shrink-0"
                  checked={selectedIds.includes(profile.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(prev => [...prev, profile.id]);
                    else setSelectedIds(prev => prev.filter(id => id !== profile.id));
                  }}
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-[#F2F2F7] truncate">{profile.full_name}</span>
                  <span className="text-xs truncate" style={{ color: "#8E8E93" }}>{profile.email}</span>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                <RoleBadge role={profile.role} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <span style={{ color: "#8E8E93" }}>CPF</span>
                <span className="font-mono" style={{ color: "#F2F2F7" }}>
                  {profile.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ color: "#8E8E93" }}>Faixa</span>
                <span className="font-bold uppercase border px-2 py-1 rounded w-fit" style={{ background: "#131313", color: "#F2F2F7", borderColor: "#2C2C2E" }}>{profile.belt}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ color: "#8E8E93" }}>Categoria</span>
                <span className="font-bold uppercase tracking-wider border px-2 py-1 rounded w-fit" style={{ background: "#131313", color: "#8E8E93", borderColor: "#2C2C2E", fontSize: "10px" }}>{profile.category}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: "#2C2C2E" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase" style={{ color: "#8E8E93" }}>Conta Ativa</span>
                <Switch
                  checked={profile.is_active}
                  onCheckedChange={() => handleToggleActive(profile.id)}
                  disabled={isPending || profile.id === currentUserId}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {renderActionButtons(profile, true)}
              </div>
            </div>
          </div>
        ))}
        {filteredProfiles.length === 0 && (
          <div className="text-center py-12 border rounded-xl" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
            <div className="flex flex-col items-center justify-center gap-2" style={{ color: "#8E8E93" }}>
              <IconAlertCircle className="w-8 h-8 opacity-50" />
              <span className="font-semibold text-sm">Nenhum aluno encontrado.</span>
            </div>
          </div>
        )}
      </div>

      {/* Belt Promotion Modal */}
      <BeltPromotionModal
        open={beltModalOpen}
        onOpenChange={setBeltModalOpen}
        selectedUser={selectedUserForBelt}
        onSuccess={handleBeltSuccess}
      />
    </div>
  );
}
