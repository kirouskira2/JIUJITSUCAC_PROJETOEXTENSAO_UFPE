# Auditoria de Código — JJCAC (Segurança + Boas Práticas)

Auditoria completa contra os 22 critérios definidos em [segurança.md](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/seguran%C3%A7a.md) (10 itens) e [boaspratica.md](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/boaspratica.md) (12 itens).

---

## PARTE 1 — Auditoria de Segurança (segurança.md)

### ✅ S1. Chaves de API e dados sensíveis protegidos
- `.gitignore` presente e cobre `.env*` (linha 34).
- Chaves armazenadas em `.env.local` e não no código-fonte.
- `INVITE_CODE_ADMIN`, `QR_SECRET`, `HMAC_SIGNING_KEY`, `ENCRYPTION_KEY` são lidos de `process.env`.
- **Único risco menor:** O [auth.ts L74](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/auth.ts#L74) possui um fallback hardcoded `"MESTRE2026"` para `INVITE_CODE_ADMIN`. Se a variável não estiver definida, qualquer um com esse código default pode criar admin. O mesmo ocorre em [checkin.ts L42](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/checkin.ts#L42) e [L66](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/checkin.ts#L66) com fallbacks para `HMAC_SIGNING_KEY` e `QR_SECRET`.

> [!WARNING]
> **Correção S1-A (ALTO):** Remover fallbacks hardcoded de segredos. Se a variável não estiver definida, lançar erro e bloquear a operação (fail-closed), ao invés de usar um valor default previsível.

---

### ✅ S2. APIs não expostas no frontend
- O cliente Supabase do browser ([client.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/lib/supabase/client.ts)) usa apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chaves públicas por design do Supabase).
- Toda a lógica sensível roda em Server Actions (`"use server"`) — nunca exposta ao browser.
- **Veredicto: APROVADO ✅**

---

### ✅ S3. Validação de dados de entrada
- O projeto usa **Zod** extensivamente em [schemas.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/lib/schemas.ts) (545 linhas) com validações robustas: UUID, email, CPF (mod 11), senha forte, tamanhos máximos.
- Todas as Server Actions fazem `.safeParse()` antes de processar.
- Validação de UUID manual com regex em `deleteCheckin`, `deleteWorkout`, `markNotificationAsRead`.

