import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Linkedin, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareFloatingProps {
  className?: string;
  title?: string;
  url?: string;
  description?: string;
}

export function ShareFloating({ 
  className = "", 
  title = document.title,
  url = window.location.href,
  description = ""
}: ShareFloatingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:text-blue-600"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: "hover:text-sky-500"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:text-blue-700"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
      color: "hover:text-green-600"
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
      setIsExpanded(false);
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsExpanded(false);
  };

  return (
    <TooltipProvider>
      <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-30 ${className}`}>
        <div className="flex flex-col gap-2">
          {/* Main Share Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Compartilhar artigo</p>
            </TooltipContent>
          </Tooltip>

          {/* Share Options */}
          {isExpanded && (
            <div className="flex flex-col gap-2 animate-in slide-in-from-right-2 duration-200">
              {shareLinks.map((link) => (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-10 w-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2 ${link.color}`}
                      onClick={() => handleShare(link.url)}
                    >
                      <link.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Compartilhar no {link.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              
              {/* Copy Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2 hover:text-primary"
                    onClick={copyToClipboard}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Copiar link</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}