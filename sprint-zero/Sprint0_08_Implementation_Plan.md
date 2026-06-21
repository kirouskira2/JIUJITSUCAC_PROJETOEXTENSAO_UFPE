# Sprint Zero — Artifact 8 V3.0: Implementation Plan (Premium Playbook)

**Project:** JJCAC Premium — Jiu-Jitsu CAC ("Jiu-Jitsu para Todos")
**Responsible Agent:** `Architect_TRM`
**Date:** 2026-05-25

Este plano substitui todas as iterações anteriores e serve como o Playbook definitivo para a construção da PWA JJCAC, agora adaptada para o design **Dark Premium**, removendo o módulo financeiro e incorporando a **Gestão de Graduação** e **Relatórios de Extensão**.

---

## FASE 1: Fundação Estética e Arquitetural (Dark Premium)

**Objetivo:** Configurar o Next.js App Router com a nova identidade visual.
1. **Configuração Tailwind:** Injetar paleta de cores (Deep Midnight Navy, Electric Cyan, Gold), typography (Hanken Grotesk, Barlow Condensed) e variáveis estruturais conforme `DESIGN1.md`.
2. **Componentes Base Glassmorphism:** Criar os layouts padronizados com suporte a `backdrop-blur` e bordas precisas de 1px.
3. **Magic UI & Efeitos Visuais:** Integrar componentes premium (`light-rays`, `magic-card`, `particles`) gerando a experiência "Tatame Digital" de alta fidelidade.
4. **Layouts Globais:** Implementar Sidebar elástica e Bottom Navigation Mobile fluida.

---

## FASE 2: Data Layer e Autenticação (Supabase)

**Objetivo:** Estabelecer a comunicação robusta com o Supabase usando SSR.
1. **Schema Injection:** Executar o script SQL atualizado (com a nova tabela `graduations`, functions de `promote_belt`, RLS refinado).
2. **Server Actions (Auth):** Implementar o módulo `/actions/auth.ts` usando `@supabase/ssr`.
3. **Telas de Acesso:** Construir `login_screen`, `recupera_o_de_senha` e `cria_o_de_conta_perfis_din_micos`.
4. **Middleware:** Configurar roteamento restrito por `role` (admin, monitor, aluno) e checagem de bloqueio de conta (`is_active`).

---

## FASE 3: Jornada do Aluno (App Core)

**Objetivo:** Permitir que alunos validem presenças de forma autônoma.
1. **Perfil Social:** Construir `perfil_do_aluno` exibindo os dados de categoria, histórico e sua Faixa atual (`belt`).
2. **Ecologia Integral:** Criar o fluxo onde o aluno entra no scanner (`qr_code_do_tatame`) e um `ecologia_integral_modal` força a confirmação de higiene (unhas cortadas, kimono limpo).
3. **Princípio do Dia:** Tela de sucesso do check-in extraindo o `detalhe_do_princ_pio` (1 dos 32 de Rener Gracie).
4. **Server Actions (Check-in):** Conectar `registerCheckin` com a segurança anti-duplicação (1 check-in por dia).

---

## FASE 4: Ferramentas do Monitor (Gestão de Tatame)

**Objetivo:** Empoderar faixas avançadas na gestão do treino.
1. **Dashboard Monitor:** Visão resumida (`dashboard_monitor`) do seu próprio status e atalhos de trabalho.
2. **Scanner de Entrada:** Implementar biblioteca de leitura QR (`html5-qrcode` ou similar) na tela `check_in_scanner` para ler presenças de alunos sem celular.
3. **Treino do Dia (Shading):** Tela `registrar_treino_do_dia_corrigido` para mapear "O que / Como / Por que" e vincular a um dos 32 Princípios.

---

## FASE 5: Painel de Controle Avançado (Admin/Mestre)

**Objetivo:** Entregar todas as ferramentas táticas e relatórios para o Mestre Sadi.
1. **Dashboard Institucional:** Construir `dashboard_admin` utilizando Tremor UI para exibir gráficos de crescimento, assiduidade média e segmentação por categoria.
2. **Gestão de Alunos:** Tela `lista_de_alunos_admin` com poderes de ativar/bloquear, ver ficha completa e promover para Monitor.
3. **Gestão de Graduação:** Criar o módulo `gest_o_de_gradua_o_admin` (Promoção de Faixas), acionando a Server Action `promoteBelt` que atualiza o perfil e gera registro em `graduations`.
4. **Relatórios de Extensão Institucional:** Construir a tela `relat_rios_de_extens_o_admin`.
   - *Funcionalidade Chave:* Cruzamento da presença dos "Acadêmicos" (UFPE/FICR) com a descrição exata do Treino do Dia. Exportação para CSV (blob download) e PDF (via jsPDF).

---

**🟢 ARTIFACT 8 V3.0 FINALIZADO. Documentação TRM 100% atualizada para o modelo Premium.**
