import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de proteção de rotas por role (RBAC)
 * Ref: Artifact 1, Section 3 (User Flows — redirecionamento por role)
 * Ref: Artifact 1, SR8 (Conta bloqueada não faz login funcional)
 */
export async function middleware(request: NextRequest) {
  // Geração do Nonce para CSP Strict
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel-scripts.com https://*.vercel.live;
    frame-src 'self' https://*.supabase.co https://vercel.live https://*.vercel.live;
    media-src 'self' blob:;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, " ").trim();

  // Clonar headers da requisição e adicionar o CSP
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Aplicar CSP também na resposta
  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rotas públicas — permite acesso sem autenticação
  if (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/" || pathname.startsWith("/_next")) {
    // Se já autenticado e tentando acessar rotas de auth, redireciona para dashboard (exceto reset-password, que precisa de sessão para atualizar a senha)
    if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (profile) {
        const redirectMap: Record<string, string> = {
          admin: "/admin",
          monitor: "/monitor",
          aluno: "/aluno",
        };
        const target = redirectMap[profile.role] || "/aluno";
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
    return supabaseResponse;
  }

  // Rotas protegidas — exige autenticação
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Buscar perfil para verificar role e is_active
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // SR8: Conta bloqueada não pode acessar o sistema
  if (!profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // RBAC: Verificar permissões por rota
  const role = profile.role;

  // Admin: acesso total
  if (pathname.startsWith("/admin") && role !== "admin") {
    const fallback = role === "monitor" ? "/monitor" : "/aluno";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  // Monitor: acesso a /monitor e /aluno (monitor herda capacidades de aluno)
  if (pathname.startsWith("/monitor") && role !== "admin" && role !== "monitor") {
    return NextResponse.redirect(new URL("/aluno", request.url));
  }

  // Aluno: acesso apenas a /aluno
  // (Admin e Monitor também podem acessar /aluno)

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
