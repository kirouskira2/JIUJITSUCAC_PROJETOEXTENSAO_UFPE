"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResponse } from "@/lib/schemas";
import { Profile } from "@/lib/schemas";
import { mapProfile } from "@/lib/mappers";

// Definir os limites de aulas por faixa (Fase inicial, pode ser ajustado depois)
const BELT_REQUIREMENTS: Record<string, number> = {
  "Branca": 60,
  "Cinza": 60, // Apenas para infantil/juvenil, mas vamos padronizar
  "Amarela": 60,
  "Laranja": 60,
  "Verde": 60,
  "Azul": 120,
  "Roxa": 200,
  "Marrom": 300,
  "Preta": 500
};

const NEXT_BELT: Record<string, string> = {
  "Branca": "Azul", // Considerando adulto padrão (pode adicionar lógica de idade depois)
  "Azul": "Roxa",
  "Roxa": "Marrom",
  "Marrom": "Preta",
  "Preta": "Preta"
};

export interface GraduationCandidate {
  profile: Profile;
  attendanceCount: number;
  requiredClasses: number;
  nextBelt: string;
}

export interface GraduationHistoryRecord {
  id: string;
  profileName: string;
  previousBelt: string;
  newBelt: string;
  date: string;
  notes: string | null;
}

/**
 * Retorna a lista de alunos ativos e quantas aulas eles têm, verificando se estão aptos.
 */
export async function getStudentsReadyForGraduation(): Promise<ActionResponse<GraduationCandidate[]>> {
  try {
    const supabase = await createClient();

    // Role check: apenas admin/monitor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (userProfile?.role !== "admin" && userProfile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    // Buscar alunos ativos (apenas 'aluno' e 'monitor')
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .in("role", ["aluno", "monitor"]);

    if (profilesError || !profiles) {
      return { success: false, error: "Erro ao buscar alunos: " + profilesError?.message };
    }

    // Para cada aluno, buscar quantas presenças eles têm *desde a última graduação*.
    // Como a lógica de 'desde a última graduação' exige uma query mais complexa,
    // na primeira versão pegamos todas as presenças caso não haja graduação anterior,
    // ou usamos a data de updated_at se a faixa foi mudada.
    // Idealmente, a tabela graduations tem a última data.
    
    // Buscar as presenças totais (agrupadas por profile_id para economizar queries)
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("profile_id");

    if (attendanceError) {
      return { success: false, error: "Erro ao buscar frequências: " + attendanceError.message };
    }

    // Contar frequências
    const attendanceCountMap: Record<string, number> = {};
    for (const a of attendanceData) {
      if (!attendanceCountMap[a.profile_id]) attendanceCountMap[a.profile_id] = 0;
      attendanceCountMap[a.profile_id]++;
    }

    // Filtrar e montar candidatos
    const candidates: GraduationCandidate[] = [];

    for (const p of profiles) {
      const currentBelt = p.belt || "Branca";
      const required = BELT_REQUIREMENTS[currentBelt] || 60;
      const next = NEXT_BELT[currentBelt] || "Azul";
      const count = attendanceCountMap[p.id] || 0;

      // Se o aluno tiver pelo menos 80% das aulas requeridas, ele aparece na lista como "quase pronto" ou pronto.
      // Vamos retornar os que têm >= 80% da meta para o professor ir acompanhando.
      if (count >= required * 0.8 && currentBelt !== "Preta") {
        candidates.push({
          profile: mapProfile(p),
          attendanceCount: count,
          requiredClasses: required,
          nextBelt: next
        });
      }
    }

    // Ordenar por proximidade da meta (mais % primeiro)
    candidates.sort((a, b) => {
      const percA = a.attendanceCount / a.requiredClasses;
      const percB = b.attendanceCount / b.requiredClasses;
      return percB - percA;
    });

    return { success: true, data: candidates };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

/**
 * Retorna o histórico de todas as promoções da academia
 */
export async function getGraduationHistory(): Promise<ActionResponse<GraduationHistoryRecord[]>> {
  try {
    const supabase = await createClient();

    // Role check: apenas admin/monitor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (userProfile?.role !== "admin" && userProfile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    // A tabela graduations deve existir. Vamos fazer um join com profiles para pegar o nome.
    // Supabase permite join se houver foreign key.
    const { data: history, error } = await supabase
      .from("graduations")
      .select(`
        id,
        previous_belt,
        new_belt,
        promotion_date,
        notes,
        profile:profiles!profile_id(full_name)
      `)
      .order("promotion_date", { ascending: false });

    if (error) {
      // Se a tabela não existir ainda ou der erro, falha suave
      console.warn("Erro ao buscar histórico de graduações:", error);
      return { success: true, data: [] }; 
    }

    const records: GraduationHistoryRecord[] = (history || []).map((record: any) => {
      // O profile retornado do join com profiles pode vir como objeto ou array dependendo das tabelas do Supabase. 
      // Pegamos o primeiro item se for array ou o objeto diretamente.
      const profile = Array.isArray(record.profile) ? record.profile[0] : record.profile;
      
      return {
        id: record.id,
        profileName: profile?.full_name || "Aluno Desconhecido",
        previousBelt: record.previous_belt,
        newBelt: record.new_belt,
        date: new Date(record.promotion_date).toISOString(),
        notes: record.notes
      };
    });

    return { success: true, data: records };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
