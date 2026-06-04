"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { toDateStringBrazil } from "@/lib/date-utils";
import { getPaginationRange, buildPaginationMeta, PaginatedResult, PaginationParams } from "@/lib/pagination";
import { 
  ActionResponse, 
  CreateWorkoutInput, 
  createWorkoutSchema, 
  UpdateWorkoutInput, 
  updateWorkoutSchema, 
  ListWorkoutsInput, 
  listWorkoutsSchema, 
  Workout,
  WorkoutWithPrinciple
} from "@/lib/schemas";
import { mapWorkout, WorkoutRow } from "@/lib/mappers";

export async function createWorkout(data: CreateWorkoutInput): Promise<ActionResponse<Workout>> {
  try {
    const parsed = createWorkoutSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Validação falhou. Verifique os dados fornecidos." };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Role check: apenas admin/monitor pode criar treinos
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    const { data: workoutData, error } = await supabase
      .from("workouts")
      .insert({
        date: toDateStringBrazil(parsed.data.date),
        technique_name: parsed.data.techniqueName,
        technique_what: parsed.data.techniqueWhat,
        technique_how: parsed.data.techniqueHow,
        technique_why: parsed.data.techniqueWhy,
        principle_id: parsed.data.principleId,
        registered_by: user.id
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // UNIQUE constraint violation
        return { success: false, error: "Já existe treino registrado para esta data" };
      }
      return { success: false, error: "Erro ao registrar treino: " + error.message };
    }

    const mappedWorkout: Workout = mapWorkout(workoutData);

    revalidatePath("/monitor/workout");
    revalidatePath("/admin");
    revalidatePath("/aluno");

    // Disparar Web Push Notification para todos os usuários inscritos (assíncrono)
    try {
      const { broadcastPushNotification } = await import("@/actions/webpush");
      broadcastPushNotification(
        "Treino do Dia Registrado! 🥋",
        `${parsed.data.techniqueName} — Verifique o painel para iniciar seus check-ins.`,
        "/aluno" // URL para abrir quando clicar
      ).catch(err => console.warn("Erro assíncrono ao disparar push:", err));
    } catch (pushErr) {
      console.warn("Erro ao carregar módulo webpush:", pushErr);
    }

    return { success: true, data: mappedWorkout };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function updateWorkout(data: UpdateWorkoutInput): Promise<ActionResponse<Workout>> {
  try {
    const parsed = updateWorkoutSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Validação falhou" };
    }

    const supabase = await createClient();

    // Role check: apenas admin/monitor pode editar treinos
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    const updates: Partial<WorkoutRow> = { updated_at: new Date().toISOString() };
    if (parsed.data.techniqueName) updates.technique_name = parsed.data.techniqueName;
    if (parsed.data.techniqueWhat) updates.technique_what = parsed.data.techniqueWhat;
    if (parsed.data.techniqueHow) updates.technique_how = parsed.data.techniqueHow;
    if (parsed.data.techniqueWhy) updates.technique_why = parsed.data.techniqueWhy;
    if (parsed.data.principleId !== undefined) updates.principle_id = parsed.data.principleId;

    const { data: workoutData, error } = await supabase
      .from("workouts")
      .update(updates)
      .eq("id", parsed.data.workoutId)
      .select()
      .single();

    if (error || !workoutData) {
      return { success: false, error: "Treino não encontrado ou não autorizado" };
    }

    const mappedWorkout: Workout = mapWorkout(workoutData);

    revalidatePath("/monitor/workout");
    revalidatePath("/admin");

    return { success: true, data: mappedWorkout };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function listWorkouts(data: ListWorkoutsInput): Promise<ActionResponse<WorkoutWithPrinciple[]>> {
  try {
    const parsed = listWorkoutsSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros de data inválidos" };
    }

    const supabase = await createClient();

    let query = supabase
      .from("workouts")
      .select(`
        *,
        principle:principles (*)
      `)
      .order("date", { ascending: false });

    if (parsed.data.startDate) {
      query = query.gte("date", toDateStringBrazil(parsed.data.startDate));
    }
    
    if (parsed.data.endDate) {
      query = query.lte("date", toDateStringBrazil(parsed.data.endDate));
    }

    const { data: workouts, error } = await query;

    if (error) {
      return { success: false, error: "Erro de consulta: " + error.message };
    }

    const mappedWorkouts: WorkoutWithPrinciple[] = workouts.map((w: { id: string; date: string; technique_name: string; technique_what: string; technique_how: string; technique_why: string; principle_id: number; registered_by: string; created_at: string; updated_at: string; principle: { id: number; number: number; title_pt: string; title_en: string; description: string; category: string | null } }) => ({
      ...mapWorkout(w),
      principle: {
        id: w.principle.id,
        number: w.principle.number,
        titlePt: w.principle.title_pt,
        titleEn: w.principle.title_en,
        description: w.principle.description,
        category: w.principle.category,
      }
    }));

    return { success: true, data: mappedWorkouts };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function deleteWorkout(workoutId: string): Promise<ActionResponse<boolean>> {
  try {
    // Validação UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workoutId)) {
      return { success: false, error: "ID inválido" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Role check: apenas admin/monitor pode deletar treinos
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId);

    if (error) {
      return { success: false, error: "Erro ao excluir treino: " + error.message };
    }

    revalidatePath("/monitor/workout");
    revalidatePath("/admin");
    revalidatePath("/aluno");

    return { success: true, data: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
