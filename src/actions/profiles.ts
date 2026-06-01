"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { 
  ActionResponse, 
  ListProfilesInput, 
  listProfilesSchema, 
  GetProfileInput, 
  getProfileSchema, 
  UpdateProfileInput, 
  updateProfileSchema, 
  PromoteToMonitorInput, 
  promoteToMonitorSchema, 
  PromoteToAdminInput,
  promoteToAdminSchema,
  DemoteToAlunoInput,
  demoteToAlunoSchema,
  PromoteBeltInput,
  promoteBeltSchema,
  ToggleUserActiveInput, 
  toggleUserActiveSchema, 
  Profile 
} from "@/lib/schemas";
import { mapProfile, ProfileRow } from "@/lib/mappers";
import { getPaginationRange, buildPaginationMeta, PaginatedResult, PaginationParams } from "@/lib/pagination";

export async function listProfiles(data: ListProfilesInput): Promise<ActionResponse<Profile[]>> {
  try {
    const parsed = listProfilesSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros de busca inválidos" };
    }

    const supabase = await createClient();

    let query = supabase.from("profiles").select("*");

    if (parsed.data.role) query = query.eq("role", parsed.data.role);
    if (parsed.data.category) query = query.eq("category", parsed.data.category);
    if (parsed.data.isActive !== undefined) query = query.eq("is_active", parsed.data.isActive);
    if (parsed.data.search) query = query.ilike("full_name", `%${parsed.data.search}%`);

    const { data: profiles, error } = await query.order("full_name");

    if (error) {
      return { success: false, error: "Erro de consulta: " + error.message };
    }

    const mappedProfiles: Profile[] = profiles.map(mapProfile);

    return { success: true, data: mappedProfiles };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

/**
 * Versão paginada do listProfiles.
 * Retorna dados + metadados de paginação (totalCount, totalPages, etc.)
 */
export async function listProfilesPaginated(
  data: ListProfilesInput & PaginationParams
): Promise<ActionResponse<PaginatedResult<Profile>>> {
  try {
    const parsed = listProfilesSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros de busca inválidos" };
    }

    const { from, to, page, pageSize } = getPaginationRange(data);
    const supabase = await createClient();

    // Query com count exato para paginação
    let query = supabase.from("profiles").select("*", { count: "exact" });

    if (parsed.data.role) query = query.eq("role", parsed.data.role);
    if (parsed.data.category) query = query.eq("category", parsed.data.category);
    if (parsed.data.isActive !== undefined) query = query.eq("is_active", parsed.data.isActive);
    if (parsed.data.search) query = query.ilike("full_name", `%${parsed.data.search}%`);

    const { data: profiles, error, count } = await query
      .order("full_name")
      .range(from, to);

    if (error) {
      return { success: false, error: "Erro de consulta: " + error.message };
    }

    const mappedProfiles: Profile[] = (profiles || []).map(mapProfile);
    const totalCount = count || 0;

    return { 
      success: true, 
      data: {
        data: mappedProfiles,
        pagination: buildPaginationMeta(page, pageSize, totalCount),
      }
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getProfile(data: GetProfileInput): Promise<ActionResponse<Profile>> {
  try {
    const parsed = getProfileSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "ID de perfil inválido" };
    }

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", parsed.data.profileId)
      .single();

    if (error || !profile) {
      return { success: false, error: "Perfil não encontrado ou não autorizado" };
    }

    const mappedProfile: Profile = mapProfile(profile);

    return { success: true, data: mappedProfile };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function updateProfile(data: UpdateProfileInput): Promise<ActionResponse<Profile>> {
  try {
    const parsed = updateProfileSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Validação falhou" };
    }

    const supabase = await createClient();

    const updates: Partial<ProfileRow> = { updated_at: new Date().toISOString() };
    if (parsed.data.fullName) updates.full_name = parsed.data.fullName;
    if (parsed.data.belt) updates.belt = parsed.data.belt;
    if (parsed.data.category) updates.category = parsed.data.category;
    if (parsed.data.institution !== undefined) updates.institution = parsed.data.institution;
    if (parsed.data.enrollmentId !== undefined) updates.enrollment_id = parsed.data.enrollmentId;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", parsed.data.profileId)
      .select()
      .single();

    if (error || !profile) {
      return { success: false, error: "Perfil não encontrado ou não autorizado para edição" };
    }

    revalidatePath("/admin/users");
    revalidatePath("/aluno");

    const mappedProfile: Profile = mapProfile(profile);
    
    return { success: true, data: mappedProfile };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function promoteToMonitor(data: PromoteToMonitorInput): Promise<ActionResponse<{ message: string; newRole: string }>> {
  try {
    const parsed = promoteToMonitorSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "ID de usuário alvo inválido" };
    }

    const supabase = await createClient();

    // Chama a RPC definida no Artifact 2
    const { error } = await supabase.rpc("promote_to_monitor", {
      target_user_id: parsed.data.targetUserId
    });

    if (error) {
      return { success: false, error: error.message || "Erro ao promover usuário" };
    }

    revalidatePath("/admin/users");
    
    return { 
      success: true, 
      data: { message: "Usuário promovido a monitor com sucesso", newRole: "monitor" } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function promoteToAdmin(data: PromoteToAdminInput): Promise<ActionResponse<{ message: string; newRole: string }>> {
  try {
    const parsed = promoteToAdminSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "ID de usuário alvo inválido" };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("promote_to_admin", {
      target_user_id: parsed.data.targetUserId
    });

    if (error) {
      return { success: false, error: error.message || "Erro ao promover usuário" };
    }

    revalidatePath("/admin/users");
    
    return { 
      success: true, 
      data: { message: "Usuário promovido a professor com sucesso", newRole: "admin" } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function demoteToAluno(data: DemoteToAlunoInput): Promise<ActionResponse<{ message: string; newRole: string }>> {
  try {
    const parsed = demoteToAlunoSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "ID de usuário alvo inválido" };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("demote_to_aluno", {
      target_user_id: parsed.data.targetUserId
    });

    if (error) {
      return { success: false, error: error.message || "Erro ao rebaixar usuário" };
    }

    revalidatePath("/admin/users");
    
    return { 
      success: true, 
      data: { message: "Usuário rebaixado a aluno com sucesso", newRole: "aluno" } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function toggleUserActive(data: ToggleUserActiveInput): Promise<ActionResponse<{ isActive: boolean }>> {
  try {
    const parsed = toggleUserActiveSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "ID de usuário alvo inválido" };
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Não autorizado" };
    }

    if (user.id === parsed.data.targetUserId) {
      return { success: false, error: "Você não pode desativar sua própria conta." };
    }

    // Chama a RPC definida no Artifact 2
    const { data: newStatus, error } = await supabase.rpc("toggle_user_active", {
      target_user_id: parsed.data.targetUserId
    });

    if (error) {
      return { success: false, error: error.message || "Erro ao alternar status do usuário" };
    }

    revalidatePath("/admin/users");
    
    return { success: true, data: { isActive: newStatus } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function promoteBelt(data: PromoteBeltInput): Promise<ActionResponse<{ message: string; newBelt: string }>> {
  try {
    const parsed = promoteBeltSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Parâmetros inválidos para promoção de faixa" };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("promote_belt", {
      target_user_id: parsed.data.targetUserId,
      target_new_belt: parsed.data.newBelt,
      promotion_notes: parsed.data.notes || null
    });

    if (error) {
      return { success: false, error: error.message || "Erro ao promover faixa do usuário" };
    }

    revalidatePath("/admin/users");
    revalidatePath("/aluno");
    
    return { 
      success: true, 
      data: { message: "Faixa atualizada com sucesso", newBelt: parsed.data.newBelt } 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

