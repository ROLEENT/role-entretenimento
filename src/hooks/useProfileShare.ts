import { useNativeShare } from './useNativeShare';
import { Profile } from '@/features/profiles/api';
import { toast } from 'sonner';

export function useProfileShare() {
  const { shareOrFallback } = useNativeShare();

  const shareProfile = async (profile: Profile) => {
    const shareData = {
      title: `${profile.name} - Rolê`,
      text: `Confira o perfil de ${profile.name} no Rolê`,
      url: `${window.location.origin}/perfil/@${profile.handle}`
    };

    await shareOrFallback(shareData, () => {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        toast.success('Link copiado para a área de transferência');
      }).catch(() => {
        toast.error('Erro ao copiar link');
      });
    });
  };

  return { shareProfile };
}