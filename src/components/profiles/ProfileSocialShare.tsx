import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Profile } from '@/features/profiles/api';

interface ProfileSocialShareProps {
  profile: Profile;
  type: 'artista' | 'local' | 'organizador';
}

export function ProfileSocialShare({ profile, type }: ProfileSocialShareProps) {
  const currentUrl = window.location.href;
  const shareText = `Confira ${profile.name} no Rolezeiro!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Link copiado para a área de transferência');
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Rolezeiro`,
          text: shareText,
          url: currentUrl
        });
      } catch {
        // User cancelled the share
      }
    } else {
      handleCopyLink();
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleNativeShare}
          className="w-full"
          variant="default"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
        
        <Button 
          onClick={handleCopyLink}
          className="w-full"
          variant="outline"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copiar Link
        </Button>
        
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="p-2"
          >
            <a 
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Compartilhar no Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="p-2"
          >
            <a 
              href={shareUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              title="Compartilhar no Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="p-2"
          >
            <a 
              href={shareUrls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Compartilhar no WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}