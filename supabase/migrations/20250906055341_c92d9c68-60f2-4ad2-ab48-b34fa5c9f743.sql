-- Criar tabela para salvos de eventos
CREATE TABLE IF NOT EXISTS public.event_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  collection TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id, collection)
);

-- Criar tabela para presença em eventos
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'went')),
  show_publicly BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Habilitar RLS
ALTER TABLE public.event_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

-- Políticas para event_saves
CREATE POLICY "Usuários podem ver seus próprios salvos" 
ON public.event_saves 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios salvos" 
ON public.event_saves 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios salvos" 
ON public.event_saves 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para event_attendance
CREATE POLICY "Usuários podem ver suas próprias presenças" 
ON public.event_attendance 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias presenças" 
ON public.event_attendance 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias presenças" 
ON public.event_attendance 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias presenças" 
ON public.event_attendance 
FOR DELETE 
USING (auth.uid() = user_id);

-- Política para visualização pública de presenças (quando show_publicly = true)
CREATE POLICY "Visualização pública de presenças" 
ON public.event_attendance 
FOR SELECT 
USING (show_publicly = true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_event_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_event_attendance_updated_at
BEFORE UPDATE ON public.event_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_event_attendance_updated_at();