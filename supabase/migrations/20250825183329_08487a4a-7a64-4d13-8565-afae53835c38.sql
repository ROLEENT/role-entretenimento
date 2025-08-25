-- Remover a única constraint que pode estar causando conflito na tabela push_subscriptions existente
ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_event_id_key;

-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'event_favorite', 'event_reminder', 'highlight_like', 'comment', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias notificações"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários podem marcar suas notificações como lidas"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Criar tabela de feed de atividades
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'event_favorite', 'highlight_like', 'comment', 'profile_update')),
  object_type TEXT CHECK (object_type IN ('user', 'event', 'highlight', 'comment')),
  object_id UUID,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver atividades dos que seguem"
ON public.activity_feed
FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = auth.uid() AND following_id = activity_feed.actor_id
  )
);

CREATE POLICY "Sistema pode criar atividades"
ON public.activity_feed
FOR INSERT
WITH CHECK (true);

-- Função para criar notificação
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true, updated_at = now()
  WHERE user_id = auth.uid() AND read = false;
END;
$$;

-- Função para criar atividade no feed
CREATE OR REPLACE FUNCTION public.create_activity(
  p_actor_id UUID,
  p_type TEXT,
  p_object_type TEXT DEFAULT NULL,
  p_object_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Criar atividade para todos os seguidores
  INSERT INTO public.activity_feed (user_id, actor_id, type, object_type, object_id, data)
  SELECT f.follower_id, p_actor_id, p_type, p_object_type, p_object_id, p_data
  FROM public.follows f
  WHERE f.following_id = p_actor_id;
END;
$$;

-- Trigger para criar notificação quando alguém te segue
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Buscar nome do seguidor
  SELECT COALESCE(display_name, username, 'Usuário') INTO follower_name
  FROM public.profiles 
  WHERE user_id = NEW.follower_id;
  
  -- Criar notificação
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    'Novo seguidor!',
    follower_name || ' começou a te seguir',
    jsonb_build_object('follower_id', NEW.follower_id, 'follower_name', follower_name)
  );
  
  -- Criar atividade no feed
  PERFORM create_activity(
    NEW.follower_id,
    'follow',
    'user',
    NEW.following_id,
    jsonb_build_object('following_id', NEW.following_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION notify_new_follower();

-- Trigger para criar atividade quando favorita evento
CREATE OR REPLACE FUNCTION public.notify_event_favorite()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_title TEXT;
BEGIN
  -- Buscar título do evento
  SELECT title INTO event_title
  FROM public.events 
  WHERE id = NEW.event_id;
  
  -- Criar atividade no feed
  PERFORM create_activity(
    NEW.user_id,
    'event_favorite',
    'event',
    NEW.event_id,
    jsonb_build_object('event_title', event_title)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_favorite
  AFTER INSERT ON public.event_favorites
  FOR EACH ROW EXECUTE FUNCTION notify_event_favorite();

-- Índices para performance
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX idx_activity_feed_user_created ON public.activity_feed(user_id, created_at DESC);

-- Habilitar realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.activity_feed REPLICA IDENTITY FULL;