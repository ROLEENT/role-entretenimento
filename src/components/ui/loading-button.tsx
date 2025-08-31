import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  spinnerSize?: 'xs' | 'sm' | 'md';
  spinnerPlacement?: 'left' | 'right' | 'replace';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  spinnerSize = 'sm',
  spinnerPlacement = 'left',
  children,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const displayText = loading && loadingText ? loadingText : children;

  const renderSpinner = () => (
    <Spinner 
      size={spinnerSize} 
      variant="white"
      className={cn(
        spinnerPlacement === 'left' && 'mr-2',
        spinnerPlacement === 'right' && 'ml-2'
      )}
    />
  );

  const renderContent = () => {
    if (loading && spinnerPlacement === 'replace') {
      return renderSpinner();
    }

    return (
      <>
        {loading && spinnerPlacement === 'left' && renderSpinner()}
        {displayText}
        {loading && spinnerPlacement === 'right' && renderSpinner()}
      </>
    );
  };

  return (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn(
        loading && 'cursor-not-allowed',
        className
      )}
    >
      {renderContent()}
    </Button>
  );
};

// Async button that automatically handles loading state
interface AsyncButtonProps extends Omit<LoadingButtonProps, 'loading'> {
  onClick?: () => Promise<void> | void;
  onSuccess?: () => void;
  onAsyncError?: (error: Error) => void;
}

export const AsyncButton: React.FC<AsyncButtonProps> = ({
  onClick,
  onSuccess,
  onAsyncError,
  ...props
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = React.useCallback(async () => {
    if (!onClick || loading) return;

    try {
      setLoading(true);
      await onClick();
      onSuccess?.();
    } catch (error) {
      console.error('AsyncButton error:', error);
      onAsyncError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [onClick, loading, onSuccess, onAsyncError]);

  return (
    <LoadingButton
      {...props}
      loading={loading}
      onClick={handleClick}
    />
  );
};