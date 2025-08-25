-- Create table for event check-ins
CREATE TABLE public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create table for push notifications subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription JSONB NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS for event_checkins
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_checkins
CREATE POLICY "Users can view their own check-ins"
ON public.event_checkins FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own check-ins"
ON public.event_checkins FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all check-ins"
ON public.event_checkins FOR ALL
USING (is_admin_user());

-- Enable RLS for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all push subscriptions"
ON public.push_subscriptions FOR SELECT
USING (is_admin_user());

-- Create function to get user check-in status for an event
CREATE OR REPLACE FUNCTION public.get_user_checkin_status(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.event_checkins
    WHERE event_id = p_event_id AND user_id = p_user_id
  );
$$;

-- Create trigger to update push_subscriptions updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();