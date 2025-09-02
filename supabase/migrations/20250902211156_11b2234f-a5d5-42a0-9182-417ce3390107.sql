-- Fix the Hate Moss profile data
UPDATE entity_profiles 
SET 
  country = 'BR',
  city = 'São Paulo',
  state = 'SP'
WHERE handle = 'hate-moss';