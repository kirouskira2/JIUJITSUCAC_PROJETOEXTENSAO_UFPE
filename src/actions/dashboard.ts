"use server";

import { createClient } from "@/lib/supabase/server";
import { toDateStringBrazil } from "@/lib/date-utils";
import { 
  ActionResponse, 
  GetDashboardStatsInput, 
  getDashboardStatsSchema, 
  GetStudentsByCategoryInput, 
  getStudentsByCategorySchema, 
  DashboardStats,
  ProfileWithAttendanceCount
} from "@/lib/schemas";
import { mapProfile } from "@/lib/mappers";

export async function getDashboardStats(data: GetDashboardStatsInput): Promise<ActionResponse<DashboardStats>> {
  try {
    const parsed = getDashboardStatsSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros de data inválidos" };
    }

    const supabase = await createClient();

    // Role check: apenas admin/monitor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (userProfile?.role !== "admin" && userProfile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    // Buscar todos os profiles para estatísticas
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, role, category, belt, is_active");

    if (profilesError || !profiles) {
      return { success: false, error: "Erro ao carregar perfis" };
    }

    // Filtrar apenas alunos e monitores (não contar admins nas estatísticas de alunos)
    const students = profiles.filter(p => p.role !== "admin");
    const activeStudentsCount = students.filter(p => p.is_active).length;

    const studentsByCategory = {
      frequente: students.filter(p => p.category === "frequente").length,
      academico: students.filter(p => p.category === "academico").length,
      visitante: students.filter(p => p.category === "visitante").length,
    };

    // Agrupar por faixa
    const beltCounts = students.reduce((acc, curr) => {
      const belt = curr.belt || "Branca";
      acc[belt] = (acc[belt] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const studentsByBelt = Object.keys(beltCounts).map(belt => ({
      belt,
      count: beltCounts[belt]
    })).sort((a, b) => b.count - a.count);

    // Buscar todos os treinos no período (ou geral se sem filtro)
    let workoutsQuery = supabase.from("workouts").select("id, date");
    if (parsed.data.startDate) workoutsQuery = workoutsQuery.gte("date", toDateStringBrazil(parsed.data.startDate));
    if (parsed.data.endDate) workoutsQuery = workoutsQuery.lte("date", toDateStringBrazil(parsed.data.endDate));
    
    const { data: workouts, error: workoutsError } = await workoutsQuery;
    
    if (workoutsError) {
      return { success: false, error: "Erro ao carregar treinos" };
    }

    // Buscar presença para os treinos filtrados
    let attendanceQuery = supabase.from("attendance").select("id, workout_id, checked_in_at, profile_id");
    if (workouts && workouts.length > 0) {
      const workoutIds = workouts.map(w => w.id);
      attendanceQuery = attendanceQuery.in("workout_id", workoutIds);
    } else if (parsed.data.startDate || parsed.data.endDate) {
       // Se não achou treinos no período, não tem presença
       return {
         success: true,
         data: {
           totalStudents: students.length,
           activeStudents: activeStudentsCount,
           studentsByCategory,
           studentsByBelt,
           averageAttendance: 0,
           attendanceByWeek: [],
           totalWorkouts: 0
         }
       }
    }

    const { data: attendances, error: attendanceError } = await attendanceQuery;
    
    if (attendanceError) {
      return { success: false, error: "Erro ao carregar presenças" };
    }

    const totalWorkouts = workouts ? workouts.length : 0;
    const totalAttendances = attendances ? attendances.length : 0;
    
    const averageAttendance = totalWorkouts > 0 
      ? Number((totalAttendances / totalWorkouts).toFixed(2)) 
      : 0;

    // Build Weekly Stats
    const weeksMap = new Map<number, { count: number; uniqueStudents: Set<string> }>();
    
    const now = new Date();
    now.setHours(0,0,0,0);

    if (attendances) {
      attendances.forEach(att => {
        if (!att.checked_in_at) return;
        const checkInDate = new Date(att.checked_in_at);
        checkInDate.setHours(0,0,0,0);
        
        // Difference in days
        const diffTime = Math.abs(now.getTime() - checkInDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Which week (0 = current week, 1 = last week, etc)
        const weekIndex = Math.floor(diffDays / 7);
        
        // We only care about the last 4 weeks (0, 1, 2, 3)
        if (weekIndex <= 3) {
          if (!weeksMap.has(weekIndex)) {
            weeksMap.set(weekIndex, { count: 0, uniqueStudents: new Set() });
          }
          const weekData = weeksMap.get(weekIndex)!;
          weekData.count += 1;
          if (att.profile_id) weekData.uniqueStudents.add(att.profile_id);
        }
      });
    }

    const attendanceByWeek = [3, 2, 1, 0].map(weekIndex => {
      const data = weeksMap.get(weekIndex);
      const label = weekIndex === 0 ? "Atual" : `${weekIndex} Sem. Atrás`;
      return {
        week: label,
        count: data ? data.count : 0,
        unique: data ? data.uniqueStudents.size : 0
      };
    });

    return {
      success: true,
      data: {
        totalStudents: students.length,
        activeStudents: activeStudentsCount,
        studentsByCategory,
        studentsByBelt,
        averageAttendance,
        attendanceByWeek,
        totalWorkouts
      }
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getStudentsByCategory(data: GetStudentsByCategoryInput): Promise<ActionResponse<ProfileWithAttendanceCount[]>> {
  try {
    const parsed = getStudentsByCategorySchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Categoria inválida" };
    }

    const supabase = await createClient();

    // Role check: apenas admin/monitor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };
    const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (userProfile?.role !== "admin" && userProfile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        *,
        attendance (count)
      `)
      .eq("category", parsed.data.category)
      .order("full_name");

    if (error || !profiles) {
      return { success: false, error: "Erro de consulta de alunos por categoria" };
    }

    // Mapear para o formato esperado extraindo o count da foreign key
    const formattedData: ProfileWithAttendanceCount[] = profiles.map((p) => ({
      ...mapProfile(p),
      attendanceCount: Array.isArray(p.attendance) ? (p.attendance[0] as unknown as { count: number })?.count || 0 : 0
    }));

    return { success: true, data: formattedData };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
