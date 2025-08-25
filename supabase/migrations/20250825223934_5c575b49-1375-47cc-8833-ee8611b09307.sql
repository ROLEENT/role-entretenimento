-- Criar tabela de grupos
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  category TEXT NOT NULL, -- Jazz, Teatro, Rock, etc.
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER DEFAULT 100,
  current_members_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de membros dos grupos
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Criar tabela de mensagens do chat
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, event_share
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de eventos exclusivos de grupos
CREATE TABLE public.group_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_end TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_participants INTEGER,
  current_participants_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de participantes em eventos de grupos
CREATE TABLE public.group_event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_event_id UUID NOT NULL REFERENCES public.group_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, pending, cancelled
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_event_id, user_id)
);

-- Criar tabela de "procuro companhia"
CREATE TABLE public.event_companions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT,
  companions_needed INTEGER NOT NULL DEFAULT 1,
  contact_preference TEXT NOT NULL DEFAULT 'app', -- app, whatsapp, telegram
  contact_info TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Criar tabela de respostas para companhia
CREATE TABLE public.companion_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  companion_request_id UUID NOT NULL REFERENCES public.event_companions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(companion_request_id, user_id)
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies para grupos
CREATE POLICY "Anyone can view public groups" ON public.groups
FOR SELECT USING (is_public = true);

CREATE POLICY "Group members can view private groups" ON public.groups
FOR SELECT USING (
  NOT is_public AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = groups.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" ON public.groups
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = groups.id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies para membros
CREATE POLICY "Anyone can view group members" ON public.group_members
FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON public.group_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.group_members
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Group admins can manage members" ON public.group_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
  )
);

-- RLS Policies para mensagens
CREATE POLICY "Group members can view messages" ON public.group_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages" ON public.group_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" ON public.group_messages
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.group_messages
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para eventos de grupos
CREATE POLICY "Group members can view group events" ON public.group_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_events.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can create events" ON public.group_events
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_events.group_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Group admins can manage events" ON public.group_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_events.group_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- RLS Policies para participantes
CREATE POLICY "Group members can view participants" ON public.group_event_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_events ge
    JOIN public.group_members gm ON ge.group_id = gm.group_id
    WHERE ge.id = group_event_participants.group_event_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join group events" ON public.group_event_participants
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.group_events ge
    JOIN public.group_members gm ON ge.group_id = gm.group_id
    WHERE ge.id = group_event_participants.group_event_id AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can leave group events" ON public.group_event_participants
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para companhia
CREATE POLICY "Anyone can view companion requests" ON public.event_companions
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create companion requests" ON public.event_companions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON public.event_companions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests" ON public.event_companions
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para respostas de companhia
CREATE POLICY "Request owners and responders can view responses" ON public.companion_responses
FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.event_companions 
    WHERE id = companion_responses.companion_request_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can respond to requests" ON public.companion_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" ON public.companion_responses
FOR UPDATE USING (auth.uid() = user_id);

-- Triggers para atualizar contadores
CREATE OR REPLACE FUNCTION update_group_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups 
    SET current_members_count = current_members_count + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups 
    SET current_members_count = current_members_count - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_group_members_count_trigger
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION update_group_members_count();

CREATE OR REPLACE FUNCTION update_group_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.group_events 
    SET current_participants_count = current_participants_count + 1 
    WHERE id = NEW.group_event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.group_events 
    SET current_participants_count = current_participants_count - 1 
    WHERE id = OLD.group_event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_group_event_participants_count_trigger
AFTER INSERT OR DELETE ON public.group_event_participants
FOR EACH ROW EXECUTE FUNCTION update_group_event_participants_count();

-- Trigger para adicionar criador automaticamente como admin do grupo
CREATE OR REPLACE FUNCTION add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_group_creator_as_admin_trigger
AFTER INSERT ON public.groups
FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_admin();

-- Inserir alguns grupos de exemplo
INSERT INTO public.groups (name, description, city, category, created_by, is_public) VALUES
('Jazz São Paulo', 'Grupo para amantes de jazz na capital paulista', 'São Paulo', 'Jazz', '00000000-0000-0000-0000-000000000000', true),
('Teatro Rio de Janeiro', 'Discussões sobre peças teatrais e espetáculos no Rio', 'Rio de Janeiro', 'Teatro', '00000000-0000-0000-0000-000000000000', true),
('Rock Curitiba', 'Para quem curte rock and roll na capital paranaense', 'Curitiba', 'Rock', '00000000-0000-0000-0000-000000000000', true),
('MPB Porto Alegre', 'Música Popular Brasileira no Sul', 'Porto Alegre', 'MPB', '00000000-0000-0000-0000-000000000000', true),
('Eletrônica Floripa', 'Música eletrônica e festas em Florianópolis', 'Florianópolis', 'Eletrônica', '00000000-0000-0000-0000-000000000000', true);