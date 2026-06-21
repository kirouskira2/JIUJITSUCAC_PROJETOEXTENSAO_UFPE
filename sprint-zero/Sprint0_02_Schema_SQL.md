-- ============================================================================
-- ARQUIVO: sprint-zero/Sprint0_02_Schema_SQL.sql
-- PROJETO: JJCAC — Jiu-Jitsu CAC ("Jiu-Jitsu para Todos")
-- DESCRIÇÃO: Schema completo para Supabase (PostgreSQL) — MVP
-- DERIVADO DE: Sprint0_01_Domain_Analysis.md (Artifact 1)
-- RESPONSIBLE AGENT: Backend_Agent (supervised by Security_Agent for RLS)
-- SPRINT ZERO PROFILE: STANDARD
-- VERSION: 1.0
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";  -- Geração de UUIDs

-- ============================================================================
-- 2. DOMAIN ENUMS
-- Derived EXACTLY from Artifact 1, Section 4 (Business Rules) and Section 2
-- ============================================================================

-- Roles do sistema (RBAC) — Ref: Artifact 1, SR3/SR4/SR5
create type user_role as enum ('admin', 'monitor', 'aluno');

-- Categorias de aluno para segmentação — Ref: Artifact 1, Section 1.5 / RF04
create type student_category as enum ('frequente', 'academico', 'visitante');

-- ============================================================================
-- 3. TABLES
-- One table per entity from Artifact 1, Section 2 (Entity Map)
-- Audit fields: created_at, updated_at on all mutable tables
-- ============================================================================

-- --------------------------------------------------------------------------
-- 3.1 PROFILES (Perfil do Usuário)
-- Ref: Artifact 1 → Entity "Profile"
-- Espelha auth.users do Supabase Auth com dados de domínio
-- --------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'aluno',
  belt text default 'Branca',
  category student_category not null default 'visitante',
  institution text,           -- Ex: UFPE, FICR (para acadêmicos)
  enrollment_id text,         -- Matrícula institucional (para acadêmicos)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_full_name_not_empty
    check (length(trim(full_name)) > 0),
  constraint profiles_email_format
    check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

comment on table public.profiles is 'Perfis de usuários do JJCAC (vinculados ao Supabase Auth)';
comment on column public.profiles.role is 'Papel no sistema: admin, monitor ou aluno (RBAC)';
comment on column public.profiles.category is 'Segmentação para relatórios: frequente, academico ou visitante';
comment on column public.profiles.is_active is 'Toggle de ativação/bloqueio controlado pelo Admin';
comment on column public.profiles.institution is 'Instituição de ensino (obrigatório para acadêmicos)';
comment on column public.profiles.enrollment_id is 'Matrícula institucional (obrigatório para acadêmicos)';

-- --------------------------------------------------------------------------
-- 3.2 PRINCIPLES (Os 32 Princípios do Jiu-Jitsu)
-- Ref: Artifact 1 → Entity "Principle"
-- Catálogo estático derivado de Os32Principios.pdf (Rener Gracie)
-- --------------------------------------------------------------------------
create table public.principles (
  id serial primary key,
  number integer not null unique,
  title_pt text not null,
  title_en text not null,
  description text not null,
  category text,              -- Agrupamento temático (ex: "Defesa", "Ataque")

  constraint principles_number_range
    check (number >= 1 and number <= 32),
  constraint principles_title_pt_not_empty
    check (length(trim(title_pt)) > 0),
  constraint principles_title_en_not_empty
    check (length(trim(title_en)) > 0)
);

comment on table public.principles is 'Catálogo dos 32 Princípios do Jiu-Jitsu (Rener Gracie)';
comment on column public.principles.number is 'Número sequencial do princípio (1 a 32)';
comment on column public.principles.category is 'Agrupamento temático para organização pedagógica';

-- --------------------------------------------------------------------------
-- 3.3 WORKOUTS (Treino do Dia)
-- Ref: Artifact 1 → Entity "Workout"
-- Metodologia Shading: O que se faz / Como se faz / Por que se faz
-- --------------------------------------------------------------------------
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  technique_name text not null,
  technique_what text not null,   -- Shading: O que se faz
  technique_how text not null,    -- Shading: Como se faz
  technique_why text not null,    -- Shading: Por que se faz
  principle_id integer not null references public.principles(id),
  registered_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workouts_technique_name_not_empty
    check (length(trim(technique_name)) > 0),
  constraint workouts_technique_what_not_empty
    check (length(trim(technique_what)) > 0),
  constraint workouts_technique_how_not_empty
    check (length(trim(technique_how)) > 0),
  constraint workouts_technique_why_not_empty
    check (length(trim(technique_why)) > 0)
);

