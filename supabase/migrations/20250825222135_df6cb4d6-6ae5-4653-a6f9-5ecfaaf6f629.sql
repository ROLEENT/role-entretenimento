-- Tabela para eventos pessoais do usuário
CREATE TABLE public.user_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  color TEXT DEFAULT '#3B82F6',
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  external_calendar_id TEXT,
  external_event_id TEXT,
  reminder_minutes INTEGER[] DEFAULT '{15, 60}',
  is_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de calendário
CREATE TABLE public.user_calendar_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  google_calendar_enabled BOOLEAN DEFAULT false,
  google_calendar_id TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  apple_calendar_enabled BOOLEAN DEFAULT false,
  default_reminder_minutes INTEGER DEFAULT 15,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  week_starts_on INTEGER DEFAULT 1, -- 0 = Sunday, 1 = Monday
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies para user_calendar_events
CREATE POLICY "Users can manage their own calendar events"
ON public.user_calendar_events
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para user_calendar_settings
CREATE POLICY "Users can manage their own calendar settings"
ON public.user_calendar_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_calendar_events_updated_at
  BEFORE UPDATE ON public.user_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER user_calendar_settings_updated_at
  BEFORE UPDATE ON public.user_calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_updated_at();

-- Função para adicionar evento favoritado ao calendário pessoal
CREATE OR REPLACE FUNCTION public.add_favorite_to_calendar(
  p_user_id UUID,
  p_event_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_data RECORD;
  calendar_event_id UUID;
BEGIN
  -- Buscar dados do evento
  SELECT title, description, date_start, date_end, city, state
  INTO event_data
  FROM public.events
  WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evento não encontrado';
  END IF;
  
  -- Criar evento no calendário pessoal
  INSERT INTO public.user_calendar_events (
    user_id, title, description, start_datetime, end_datetime,
    location, event_id, color
  ) VALUES (
    p_user_id, 
    event_data.title,
    event_data.description,
    event_data.date_start,
    COALESCE(event_data.date_end, event_data.date_start + INTERVAL '2 hours'),
    CONCAT(event_data.city, ', ', event_data.state),
    p_event_id,
    '#8B5CF6'
  ) RETURNING id INTO calendar_event_id;
  
  RETURN calendar_event_id;
END;
$$;