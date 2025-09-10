import React, { useState } from 'react';
import { Share2, Copy, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAnimatedToast } from '@/hooks/useAnimatedToast';

interface ShareButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  className?: string;
}

export function ShareButton({ eventId, eventTitle, eventDate, className }: ShareButtonProps) {
  const { showShareSuccess } = useAnimatedToast();
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${window.location.origin}/evento/${eventId}`;
  const shareText = `Confira este rolê: ${eventTitle}${eventDate ? ` em ${eventDate}` : ''}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showShareSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    showShareSuccess('WhatsApp');
    setIsOpen(false);
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct URL sharing, so we copy to clipboard
    copyToClipboard();
    showShareSuccess('Instagram Stories');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          text: shareText,
          url: shareUrl,
        });
        showShareSuccess();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          Enviar para o grupo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToInstagram}>
          <Instagram className="h-4 w-4 mr-2" />
          Instagram Stories
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {navigator.share && (
          <DropdownMenuItem onClick={shareNative}>
            <Share2 className="h-4 w-4 mr-2" />
            Mais opções
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}