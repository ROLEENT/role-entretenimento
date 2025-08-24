-- Create RPC functions for contact messages
CREATE OR REPLACE FUNCTION public.insert_contact_message(
  p_name TEXT,
  p_email TEXT,
  p_subject TEXT,
  p_message TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.contact_messages (name, email, subject, message)
  VALUES (p_name, p_email, p_subject, p_message);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_contact_messages()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (get_user_role(auth.uid()) = 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.email,
    cm.subject,
    cm.message,
    cm.status,
    cm.created_at
  FROM public.contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_contact_message_status(
  p_id UUID,
  p_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (get_user_role(auth.uid()) = 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.contact_messages
  SET status = p_status
  WHERE id = p_id;
END;
$$;