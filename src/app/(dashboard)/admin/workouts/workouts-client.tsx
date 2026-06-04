"use client";

import React, { useState, useMemo } from "react";
import { Workout } from "@/lib/schemas";
import { WorkoutEditModal } from "@/components/workout-edit-modal";
import { IconSearch, IconBarbell, IconPlus } from "@tabler/icons-react";
import { BlurFade } from "@/components/ui/blur-fade";

interface Principle {
  id: number;
  number: number;
  titlePt: string;
}

export function WorkoutsClient({ 
  initialWorkouts, 
  principles 
}: { 
  initialWorkouts: Workout[], 
  principles: Principle[] 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkouts = useMemo(() => {
    return initialWorkouts.filter(w => 
      w.techniqueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.date.includes(searchTerm)
    );
  }, [initialWorkouts, searchTerm]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
            Gestão de Treinos
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Crie, edite e apague os treinos ministrados no tatame.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <WorkoutEditModal principles={principles}>
            <div className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 w-fit">
              <IconPlus className="h-4 w-4" />
              Novo Treino
            </div>
          </WorkoutEditModal>
        </div>
      </div>

      {/* Busca */}
      <div className="rounded-3xl border p-6 relative overflow-hidden group transition-colors bg-surface-container border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500">
            <IconSearch className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Busca</h3>
        </div>
        
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Buscar por técnica ou data</label>
          <input 
            type="text"
            placeholder="Digite o nome da técnica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 rounded-lg px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-[#dc2626]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkouts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground p-12 bg-white/50 dark:bg-black/20 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            Nenhum treino encontrado.
          </div>
        ) : (
          filteredWorkouts.map((workout, index) => {
            const principle = principles.find(p => p.id === workout.principleId);
            return (
              <WorkoutEditModal key={workout.id} initialWorkout={workout} principles={principles}>
                <div className="cursor-pointer text-left rounded-3xl border border-border p-5 flex flex-col gap-3 bg-surface-container hover:border-red-500/50 transition-colors w-full h-full group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                      🥋 {new Date(workout.date).toLocaleDateString("pt-BR")}
                    </span>
                    {principle && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-[#8E8E93] border border-border px-2 py-0.5 rounded-full">
                        Mód {principle.number}
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-lg font-black uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7] group-hover:text-red-500 transition-colors">
                    {workout.techniqueName}
                  </h4>
                  <p className="text-sm leading-relaxed text-neutral-500 dark:text-[#8E8E93] line-clamp-2 mt-auto">
                    {workout.techniqueWhat}
                  </p>
                </div>
              </WorkoutEditModal>
            );
          })
        )}
      </div>
    </div>
  );
}
