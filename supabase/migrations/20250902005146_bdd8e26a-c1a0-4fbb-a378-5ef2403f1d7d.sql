-- Reload PostgREST schema cache to ensure it sees current table structure
NOTIFY pgrst, 'reload schema';