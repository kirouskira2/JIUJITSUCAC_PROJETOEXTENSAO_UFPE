/**
 * Barra de Progresso de Faixa
 * Ref: Artifact 1, Section 3.1 — Perfil do aluno (barra de progresso)
 * 
 * Visual: gradiente da faixa atual para a próxima faixa
 * Nota: Para MVP, o progresso é baseado na assiduidade (VR1 — regra volátil marcada
 * como constante configurável até migração para Policy Agent)
 */

import { BELT_COLORS, BELT_ORDER } from "@/lib/constants";

interface BeltProgressProps {
  currentBelt: string;
  attendanceCount: number;
  /** Threshold configurável — TODO: migrate to Policy Agent (VR1) */
  requiredAttendance?: number;
}

function getNextBelt(currentBelt: string): string {
  const idx = BELT_ORDER.indexOf(currentBelt as any);
  if (idx === -1 || idx === BELT_ORDER.length - 1) return currentBelt;
  return BELT_ORDER[idx + 1];
}

export function BeltProgress({
  currentBelt,
  attendanceCount,
  requiredAttendance = 50,
}: BeltProgressProps) {
  const nextBelt = getNextBelt(currentBelt);
  const progress = Math.min((attendanceCount / requiredAttendance) * 100, 100);
  const currentColor = BELT_COLORS[currentBelt] || "#FFFFFF";
  const nextColor = BELT_COLORS[nextBelt] || "#8B5CF6";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Jornada no Tatame
        </h2>
        <span className="text-xs text-muted-foreground">
          {attendanceCount}/{requiredAttendance} presenças
        </span>
      </div>

      <div className="w-full bg-background rounded-full h-4 border border-white/5 overflow-hidden p-0.5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentColor}, ${nextColor})`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: currentColor }}
          />
          {currentBelt}
        </span>
        <span className="flex items-center gap-1.5">
          {nextBelt}
          <span
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: nextColor }}
          />
        </span>
      </div>
    </div>
  );
}
