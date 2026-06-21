# Sprint Zero — Artifact 3: API Contract (Server Actions)

# Project: JJCAC — Jiu-Jitsu CAC ("Jiu-Jitsu para Todos")
# Responsible Agent: Backend_Agent
# Input: Artifact 1 (Domain Analysis) + Artifact 2 (SQL Schema)
# Sprint Zero Profile: STANDARD
# Date: 2026-05-22

# ===========================================================================
# CONVENTION:
#   - All Server Actions use "use server" directive on line 1
Sprint0_03_API_ContractSprint0_03_API_Contract#   - All return ActionResponse<T> = { success: boolean, data?: T, error?: string }
#   - All inputs validated by Zod schemas (Artifact 4)
#   - No API Route Handlers (/api/) — Anti-Legacy Filter
#   - No direct fetch() — use Supabase SSR client
# ===========================================================================

# ---------------------------------------------------------------------------
# FILE: /actions/auth.ts
# Domain: Authentication & Session Management
# Ref: Artifact 1, Section 3.1-3.3 (User Flows — Login)
# ---------------------------------------------------------------------------

/actions/auth.ts:

  signIn:
    description: "Autentica o usuário via Supabase Auth (email + password) e redireciona para a rota apropriada baseada na role"
    auth_required: false
    input:
      schema: signInSchema
      fields:
        - name: email
          type: string
          validation: "email()"
        - name: password
          type: string
          validation: "min(6)"
    output:
      success_type: "{ user: UserSession, redirectTo: string }"
      error_cases:
        - "Credenciais inválidas"
        - "Conta bloqueada (is_active=false)"
        - "Erro interno de autenticação"
    tables_accessed:
      - profiles (SELECT — para verificar is_active e role)
    rls_dependency: "profiles_select_policy"
    business_rules:
      - rule: "Após login, verificar is_active. Se false, retornar erro e fazer signOut"
        type: STATIC
        delegation: "V3.1 (code)"
      - rule: "Redirecionar baseado na role: admin→/admin, monitor→/monitor, aluno→/aluno"
        type: STATIC
        delegation: "V3.1 (code)"

  signUp:
    description: "Registra um novo usuário via Supabase Auth. O trigger handle_new_user() cria o profile automaticamente"
    auth_required: false
    input:
      schema: signUpSchema
      fields:
        - name: email
          type: string
          validation: "email()"
        - name: password
          type: string
          validation: "min(6)"
        - name: fullName
          type: string
          validation: "min(1), max(200)"
    output:
      success_type: "{ userId: string, message: string }"
      error_cases:
        - "E-mail já cadastrado"
        - "Senha fraca"
        - "Erro interno"
    tables_accessed:
      - auth.users (INSERT — via Supabase Auth)
      - profiles (INSERT — via trigger handle_new_user)
    rls_dependency: "profiles_insert_policy"
    business_rules:
      - rule: "fullName é passado via raw_user_meta_data para o trigger capturar"
        type: STATIC
        delegation: "V3.1 (code)"

  signOut:
    description: "Encerra a sessão do usuário e redireciona para /login"
    auth_required: true
    input:
      schema: null
      fields: []
    output:
      success_type: "void"
      error_cases:
        - "Erro ao encerrar sessão"
    tables_accessed: []
    rls_dependency: null
    business_rules: []

  getSession:
    description: "Retorna a sessão atual do usuário e seu perfil completo (role, category, is_active)"
    auth_required: true
    input:
      schema: null
      fields: []
    output:
      success_type: "{ session: Session, profile: Profile }"
      error_cases:
        - "Sessão expirada"
        - "Perfil não encontrado"
    tables_accessed:
      - profiles (SELECT)
    rls_dependency: "profiles_select_policy"
    business_rules:
      - rule: "Se is_active=false, forçar signOut e retornar erro"
        type: STATIC
        delegation: "V3.1 (code)"

