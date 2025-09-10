-- Corrigir erro da migração anterior - remover trigger existente primeiro
DROP TRIGGER IF EXISTS update_profile_media_updated_at ON public.profile_media;

-- Recriar o trigger
CREATE TRIGGER update_profile_media_updated_at
BEFORE UPDATE ON public.profile_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();