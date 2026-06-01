"use client";

import { useState, useTransition } from "react";
import { toggleUserActive, promoteToMonitor, promoteToAdmin, demoteToAluno } from "@/actions/profiles";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconSearch, IconAlertCircle, IconMedal, IconUserShield, IconUserUp } from "@tabler/icons-react";
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
        className={`${compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
        style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0A84FF"; e.currentTarget.style.color = "#0A84FF"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
      >
        <IconMedal className="w-3 h-3" /> {compact ? "" : "Graduar"}
      </button>
      {profile.role === "aluno" && (
        <button
          onClick={() => handlePromote(profile.id, profile.full_name)}
          disabled={isPending}
          className={`${compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0A84FF"; e.currentTarget.style.color = "#0A84FF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
        >
          <IconUserUp className="w-3 h-3" /> {compact ? "" : "Monitor"}
        </button>
      )}
      {profile.role !== "admin" && (
        <button
          onClick={() => handlePromoteToAdmin(profile.id, profile.full_name)}
          disabled={isPending}
          className={`${compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
        >
          <IconUserShield className="w-3 h-3" /> {compact ? "" : "Prof."}
        </button>
      )}
      {(profile.role === "admin" || profile.role === "monitor") && profile.id !== currentUserId && (
        <button
          onClick={() => handleDemote(profile.id, profile.full_name)}
          disabled={isPending}
          className={`${compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-1.5 text-xs"} rounded-lg border flex items-center gap-1.5 font-bold transition-colors`}
          style={{ borderColor: "#2C2C2E", color: "#F2F2F7" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ea580c"; e.currentTarget.style.color = "#ea580c"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2C2C2E"; e.currentTarget.style.color = "#F2F2F7"; }}
          title="Remover privilégios e tornar Aluno"
        >
          <IconUserShield className="w-3 h-3 rotate-180" /> {compact ? "" : "Rebaixar"}
        </button>
      )}
    </>
  );

  // --- Render ---

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 w-full items-start md:items-center">
        {/* Search */}
        <div className="relative max-w-sm w-full md:w-80" role="search" aria-label="Buscar alunos">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-neutral-500 dark:text-[#8E8E93]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            aria-label="Buscar por nome ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg pl-11 pr-4 text-sm outline-none transition-colors border bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select value={filterRole} onValueChange={(val) => setFilterRole(val || "all")}>
            <SelectTrigger className="w-full md:w-[130px] h-10">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Funções</SelectItem>
              <SelectItem value="admin">Professor</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
              <SelectItem value="aluno">Aluno</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBelt} onValueChange={(val) => setFilterBelt(val || "all")}>
            <SelectTrigger className="w-full md:w-[120px] h-10">
              <SelectValue placeholder="Faixa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Faixas</SelectItem>
              <SelectItem value="branca">Branca</SelectItem>
              <SelectItem value="azul">Azul</SelectItem>
              <SelectItem value="roxa">Roxa</SelectItem>
              <SelectItem value="marrom">Marrom</SelectItem>
              <SelectItem value="preta">Preta</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
            <SelectTrigger className="w-full md:w-[140px] h-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="frequente">Frequente (Aluno)</SelectItem>
              <SelectItem value="academico">Acadêmico (Ext.)</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "all")}>
            <SelectTrigger className="w-full md:w-[120px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-neutral-200 dark:border-[#2C2C2E] overflow-x-auto bg-white dark:bg-[#111111]">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-[#2C2C2E] bg-neutral-50 dark:bg-[#1c1b1b]">
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
              <tr key={profile.id} className="transition-colors group hover:bg-[#1C1C1E]">
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
                <td colSpan={7} className="text-center py-12">
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
          <div key={profile.id} className="rounded-xl border p-4 flex flex-col gap-4" style={{ background: "#111111", borderColor: "#2C2C2E" }}>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm" style={{ color: "#F2F2F7" }}>{profile.full_name}</span>
                <span className="text-xs" style={{ color: "#8E8E93", wordBreak: "break-all" }}>{profile.email}</span>
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

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#2C2C2E" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase" style={{ color: "#8E8E93" }}>Ativo</span>
                <Switch
                  checked={profile.is_active}
                  onCheckedChange={() => handleToggleActive(profile.id)}
                  disabled={isPending || profile.id === currentUserId}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
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
