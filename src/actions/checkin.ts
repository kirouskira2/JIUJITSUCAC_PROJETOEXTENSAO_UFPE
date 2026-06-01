"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTodayBrazil, toDateStringBrazil } from "@/lib/date-utils";
import { createHmac, timingSafeEqual } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { 
  ActionResponse, 
  RegisterCheckinInput, 
  registerCheckinSchema, 
  GetMyAttendanceInput, 
  getMyAttendanceSchema, 
  AttendanceWithWorkout, 
  Attendance, 
  Principle,
  Workout
} from "@/lib/schemas";
import { mapAttendance, mapPrinciple, mapWorkout, mapProfile } from "@/lib/mappers";

/**
 * Valida o token QR usando HMAC-SHA256.
 * 
 * O QR code físico impresso contém o `secret` em texto.
 * A validação server-side:
 * 1. Gera um HMAC do secret usando uma chave de assinatura interna
 * 2. Compara com timingSafeEqual para prevenir timing attacks
 * 
 * Para compatibilidade com o QR estático atual, se o token 
 * corresponder diretamente ao secret, também aceita.
 * Em produção com QR dinâmico, remover o fallback.
 */
async function verifyQrToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  
  // Compatibilidade: aceita o token direto (QR estático impresso)
  // Em produção com display digital, remover este bloco e usar apenas HMAC
  if (token === secret) return true;
  
  // Validação HMAC: o token pode ser um HMAC gerado por um display digital
  try {
    const signingKey = process.env.HMAC_SIGNING_KEY || "jjcac-hmac-default-key-2026";
    const expectedHmac = createHmac("sha256", signingKey)
      .update(secret)
      .digest("hex");
    
    const tokenBuffer = Buffer.from(token, "utf-8");
    const expectedBuffer = Buffer.from(expectedHmac, "utf-8");
    
    if (tokenBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function registerCheckin(data: RegisterCheckinInput): Promise<ActionResponse<{ attendance: Attendance; principleOfDay: Principle }>> {
  try {
    const parsed = registerCheckinSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Higiene não confirmada ou dados inválidos" };
    }

    // Validação HMAC-SHA256 do token QR
    const qrSecret = process.env.QR_SECRET || "JJCAC-TATAME-UFPE";
    const isValidToken = await verifyQrToken(parsed.data.qrCodeToken, qrSecret);
    if (!isValidToken) {
      return { success: false, error: "QR Code inválido. Escaneie o QR Code oficial do tatame." };
    }

    const supabase = await createClient();

    // Verificação de Horário e Dia (Seg/Qua, 14:30 às 18:00 - Fuso de Brasília)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find(p => p.type === "weekday")?.value;
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
    const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

    const isAllowedDay = weekday === "Monday" || weekday === "Wednesday";
    const timeInMinutes = hour * 60 + minute;
    const startMinutes = 14 * 60 + 30; // 14:30
    const endMinutes = 18 * 60; // 18:00

    if (!isAllowedDay || timeInMinutes < startMinutes || timeInMinutes > endMinutes) {
      return { success: false, error: "O check-in só é permitido às Segundas e Quartas, das 14:30 às 18:00." };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    // Rate limiting: 1 check-in a cada 30 segundos por usuário
    const rateCheck = checkRateLimit(`checkin:${user.id}`, { maxRequests: 1, windowSeconds: 30 });
    if (!rateCheck.allowed) {
      return { success: false, error: `Aguarde ${rateCheck.retryAfter}s antes de tentar novamente.` };
    }

    const targetProfileId = parsed.data.profileId || user.id;

    if (targetProfileId !== user.id) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin' && profile?.role !== 'monitor') {
        return { success: false, error: "Você só pode registrar presença para você mesmo." };
      }
    }

    // Tenta inserir a presença (RLS e constraints garantem validações como is_active, 1 checkin por treino, etc)
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .insert({
        profile_id: targetProfileId,
        workout_id: parsed.data.workoutId,
        hygiene_confirmed: parsed.data.hygieneConfirmed
      })
      .select()
      .single();

    if (attendanceError || !attendanceData) {
      if (attendanceError?.code === "23505") { // Código para UNIQUE constraint violation
        return { success: false, error: "Você já fez check-in neste treino" };
      }
      return { success: false, error: "Erro ao registrar check-in ou conta não autorizada" };
    }

    // Buscar o princípio do dia associado a este treino
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .select("principle_id")
      .eq("id", parsed.data.workoutId)
      .single();

    if (workoutError || !workoutData) {
      return { success: false, error: "Treino não encontrado após o check-in" };
    }

    const { data: principleData, error: principleError } = await supabase
      .from("principles")
      .select("*")
      .eq("id", workoutData.principle_id)
      .single();

    if (principleError || !principleData) {
      return { success: false, error: "Princípio do dia não encontrado" };
    }

    const mappedAttendance: Attendance = mapAttendance(attendanceData);
    const mappedPrinciple: Principle = mapPrinciple(principleData);

    revalidatePath("/aluno");
    
    return { 
      success: true, 
      data: { 
        attendance: mappedAttendance, 
        principleOfDay: mappedPrinciple 
      } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getTodayWorkout(): Promise<ActionResponse<{ workout: Workout | null; principle: Principle | null }>> {
  try {
    const supabase = await createClient();
    
    const today = getTodayBrazil(); // YYYY-MM-DD (fuso Brasília)

    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    if (workoutError && workoutError.code !== "PGRST116") { // IGNORA O ERRO SE NÃO ENCONTRAR NADA
      return { success: false, error: "Erro de consulta ao buscar treino de hoje" };
    }

    if (!workoutData) {
      return { success: true, data: { workout: null, principle: null } };
    }

    const { data: principleData, error: principleError } = await supabase
      .from("principles")
      .select("*")
      .eq("id", workoutData.principle_id)
      .single();

    if (principleError) {
      return { success: false, error: "Erro ao buscar princípio vinculado ao treino" };
    }

    const mappedWorkout: Workout = mapWorkout(workoutData);
    const mappedPrinciple: Principle = mapPrinciple(principleData);

    return { 
      success: true, 
      data: { 
        workout: mappedWorkout, 
        principle: mappedPrinciple 
      } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getMyAttendance(data: GetMyAttendanceInput): Promise<ActionResponse<AttendanceWithWorkout[]>> {
  try {
    const parsed = getMyAttendanceSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros de data inválidos" };
    }

    const supabase = await createClient();
    
    // Pegando o user id via session localmente para a query ser mais direta (opcional pois o RLS protege, mas bom por tipagem)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    let query = supabase
      .from("attendance")
      .select(`
        *,
        workout:workouts (
          *,
          principle:principles (*)
        )
      `)
      .eq("profile_id", user.id)
      .order("checked_in_at", { ascending: false });

    if (parsed.data.startDate) {
      query = query.gte("workouts.date", toDateStringBrazil(parsed.data.startDate));
    }
    
    if (parsed.data.endDate) {
      query = query.lte("workouts.date", toDateStringBrazil(parsed.data.endDate));
    }

    const { data: attendanceData, error } = await query;

    if (error) {
      return { success: false, error: "Erro de consulta de presença: " + error.message };
    }

    // Usando mapeamento limpo com tipagem direta
    const mappedAttendance: AttendanceWithWorkout[] = (attendanceData || []).map((a: any) => ({
      ...mapAttendance({
        id: a.id,
        profile_id: a.profile_id,
        workout_id: a.workout_id,
        checked_in_at: a.checked_in_at,
        hygiene_confirmed: a.hygiene_confirmed,
        created_at: a.created_at,
      }),
      workout: {
        ...mapWorkout(a.workout),
        principle: mapPrinciple(a.workout.principle)
      }
    }));

    return { success: true, data: mappedAttendance };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getAllAttendance(data: GetMyAttendanceInput): Promise<ActionResponse<AttendanceWithWorkout[]>> {
  try {
    const parsed = getMyAttendanceSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros de data inválidos" };
    }

    const supabase = await createClient();
    
    // Verificação de permissão (admin/monitor)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'monitor') {
        return { success: false, error: "Não autorizado" };
    }

    let query = supabase
      .from("attendance")
      .select(`
        *,
        profile:profiles (*),
        workout:workouts (
          *,
          principle:principles (*)
        )
      `)
      .order("checked_in_at", { ascending: false });

    if (parsed.data.startDate) {
      query = query.gte("workouts.date", toDateStringBrazil(parsed.data.startDate));
    }
    
    if (parsed.data.endDate) {
      query = query.lte("workouts.date", toDateStringBrazil(parsed.data.endDate));
    }

    const { data: attendanceData, error } = await query;

    if (error) {
      return { success: false, error: "Erro de consulta de presença: " + error.message };
    }
    
    const mappedAttendance: AttendanceWithWorkout[] = (attendanceData || []).map((a: any) => ({
      ...mapAttendance({
        id: a.id,
        profile_id: a.profile_id,
        workout_id: a.workout_id,
        checked_in_at: a.checked_in_at,
        hygiene_confirmed: a.hygiene_confirmed,
        created_at: a.created_at,
      }),
      profile: a.profile ? mapProfile(a.profile) : undefined,
      workout: {
        ...mapWorkout(a.workout),
        principle: mapPrinciple(a.workout.principle)
      }
    }));

    return { success: true, data: mappedAttendance };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function deleteCheckin(attendanceId: string): Promise<ActionResponse<void>> {
  try {
    // Validação UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attendanceId)) {
      return { success: false, error: "ID inválido" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    
    let query = supabase.from("attendance").delete().eq("id", attendanceId);
    
    // Alunos e Monitores só podem apagar o próprio histórico
    if (profile?.role !== "admin") {
      query = query.eq("profile_id", user.id);
    }
    
    const { error } = await query;
    if (error) {
      return { success: false, error: "Erro ao excluir presença: " + error.message };
    }

    revalidatePath("/aluno");
    revalidatePath("/aluno/history");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
