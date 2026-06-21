-- ==========================================
-- SPRINT 0 - ARTIFACT 02: DATABASE SCHEMA
-- App: Jiu Jitsu CAC
-- ==========================================

-- 1. Custom Types (Enums)
CREATE TYPE user_role AS ENUM ('student', 'teacher');
CREATE TYPE user_category AS ENUM ('academic', 'community');
CREATE TYPE user_status AS ENUM ('pending_approval', 'active', 'rejected');

-- 2. Profiles Table
-- Armazena os dados dos alunos e professores
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    category user_category NOT NULL DEFAULT 'academic',
    role user_role NOT NULL DEFAULT 'student',
    status user_status NOT NULL DEFAULT 'pending_approval',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Check-ins Table (Frequência)
-- Registra quando o aluno escaneia o QR Code no CT
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Restrição: Apenas um check-in por aluno por dia
    UNIQUE(profile_id, (DATE(scanned_at)))
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
-- 1. O próprio usuário pode ver seu perfil
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Professores podem ver todos os perfis (Admin)
CREATE POLICY "Teachers can view all profiles" 
ON profiles FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
);

-- 3. Professores podem atualizar qualquer perfil (aprovar, mudar role/categoria)
CREATE POLICY "Teachers can update profiles" 
ON profiles FOR UPDATE 
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
);

-- POLÍTICAS PARA CHECK-INS
-- 1. Usuários podem ver seus próprios check-ins
CREATE POLICY "Users can view own check-ins" 
ON check_ins FOR SELECT 
USING (auth.uid() = profile_id);

-- 2. Professores podem ver todos os check-ins
CREATE POLICY "Teachers can view all check-ins" 
ON check_ins FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
);

-- 3. Alunos PODEM inserir um check-in APENAS se o status for 'active'
CREATE POLICY "Active students can check in" 
ON check_ins FOR INSERT 
WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'active')
);

-- Trigger para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Trigger for new User Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger as $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, category, role, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    CAST(COALESCE(new.raw_user_meta_data->>'category', 'academic') AS user_category),
    'student',
    'pending_approval'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
