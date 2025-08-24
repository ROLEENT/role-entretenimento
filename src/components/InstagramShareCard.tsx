import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Link, Instagram } from 'lucide-react';
import { toast } from 'sonner';

interface InstagramShareCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const InstagramShareCard = ({ 
  title, 
  subtitle, 
  imageUrl, 
  url, 
  gradientFrom = "#8B5CF6", 
  gradientTo = "#EC4899" 
}: InstagramShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateStoriesImage();
  }, [title, subtitle, imageUrl, gradientFrom, gradientTo]);

  const generateStoriesImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Stories dimensions (9:16 aspect ratio)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background setup
    if (imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Blurred background image (Spotify style)
        ctx.filter = 'blur(18px) saturate(120%)';
        ctx.globalAlpha = 0.55;
        const scale = 1.08;
        const offsetX = (canvas.width * scale - canvas.width) / 2;
        const offsetY = (canvas.height * scale - canvas.height) / 2;
        ctx.drawImage(img, -offsetX, -offsetY, canvas.width * scale, canvas.height * scale);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      } catch (error) {
        console.log('Could not load background image, using gradient:', error);
      }
    }

    // Background gradient overlay (always applied)
    const bgGradient = ctx.createRadialGradient(canvas.width * 0.1, 0, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 1.2);
    bgGradient.addColorStop(0, 'rgba(43, 43, 50, 0.1)');
    bgGradient.addColorStop(0.32, 'rgba(26, 26, 31, 0.3)');
    bgGradient.addColorStop(0.5, 'rgba(20, 20, 25, 0.5)');
    bgGradient.addColorStop(0.7, 'rgba(17, 16, 22, 0.7)');
    
    const accentGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    accentGradient.addColorStop(0, gradientFrom + '40');
    accentGradient.addColorStop(0.5, '#8b5cf640');
    accentGradient.addColorStop(1, '#6ee7f940');
    
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = accentGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vignette effect
    const vignetteGradient = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.5, 0, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.6);
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.5)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Central card (Spotify style)
    const cardWidth = canvas.width - 96; // 48px margin each side
    const cardHeight = 140;
    const cardX = 48;
    const cardY = canvas.height - 160; // Bottom positioning

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;

    // Card background with blur effect
    ctx.fillStyle = 'rgba(20, 20, 27, 0.8)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Cover image (1:1 ratio on the left)
    const coverSize = 108; // Fits inside card with padding
    const coverX = cardX + 16;
    const coverY = cardY + 16;

    if (imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
        ctx.clip();
        ctx.drawImage(img, coverX, coverY, coverSize, coverSize);
        ctx.restore();
      } catch (error) {
        // Fallback cover
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
        ctx.fill();
      }
    } else {
      // Default cover
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, coverSize, coverSize, 14);
      ctx.fill();
    }

    // Text content area
    const textX = coverX + coverSize + 16;
    const textWidth = cardWidth - coverSize - 48;

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    
    const titleLines = wrapText(ctx, title, textWidth);
    let currentY = cardY + 40;
    titleLines.slice(0, 2).forEach(line => { // Max 2 lines
      ctx.fillText(line, textX, currentY);
      currentY += 28;
    });

    // Source
    ctx.fillStyle = '#C7C7CF';
    ctx.font = '500 16px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('ROLÊ ENTRETENIMENTO', textX, currentY + 8);

    // Brand indicator
    const dotX = textX;
    const dotY = cardY + cardHeight - 24;
    
    ctx.fillStyle = gradientFrom;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
    ctx.shadowColor = gradientFrom;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#C7C7CF';
    ctx.font = '12px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillText('roleentretenimento.com', dotX + 16, dotY + 4);

    // CTA at bottom
    ctx.fillStyle = 'rgba(199, 199, 207, 0.85)';
    ctx.font = '14px Inter, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Toque para ler no ROLÊ', canvas.width / 2, canvas.height - 48);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines.slice(0, 2); // Max 2 lines for title
  };

  const handleDownloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `role-stories-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Download concluído! 📱 Agora é só compartilhar nos seus Stories!");
    }, 'image/png', 1.0);
  };

  const handleShareInstagram = async () => {
    await handleDownloadImage();
    
    // Open Instagram Stories camera
    window.open('https://www.instagram.com/stories/camera/', '_blank');
    
    toast.success("Redirecionando para o Instagram 📸 A imagem foi baixada!");
  };

  const handleCopyLink = async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado! 🔗 Cole onde quiser compartilhar.");
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white shadow-2xl border-0">
      <CardContent className="p-6">
        {/* Preview */}
        <div className="mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-xl shadow-2xl border border-white/10"
            style={{ aspectRatio: '9/16', maxHeight: '320px' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleShareInstagram}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            size="lg"
          >
            <Instagram className="w-5 h-5 mr-3" />
            Compartilhar Stories
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl py-3 transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            
            {url && (
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl py-3 transition-all duration-200"
              >
                <Link className="w-4 h-4 mr-2" />
                Link
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
            <p className="text-sm font-medium">
              Otimizado para Instagram Stories
            </p>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"></div>
          </div>
          <p className="text-white/60 text-xs">
            Design inspirado no Spotify • 1080x1920px
          </p>
        </div>
      </CardContent>
    </Card>
  );
};