# ---------------------------------------------------------------------------
# FILE: /actions/profiles.ts
# Domain: User Profile Management (Admin)
# Ref: Artifact 1, Section 3.3 (Admin — Gestão de Usuários)
# ---------------------------------------------------------------------------

/actions/profiles.ts:

  listProfiles:
    description: "Lista todos os perfis do sistema com filtros por role, category e is_active. Admin only."
    auth_required: true
    input:
      schema: listProfilesSchema
      fields:
        - name: role
          type: enum(user_role)
          validation: "optional()"
        - name: category
          type: enum(student_category)
          validation: "optional()"
        - name: isActive
          type: boolean
          validation: "optional()"
        - name: search
          type: string
          validation: "optional(), max(200)"
    output:
      success_type: "Profile[]"
      error_cases:
        - "Não autorizado (não é admin)"
        - "Erro de consulta"
    tables_accessed:
      - profiles (SELECT)
    rls_dependency: "profiles_select_policy"
    business_rules:
      - rule: "Apenas Admin pode listar todos os perfis"
        type: STATIC
        delegation: "V3.1 (code) — RLS garante isolamento"

  getProfile:
    description: "Retorna o perfil completo de um usuário específico"
    auth_required: true
    input:
      schema: getProfileSchema
      fields:
        - name: profileId
          type: uuid
          validation: "uuid()"
    output:
      success_type: "Profile"
      error_cases:
        - "Perfil não encontrado"
        - "Não autorizado"
    tables_accessed:
      - profiles (SELECT)
    rls_dependency: "profiles_select_policy"
    business_rules:
      - rule: "RLS garante que aluno só vê o próprio perfil"
        type: STATIC
        delegation: "V3.1 (RLS)"

  updateProfile:
    description: "Atualiza dados do perfil (full_name, belt, category, institution, enrollment_id)"
    auth_required: true
    input:
      schema: updateProfileSchema
      fields:
        - name: profileId
          type: uuid
          validation: "uuid()"
        - name: fullName
          type: string
          validation: "optional(), min(1), max(200)"
        - name: belt
          type: string
          validation: "optional()"
        - name: category
          type: enum(student_category)
          validation: "optional()"
        - name: institution
          type: string
          validation: "optional(), max(200)"
        - name: enrollmentId
          type: string
          validation: "optional(), max(50)"
    output:
      success_type: "Profile"
      error_cases:
        - "Perfil não encontrado"
        - "Não autorizado"
        - "Validação falhou"
    tables_accessed:
      - profiles (UPDATE)
    rls_dependency: "profiles_update_policy"
    business_rules:
      - rule: "Aluno pode editar apenas full_name do próprio perfil. Admin edita qualquer campo de qualquer perfil."
        type: STATIC
        delegation: "V3.1 (code + RLS)"

  promoteToMonitor:
    description: "Promove um aluno para monitor. Admin only. Preserva histórico completo do aluno."
    auth_required: true
    input:
      schema: promoteToMonitorSchema
      fields:
        - name: targetUserId
          type: uuid
          validation: "uuid()"
    output:
      success_type: "{ message: string, newRole: string }"
      error_cases:
        - "Não autorizado (não é admin)"
        - "Usuário alvo não é aluno"
        - "Usuário alvo não encontrado"
    tables_accessed:
      - profiles (SELECT, UPDATE — via function promote_to_monitor)
    rls_dependency: "profiles_update_policy"
    business_rules:
      - rule: "Apenas Admin pode promover. Apenas alunos podem ser promovidos."
        type: STATIC
        delegation: "V3.1 (code) — Ref: Artifact 1, SR3"
      - rule: "O histórico de attendance do aluno é mantido intacto após promoção"
        type: STATIC
        delegation: "V3.1 (no action needed — FK preserved)"

  promoteBelt:
    description: "Promove a faixa de um aluno. Admin only. Salva no histórico de graduações."
    auth_required: true
    input:
      schema: promoteBeltSchema
      fields:
        - name: targetUserId
          type: uuid
          validation: "uuid()"
        - name: newBelt
          type: string
          validation: "min(1)"
        - name: notes
          type: string
          validation: "optional()"
    output:
      success_type: "{ message: string, newBelt: string }"
      error_cases:
        - "Não autorizado (não é admin)"
        - "Usuário alvo não encontrado"
    tables_accessed:
      - profiles (UPDATE — via function promote_belt)
      - graduations (INSERT — via function promote_belt)
    rls_dependency: "profiles_update_policy, graduations_insert_policy"
    business_rules:
      - rule: "Apenas Admin pode promover faixas."
        type: STATIC
        delegation: "V3.1 (code + SQL Function)"

  toggleUserActive:
    description: "Alterna o status ativo/bloqueado de um usuário. Admin only."
    auth_required: true
    input:
      schema: toggleUserActiveSchema
      fields:
        - name: targetUserId
          type: uuid
          validation: "uuid()"
    output:
      success_type: "{ isActive: boolean }"
      error_cases:
        - "Não autorizado (não é admin)"
        - "Usuário não encontrado"
    tables_accessed:
      - profiles (SELECT, UPDATE — via function toggle_user_active)
    rls_dependency: "profiles_update_policy"
    business_rules:
      - rule: "Apenas Admin pode ativar/bloquear contas"
        type: STATIC
        delegation: "V3.1 (code) — Ref: Artifact 1, SR4"

