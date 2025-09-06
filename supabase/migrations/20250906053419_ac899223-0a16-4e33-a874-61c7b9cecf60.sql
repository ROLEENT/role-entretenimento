-- Atualiza updated_at em attendance
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attendance_touch ON public.attendance;
CREATE TRIGGER trg_attendance_touch
BEFORE UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();