-- Create table for AdSense settings and configuration
CREATE TABLE public.adsense_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publisher_id text NOT NULL,
  slot_id text NOT NULL,
  ad_format text NOT NULL DEFAULT 'auto',
  ad_layout text,
  position text NOT NULL, -- 'header', 'footer', 'sidebar', 'in-feed', 'in-article'
  page_type text NOT NULL, -- 'homepage', 'events', 'blog', 'highlights', 'all'
  is_active boolean NOT NULL DEFAULT true,
  responsive boolean NOT NULL DEFAULT true,
  lazy_loading boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adsense_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active AdSense settings"
ON public.adsense_settings
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage AdSense settings"
ON public.adsense_settings
FOR ALL
USING (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'))
WITH CHECK (is_admin_session_valid(current_setting('request.headers', true)::json->>'x-admin-email'));

-- Create trigger for updated_at
CREATE TRIGGER update_adsense_settings_updated_at
BEFORE UPDATE ON public.adsense_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default AdSense configurations
INSERT INTO public.adsense_settings (publisher_id, slot_id, ad_format, position, page_type, is_active) VALUES
('ca-pub-XXXXXXXXXX', '1234567890', 'auto', 'header', 'homepage', true),
('ca-pub-XXXXXXXXXX', '1234567891', 'rectangle', 'sidebar', 'blog', true),
('ca-pub-XXXXXXXXXX', '1234567892', 'horizontal', 'in-feed', 'events', true),
('ca-pub-XXXXXXXXXX', '1234567893', 'auto', 'footer', 'all', true);