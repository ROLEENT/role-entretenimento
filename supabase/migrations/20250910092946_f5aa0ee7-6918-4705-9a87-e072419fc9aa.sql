-- Create audit logs table (skipping user_role type as it exists)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create content approval workflow
CREATE TYPE IF NOT EXISTS public.approval_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected');

-- Add approval columns to events (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'approval_status') THEN
    ALTER TABLE public.events 
    ADD COLUMN approval_status approval_status DEFAULT 'draft',
    ADD COLUMN reviewed_by UUID,
    ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN review_notes TEXT;
  END IF;
END $$;

-- Add approval columns to artists (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'approval_status') THEN
    ALTER TABLE public.artists 
    ADD COLUMN approval_status approval_status DEFAULT 'draft',
    ADD COLUMN reviewed_by UUID,
    ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN review_notes TEXT;
  END IF;
END $$;

-- Create push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    operation,
    old_values,
    new_values,
    changed_by
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to important tables (drop first if exists)
DROP TRIGGER IF EXISTS audit_events_trigger ON public.events;
CREATE TRIGGER audit_events_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_artists_trigger ON public.artists;
CREATE TRIGGER audit_artists_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_agenda_itens_trigger ON public.agenda_itens;
CREATE TRIGGER audit_agenda_itens_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agenda_itens
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();