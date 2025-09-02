import { Button, ButtonProps } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({ 
  loading = false, 
  loadingText,
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={loading || disabled}
      className={cn(
        'transition-all duration-200',
        loading && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}