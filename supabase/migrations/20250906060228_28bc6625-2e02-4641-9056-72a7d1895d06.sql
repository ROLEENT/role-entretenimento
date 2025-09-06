-- Clean up any test/fake profiles
DELETE FROM public.users_public 
WHERE username ILIKE '%test%' 
   OR username ILIKE '%fake%' 
   OR username ILIKE '%dummy%' 
   OR username ILIKE '%exemplo%'
   OR display_name ILIKE '%test%' 
   OR display_name ILIKE '%fake%' 
   OR display_name ILIKE '%dummy%' 
   OR display_name ILIKE '%exemplo%';

-- Add validation function to prevent fake usernames
CREATE OR REPLACE FUNCTION validate_username_not_fake(username text)
RETURNS boolean AS $$
BEGIN
  -- Check for common test/fake patterns
  IF username ILIKE '%test%' OR 
     username ILIKE '%fake%' OR 
     username ILIKE '%dummy%' OR 
     username ILIKE '%exemplo%' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;