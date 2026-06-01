/**
 * Badge visual indicando o papel do usuário (admin/monitor/aluno).
 * Extraído do user-table.tsx para reutilização.
 */
interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === "admin") {
    return (
      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border" style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626", borderColor: "rgba(220,38,38,0.2)" }}>
        PROFESSOR
      </span>
    );
  }
  if (role === "monitor") {
    return (
      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border" style={{ background: "rgba(10,132,255,0.1)", color: "#0A84FF", borderColor: "rgba(10,132,255,0.2)" }}>
        MONITOR
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border" style={{ background: "#1c1b1b", color: "#8E8E93", borderColor: "#2C2C2E" }}>
      ALUNO
    </span>
  );
}
