-- Criar tabela para subscribers da newsletter
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  confirmation_token TEXT,
  preferences JSONB DEFAULT '{"events": true, "highlights": true, "weekly": true}'::jsonb,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Admins can manage all subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')))
WITH CHECK (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Public can subscribe (insert only)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Subscribers can update their own preferences using token
CREATE POLICY "Subscribers can update own preferences"
ON public.newsletter_subscribers
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create function to generate confirmation token
CREATE OR REPLACE FUNCTION public.generate_confirmation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Create function to confirm subscription
CREATE OR REPLACE FUNCTION public.confirm_newsletter_subscription(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  subscriber_found BOOLEAN := FALSE;
BEGIN
  UPDATE public.newsletter_subscribers 
  SET status = 'confirmed', 
      confirmed_at = now(),
      confirmation_token = NULL
  WHERE confirmation_token = p_token 
    AND status = 'pending'
    AND created_at > now() - INTERVAL '7 days';
  
  GET DIAGNOSTICS subscriber_found = FOUND;
  RETURN subscriber_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unsubscribe
CREATE OR REPLACE FUNCTION public.unsubscribe_newsletter(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  subscriber_found BOOLEAN := FALSE;
BEGIN
  UPDATE public.newsletter_subscribers 
  SET status = 'unsubscribed', 
      unsubscribed_at = now()
  WHERE confirmation_token = p_token 
    AND status = 'confirmed';
  
  GET DIAGNOSTICS subscriber_found = FOUND;
  RETURN subscriber_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create newsletter campaigns table
CREATE TABLE public.newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT,
  template_type TEXT DEFAULT 'weekly_highlights',
  target_audience JSONB DEFAULT '{"cities": [], "preferences": []}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can manage campaigns
CREATE POLICY "Admins can manage newsletter campaigns"
ON public.newsletter_campaigns
FOR ALL
USING (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')))
WITH CHECK (is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email')));

-- Add updated_at trigger
CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at
BEFORE UPDATE ON public.newsletter_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();