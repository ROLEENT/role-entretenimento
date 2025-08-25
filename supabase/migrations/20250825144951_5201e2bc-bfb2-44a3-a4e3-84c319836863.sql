-- Deactivate all demonstration advertisements
UPDATE advertisements 
SET active = false 
WHERE active = true;