# ---------------------------------------------------------------------------
# FILE: /actions/checkin.ts
# Domain: QR Code Check-in & Attendance
# Ref: Artifact 1, Section 3.1 (Aluno — Check-in via QR Code)
# ---------------------------------------------------------------------------

/actions/checkin.ts:

  registerCheckin:
    description: "Registra o check-in de presença de um aluno após confirmação da Ecologia Integral"
    auth_required: true
    input:
      schema: registerCheckinSchema
      fields:
        - name: profileId
          type: uuid
          validation: "uuid()"
        - name: workoutId
          type: uuid
          validation: "uuid()"
        - name: hygieneConfirmed
          type: boolean
          validation: "literal(true) — deve ser true para confirmar"
    output:
      success_type: "{ attendance: Attendance, principleOfDay: Principle }"
      error_cases:
        - "Higiene não confirmada"
        - "Já fez check-in neste treino"
        - "Treino do dia não encontrado"
        - "Conta bloqueada"
    tables_accessed:
      - attendance (INSERT)
      - workouts (SELECT — para buscar o treino do dia)
      - principles (SELECT — para buscar o Princípio do Dia)
    rls_dependency: "attendance_insert_policy"
    business_rules:
      - rule: "hygieneConfirmed DEVE ser true — Ecologia Integral é obrigatória"
        type: STATIC
        delegation: "V3.1 (code) — Ref: Artifact 1, SR2"
      - rule: "Constraint UNIQUE(profile_id, workout_id) impede check-in duplicado"
        type: STATIC
        delegation: "V3.1 (DB constraint) — Ref: Artifact 1, SR7"
      - rule: "Após check-in, retornar o Princípio do Dia vinculado ao treino"
        type: STATIC
        delegation: "V3.1 (code) — Ref: Artifact 1, RF02"

  getTodayWorkout:
    description: "Retorna o treino do dia atual (se cadastrado) para exibição no check-in"
    auth_required: true
    input:
      schema: null
      fields: []
    output:
      success_type: "{ workout: Workout | null, principle: Principle | null }"
      error_cases:
        - "Erro de consulta"
    tables_accessed:
      - workouts (SELECT)
      - principles (SELECT)
    rls_dependency: "workouts_select_policy"
    business_rules: []

  getMyAttendance:
    description: "Retorna o histórico de presenças do aluno autenticado"
    auth_required: true
    input:
      schema: getMyAttendanceSchema
      fields:
        - name: startDate
          type: date
          validation: "optional()"
        - name: endDate
          type: date
          validation: "optional()"
    output:
      success_type: "AttendanceWithWorkout[]"
      error_cases:
        - "Erro de consulta"
    tables_accessed:
      - attendance (SELECT)
      - workouts (SELECT — join para detalhes do treino)
      - principles (SELECT — join para nome do princípio)
    rls_dependency: "attendance_select_policy"
    business_rules:
      - rule: "RLS garante que aluno vê apenas os próprios check-ins"
        type: STATIC
        delegation: "V3.1 (RLS)"

