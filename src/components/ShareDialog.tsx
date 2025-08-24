import { Facebook, Twitter, MessageCircle, Link, Copy, Instagram } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { FavoriteEvent } from '@/hooks/useFavorites';
import { InstagramShareCard } from './InstagramShareCard';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: FavoriteEvent;
}

const ShareDialog = ({ isOpen, onClose, event }: ShareDialogProps) => {
  const eventUrl = `${window.location.origin}/event/${event.id}`;
  const eventText = `Confira este evento: ${event.title} em ${event.city}`;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-[#1877F2]',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
      }
    },
    {
      name: 'Twitter', 
      icon: Twitter,
      color: 'text-[#1DA1F2]',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(eventText)}&url=${encodeURIComponent(eventUrl)}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-[#25D366]',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${eventText} ${eventUrl}`)}`, '_blank');
      }
    },
    {
      name: 'Copiar Link',
      icon: Copy,
      color: 'text-muted-foreground',
      action: () => {
        navigator.clipboard.writeText(eventUrl).then(() => {
          toast.success('Link copiado para a área de transferência!');
        });
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Compartilhar Evento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">{event.title}</p>
            <p>{event.city} • {new Date(event.date).toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Instagram Stories Card */}
          <InstagramShareCard
            title={event.title}
            subtitle={`${event.city} • ${new Date(event.date).toLocaleDateString('pt-BR')}`}
            imageUrl={event.image}
            url={eventUrl}
          />

          {/* Regular sharing options */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Outras opções</h4>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  onClick={option.action}
                  className="flex items-center gap-2 h-12"
                >
                  <option.icon className={`h-5 w-5 ${option.color}`} />
                  <span className="text-sm">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;