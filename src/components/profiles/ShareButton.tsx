import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ShareIcon, 
  LinkIcon, 
  MessageCircleIcon,
  TwitterIcon,
  FacebookIcon,
  CheckIcon
} from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { toast } from "sonner";

interface ShareButtonProps {
  profile: Profile;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function ShareButton({ 
  profile, 
  className, 
  variant = "outline",
  size = "default" 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const profileUrl = `${window.location.origin}/profiles/${profile.handle}`;
  const shareText = `Confira o perfil de ${profile.name} - ${profile.bio || 'Artista incrível!'} 🎵`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <ShareIcon className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {copied ? (
            <CheckIcon className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <LinkIcon className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copiado!" : "Copiar link"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
          <MessageCircleIcon className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
          <TwitterIcon className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
          <FacebookIcon className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}