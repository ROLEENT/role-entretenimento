import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

interface FocalPointSelectorProps {
  imageUrl: string;
  focalPointX: number;
  focalPointY: number;
  onFocalPointChange: (x: number, y: number) => void;
  className?: string;
}

export function FocalPointSelector({
  imageUrl,
  focalPointX,
  focalPointY,
  onFocalPointChange,
  className
}: FocalPointSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    
    onFocalPointChange(clampedX, clampedY);
  }, [onFocalPointChange]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));
    
    onFocalPointChange(clampedX, clampedY);
  }, [isDragging, onFocalPointChange]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium flex items-center gap-2">
        <Target className="h-4 w-4" />
        Ponto focal da imagem
      </div>
      
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden cursor-crosshair select-none border"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Focal point selector"
          className="w-full h-48 object-cover"
          draggable={false}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
        
        {/* Crosshair lines */}
        <div
          className="absolute w-full border-t border-white/70"
          style={{ top: `${focalPointY * 100}%` }}
        />
        <div
          className="absolute h-full border-l border-white/70"
          style={{ left: `${focalPointX * 100}%` }}
        />
        
        {/* Focal point indicator */}
        <div
          className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white bg-primary shadow-lg transition-transform hover:scale-110"
          style={{
            left: `${focalPointX * 100}%`,
            top: `${focalPointY * 100}%`
          }}
        />
        
        {/* Instructions */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Clique para definir o ponto focal
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Posição: X={Math.round(focalPointX * 100)}%, Y={Math.round(focalPointY * 100)}%
      </div>
    </div>
  );
}