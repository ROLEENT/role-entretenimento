import { useState, useRef } from 'react';

interface FocalPointSelectorProps {
  imageUrl: string;
  initialX?: number;
  initialY?: number;
  onFocalPointChange: (x: number, y: number) => void;
}

export const FocalPointSelector = ({ 
  imageUrl, 
  initialX = 0.5, 
  initialY = 0.5, 
  onFocalPointChange 
}: FocalPointSelectorProps) => {
  const [focalPoint, setFocalPoint] = useState({ x: initialX, y: initialY });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const newFocalPoint = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };
    
    setFocalPoint(newFocalPoint);
    onFocalPointChange(newFocalPoint.x, newFocalPoint.y);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Ponto focal da imagem</label>
      <div 
        ref={containerRef}
        className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden cursor-crosshair"
        onClick={handleClick}
      >
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute w-4 h-4 bg-primary border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
          style={{
            left: `${focalPoint.x * 100}%`,
            top: `${focalPoint.y * 100}%`
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Clique na imagem para definir o ponto focal (x: {focalPoint.x.toFixed(2)}, y: {focalPoint.y.toFixed(2)})
      </p>
    </div>
  );
};