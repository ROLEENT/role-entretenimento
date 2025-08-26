import { useToast as useToastOriginal } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";

// Admin logger utility
export const adminLogger = {
  error: (message: string, error?: any) => {
    console.error(`[ADMIN] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[ADMIN] ${message}`, data);
  },
  info: (message: string, data?: any) => {
    console.info(`[ADMIN] ${message}`, data);
  },
  success: (message: string, data?: any) => {
    console.log(`[ADMIN] ${message}`, data);
  }
};

// Supabase error message mappings
const supabaseErrorMessages: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'E-mail ou senha incorretos',
  'User not found': 'Usuário não encontrado',
  'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada',
  'Too many requests': 'Muitas tentativas. Aguarde alguns minutos',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
  'User already registered': 'Este e-mail já está registrado',
  'Signup not allowed': 'Cadastro não permitido',
  
  // Database errors
  'Permission denied': 'Você não tem permissão para esta ação',
  'Row Level Security': 'Acesso negado para este recurso',
  'duplicate key value': 'Este item já existe',
  'foreign key constraint': 'Não é possível excluir: item está sendo usado',
  'not null violation': 'Todos os campos obrigatórios devem ser preenchidos',
  'check constraint': 'Dados inválidos fornecidos',
  
  // Network errors
  'Failed to fetch': 'Erro de conexão. Verifique sua internet',
  'Network error': 'Erro de rede. Tente novamente',
  'timeout': 'Operação demorou muito. Tente novamente',
  
  // Generic errors
  'Internal server error': 'Erro interno do servidor. Tente novamente em alguns minutos',
  'Service unavailable': 'Serviço temporariamente indisponível',
  'Bad gateway': 'Erro de conexão com o servidor'
};

// Function to get friendly error message
function getFriendlyErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido';
  
  const errorMessage = error.message || error.toString();
  
  // Check for exact matches first
  for (const [key, friendlyMessage] of Object.entries(supabaseErrorMessages)) {
    if (errorMessage.includes(key)) {
      return friendlyMessage;
    }
  }
  
  // Check for specific Supabase error codes
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'Nenhum item encontrado';
      case 'PGRST301':
        return 'Dados em formato inválido';
      case '23505':
        return 'Este item já existe';
      case '23503':
        return 'Não é possível excluir: item está sendo usado';
      case '23502':
        return 'Todos os campos obrigatórios devem ser preenchidos';
      default:
        adminLogger.warn('Unhandled Supabase error code', { code: error.code, error });
    }
  }
  
  // Fallback to original message if it's user-friendly
  if (errorMessage.length < 100 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }
  
  return 'Ocorreu um erro inesperado. Tente novamente';
}

interface UseAdminToastReturn {
  toast: typeof toast;
  showSuccess: (message: string, description?: string) => void;
  showError: (error: any, customMessage?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  showLoading: (message: string) => string; // Returns toast ID for dismissal
  dismissToast: (toastId: string) => void;
}

export function useAdminToast(): UseAdminToastReturn {
  const originalToast = useToastOriginal();

  const showSuccess = (message: string, description?: string) => {
    adminLogger.success(message, description);
    toast({
      title: message,
      description,
      variant: "default",
      duration: 4000,
    });
  };

  const showError = (error: any, customMessage?: string) => {
    const friendlyMessage = customMessage || getFriendlyErrorMessage(error);
    
    adminLogger.error(friendlyMessage, error);
    
    toast({
      title: "Erro",
      description: friendlyMessage,
      variant: "destructive",
      duration: 6000,
    });
  };

  const showWarning = (message: string, description?: string) => {
    adminLogger.warn(message, description);
    toast({
      title: "Atenção",
      description: message,
      variant: "default",
      duration: 5000,
    });
  };

  const showInfo = (message: string, description?: string) => {
    adminLogger.info(message, description);
    toast({
      title: message,
      description,
      variant: "default",
      duration: 4000,
    });
  };

  const showLoading = (message: string): string => {
    adminLogger.info(`Loading: ${message}`);
    const toastId = Math.random().toString(36).substr(2, 9);
    
    toast({
      title: message,
      description: "Processando...",
      variant: "default",
      duration: Infinity, // Don't auto-dismiss
    });
    
    return toastId;
  };

  const dismissToast = (toastId: string) => {
    // Note: This would need to be implemented in the toast system
    // For now, we'll log it
    adminLogger.info(`Dismissing toast: ${toastId}`);
  };

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissToast,
  };
}

// Helper hook for async operations with loading states
export function useAsyncOperation() {
  const { showSuccess, showError, showLoading } = useAdminToast();

  const executeOperation = async <T>(
    operation: () => Promise<T>,
    options: {
      loadingMessage: string;
      successMessage: string;
      errorMessage?: string;
    }
  ): Promise<T | null> => {
    const loadingToastId = showLoading(options.loadingMessage);
    
    try {
      const result = await operation();
      showSuccess(options.successMessage);
      return result;
    } catch (error) {
      showError(error, options.errorMessage);
      return null;
    }
  };

  return { executeOperation };
}