import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Upload, UserPlus } from 'lucide-react';

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'follow' | 'review' | 'upload' | 'general';
  onSignIn: () => void;
}

const actionConfig = {
  follow: {
    icon: UserPlus,
    title: 'Seguir Perfil',
    description: 'Para seguir perfis e acompanhar suas atualizações, você precisa estar logado.'
  },
  review: {
    icon: MessageCircle,
    title: 'Deixar Avaliação',
    description: 'Para deixar avaliações e comentários, você precisa estar logado.'
  },
  upload: {
    icon: Upload,
    title: 'Enviar Mídia',
    description: 'Para enviar fotos e vídeos para o portfólio, você precisa estar logado.'
  },
  general: {
    icon: Heart,
    title: 'Faça Login',
    description: 'Para acessar esta funcionalidade, você precisa estar logado.'
  }
};

export function AuthRequiredDialog({ open, onOpenChange, action, onSignIn }: AuthRequiredDialogProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  const handleSignIn = () => {
    onOpenChange(false);
    onSignIn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={handleSignIn} className="w-full">
            Fazer Login
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}