-- Enum para tipos de badges
CREATE TYPE public.badge_type AS ENUM (
  'activity', 'achievement', 'special', 'milestone'
);

-- Enum para níveis de usuário
CREATE TYPE public.user_level AS ENUM (
  'bronze', 'silver', 'gold', 'platinum', 'diamond'
);

-- Tabela de badges disponíveis
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  type badge_type NOT NULL,
  points_required INTEGER DEFAULT 0,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de badges conquistados pelos usuários
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

-- Tabela de pontos dos usuários
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level user_level NOT NULL DEFAULT 'bronze',
  monthly_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de pontos
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies para badges
CREATE POLICY "Anyone can view active badges"
ON public.badges
FOR SELECT
USING (is_active = true);

-- RLS Policies para user_badges
CREATE POLICY "Users can view all user badges"
ON public.user_badges
FOR SELECT
USING (true);

-- RLS Policies para user_points
CREATE POLICY "Users can view all user points"
ON public.user_points
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own points"
ON public.user_points
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para points_history
CREATE POLICY "Users can view their own points history"
ON public.points_history
FOR SELECT
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

-- Função para adicionar pontos ao usuário
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_activity_type TEXT,
  p_activity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_total INTEGER;
  new_level user_level;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Inserir no histórico
  INSERT INTO public.points_history (
    user_id, points, activity_type, activity_id, description
  ) VALUES (
    p_user_id, p_points, p_activity_type, p_activity_id, p_description
  );
  
  -- Criar ou atualizar pontos do usuário
  INSERT INTO public.user_points (user_id, total_points, monthly_points, last_activity_date)
  VALUES (p_user_id, p_points, p_points, today_date)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + p_points,
    monthly_points = CASE 
      WHEN EXTRACT(MONTH FROM user_points.updated_at) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(YEAR FROM user_points.updated_at) = EXTRACT(YEAR FROM NOW())
      THEN user_points.monthly_points + p_points
      ELSE p_points
    END,
    current_streak = CASE
      WHEN user_points.last_activity_date = today_date - INTERVAL '1 day'
      THEN user_points.current_streak + 1
      WHEN user_points.last_activity_date = today_date
      THEN user_points.current_streak
      ELSE 1
    END,
    best_streak = GREATEST(
      user_points.best_streak,
      CASE
        WHEN user_points.last_activity_date = today_date - INTERVAL '1 day'
        THEN user_points.current_streak + 1
        WHEN user_points.last_activity_date = today_date
        THEN user_points.current_streak
        ELSE 1
      END
    ),
    last_activity_date = today_date,
    updated_at = now();
  
  -- Obter total atual para calcular nível
  SELECT total_points INTO current_total
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  -- Calcular novo nível
  SELECT CASE
    WHEN current_total >= 2501 THEN 'diamond'::user_level
    WHEN current_total >= 1001 THEN 'platinum'::user_level
    WHEN current_total >= 501 THEN 'gold'::user_level
    WHEN current_total >= 101 THEN 'silver'::user_level
    ELSE 'bronze'::user_level
  END INTO new_level;
  
  -- Atualizar nível se mudou
  UPDATE public.user_points 
  SET level = new_level
  WHERE user_id = p_user_id AND level != new_level;
END;
$$;

-- Função para verificar e conceder badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_stats RECORD;
  badge_record RECORD;
BEGIN
  -- Obter estatísticas do usuário
  SELECT 
    up.total_points,
    up.current_streak,
    up.level,
    (SELECT COUNT(*) FROM public.event_checkins WHERE user_id = p_user_id) as checkin_count,
    (SELECT COUNT(*) FROM public.event_reviews WHERE user_id = p_user_id) as review_count,
    (SELECT COUNT(DISTINCT city) FROM public.events e 
     JOIN public.event_checkins ec ON e.id = ec.event_id 
     WHERE ec.user_id = p_user_id) as cities_visited
  INTO user_stats
  FROM public.user_points up
  WHERE up.user_id = p_user_id;
  
  -- Verificar cada badge e conceder se critérios forem atendidos
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE is_active = true 
    AND id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_id = p_user_id)
  LOOP
    -- Verificar critérios específicos de cada badge
    IF (badge_record.name = 'Novato' AND user_stats.checkin_count >= 1) OR
       (badge_record.name = 'Crítico' AND user_stats.review_count >= 5) OR
       (badge_record.name = 'Descobridor' AND user_stats.cities_visited >= 3) OR
       (badge_record.name = 'Frequentador' AND user_stats.checkin_count >= 10) OR
       (badge_record.name = 'Influencer' AND user_stats.total_points >= 500) OR
       (badge_record.name = 'Expert' AND user_stats.total_points >= 1000) OR
       (badge_record.name = 'Streaker' AND user_stats.current_streak >= 7) THEN
      
      -- Conceder badge
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
      
    END IF;
  END LOOP;
END;
$$;

-- Inserir badges padrão
INSERT INTO public.badges (name, description, icon, color, type, criteria) VALUES
('Novato', 'Primeiro check-in em um evento', '🎯', '#10B981', 'milestone', '{"checkins": 1}'),
('Crítico', 'Escreveu 5 avaliações de eventos', '📝', '#F59E0B', 'activity', '{"reviews": 5}'),
('Descobridor', 'Visitou eventos em 3 cidades diferentes', '🗺️', '#8B5CF6', 'achievement', '{"cities": 3}'),
('Frequentador', 'Fez check-in em 10 eventos', '🎭', '#EF4444', 'milestone', '{"checkins": 10}'),
('Influencer', 'Alcançou 500 pontos', '⭐', '#F97316', 'achievement', '{"points": 500}'),
('Expert', 'Alcançou 1000 pontos', '👑', '#EC4899', 'achievement', '{"points": 1000}'),
('Streaker', 'Atividade por 7 dias consecutivos', '🔥', '#6366F1', 'special', '{"streak": 7}');

-- Trigger para adicionar pontos em check-ins
CREATE OR REPLACE FUNCTION public.award_checkin_points()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.add_user_points(
    NEW.user_id,
    10,
    'checkin',
    NEW.event_id,
    'Check-in em evento'
  );
  
  PERFORM public.check_and_award_badges(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_checkin_points
  AFTER INSERT ON public.event_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.award_checkin_points();

-- Trigger para adicionar pontos em reviews
CREATE OR REPLACE FUNCTION public.award_review_points()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.add_user_points(
    NEW.user_id,
    15,
    'review',
    NEW.event_id,
    'Avaliação de evento'
  );
  
  PERFORM public.check_and_award_badges(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_review_points
  AFTER INSERT ON public.event_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_review_points();