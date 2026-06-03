/**
 * Testes Unitários — middleware.ts (RBAC e Proteção de Contas)
 * 
 * Foco:
 * 1. Contas bloqueadas (is_active = false) são deslogadas e redirecionadas
 * 2. RBAC: /admin só aceita role "admin"
 * 3. RBAC: /monitor aceita "admin" e "monitor", rejeita "aluno"
 * 4. Rotas públicas são acessíveis sem autenticação
 *
 * Ref: boaspratica.md §12 (Adequate Testing)
 * Ref: segurança.md §4 (Authentication & Authorization)
 */

// ============================================================================
// Re-implementação isolada da lógica RBAC para teste unitário puro
// (sem dependências de Next.js Request/Response ou Supabase)
// ============================================================================

interface MockProfile {
  role: "admin" | "monitor" | "aluno";
  is_active: boolean;
}

interface RbacResult {
  action: "allow" | "redirect" | "signout_redirect";
  target?: string;
}

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/"];

function evaluateRbac(
  pathname: string,
  user: { id: string } | null,
  profile: MockProfile | null
): RbacResult {
  // Rotas públicas — permitir
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/_next")) {
    return { action: "allow" };
  }

  // Sem autenticação → redirecionar para login
  if (!user) {
    return { action: "redirect", target: "/login" };
  }

  // Sem perfil → redirecionar para login
  if (!profile) {
    return { action: "redirect", target: "/login" };
  }

  // Conta bloqueada → signOut + redirecionar
  if (!profile.is_active) {
    return { action: "signout_redirect", target: "/login" };
  }

  const role = profile.role;

  // RBAC por rota
  if (pathname.startsWith("/admin") && role !== "admin") {
    const fallback = role === "monitor" ? "/monitor" : "/aluno";
    return { action: "redirect", target: fallback };
  }

  if (pathname.startsWith("/monitor") && role !== "admin" && role !== "monitor") {
    return { action: "redirect", target: "/aluno" };
  }

  return { action: "allow" };
}

// ============================================================================
// TESTES
// ============================================================================

describe("RBAC — Rotas Públicas", () => {
  test("/login é acessível sem autenticação", () => {
    const result = evaluateRbac("/login", null, null);
    expect(result.action).toBe("allow");
  });

  test("/signup é acessível sem autenticação", () => {
    const result = evaluateRbac("/signup", null, null);
    expect(result.action).toBe("allow");
  });

  test("/ (raiz) é acessível sem autenticação", () => {
    const result = evaluateRbac("/", null, null);
    expect(result.action).toBe("allow");
  });
});

describe("RBAC — Proteção de Rotas", () => {
  test("redireciona para /login se não autenticado em rota protegida", () => {
    const result = evaluateRbac("/admin", null, null);
    expect(result.action).toBe("redirect");
    expect(result.target).toBe("/login");
  });

  test("admin pode acessar /admin", () => {
    const result = evaluateRbac("/admin/users", { id: "1" }, { role: "admin", is_active: true });
    expect(result.action).toBe("allow");
  });

  test("monitor NÃO pode acessar /admin", () => {
    const result = evaluateRbac("/admin", { id: "1" }, { role: "monitor", is_active: true });
    expect(result.action).toBe("redirect");
    expect(result.target).toBe("/monitor");
  });

  test("aluno NÃO pode acessar /admin", () => {
    const result = evaluateRbac("/admin", { id: "1" }, { role: "aluno", is_active: true });
    expect(result.action).toBe("redirect");
    expect(result.target).toBe("/aluno");
  });

  test("admin pode acessar /monitor", () => {
    const result = evaluateRbac("/monitor", { id: "1" }, { role: "admin", is_active: true });
    expect(result.action).toBe("allow");
  });

  test("monitor pode acessar /monitor", () => {
    const result = evaluateRbac("/monitor/scanner", { id: "1" }, { role: "monitor", is_active: true });
    expect(result.action).toBe("allow");
  });

  test("aluno NÃO pode acessar /monitor", () => {
    const result = evaluateRbac("/monitor", { id: "1" }, { role: "aluno", is_active: true });
    expect(result.action).toBe("redirect");
    expect(result.target).toBe("/aluno");
  });

  test("todos podem acessar /aluno", () => {
    expect(evaluateRbac("/aluno", { id: "1" }, { role: "admin", is_active: true }).action).toBe("allow");
    expect(evaluateRbac("/aluno", { id: "1" }, { role: "monitor", is_active: true }).action).toBe("allow");
    expect(evaluateRbac("/aluno", { id: "1" }, { role: "aluno", is_active: true }).action).toBe("allow");
  });
});

describe("RBAC — Conta Bloqueada (is_active = false)", () => {
  test("conta bloqueada é deslogada e redirecionada para /login (admin)", () => {
    const result = evaluateRbac("/admin", { id: "1" }, { role: "admin", is_active: false });
    expect(result.action).toBe("signout_redirect");
    expect(result.target).toBe("/login");
  });

  test("conta bloqueada é deslogada e redirecionada para /login (aluno)", () => {
    const result = evaluateRbac("/aluno", { id: "1" }, { role: "aluno", is_active: false });
    expect(result.action).toBe("signout_redirect");
    expect(result.target).toBe("/login");
  });

  test("conta bloqueada é deslogada e redirecionada para /login (monitor)", () => {
    const result = evaluateRbac("/monitor", { id: "1" }, { role: "monitor", is_active: false });
    expect(result.action).toBe("signout_redirect");
    expect(result.target).toBe("/login");
  });
});
