"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResponse } from "@/lib/schemas";

export interface ExtensionReportStats {
  totalClasses: number;
  totalHours: number;
  startDate: string;
  endDate: string;
  studentName: string | null;
  studentCategory: string | null;
}

export interface ExtensionReportInput {
  profileId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

const HOURS_PER_CLASS = 1.5; // Padrão acadêmico

export async function generateExtensionReport(data: ExtensionReportInput): Promise<ActionResponse<ExtensionReportStats>> {
  try {
    const supabase = await createClient();

    // Verificação de autenticação e autorização
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado. Apenas admin/monitor podem gerar relatórios." };
    }

    // Validação UUID do profileId se fornecido
    if (data.profileId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.profileId)) {
      return { success: false, error: "ID de perfil inválido" };
    }

    let query = supabase.from("attendance").select(`
      id,
      checked_in_at,
      profile:profiles ( id, full_name, category ),
      workout:workouts ( date )
    `);

    // Aplica filtros se houver
    if (data.profileId) {
      query = query.eq("profile_id", data.profileId);
    }

    if (data.startDate) {
      query = query.gte("workouts.date", data.startDate);
    }

    if (data.endDate) {
      query = query.lte("workouts.date", data.endDate);
    }

    const { data: attendanceData, error } = await query;

    if (error) {
      return { success: false, error: "Erro ao gerar relatório: " + error.message };
    }

    // Mapeia e garante de forma robusta que profile e workout sejam tratados como objetos individuais (não arrays)
    const rawAttendance = (attendanceData || []) as any[];
    let filteredData = rawAttendance.map(item => {
      const profile = Array.isArray(item.profile) ? item.profile[0] : item.profile;
      const workout = Array.isArray(item.workout) ? item.workout[0] : item.workout;
      return {
        id: item.id,
        checked_in_at: item.checked_in_at,
        profile: profile ? { id: profile.id, full_name: profile.full_name, category: profile.category } : null,
        workout: workout ? { date: workout.date } : null,
      };
    });

    if (data.category && data.category !== "all") {
      filteredData = filteredData.filter(item => item.profile?.category === data.category);
    }

    const totalClasses = filteredData.length;
    const totalHours = totalClasses * HOURS_PER_CLASS;

    let studentName = null;
    let studentCategory = null;

    if (data.profileId && filteredData.length > 0) {
      studentName = filteredData[0].profile?.full_name;
      studentCategory = filteredData[0].profile?.category;
    } else if (data.profileId) {
      // Tentar buscar o nome do aluno se ele não teve aulas
      const { data: profile } = await supabase.from("profiles").select("full_name, category").eq("id", data.profileId).single();
      if (profile) {
        studentName = profile.full_name;
        studentCategory = profile.category;
      }
    }

    // Define fallback dates se não especificados
    const computedStartDate = data.startDate || "Início dos registros";
    const computedEndDate = data.endDate || "Até o momento";

    return { 
      success: true, 
      data: {
        totalClasses,
        totalHours,
        startDate: computedStartDate,
        endDate: computedEndDate,
        studentName,
        studentCategory: data.category && data.category !== 'all' ? data.category : studentCategory
      } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

/**
 * Função para retornar a string CSV formatada de presenças. 
 */
export async function getReportCSVData(data: ExtensionReportInput): Promise<ActionResponse<Record<string, string | number>[]>> {
  try {
    const supabase = await createClient();

    // Verificação de autenticação e autorização
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado." };
    }

    // Validação UUID
    if (data.profileId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.profileId)) {
      return { success: false, error: "ID de perfil inválido" };
    }

    let query = supabase.from("attendance").select(`
      id,
      checked_in_at,
      profile:profiles ( full_name, enrollment_id, category, belt ),
      workout:workouts ( date, technique_name )
    `).order("checked_in_at", { ascending: false });

    if (data.profileId) query = query.eq("profile_id", data.profileId);
    if (data.startDate) query = query.gte("workouts.date", data.startDate);
    if (data.endDate) query = query.lte("workouts.date", data.endDate);

    const { data: records, error } = await query;

    if (error) return { success: false, error: error.message };

    const rawRecords = (records || []) as any[];
    let filtered = rawRecords.map(item => {
      const profile = Array.isArray(item.profile) ? item.profile[0] : item.profile;
      const workout = Array.isArray(item.workout) ? item.workout[0] : item.workout;
      return {
        id: item.id,
        checked_in_at: item.checked_in_at,
        profile: profile ? { full_name: profile.full_name, enrollment_id: profile.enrollment_id, category: profile.category, belt: profile.belt } : null,
        workout: workout ? { date: workout.date, technique_name: workout.technique_name } : null,
      };
    });

    if (data.category && data.category !== "all") {
      filtered = filtered.filter(item => item.profile?.category === data.category);
    }

    const exportData = filtered.map(r => ({
      Data: r.workout?.date || r.checked_in_at.split("T")[0],
      Aluno: r.profile?.full_name || "N/A",
      Matricula: r.profile?.enrollment_id || "N/A",
      Categoria: r.profile?.category || "N/A",
      Faixa: r.profile?.belt || "N/A",
      Horas: HOURS_PER_CLASS
    }));

    return { success: true, data: exportData };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
