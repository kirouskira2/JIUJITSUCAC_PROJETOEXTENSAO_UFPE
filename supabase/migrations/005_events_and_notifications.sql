-- ============================================================================
-- ARQUIVO: migrations/005_events_and_notifications.sql
-- DESCRIÇÃO: Criação das tabelas de Eventos, Avisos e Notificações (Sprint 2)
-- ============================================================================

-- 1. Criação de Tipos Enumerados (Opcional, mas recomendado para consistência)
CREATE TYPE event_type AS ENUM ('tournament', 'graduation', 'seminar', 'other');
CREATE TYPE announcement_importance AS ENUM ('info', 'warning', 'urgent');

-- ============================================================================
-- 2. Tabela de EVENTOS (Calendário do Tatame)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type event_type DEFAULT 'other',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. Tabela de AVISOS (Mural Global do Mestre)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  importance announcement_importance DEFAULT 'info',
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. Tabela de NOTIFICAÇÕES (O "Sininho" individual)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. RLS (Row Level Security) - Regra 4 do Security Agent
-- ============================================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para EVENTS
-- Todos os usuários logados podem ler os eventos
CREATE POLICY "Leitura de eventos liberada para autenticados" 
ON public.events FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Apenas admins podem inserir, atualizar ou deletar eventos
CREATE POLICY "Apenas admin modifica eventos" 
ON public.events FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para ANNOUNCEMENTS
-- Todos os usuários logados podem ler os avisos globais
CREATE POLICY "Leitura de avisos liberada para autenticados" 
ON public.announcements FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Apenas admins podem inserir, atualizar ou deletar avisos
CREATE POLICY "Apenas admin modifica avisos" 
ON public.announcements FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para NOTIFICATIONS
-- Usuários só podem ler suas próprias notificações
CREATE POLICY "Usuários leem apenas suas notificações" 
ON public.notifications FOR SELECT 
USING (auth.uid() = profile_id);

-- Apenas sistema/admins podem inserir notificações (usamos policy ALL temporariamente para simplificar inserção manual se necessário)
CREATE POLICY "Admins inserem notificações para qualquer um" 
ON public.notifications FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Usuários podem atualizar apenas suas próprias notificações (ex: marcar como lida)
CREATE POLICY "Usuários marcam suas notificações como lidas" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = profile_id);

-- Usuários podem deletar suas próprias notificações
CREATE POLICY "Usuários deletam suas notificações" 
ON public.notifications FOR DELETE 
USING (auth.uid() = profile_id);

-- Triggers de updated_at para events e announcements
CREATE TRIGGER set_updated_at_events
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_announcements
BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
