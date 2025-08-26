-- Fix contact_messages migration by dropping existing functions first

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_contact_messages();
DROP FUNCTION IF EXISTS public.update_contact_message_status(uuid, text);

-- Migrate contact_messages table to use email_hash instead of email
-- Add handled status and handled_by fields

-- First, add new columns
ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS email_hash text,
ADD COLUMN IF NOT EXISTS handled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS handled_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS body text;

-- Migrate existing email data to email_hash using SHA256
UPDATE public.contact_messages 
SET email_hash = encode(digest(email, 'sha256'), 'hex')
WHERE email IS NOT NULL AND email_hash IS NULL;

-- Copy message to body if body is null
UPDATE public.contact_messages 
SET body = message
WHERE body IS NULL;

-- Drop the email column
ALTER TABLE public.contact_messages DROP COLUMN IF EXISTS email;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_handled ON public.contact_messages(handled);
CREATE INDEX IF NOT EXISTS idx_contact_messages_name ON public.contact_messages(name);
CREATE INDEX IF NOT EXISTS idx_contact_messages_subject ON public.contact_messages(subject);

-- Update the insert function to use email_hash
CREATE OR REPLACE FUNCTION public.insert_contact_message(p_name text, p_email text, p_subject text, p_message text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.contact_messages (name, email_hash, subject, body)
  VALUES (p_name, encode(digest(p_email, 'sha256'), 'hex'), p_subject, p_message);
END;
$function$;

-- Create new get_contact_messages function with new structure
CREATE OR REPLACE FUNCTION public.get_contact_messages()
RETURNS TABLE(id uuid, name text, email_hash text, subject text, body text, handled boolean, handled_by uuid, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.email_hash,
    cm.subject,
    cm.body,
    cm.handled,
    cm.handled_by,
    cm.created_at
  FROM public.contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$function$;

-- Create function to mark message as handled
CREATE OR REPLACE FUNCTION public.mark_contact_message_handled(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Get admin user ID from session
  SELECT auth.uid() INTO admin_user_id;

  UPDATE public.contact_messages
  SET 
    handled = true,
    handled_by = admin_user_id
  WHERE id = p_id;
END;
$function$;

-- Create function to mark message as unhandled
CREATE OR REPLACE FUNCTION public.mark_contact_message_unhandled(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.contact_messages
  SET 
    handled = false,
    handled_by = null
  WHERE id = p_id;
END;
$function$;