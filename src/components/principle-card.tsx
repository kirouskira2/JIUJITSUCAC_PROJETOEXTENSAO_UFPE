"use client";

import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";

/**
 * Card do Princípio do Dia
 * Ref: Artifact 1, RF02 — Exibe o princípio vinculado ao treino do dia
 * Design: Glassmorphism + Electric Cyan accent + Border Beam animation
 */
interface PrincipleCardProps {
  number: number;
  titlePt: string;
  titleEn: string;
  description: string;
  category?: string | null;
}

export function PrincipleCard({
  number,
  titlePt,
  titleEn,
  description,
  category,
}: PrincipleCardProps) {
  return (
    <MagicCard
      className="rounded-2xl relative overflow-hidden"
      gradientColor="rgba(229, 9, 20, 0.15)"
    >
      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
              <span className="text-secondary font-black text-lg">
                {number}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Princípio do Dia
              </p>
              {category && (
                <span className="text-[10px] uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                  {category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-1">{titlePt}</h3>
        <p className="text-sm text-muted-foreground italic mb-4">
          &quot;{titleEn}&quot;
        </p>

        {/* Description */}
        <p className="text-sm text-foreground/80 leading-relaxed">
          {description}
        </p>

        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-[60px] rounded-full pointer-events-none" />
      </div>

      <BorderBeam size={200} duration={15} delay={3} />
    </MagicCard>
  );
}