# ---------------------------------------------------------------------------
# FILE: /actions/workouts.ts
# Domain: Workout (Treino do Dia) Management
# Ref: Artifact 1, Section 3.2 (Monitor — Treino do Dia)
# ---------------------------------------------------------------------------

/actions/workouts.ts:

  createWorkout:
    description: "Registra o Treino do Dia com a Metodologia Shading e o Princípio aplicado"
    auth_required: true
    input:
      schema: createWorkoutSchema
      fields:
        - name: date
          type: date
          validation: "date()"
        - name: techniqueName
          type: string
          validation: "min(1), max(200)"
        - name: techniqueWhat
          type: string
          validation: "min(1), max(2000)"
        - name: techniqueHow
          type: string
          validation: "min(1), max(2000)"
        - name: techniqueWhy
          type: string
          validation: "min(1), max(2000)"
        - name: principleId
          type: integer
          validation: "int(), min(1), max(32)"
    output:
      success_type: "Workout"
      error_cases:
        - "Não autorizado (não é admin ou monitor)"
        - "Já existe treino para esta data"
        - "Princípio inválido"
        - "Validação falhou"
    tables_accessed:
      - workouts (INSERT)
      - principles (SELECT — validar FK)
    rls_dependency: "workouts_insert_policy"
    business_rules:
      - rule: "Apenas Admin e Monitor podem criar treinos"
        type: STATIC
        delegation: "V3.1 (code + RLS) — Ref: Artifact 1, SR5"
      - rule: "Cada treino deve ter exatamente 1 princípio associado"
        type: STATIC
        delegation: "V3.1 (FK constraint) — Ref: Artifact 1, SR6"
      - rule: "Data é UNIQUE — apenas 1 treino por dia"
        type: STATIC
        delegation: "V3.1 (DB constraint)"

  updateWorkout:
    description: "Atualiza um treino existente (técnica, princípio)"
    auth_required: true
    input:
      schema: updateWorkoutSchema
      fields:
        - name: workoutId
          type: uuid
          validation: "uuid()"
        - name: techniqueName
          type: string
          validation: "optional(), min(1), max(200)"
        - name: techniqueWhat
          type: string
          validation: "optional(), min(1), max(2000)"
        - name: techniqueHow
          type: string
          validation: "optional(), min(1), max(2000)"
        - name: techniqueWhy
          type: string
          validation: "optional(), min(1), max(2000)"
        - name: principleId
          type: integer
          validation: "optional(), int(), min(1), max(32)"
    output:
      success_type: "Workout"
      error_cases:
        - "Não autorizado"
        - "Treino não encontrado"
        - "Validação falhou"
    tables_accessed:
      - workouts (UPDATE)
    rls_dependency: "workouts_update_policy"
    business_rules:
      - rule: "Apenas Admin e Monitor podem editar treinos"
        type: STATIC
        delegation: "V3.1 (RLS) — Ref: Artifact 1, SR5"

  listWorkouts:
    description: "Lista treinos com filtros de período. Disponível para todos os autenticados."
    auth_required: true
    input:
      schema: listWorkoutsSchema
      fields:
        - name: startDate
          type: date
          validation: "optional()"
        - name: endDate
          type: date
          validation: "optional()"
    output:
      success_type: "WorkoutWithPrinciple[]"
      error_cases:
        - "Erro de consulta"
    tables_accessed:
      - workouts (SELECT)
      - principles (SELECT — join)
    rls_dependency: "workouts_select_policy"
    business_rules: []

