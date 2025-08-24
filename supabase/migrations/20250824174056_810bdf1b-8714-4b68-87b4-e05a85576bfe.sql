-- Debug admin operations by adding console logs and creating test functions

-- Create a debug function to test admin operations
CREATE OR REPLACE FUNCTION public.debug_admin_operations(admin_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_exists boolean;
  partners_count integer;
  ads_count integer;
  result jsonb;
BEGIN
  -- Check if admin exists
  SELECT EXISTS(
    SELECT 1 FROM public.admin_users 
    WHERE email = admin_email AND is_active = true
  ) INTO admin_exists;
  
  -- Try to count partners and ads to test RLS
  SELECT COUNT(*) FROM public.partners INTO partners_count;
  SELECT COUNT(*) FROM public.advertisements INTO ads_count;
  
  result := jsonb_build_object(
    'admin_exists', admin_exists,
    'admin_email', admin_email,
    'partners_count', partners_count,
    'ads_count', ads_count,
    'test_timestamp', NOW()
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM,
    'admin_email', admin_email
  );
END;
$function$;

-- Create a function to test if RLS is blocking operations
CREATE OR REPLACE FUNCTION public.test_admin_insert()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  test_partner_id uuid;
  test_ad_id uuid;
  result jsonb;
BEGIN
  -- Test partner insert
  INSERT INTO public.partners (name, location) 
  VALUES ('Test Partner', 'Test Location')
  RETURNING id INTO test_partner_id;
  
  -- Test advertisement insert
  INSERT INTO public.advertisements (title, cta_text) 
  VALUES ('Test Ad', 'Test CTA')
  RETURNING id INTO test_ad_id;
  
  -- Clean up test data
  DELETE FROM public.partners WHERE id = test_partner_id;
  DELETE FROM public.advertisements WHERE id = test_ad_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'partner_test', test_partner_id,
    'ad_test', test_ad_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', true,
    'error_message', SQLERRM
  );
END;
$function$;