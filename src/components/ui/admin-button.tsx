import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAdminToast, useAsyncOperation } from '@/hooks/useAdminToast';

interface AdminActionButtonProps {
  onClick: () => Promise<void> | void;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  confirmAction?: boolean;
  confirmMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export function AdminActionButton({
  onClick,
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  loadingText,
  confirmAction = false,
  confirmMessage = 'Tem certeza que deseja continuar?',
  successMessage,
  errorMessage,
  loadingMessage = 'Processando...',
}: AdminActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAdminToast();

  const handleClick = async () => {
    if (confirmAction && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    
    try {
      await onClick();
      
      if (successMessage) {
        showSuccess(successMessage);
      }
    } catch (error) {
      showError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {loading ? (loadingText || loadingMessage) : children}
    </Button>
  );
}

// Specialized buttons for common admin actions
export function SaveButton(props: Omit<AdminActionButtonProps, 'successMessage' | 'loadingMessage'>) {
  return (
    <AdminActionButton
      successMessage="Dados salvos com sucesso!"
      loadingMessage="Salvando..."
      {...props}
    >
      {props.children}
    </AdminActionButton>
  );
}

export function DeleteButton(props: Omit<AdminActionButtonProps, 'variant' | 'confirmAction' | 'confirmMessage' | 'successMessage' | 'loadingMessage'>) {
  return (
    <AdminActionButton
      variant="destructive"
      confirmAction={true}
      confirmMessage="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      successMessage="Item excluído com sucesso!"
      loadingMessage="Excluindo..."
      {...props}
    >
      {props.children}
    </AdminActionButton>
  );
}

export function PublishButton(props: Omit<AdminActionButtonProps, 'successMessage' | 'loadingMessage'>) {
  return (
    <AdminActionButton
      successMessage="Publicado com sucesso!"
      loadingMessage="Publicando..."
      {...props}
    >
      {props.children}
    </AdminActionButton>
  );
}

export function UpdateButton(props: Omit<AdminActionButtonProps, 'successMessage' | 'loadingMessage'>) {
  return (
    <AdminActionButton
      successMessage="Atualizado com sucesso!"
      loadingMessage="Atualizando..."
      {...props}
    >
      {props.children}
    </AdminActionButton>
  );
}