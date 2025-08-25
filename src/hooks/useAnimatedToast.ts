import { toast } from 'sonner';

interface AnimatedToastOptions {
  title: string;
  description?: string;
  icon?: 'share' | 'heart' | 'star' | 'copy' | 'success';
  duration?: number;
}

export const useAnimatedToast = () => {
  const showAnimatedToast = ({ 
    title, 
    description, 
    icon = 'success',
    duration = 3000 
  }: AnimatedToastOptions) => {

    toast(title, {
      description,
      duration,
      className: "animate-scale-in",
      style: {
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
      }
    });
  };

  const showShareSuccess = (platform?: string) => {
    showAnimatedToast({
      title: platform ? 'Compartilhado via ' + platform + '!' : 'Link copiado!',
      description: platform ? undefined : 'Link copiado para a área de transferência',
      icon: platform ? 'share' : 'copy',
    });
  };

  const showLikeSuccess = (isLiked: boolean) => {
    showAnimatedToast({
      title: isLiked ? 'Adicionado aos favoritos!' : 'Removido dos favoritos',
      icon: 'heart',
    });
  };

  return {
    showAnimatedToast,
    showShareSuccess,
    showLikeSuccess,
  };
};