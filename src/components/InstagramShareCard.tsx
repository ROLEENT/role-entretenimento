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

    // Create sophisticated background
    const bgGradient = ctx.createRadialGradient(540, 960, 0, 540, 960, 1200);
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(0.6, '#0a0a0a');
    bgGradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle noise texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }

    // Load and process background image
    if (imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Blur effect for background
        ctx.filter = 'blur(20px)';
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, -100, -100, canvas.width + 200, canvas.height + 200);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;

        // Dark overlay
        const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.log('Could not load background image:', error);
      }
    }

    // Main content card (Spotify-style)
    const cardY = canvas.height * 0.4;
    const cardHeight = 400;
    const cardWidth = canvas.width * 0.8;
    const cardX = (canvas.width - cardWidth) / 2;

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    // Card background with rounded corners
    ctx.fillStyle = 'rgba(18, 18, 18, 0.95)';
    const radius = 24;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
    ctx.stroke();

    // Brand logo area
    ctx.fillStyle = gradientFrom;
    ctx.beginPath();
    ctx.roundRect(cardX + 24, cardY + 24, cardWidth - 48, 80, 12);
    ctx.fill();

    // ROLÊ logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROLÊ', cardX + cardWidth / 2, cardY + 70);

    // Title section
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    
    const titleLines = wrapText(ctx, title, cardWidth - 80);
    let currentY = cardY + 160;
    titleLines.forEach(line => {
      ctx.fillText(line, cardX + cardWidth / 2, currentY);
      currentY += 50;
    });

    // Subtitle
    if (subtitle) {
      ctx.fillStyle = '#B3B3B3';
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      
      const subtitleLines = wrapText(ctx, subtitle, cardWidth - 80);
      currentY += 20;
      subtitleLines.forEach(line => {
        ctx.fillText(line, cardX + cardWidth / 2, currentY);
        currentY += 35;
      });
    }

    // Website URL
    ctx.fillStyle = '#666666';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('role.site', cardX + cardWidth / 2, cardY + cardHeight - 30);

    // Decorative elements (like Spotify's design)
    const dotSize = 6;
    ctx.fillStyle = gradientFrom;
    ctx.beginPath();
    ctx.arc(cardX + 40, cardY + cardHeight - 60, dotSize, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = gradientTo;
    ctx.beginPath();
    ctx.arc(cardX + 60, cardY + cardHeight - 60, dotSize, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cardX + 80, cardY + cardHeight - 60, dotSize, 0, 2 * Math.PI);
    ctx.fill();

    // Top branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Descubra eventos incríveis', canvas.width / 2, 120);
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