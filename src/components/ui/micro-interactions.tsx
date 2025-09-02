import { useState } from 'react';
import { cn } from '@/lib/utils';

// Hover lift effect for cards
interface HoverLiftProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export function HoverLift({ children, className, intensity = 'medium' }: HoverLiftProps) {
  const intensityClasses = {
    subtle: 'hover:-translate-y-1 hover:shadow-md',
    medium: 'hover:-translate-y-2 hover:shadow-lg',
    strong: 'hover:-translate-y-3 hover:shadow-xl',
  };

  return (
    <div className={cn(
      'transition-all duration-300 ease-out',
      intensityClasses[intensity],
      className
    )}>
      {children}
    </div>
  );
}

// Ripple effect for buttons
interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function RippleEffect({ children, className, color = 'rgba(255,255,255,0.3)' }: RippleEffectProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute animate-ping rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}

// Floating action button with pulse effect
interface FloatingActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  pulse?: boolean;
}

export function FloatingAction({ children, onClick, className, pulse = false }: FloatingActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg transition-all duration-300',
        'bg-primary text-primary-foreground hover:bg-primary-hover',
        'hover:scale-110 hover:shadow-xl active:scale-95',
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </button>
  );
}

// Scale on tap for mobile interactions
interface TapScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function TapScale({ children, className, scale = 0.95 }: TapScaleProps) {
  return (
    <div 
      className={cn(
        'transition-transform duration-150 ease-out active:scale-95 cursor-pointer',
        className
      )}
      style={{ '--scale': scale } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Glow effect on hover
interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function GlowEffect({ children, className, color = 'primary' }: GlowEffectProps) {
  return (
    <div className={cn(
      'transition-all duration-300',
      `hover:shadow-[0_0_20px_hsl(var(--${color})_/_0.3)]`,
      className
    )}>
      {children}
    </div>
  );
}