-- Create artist backup table for protection system
CREATE TABLE IF NOT EXISTS public.artist_backups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_data jsonb NOT NULL,
  created_by text NOT NULL,
  record_count integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  restored_at timestamp with time zone NULL
);

-- Enable RLS
ALTER TABLE public.artist_backups ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage backups
CREATE POLICY "Admins can manage artist backups" ON public.artist_backups
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = (current_setting('request.headers', true)::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- Enhanced artist protection trigger
CREATE OR REPLACE FUNCTION public.protect_artist_operations()
RETURNS trigger AS $$
DECLARE
  admin_email text;
  artist_name text;
BEGIN
  -- Get admin email from headers
  admin_email := (current_setting('request.headers', true))::json ->> 'x-admin-email';
  
  -- For DELETE operations, log the action
  IF TG_OP = 'DELETE' THEN
    artist_name := OLD.stage_name;
    
    -- Log security event for deletion
    PERFORM public.log_security_event(
      'artist_deletion',
      null,
      admin_email,
      jsonb_build_object(
        'artist_id', OLD.id,
        'artist_name', artist_name,
        'deleted_at', now()
      ),
      'warning'
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for artist protection
DROP TRIGGER IF EXISTS artist_protection_trigger ON public.artists;
CREATE TRIGGER artist_protection_trigger
  BEFORE DELETE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_artist_operations();

-- Function to validate admin email
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_check text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = email_to_check AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;