-- Create function to change admin password
CREATE OR REPLACE FUNCTION public.change_admin_password(p_admin_id uuid, p_current_password text, p_new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify current password
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = p_admin_id AND password_hash = p_current_password AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Senha atual incorreta';
  END IF;

  -- Update password
  UPDATE public.admin_users
  SET 
    password_hash = p_new_password,
    updated_at = NOW()
  WHERE id = p_admin_id;
END;
$function$