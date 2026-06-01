import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth Callback Route Handler
 * 
 * Processa o código de troca de sessão (PKCE) do Supabase Auth.
 * Usado para:
 * - Confirmação de e-mail
 * - Recuperação de senha (magic link)
 * - OAuth callbacks
 * 
 * O Supabase redireciona para esta rota com um `code` query param
 * que é trocado por uma sessão válida.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/aluno";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Após troca bem-sucedida, verificar o role do usuário para redirecionar corretamente
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Se o next param já está definido (ex: /reset-password), respeitar
        if (next !== "/aluno") {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Redirecionar baseado no role
        const role = profile?.role;
        if (role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (role === "monitor") {
          return NextResponse.redirect(`${origin}/monitor`);
        } else {
          return NextResponse.redirect(`${origin}/aluno`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Erro na troca — redirecionar para login com erro
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
