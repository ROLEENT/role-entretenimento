-- Update the event status from draft to published
UPDATE events 
SET status = 'published', updated_at = NOW()
WHERE id = '0057a5c6-2f5e-47b8-b108-5f72c1af32de';