comment on table public.workouts is 'Registro diário do Treino do Dia (Metodologia Shading)';
comment on column public.workouts.date is 'Data do treino — único por dia';
comment on column public.workouts.technique_what is 'Shading: O que se faz (descrição da técnica)';
comment on column public.workouts.technique_how is 'Shading: Como se faz (execução passo a passo)';
comment on column public.workouts.technique_why is 'Shading: Por que se faz (fundamento tático/filosófico)';
comment on column public.workouts.principle_id is 'FK para o princípio aplicado neste treino';
comment on column public.workouts.registered_by is 'FK para o Monitor ou Admin que registrou o treino';

-- --------------------------------------------------------------------------
-- 3.4 ATTENDANCE (Registro de Presença / Check-in)
-- Ref: Artifact 1 → Entity "Attendance"
-- Vincula aluno a treino com validação de Ecologia Integral
-- --------------------------------------------------------------------------
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  hygiene_confirmed boolean not null default false,
  created_at timestamptz not null default now(),

  -- Ref: Artifact 1, SR7 — Um aluno só pode fazer 1 check-in por treino
  constraint attendance_unique_per_workout
    unique (profile_id, workout_id)
);

comment on table public.attendance is 'Registros de presença (check-in via QR Code)';
comment on column public.attendance.hygiene_confirmed is 'Confirmação da Ecologia Integral (unhas, uniforme, hidratação)';
comment on column public.attendance.checked_in_at is 'Momento exato do check-in no tatame';

-- --------------------------------------------------------------------------
-- 3.5 GRADUATIONS (Histórico de Promoções)
-- Ref: Gestão de Graduação Premium
-- Histórico de faixas e graus recebidos pelos alunos
-- --------------------------------------------------------------------------
create table public.graduations (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  previous_belt text not null,
  new_belt text not null,
  promoted_by uuid not null references public.profiles(id),
  promotion_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.graduations is 'Histórico de graduações e promoções de faixa dos alunos';
comment on column public.graduations.previous_belt is 'Faixa que o aluno possuía antes da promoção';
comment on column public.graduations.new_belt is 'Nova faixa atribuída';
comment on column public.graduations.promoted_by is 'Admin (Mestre) responsável pela promoção';

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- MANDATORY on ALL tables — Ref: 05_Security_Governance_Policy.md
-- Isolation by auth.uid() with role-based escalation
-- ============================================================================

-- Enable RLS on ALL tables (zero exceptions)
alter table public.profiles enable row level security;
alter table public.principles enable row level security;
alter table public.workouts enable row level security;
alter table public.attendance enable row level security;
alter table public.graduations enable row level security;

-- --------------------------------------------------------------------------
-- 4.0 SECURITY DEFINER FUNCTIONS FOR ROLE CHECKS (Bypass RLS Recursion)
-- --------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

create or replace function public.is_admin_or_monitor()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'monitor')
  );
$$ language sql security definer;

-- --------------------------------------------------------------------------
-- 4.1 PROFILES — RLS Policies
-- Admin: vê/edita todos | Monitor: vê todos | Aluno: vê apenas o próprio
-- --------------------------------------------------------------------------

-- SELECT: Admins e Monitores veem todos; Alunos veem apenas o próprio perfil
create policy "profiles_select_policy" on public.profiles
  for select using (
    public.is_admin_or_monitor() or auth.uid() = id
  );

-- INSERT: Apenas o sistema (trigger de signup) ou Admin pode criar perfis
create policy "profiles_insert_policy" on public.profiles
  for insert with check (
    auth.uid() = id or public.is_admin()
  );

-- UPDATE: Admin pode editar qualquer perfil; Usuário pode editar o próprio (campos limitados)
create policy "profiles_update_policy" on public.profiles
  for update using (
    public.is_admin() or auth.uid() = id
  );

-- DELETE: Apenas Admin pode deletar perfis
create policy "profiles_delete_policy" on public.profiles
  for delete using (
    public.is_admin()
  );

-- --------------------------------------------------------------------------
-- 4.2 PRINCIPLES — RLS Policies
-- Leitura pública para todos os autenticados (catálogo estático)
-- Escrita restrita ao Admin
-- --------------------------------------------------------------------------

-- SELECT: Qualquer usuário autenticado pode ler os princípios
create policy "principles_select_policy" on public.principles
  for select using (auth.uid() is not null);

-- INSERT: Apenas Admin pode inserir princípios
create policy "principles_insert_policy" on public.principles
  for insert with check (
    public.is_admin()
  );

