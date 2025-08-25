-- Criar tabela de preferências de notificação dos usuários
CREATE TABLE public.user_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipos de notificação
  new_events BOOLEAN NOT NULL DEFAULT true,
  event_reminders BOOLEAN NOT NULL DEFAULT true,
  comment_replies BOOLEAN NOT NULL DEFAULT true,
  weekly_highlights BOOLEAN NOT NULL DEFAULT true,
  
  -- Configurações de horário
  allowed_start_hour INTEGER NOT NULL DEFAULT 9 CHECK (allowed_start_hour >= 0 AND allowed_start_hour <= 23),
  allowed_end_hour INTEGER NOT NULL DEFAULT 22 CHECK (allowed_end_hour >= 0 AND allowed_end_hour <= 23),
  
  -- Frequência e limitações
  max_daily_notifications INTEGER NOT NULL DEFAULT 3 CHECK (max_daily_notifications > 0),
  last_notification_date DATE DEFAULT NULL,
  daily_notification_count INTEGER NOT NULL DEFAULT 0,
  
  -- Segmentação
  preferred_cities TEXT[] DEFAULT '{}',
  interested_categories TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own notification preferences"
ON public.user_notification_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification preferences"
ON public.user_notification_preferences
FOR SELECT
USING (is_admin_user());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
BEFORE UPDATE ON public.user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Função para resetar contador diário
CREATE OR REPLACE FUNCTION public.reset_daily_notification_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_notification_preferences 
  SET 
    daily_notification_count = 0,
    last_notification_date = CURRENT_DATE
  WHERE last_notification_date < CURRENT_DATE OR last_notification_date IS NULL;
END;
$$;

-- Função para verificar se usuário pode receber notificação
CREATE OR REPLACE FUNCTION public.can_receive_notification(
  p_user_id UUID,
  p_notification_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prefs RECORD;
  current_hour INTEGER;
BEGIN
  -- Resetar contadores diários se necessário
  PERFORM reset_daily_notification_count();
  
  -- Buscar preferências do usuário
  SELECT * INTO prefs
  FROM public.user_notification_preferences
  WHERE user_id = p_user_id;
  
  -- Se não tem preferências, criar padrão e permitir
  IF NOT FOUND THEN
    INSERT INTO public.user_notification_preferences (user_id)
    VALUES (p_user_id);
    RETURN true;
  END IF;
  
  -- Verificar se tipo de notificação está habilitado
  CASE p_notification_type
    WHEN 'new_events' THEN
      IF NOT prefs.new_events THEN RETURN false; END IF;
    WHEN 'event_reminders' THEN
      IF NOT prefs.event_reminders THEN RETURN false; END IF;
    WHEN 'comment_replies' THEN
      IF NOT prefs.comment_replies THEN RETURN false; END IF;
    WHEN 'weekly_highlights' THEN
      IF NOT prefs.weekly_highlights THEN RETURN false; END IF;
    ELSE
      RETURN false;
  END CASE;
  
  -- Verificar limite diário
  IF prefs.daily_notification_count >= prefs.max_daily_notifications THEN
    RETURN false;
  END IF;
  
  -- Verificar horário permitido
  current_hour := EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Sao_Paulo');
  IF current_hour < prefs.allowed_start_hour OR current_hour > prefs.allowed_end_hour THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Função para incrementar contador de notificações
CREATE OR REPLACE FUNCTION public.increment_notification_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_notification_preferences
  SET 
    daily_notification_count = daily_notification_count + 1,
    last_notification_date = CURRENT_DATE
  WHERE user_id = p_user_id;
END;
$$;