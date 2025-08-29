import { Copy, Facebook, Twitter, MessageCircle, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ArticleShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description: string;
}

export function ArticleShareDialog({ 
  isOpen, 
  onClose, 
  title, 
  url, 
  description 
}: ArticleShareDialogProps) {
  const shareData = {
    title,
    url,
    text: description
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error('Erro ao copiar link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar artigo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.facebook)}
              className="flex items-center gap-2"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.twitter)}
              className="flex items-center gap-2"
            >
              <Twitter className="w-4 h-4 text-blue-400" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              onClick={() => openShareWindow(shareUrls.whatsapp)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar link
            </Button>
          </div>

          {navigator.share && (
            <Button 
              onClick={handleNativeShare}
              className="w-full flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Compartilhar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}