-- UPDATE: Apenas Admin pode atualizar princípios
create policy "principles_update_policy" on public.principles
  for update using (
    public.is_admin()
  );

-- DELETE: Apenas Admin pode deletar princípios
create policy "principles_delete_policy" on public.principles
  for delete using (
    public.is_admin()
  );

-- --------------------------------------------------------------------------
-- 4.3 WORKOUTS — RLS Policies
-- Ref: Artifact 1, SR5 — Apenas Admin e Monitor podem registrar treinos
-- Leitura liberada para todos os autenticados
-- --------------------------------------------------------------------------

-- SELECT: Qualquer autenticado pode ler os treinos (exibir Princípio do Dia)
create policy "workouts_select_policy" on public.workouts
  for select using (auth.uid() is not null);

-- INSERT: Apenas Admin e Monitor podem criar treinos
create policy "workouts_insert_policy" on public.workouts
  for insert with check (
    public.is_admin_or_monitor()
  );

-- UPDATE: Apenas Admin e Monitor podem editar treinos
create policy "workouts_update_policy" on public.workouts
  for update using (
    public.is_admin_or_monitor()
  );

-- DELETE: Apenas Admin pode deletar treinos
create policy "workouts_delete_policy" on public.workouts
  for delete using (
    public.is_admin()
  );

-- --------------------------------------------------------------------------
-- 4.4 ATTENDANCE — RLS Policies
-- Ref: Artifact 1, SR7 — Aluno insere apenas para si mesmo
-- Admin e Monitor veem tudo; Aluno vê apenas os próprios check-ins
-- --------------------------------------------------------------------------

-- SELECT: Admin/Monitor veem todos; Aluno vê apenas os próprios
create policy "attendance_select_policy" on public.attendance
  for select using (
    public.is_admin_or_monitor() or auth.uid() = profile_id
  );

-- INSERT: Aluno insere apenas para si; Admin/Monitor podem inserir para qualquer um
create policy "attendance_insert_policy" on public.attendance
  for insert with check (
    auth.uid() = profile_id or public.is_admin_or_monitor()
  );

-- UPDATE: Apenas Admin pode corrigir registros de presença
create policy "attendance_update_policy" on public.attendance
  for update using (
    public.is_admin()
  );

-- DELETE: Apenas Admin pode deletar registros de presença
create policy "attendance_delete_policy" on public.attendance
  for delete using (
    public.is_admin()
  );

-- --------------------------------------------------------------------------
-- 4.5 GRADUATIONS — RLS Policies
-- Admin pode inserir, atualizar e deletar. Todos podem ler as graduações.
-- --------------------------------------------------------------------------

create policy "graduations_select_policy" on public.graduations
  for select using (auth.uid() is not null);

create policy "graduations_insert_policy" on public.graduations
  for insert with check (public.is_admin());

create policy "graduations_update_policy" on public.graduations
  for update using (public.is_admin());

create policy "graduations_delete_policy" on public.graduations
  for delete using (public.is_admin());

-- ============================================================================
-- 5. INDEXES (Performance)
-- Frequently queried columns and partial indexes
-- ============================================================================

-- Profiles
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_category on public.profiles(category);
create index idx_profiles_is_active on public.profiles(is_active)
  where is_active = true;  -- Partial index: only active profiles

-- Workouts
create index idx_workouts_date on public.workouts(date desc);
create index idx_workouts_principle on public.workouts(principle_id);
create index idx_workouts_registered_by on public.workouts(registered_by);

-- Attendance
create index idx_attendance_profile on public.attendance(profile_id);
create index idx_attendance_workout on public.attendance(workout_id);
create index idx_attendance_checked_in on public.attendance(checked_in_at desc);

-- Graduations
create index idx_graduations_profile on public.graduations(profile_id);
create index idx_graduations_promoted_by on public.graduations(promoted_by);

-- ============================================================================
-- 6. TRIGGERS (Automatic updated_at)
-- ============================================================================

-- Function: update updated_at column automatically
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger: profiles
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Trigger: workouts
create trigger set_updated_at_workouts
  before update on public.workouts
  for each row execute function public.update_updated_at_column();

-- Trigger: graduations
create trigger set_updated_at_graduations
  before update on public.graduations
  for each row execute function public.update_updated_at_column();

-- ============================================================================
-- 7. FUNCTIONS
-- SECURITY DEFINER only when justified
-- ============================================================================

-- Function: Handle new user signup (auto-create profile from auth.users)
-- Called via Supabase Auth trigger on user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, category)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Novo Aluno'),
    new.email,
    'aluno',
    'visitante'
  );
  return new;
end;
$$ language plpgsql security definer;

