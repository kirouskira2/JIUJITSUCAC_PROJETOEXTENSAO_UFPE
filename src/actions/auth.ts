"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ActionResponse, SignInInput, signInSchema, SignUpInput, signUpSchema, Profile } from "@/lib/schemas";
import { User, Session } from "@supabase/supabase-js";
import { mapProfile } from "@/lib/mappers";

export async function signIn(data: SignInInput): Promise<ActionResponse<{ user: User; redirectTo: string }>> {
  try {
    const parsed = signInSchema.safeParse(data);
    
    if (!parsed.success) {
      return { success: false, error: "Credenciais inválidas" };
    }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError || !authData.user || !authData.session) {
    return { success: false, error: `Erro de login: ${authError?.message || "Sessão não criada"}` };
  }

  // Use the fresh access_token to fetch the profile, as cookies aren't available to the current server instance yet
  const { createClient: createSupabaseJs } = await import('@supabase/supabase-js');
  const userClient = createSupabaseJs(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      },
    }
  );

  // Verifica o perfil do usuário para checar is_active e definir redirecionamento
  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { success: false, error: `Perfil não encontrado: ${profileError?.message || "Desconhecido"}` };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { success: false, error: "Conta bloqueada (is_active=false)" };
  }

  let redirectTo = "/aluno";
  if (profile.role === "admin") redirectTo = "/admin";
  else if (profile.role === "monitor") redirectTo = "/monitor";

    revalidatePath("/", "layout");
    return { success: true, data: { user: authData.user, redirectTo } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function signUp(data: SignUpInput): Promise<ActionResponse<{ userId: string; message: string }>> {
  try {
    const parsed = signUpSchema.safeParse(data);
    
    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => issue.message).join(", ");
      return { success: false, error: `Erros de validação: ${errorMessages}` };
    }

    const supabase = await createClient();

    let role = "aluno";
    let category = "visitante";
    if (parsed.data.userProfile === "professor") {
      // Validação server-side do código de convite usando variável de ambiente
      const expectedCode = process.env.INVITE_CODE_ADMIN || "MESTRE2026";
      if (!parsed.data.inviteCode || parsed.data.inviteCode !== expectedCode) {
        return { success: false, error: "Código de convite inválido para professor" };
      }
      role = "admin";
      category = "frequente";
    } else if (parsed.data.userProfile === "extensionista") {
      role = "aluno";
      category = "academico";
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          cpf: parsed.data.cpf || null,
          role: role,
          category: category,
          gender: parsed.data.gender || null, // Legado, caso ainda precisemos
          institution: parsed.data.institution || null,
          enrollment_id: parsed.data.goalHours || null, // Guardando meta de horas em enrollment_id
          phone: parsed.data.phone || null,
          emergency_contact: parsed.data.emergencyContact || null,
          ufpe_bond: parsed.data.ufpeBond || null,
          academic_level: parsed.data.academicLevel || null,
          sexual_orientation: parsed.data.sexualOrientation || null,
          gender_identity: parsed.data.genderIdentity || null,
          race: parsed.data.race || null,
        },
      },
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Erro interno ao registrar usuário" };
    }

    return { success: true, data: { userId: authData.user.id, message: "Usuário registrado com sucesso" } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function signOut(): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: "Erro ao encerrar sessão" };
    }

    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error: unknown) {
    // redirect throws an error that should not be caught like this if it's the NEXT_REDIRECT error,
    // but in Server Actions, redirect() works by throwing. So we must re-throw it if it's a redirect error.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}

export async function getSession(): Promise<ActionResponse<{ session: Session | { user: User }; profile: Profile }>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sessão expirada" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Perfil não encontrado" };
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      redirect("/login");
    }

    const mappedProfile = mapProfile(profile);

    return { success: true, data: { session: { user }, profile: mappedProfile } };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: `Erro no servidor: ${message}` };
  }
}
