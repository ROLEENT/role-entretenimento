import { Button, ButtonProps } from '@/components/ui/button';
import { RippleEffect, TapScale } from '@/components/ui/micro-interactions';
import { LoadingButton } from '@/components/ui/loading-button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  ripple?: boolean;
  tapScale?: boolean;
  loading?: boolean;
  loadingText?: string;
  hapticFeedback?: boolean;
}

export function EnhancedButton({
  children,
  ripple = false,
  tapScale = true,
  loading = false,
  loadingText,
  hapticFeedback = true,
  className,
  onClick,
  ...props
}: EnhancedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Add haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    onClick?.(e);
  };

  const ButtonComponent = loading ? LoadingButton : Button;

  const button = (
    <ButtonComponent
      {...props}
      loading={loading}
      loadingText={loadingText}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </ButtonComponent>
  );

  if (ripple && tapScale) {
    return (
      <TapScale>
        <RippleEffect>{button}</RippleEffect>
      </TapScale>
    );
  }

  if (ripple) {
    return <RippleEffect>{button}</RippleEffect>;
  }

  if (tapScale) {
    return <TapScale>{button}</TapScale>;
  }

  return button;
}