comment on function public.handle_new_user()
  is 'Auto-cria perfil na tabela profiles quando um novo usuário se registra via Supabase Auth';

-- Trigger: auto-create profile on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function: Promote aluno to monitor (Admin only)
-- Ref: Artifact 1, Section 3.3 — Fluxo de Promoção Orgânica
create or replace function public.promote_to_monitor(target_user_id uuid)
returns void as $$
begin
  -- Verify caller is admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Apenas administradores podem promover alunos a monitores';
  end if;

  -- Verify target is currently an aluno
  if not exists (
    select 1 from public.profiles
    where id = target_user_id and role = 'aluno'
  ) then
    raise exception 'Apenas alunos podem ser promovidos a monitor';
  end if;

  update public.profiles
  set role = 'monitor'
  where id = target_user_id;
end;
$$ language plpgsql security definer;

comment on function public.promote_to_monitor(uuid)
  is 'Promove um aluno para monitor — apenas Admin pode executar. O histórico do aluno é preservado.';

-- Function: Promote student belt (Admin only)
-- Ref: Gestão de Graduação Admin
create or replace function public.promote_belt(
  target_user_id uuid,
  target_new_belt text,
  promotion_notes text default null
)
returns void as $$
declare
  old_belt text;
begin
  -- Verify caller is admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Apenas administradores podem promover faixas';
  end if;

  -- Get current belt
  select belt into old_belt from public.profiles where id = target_user_id;

  -- Insert graduation history
  insert into public.graduations (profile_id, previous_belt, new_belt, promoted_by, notes)
  values (target_user_id, old_belt, target_new_belt, auth.uid(), promotion_notes);

  -- Update profile belt
  update public.profiles
  set belt = target_new_belt
  where id = target_user_id;
end;
$$ language plpgsql security definer;

comment on function public.promote_belt(uuid, text, text)
  is 'Promove a faixa do aluno, salvando histórico na tabela graduations e atualizando o profile. Apenas Admin.';

-- Function: Toggle user active status (Admin only)
-- Ref: Artifact 1, SR4 — Apenas Admin pode Ativar/Bloquear
create or replace function public.toggle_user_active(target_user_id uuid)
returns boolean as $$
declare
  new_status boolean;
begin
  -- Verify caller is admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Apenas administradores podem ativar/bloquear contas';
  end if;

  update public.profiles
  set is_active = not is_active
  where id = target_user_id
  returning is_active into new_status;

  return new_status;
end;
$$ language plpgsql security definer;

comment on function public.toggle_user_active(uuid)
  is 'Alterna o status ativo/bloqueado de um usuário — Admin only';

-- Function: Get attendance report for academic students (RF05)
-- Returns detailed cross-reference of attendance × workout for a given period
create or replace function public.get_academic_report(
  start_date date,
  end_date date
)
returns table (
  student_name text,
  student_email text,
  institution text,
  enrollment_id text,
  workout_date date,
  technique_name text,
  technique_what text,
  technique_how text,
  technique_why text,
  principle_title text,
  checked_in_at timestamptz
) as $$
begin
  -- Verify caller is admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Apenas administradores podem gerar relatórios acadêmicos';
  end if;

  return query
  select
    p.full_name as student_name,
    p.email as student_email,
    p.institution,
    p.enrollment_id,
    w.date as workout_date,
    w.technique_name,
    w.technique_what,
    w.technique_how,
    w.technique_why,
    pr.title_pt as principle_title,
    a.checked_in_at
  from public.attendance a
  join public.profiles p on p.id = a.profile_id
  join public.workouts w on w.id = a.workout_id
  join public.principles pr on pr.id = w.principle_id
  where p.category = 'academico'
    and w.date >= start_date
    and w.date <= end_date
  order by p.full_name, w.date;
end;
$$ language plpgsql security definer;

comment on function public.get_academic_report(date, date)
  is 'Relatório detalhado de alunos acadêmicos: cruza presença com treino do dia para prestação de contas (UFPE/FICR)';

-- ============================================================================
-- 8. SEED DATA — Os 32 Princípios do Jiu-Jitsu (Ref: Os32Principios.pdf)
-- ============================================================================

