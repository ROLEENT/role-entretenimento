import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Copy, Instagram, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface InstagramShareCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const InstagramShareCard = ({ 
  title, 
  subtitle, 
  imageUrl, 
  url,
  gradientFrom = "hsl(280, 100%, 60%)",
  gradientTo = "hsl(320, 100%, 70%)"
}: InstagramShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateInstagramImage();
  }, [title, subtitle, imageUrl]);

  const generateInstagramImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for Instagram Stories (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, gradientFrom);
    gradient.addColorStop(1, gradientTo);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Add overlay for better text readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 1080, 1920);

    // Load and draw background image if provided
    if (imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Draw image with overlay
          ctx.globalAlpha = 0.4;
          ctx.drawImage(img, 0, 0, 1080, 1920);
          ctx.globalAlpha = 1;
          
          // Add dark overlay for text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, 1080, 1920);
          
          drawText();
        };
        img.src = imageUrl;
      } catch (error) {
        console.error('Error loading image:', error);
        drawText();
      }
    } else {
      drawText();
    }

    function drawText() {
      // ROLÊ logo/brand
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROLÊ', 540, 200);

      // Main title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial, sans-serif';
      ctx.textAlign = 'center';
      
      // Text wrapping for long titles
      const words = title.split(' ');
      let line = '';
      let y = 800;
      const maxWidth = 900;
      const lineHeight = 90;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 540, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 540, y);

      // Subtitle
      if (subtitle) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '50px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(subtitle, 540, y + 100);
      }

      // Call to action
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Veja mais em role.ent', 540, 1700);

      // QR code placeholder or URL
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '30px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(url.replace('https://', ''), 540, 1780);
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `role-story-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Imagem baixada! Compartilhe no Instagram Stories');
      }
    }, 'image/png');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para área de transferência!');
  };

  const handleShareInstagram = () => {
    // Try to open Instagram app or website
    const instagramUrl = `https://www.instagram.com/`;
    window.open(instagramUrl, '_blank');
    toast.info('Baixe a imagem e compartilhe no Instagram Stories!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-card-foreground">Compartilhar no Instagram Stories</h3>
        
        {/* Preview */}
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-[200px] max-h-[356px] rounded-lg border shadow-sm"
              style={{ aspectRatio: '9/16' }}
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
              <Button
                onClick={handleDownloadImage}
                size="sm"
                className="bg-white/90 text-black hover:bg-white"
              >
                Baixar Imagem
              </Button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleDownloadImage}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Baixar
          </Button>
          
          <Button
            onClick={handleShareInstagram}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-pink-600 border-pink-200 hover:bg-pink-50"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </Button>
          
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Link
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Imagem otimizada para Instagram Stories (1080x1920)
        </p>
      </div>
    </div>
  );
};

export default InstagramShareCard;