"use server";

import { createClient } from "@/lib/supabase/server";
import { 
  ActionResponse, 
  Principle,
  Workout
} from "@/lib/schemas";
import { mapPrinciple, mapWorkout } from "@/lib/mappers";
import { getTodayBrazil } from "@/lib/date-utils";

export async function listPrinciples(): Promise<ActionResponse<Principle[]>> {
  try {
    const supabase = await createClient();

    const { data: principles, error } = await supabase
      .from("principles")
      .select("*")
      .order("number", { ascending: true });

    if (error) {
      return { success: false, error: "Erro ao listar os 32 Princípios" };
    }

    const mappedPrinciples: Principle[] = principles.map(mapPrinciple);

    return { success: true, data: mappedPrinciples };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getPrincipleOfDay(): Promise<ActionResponse<{ principle: Principle | null; workout: Workout | null }>> {
  try {
    const supabase = await createClient();
    
    const today = getTodayBrazil(); // YYYY-MM-DD (fuso Brasília)

    // Buscar se há treino registrado para hoje
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    if (workoutError && workoutError.code !== "PGRST116") {
      return { success: false, error: "Erro de consulta ao buscar treino" };
    }

    let targetPrincipleId: number;

    if (workoutData) {
      // Se tem treino, usamos o princípio associado a ele
      targetPrincipleId = workoutData.principle_id;
    } else {
      // Se NÃO tem treino cadastrado, geramos um princípio aleatório baseado no dia do ano (Regra RF02 fallback)
      // Para manter previsibilidade durante o dia, calculamos o dayOfYear % 32 + 1
      const start = new Date(new Date().getFullYear(), 0, 0);
      const diff = new Date().getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      targetPrincipleId = (dayOfYear % 32) + 1;
    }

    // Buscar o princípio alvo
    const { data: principleData, error: principleError } = await supabase
      .from("principles")
      .select("*")
      .eq("id", targetPrincipleId)
      .single();

    if (principleError || !principleData) {
      return { success: false, error: "Erro ao buscar Princípio do Dia" };
    }

    const mappedPrinciple: Principle = mapPrinciple(principleData);
    const mappedWorkout: Workout | null = workoutData ? mapWorkout(workoutData) : null;

    return { 
      success: true, 
      data: { 
        principle: mappedPrinciple,
        workout: mappedWorkout
      } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
