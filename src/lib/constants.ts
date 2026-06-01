/**
 * Constantes centralizadas do projeto JJCAC.
 * Evita duplicação de valores entre componentes.
 */

/** Mapeamento de faixas para cores CSS (backgrounds) */
export const BELT_COLORS: Record<string, string> = {
  Branca: "#FFFFFF",
  Cinza: "#9CA3AF",
  Amarela: "#EAB308",
  Laranja: "#F97316",
  Verde: "#22C55E",
  Azul: "#3B82F6",
  Roxa: "#8B5CF6",
  Marrom: "#92400E",
  Preta: "#1F2937",
};

/** Mapeamento de faixas para estilos de badge (bg, text, border) */
export const BELT_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Branca: { bg: "#F2F2F7", text: "#1C1C1E", border: "#D1D1D6" },
  Cinza: { bg: "#E5E5EA", text: "#1C1C1E", border: "#C7C7CC" },
  Amarela: { bg: "#FFFDE7", text: "#6D5D00", border: "#FDE047" },
  Laranja: { bg: "#FFF3E0", text: "#7C3000", border: "#FB923C" },
  Verde: { bg: "#E8F5E9", text: "#1B5E20", border: "#4ADE80" },
  Azul: { bg: "#E3F2FD", text: "#0D47A1", border: "#3B82F6" },
  Roxa: { bg: "#EDE7F6", text: "#4A148C", border: "#8B5CF6" },
  Marrom: { bg: "#EFEBE9", text: "#3E2723", border: "#92400E" },
  Preta: { bg: "#1C1917", text: "#F2F2F7", border: "#3A3A3C" },
};

/** Ordem das faixas para progressão */
export const BELT_ORDER = [
  "Branca",
  "Cinza",
  "Amarela",
  "Laranja",
  "Verde",
  "Azul",
  "Roxa",
  "Marrom",
  "Preta",
] as const;

export type BeltRank = (typeof BELT_ORDER)[number];

/** Presença mínima para graduação (faixa atual → próxima) */
export const BELT_GRADUATION_REQUIREMENTS: Record<string, number> = {
  Branca: 30,
  Cinza: 40,
  Amarela: 50,
  Laranja: 60,
  Verde: 70,
  Azul: 80,
  Roxa: 90,
  Marrom: 100,
};

/** Tipos de eventos válidos */
export const EVENT_TYPES = ["tournament", "graduation", "seminar", "other"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Importância de anúncios */
export const ANNOUNCEMENT_IMPORTANCE = ["info", "warning", "urgent"] as const;
export type AnnouncementImportance = (typeof ANNOUNCEMENT_IMPORTANCE)[number];

/** Roles do sistema */
export const USER_ROLES = ["admin", "monitor", "aluno"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Horas por aula (padrão acadêmico de extensão) */
export const HOURS_PER_CLASS = 1.5;