> [!NOTE]
> **Correção S3-A (MÉDIO):** [deleteEvent](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/events.ts#L205) e [deleteAnnouncement](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/events.ts#L228) **não validam** o `eventId`/`announcementId` como UUID antes de passá-lo ao Supabase. Adicionar validação UUID.

---

### ✅ S4. Autenticação e Autorização (RBAC)
- [middleware.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/middleware.ts) implementa RBAC completo: `admin` > `monitor` > `aluno`.
- Todas as Server Actions críticas fazem dupla verificação: `getUser()` + consulta `profiles.role`.
- Contas bloqueadas (`is_active=false`) são deslogadas imediatamente.
- **Veredicto: APROVADO ✅**

---

### ✅ S5. Proteção contra ataques comuns (SQLi, XSS, CSRF)
- **SQL Injection:** Impossível — usa Supabase JS Client (queries parametrizadas internamente) e RPCs nomeadas.
- **XSS:** React escapa automaticamente. CSP rigorosa definida no [middleware.ts L12-L25](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/middleware.ts#L12-L25).
- **CSRF:** Server Actions do Next.js usam tokens automáticos. Rate limiting implementado em [rate-limit.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/lib/rate-limit.ts).

> [!NOTE]
> **Observação S5-A (BAIXO):** A CSP inclui `'unsafe-eval'` e `'unsafe-inline'` na diretiva `script-src`. Idealmente, usar nonce-based CSP (o nonce já é gerado mas não é injetado nos scripts).

---

### ⚠️ S6. Logging Adequado
- **FALHA DETECTADA:** O projeto **não possui sistema de logging estruturado**. Usa apenas `console.error` espalhado (11 ocorrências) e `console.warn` (3 ocorrências).
- Não há registro de tentativas de login (sucesso/falha), alterações críticas de dados, ou ações administrativas.
- Nenhum dado sensível é logado (bom), mas nenhum dado útil é logado (ruim).

> [!CAUTION]
> **Correção S6-A (ALTO):** Implementar um módulo de logging centralizado (`src/lib/logger.ts`) que registre: tentativas de login, mudanças de role, exclusões de usuários, e erros de servidor. Usar formato estruturado (JSON) para facilitar auditoria.

---

### ✅ S7. Política de Senhas
- [schemas.ts L37-L44](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/lib/schemas.ts#L37-L44) impõe: mínimo 8 caracteres, maiúscula, minúscula, número, caractere especial.
- Senhas são gerenciadas pelo Supabase GoTrue (bcrypt com salt único por padrão).
- Reset de senha via e-mail (`/forgot-password` → `/reset-password`).
- **Veredicto: APROVADO ✅**

---

### ⚠️ S8. Backup e Recuperação de Dados
- **Nenhuma rotina de backup documentada ou implementada.**
- O Supabase Cloud oferece backups automáticos no plano Pro, mas no plano Free (atual), os backups são limitados.

> [!IMPORTANT]
> **Correção S8-A (MÉDIO):** Documentar a estratégia de backup no `docs/DEPLOY.md`. Se estiver no plano Free, recomendar à UFPE o uso de `pg_dump` periódico ou upgrade para plano Pro.

---

### ⚠️ S9. Dependências e Vulnerabilidades
O `npm audit` retornou vulnerabilidades:
- `@babel/core` (low) — leitura arbitrária de arquivo via sourceMappingURL
- `@ducanh2912/next-pwa` (moderate) — vulnerabilidades transitivas via workbox

> [!WARNING]
> **Correção S9-A (MÉDIO):** Atualizar `@ducanh2912/next-pwa` ou avaliar alternativa (`@serwist/next`). Rodar `npm audit fix` para as correções automáticas.

---

### ✅ S10. HTTPS e Headers de Segurança
- [next.config.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/next.config.ts#L10-L41) define: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `HSTS` (1 ano), `Permissions-Policy`.
- CSP definida no middleware.
- Supabase forçado em HTTPS.
- **Veredicto: APROVADO ✅**

---

## PARTE 2 — Auditoria de Boas Práticas (boaspratica.md)

### ✅ B1. Código Duplicado (DRY)
- O padrão de role-check (`getUser()` → `profiles.role`) se repete em praticamente toda Server Action (~15 vezes).

> [!NOTE]
> **Correção B1-A (BAIXO):** Extrair para uma função utilitária tipo `requireRole(["admin", "monitor"])` que retorne o perfil ou lance erro. Elimina ~50 linhas de código repetido.

---

### ⚠️ B2. Código Morto (Dead Code)
- SVGs padrão do Next.js em `/public` (`file.svg`, `globe.svg`, `window.svg`, `next.svg`, `vercel.svg`) — não referenciados.
- Código comentado em [checkin.ts L77-L83](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/checkin.ts#L77-L83) (verificação de horário desativada).

> [!NOTE]
> **Correção B2-A (BAIXO):** Remover SVGs não utilizados e o bloco de código comentado (ou documentar por que está desativado).

---

### ⚠️ B3. Uso Consistente de TypeScript
- **11 ocorrências** de `: any` detectadas no código (em `catch` blocks, mapeamentos Supabase, e PWA prompt).
- Principais ofensores: [checkin.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/checkin.ts) (3x), [webpush.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/webpush.ts) (2x), [graduation.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/actions/graduation.ts) (1x).

> [!NOTE]
> **Correção B3-A (BAIXO):** Substituir `catch (err: any)` por `catch (err: unknown)` com narrowing. Tipar os mapeamentos Supabase com interfaces dedicadas ao invés de `(a: any)`.

---

### ✅ B4. Componentes Bem Estruturados
- Componentes focados e com responsabilidade única.
- O maior componente é [user-table.tsx](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/components/user-table.tsx) (25KB, ~600 linhas) — candidato a refatoração mas aceitável.
- **Veredicto: APROVADO ✅** (com ressalva para `user-table.tsx`)

---

### ✅ B5. Gestão de Estado | ✅ B6. Uso de Hooks
- Uso correto de `useCallback` e `useMemo` nos componentes críticos.
- Custom hooks extraídos (`use-offline-sync`, `use-toast`, `useOnWindowResize`).
- Sem prop-drilling excessivo — dados fluem via Server Components.
- **Veredicto: APROVADO ✅**

---

### ✅ B7. Separação Lógica/Apresentação
- Server Actions em `/actions` (lógica) completamente separadas de componentes UI em `/components`.
- Páginas server-side buscam dados e passam para componentes client-side.
- **Veredicto: APROVADO ✅**

---

### ✅ B8. Tratamento de Erros
- Todas as Server Actions retornam `ActionResponse<T>` com `success/error`.
- `try/catch` em todos os blocos assíncronos.
- [error.tsx](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/app/error.tsx) e [not-found.tsx](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/app/not-found.tsx) existem como boundaries globais.
- **Veredicto: APROVADO ✅**

---

### ✅ B9. Performance
- `output: 'standalone'` no next.config (imagem Docker otimizada).
- PWA com service worker para cache de assets.
- Uso de `useMemo` e `useCallback` nos componentes interativos.
- **Veredicto: APROVADO ✅**

---

### ✅ B10. Organização do Projeto
- Estrutura limpa: `/actions`, `/components`, `/lib`, `/hooks`, `/app`.
- Aliases configurados (`@/`).
- **Veredicto: APROVADO ✅**

---

### ✅ B11. Acessibilidade (a11y)
- Skip link para "Pular para o conteúdo principal" ([layout.tsx L73-L78](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/app/layout.tsx#L73-L78)).
- `lang="pt-BR"` no HTML.
- `aria-label` em botões de navegação, busca, e paginação.
- `alt` text em todas as imagens.
- **Veredicto: APROVADO ✅**

---

### ⚠️ B12. Testes Adequados
- Apenas **1 arquivo de teste** encontrado: [middleware.test.ts](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/src/__tests__/middleware.test.ts).
- Jest configurado mas com cobertura mínima.
- Nenhum teste de componente, nenhum teste E2E.

> [!WARNING]
> **Correção B12-A (ALTO):** Adicionar testes unitários para as Server Actions críticas (`auth.ts`, `checkin.ts`). Idealmente, testes para: login com credenciais válidas/inválidas, check-in com token HMAC válido/inválido, validação de role.

---

## Resumo por Prioridade

| Prioridade | ID | Descrição | Arquivo |
|---|---|---|---|
| 🔴 ALTO | S1-A | Remover fallbacks hardcoded de segredos | `auth.ts`, `checkin.ts` |
| 🔴 ALTO | S6-A | Implementar logging estruturado | Novo: `lib/logger.ts` |
| 🔴 ALTO | B12-A | Expandir cobertura de testes | `__tests__/` |
| 🟡 MÉDIO | S3-A | Validar UUID em `deleteEvent`/`deleteAnnouncement` | `events.ts` |
| 🟡 MÉDIO | S8-A | Documentar estratégia de backup | `docs/DEPLOY.md` |
| 🟡 MÉDIO | S9-A | Atualizar dependências vulneráveis | `package.json` |
| 🟢 BAIXO | B1-A | Extrair helper `requireRole()` | Novo: `lib/auth-helpers.ts` |
| 🟢 BAIXO | B2-A | Remover SVGs e código comentado | `public/`, `checkin.ts` |
| 🟢 BAIXO | B3-A | Substituir `any` por tipos específicos | 11 ocorrências |
| 🟢 BAIXO | S5-A | Refinar CSP (remover `unsafe-eval`) | `middleware.ts` |