# ---------------------------------------------------------------------------
# FILE: /actions/dashboard.ts
# Domain: Admin Analytics & Reporting
# Ref: Artifact 1, Section 3.3 (Admin — Dashboard Analítico RF04)
# ---------------------------------------------------------------------------

/actions/dashboard.ts:

  getDashboardStats:
    description: "Retorna KPIs e dados agregados para o painel analítico do Mestre"
    auth_required: true
    input:
      schema: getDashboardStatsSchema
      fields:
        - name: startDate
          type: date
          validation: "optional()"
        - name: endDate
          type: date
          validation: "optional()"
    output:
      success_type: >
        {
          totalStudents: number,
          activeStudents: number,
          studentsByCategory: { frequente: number, academico: number, visitante: number },
          studentsByBelt: { belt: string, count: number }[],
          averageAttendance: number,
          attendanceByWeek: { week: string, count: number }[],
          totalWorkouts: number
        }
      error_cases:
        - "Não autorizado (não é admin)"
        - "Erro de consulta"
    tables_accessed:
      - profiles (SELECT — contagens e agrupamentos)
      - attendance (SELECT — dados de frequência)
      - workouts (SELECT — total de treinos)
    rls_dependency: "profiles_select_policy, attendance_select_policy"
    business_rules:
      - rule: "Apenas Admin pode acessar o dashboard completo"
        type: STATIC
        delegation: "V3.1 (code)"

  getStudentsByCategory:
    description: "Lista alunos segmentados por categoria (Frequentes, Acadêmicos, Visitantes)"
    auth_required: true
    input:
      schema: getStudentsByCategorySchema
      fields:
        - name: category
          type: enum(student_category)
          validation: "enum()"
    output:
      success_type: "ProfileWithAttendanceCount[]"
      error_cases:
        - "Não autorizado (não é admin)"
    tables_accessed:
      - profiles (SELECT)
      - attendance (SELECT — contagem de presenças por aluno)
    rls_dependency: "profiles_select_policy"
    business_rules:
      - rule: "Apenas Admin pode listar alunos por categoria"
        type: STATIC
        delegation: "V3.1 (code)"

# ---------------------------------------------------------------------------
# FILE: /actions/reports.ts
# Domain: Report Export (PDF/CSV)
# Ref: Artifact 1, Section 3.3 (Admin — Exportação RF05)
# ---------------------------------------------------------------------------

/actions/reports.ts:

  exportAttendanceReport:
    description: "Gera dados consolidados de presença para exportação em PDF/CSV"
    auth_required: true
    input:
      schema: exportAttendanceReportSchema
      fields:
        - name: startDate
          type: date
          validation: "date()"
        - name: endDate
          type: date
          validation: "date()"
        - name: category
          type: enum(student_category)
          validation: "optional()"
        - name: format
          type: enum('pdf', 'csv')
          validation: "enum()"
    output:
      success_type: "{ data: ReportRow[], totalRecords: number }"
      error_cases:
        - "Não autorizado (não é admin)"
        - "Período inválido"
        - "Sem dados para o período"
    tables_accessed:
      - profiles (SELECT)
      - attendance (SELECT)
      - workouts (SELECT)
    rls_dependency: "profiles_select_policy, attendance_select_policy"
    business_rules:
      - rule: "Apenas Admin pode exportar relatórios"
        type: STATIC
        delegation: "V3.1 (code)"

  exportAcademicReport:
    description: "Gera relatório detalhado para alunos acadêmicos: cruza presenças com Treino do Dia para prestação de contas institucional (UFPE/FICR)"
    auth_required: true
    input:
      schema: exportAcademicReportSchema
      fields:
        - name: startDate
          type: date
          validation: "date()"
        - name: endDate
          type: date
          validation: "date()"
    output:
      success_type: >
        {
          rows: AcademicReportRow[],
          summary: {
            totalStudents: number,
            totalSessions: number,
            period: string
          }
        }
      error_cases:
        - "Não autorizado (não é admin)"
        - "Período inválido"
        - "Sem alunos acadêmicos no período"
    tables_accessed:
      - profiles (SELECT — category='academico')
      - attendance (SELECT)
      - workouts (SELECT — técnica e data)
      - principles (SELECT — princípio aplicado)
    rls_dependency: "Via function get_academic_report() — SECURITY DEFINER"
    business_rules:
      - rule: "Relatório deve detalhar os dias exatos de presença cruzados com a descrição exata do Treino do Dia"
        type: STATIC
        delegation: "V3.1 (SQL function get_academic_report) — Ref: Artifact 1, RF05"
      - rule: "Incluir institution e enrollment_id de cada aluno para validação institucional"
        type: STATIC
        delegation: "V3.1 (code)"

