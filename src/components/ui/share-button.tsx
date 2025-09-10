import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  title: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function ShareButton({ url, title, variant = "outline", size = "default", className }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado!');
      } catch (error) {
        toast.error('Erro ao copiar link');
      }
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleShare} className={className}>
      <Share2 className="w-4 h-4" />
    </Button>
  );
}