import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Share2, Copy } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const handleShare = (platform: string) => {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para área de transferência!");
      return;
    }
    
    if (platform === 'native' && navigator.share) {
      navigator.share({
        title,
        url
      }).catch(() => {
        // Fallback if native share fails
        navigator.clipboard.writeText(url);
        toast.success("Link copiado para área de transferência!");
      });
      return;
    }
    
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2"
      >
        <Facebook className="w-4 h-4" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2"
      >
        <Twitter className="w-4 h-4" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copiar link
      </Button>
    </div>
  );
};

export default ShareButtons;