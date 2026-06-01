"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResponse } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

// --- Zod Schemas ---
const createEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().max(2000).nullable().optional(),
  event_date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["tournament", "graduation", "seminar", "other"]),
});

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  message: z.string().min(1, "Mensagem é obrigatória").max(5000),
  importance: z.enum(["info", "warning", "urgent"]),
});

// --- Types ---
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  type: "tournament" | "graduation" | "seminar" | "other";
  created_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  importance: "info" | "warning" | "urgent";
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// --- Event Actions ---

export async function listEvents(): Promise<ActionResponse<Event[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function createEvent(eventData: Omit<Event, "id" | "created_by" | "created_at">): Promise<ActionResponse<void>> {
  try {
    // Validação Zod
    const parsed = createEventSchema.safeParse(eventData);
    if (!parsed.success) {
      return { success: false, error: "Dados de evento inválidos" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    // Role check: apenas admin/monitor podem criar eventos
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    const { error } = await supabase.from("events").insert({
      ...parsed.data,
      created_by: user.id
    });

    if (error) throw new Error(error.message);
    
    revalidatePath("/admin/events");
    revalidatePath("/aluno/events");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

// --- Announcement Actions ---

export async function listAnnouncements(): Promise<ActionResponse<Announcement[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function createAnnouncement(announcementData: Omit<Announcement, "id" | "created_by" | "created_at">): Promise<ActionResponse<void>> {
  try {
    // Validação Zod
    const parsed = createAnnouncementSchema.safeParse(announcementData);
    if (!parsed.success) {
      return { success: false, error: "Dados de anúncio inválidos" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Não autenticado" };

    // Role check: apenas admin pode criar anúncios
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "monitor") {
      return { success: false, error: "Não autorizado" };
    }

    const { error } = await supabase.from("announcements").insert({
      ...parsed.data,
      created_by: user.id
    });

    if (error) throw new Error(error.message);
    
    revalidatePath("/admin/events");
    revalidatePath("/aluno/events");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

// --- Notification Actions ---

export async function getMyNotifications(): Promise<ActionResponse<Notification[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionResponse<void>> {
  try {
    // Validação UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(notificationId)) {
      return { success: false, error: "ID inválido" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("profile_id", user.id);

    if (error) throw new Error(error.message);
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}