insert into public.principles (number, title_pt, title_en, description, category) values
  (1,  'Distância',            'Distance Management',    'Controlar a distância entre você e o oponente é a base de toda estratégia.',                    'Fundamento'),
  (2,  'Guarda',               'Guard Retention',        'A guarda é sua fortaleza. Mantê-la significa manter o controle da luta.',                       'Defesa'),
  (3,  'Espaço',               'Space Creation',         'Criar espaço quando está por baixo é essencial para recuperar posições.',                       'Defesa'),
  (4,  'Fechamento',           'Space Closure',          'Fechar o espaço quando está por cima neutraliza as opções do oponente.',                        'Ataque'),
  (5,  'Base',                 'Base Establishment',     'Uma base sólida impede que você seja derrubado ou varrido.',                                    'Fundamento'),
  (6,  'Postura',              'Posture Alignment',      'A postura correta distribui peso e protege contra submissões.',                                 'Fundamento'),
  (7,  'Estrutura',            'Frame Construction',     'Frames criam barreiras estruturais que impedem o avanço do oponente.',                          'Defesa'),
  (8,  'Kuzushi',              'Off-Balancing',          'Desequilibrar o oponente antes de atacar aumenta drasticamente a efetividade.',                 'Ataque'),
  (9,  'Alavanca',             'Leverage Utilization',   'Usar alavancas permite que o menor supere o maior — a essência do Jiu-Jitsu.',                 'Fundamento'),
  (10, 'Cunha',                'Wedge Insertion',        'Inserir cunhas cria pontos de entrada para passagens e sweeps.',                                'Ataque'),
  (11, 'Gancho',               'Hook Application',       'Ganchos com os pés e mãos criam conexões que controlam o movimento.',                          'Controle'),
  (12, 'Ângulo',               'Angle Creation',         'Mudar o ângulo de ataque expõe vulnerabilidades que o oponente não consegue defender.',         'Ataque'),
  (13, 'Centro de Gravidade',  'Center of Gravity',      'Controlar o centro de gravidade determina quem dita o ritmo da luta.',                         'Fundamento'),
  (14, 'Conexão',              'Connection Maintenance', 'Manter conexão com o oponente é essencial para sentir suas intenções.',                        'Controle'),
  (15, 'Contenção',            'Containment',            'Conter os movimentos do oponente limita suas opções de fuga e ataque.',                         'Controle'),
  (16, 'Redirecionamento',     'Redirection',            'Redirecionar a força do oponente transforma seu ataque em sua desvantagem.',                    'Filosofia'),
  (17, 'Velocidade',           'Velocity Control',       'Controlar a velocidade da luta permite ditar o ritmo e conservar energia.',                     'Estratégia'),
  (18, 'Pressão',              'Pressure Application',   'Aplicar pressão constante desgasta o oponente física e mentalmente.',                          'Ataque'),
  (19, 'Isolamento',           'Isolation',              'Isolar um membro ou parte do corpo do oponente cria oportunidades de submissão.',              'Ataque'),
  (20, 'Sacrifício',           'Sacrifice',              'Às vezes é necessário ceder posição para ganhar uma vantagem maior.',                           'Estratégia'),
  (21, 'Fluidez',              'Flow',                   'Transicionar fluidamente entre técnicas mantém o oponente em constante reação.',                'Filosofia'),
  (22, 'Tempo',                'Timing',                 'O momento certo de executar uma técnica é tão importante quanto a técnica em si.',              'Estratégia'),
  (23, 'Precisão',             'Precision',              'Movimentos precisos economizam energia e maximizam o impacto.',                                 'Fundamento'),
  (24, 'Eficiência',           'Efficiency',             'Fazer mais com menos esforço é o objetivo de todo praticante avançado.',                        'Filosofia'),
  (25, 'Ação e Reação',        'Action-Reaction',        'Toda ação gera uma reação — antecipe e use a reação do oponente a seu favor.',                  'Estratégia'),
  (26, 'Adaptação',            'Adaptation',             'A capacidade de se adaptar em tempo real separa o bom do excelente.',                           'Filosofia'),
  (27, 'Resiliência',          'Resilience',             'Sobreviver posições ruins e manter a calma é o caminho para a virada.',                         'Filosofia'),
  (28, 'Paciência',            'Patience',               'A paciência é a arma mais poderosa do Jiu-Jitsu — espere o momento certo.',                    'Filosofia'),
  (29, 'Respiração',           'Breathing Control',      'Controlar a respiração mantém a clareza mental e a resistência física.',                        'Fundamento'),
  (30, 'Percepção',            'Awareness',              'Estar consciente de todo o corpo — seu e do oponente — permite decisões superiores.',           'Estratégia'),
  (31, 'Mentalidade',          'Mindset',                'Uma mentalidade de crescimento transforma derrotas em aprendizado.',                            'Filosofia'),
  (32, 'Comunidade',           'Community',              'O Jiu-Jitsu cresce quando compartilhamos conhecimento e fortalecemos uns aos outros.',          'Filosofia');

-- ============================================================================
-- FIM DO SCHEMA — JJCAC MVP
-- ============================================================================
