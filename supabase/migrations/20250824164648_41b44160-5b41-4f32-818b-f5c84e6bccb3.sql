-- Remove the non-existent admin@role.com.br account
DELETE FROM public.admin_users 
WHERE email = 'admin@role.com.br';