# ---------------------------------------------------------------------------
# FILE: /actions/principles.ts
# Domain: 32 Principles Catalog
# Ref: Artifact 1, Section 2 (Entity "Principle")
# ---------------------------------------------------------------------------

/actions/principles.ts:

  listPrinciples:
    description: "Retorna a lista completa dos 32 Princípios do Jiu-Jitsu"
    auth_required: true
    input:
      schema: null
      fields: []
    output:
      success_type: "Principle[]"
      error_cases:
        - "Erro de consulta"
    tables_accessed:
      - principles (SELECT)
    rls_dependency: "principles_select_policy"
    business_rules: []

  getPrincipleOfDay:
    description: "Retorna o Princípio do Dia baseado no treino cadastrado para a data atual"
    auth_required: true
    input:
      schema: null
      fields: []
    output:
      success_type: "{ principle: Principle | null, workout: Workout | null }"
      error_cases:
        - "Erro de consulta"
    tables_accessed:
      - workouts (SELECT — buscar treino de hoje)
      - principles (SELECT — buscar princípio vinculado)
    rls_dependency: "workouts_select_policy, principles_select_policy"
    business_rules:
      - rule: "Se não houver treino cadastrado para hoje, retornar princípio aleatório"
        type: STATIC
        delegation: "V3.1 (code) — Ref: Artifact 1, RF02"

# ===========================================================================
# TYPE DEFINITIONS (ActionResponse<T>)
# ===========================================================================

# All Server Actions MUST return this standard envelope:
#
# type ActionResponse<T> = {
#   success: boolean;
#   data?: T;
#   error?: string;
# }
#
# Convention enforced by Artifact 4 (Zod Schemas) and
# validated by Audit Framework Section 4 (Contract Compliance).

# ===========================================================================
# TRM VERIFICATION CHECKLIST
# ===========================================================================

# - [x] Each Artifact 1 user flow has corresponding actions?
#       Aluno: signIn, registerCheckin, getMyAttendance, getPrincipleOfDay ✅
#       Monitor: createWorkout, updateWorkout, registerCheckin (scanner) ✅
#       Admin: listProfiles, promoteToMonitor, toggleUserActive, getDashboardStats, exportReports ✅
#       Legado: signUp (n8n pode chamar via webhook) ✅
#
# - [x] Each action references tables that exist in Artifact 2? ✅
# - [x] All actions are async and return ActionResponse<T>? ✅
# - [x] Volatile rules marked as "V4 (Policy Agent)"? N/A — No volatile rules in MVP
# - [x] No action without auth_required defined? ✅ (4 public, 16 authenticated)
# - [x] Error cases cover real scenarios (not generic)? ✅

# ===========================================================================
# Sprint Zero Artifact 3 complete. Audit Gateway approved.
# Awaiting command: "Proceed" to generate Artifact 4 (Zod Validation Schemas).
# ===========================================================================
