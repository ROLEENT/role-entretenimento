import { z } from 'zod';

// Error types and severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// Base error interface
export interface AppError {
  id: string;
  message: string;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
  userMessage?: string; // User-friendly message
  retryable?: boolean;
  details?: Record<string, any>;
}

// Standard error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NO_CONNECTION: 'NO_CONNECTION',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Client errors
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  
  // Application specific
  FORM_SUBMISSION_FAILED: 'FORM_SUBMISSION_FAILED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  DATA_CORRUPTION: 'DATA_CORRUPTION',
} as const;

// User-friendly error messages
export const USER_ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Problema de conexão. Verifique sua internet e tente novamente.',
  [ERROR_CODES.TIMEOUT]: 'A operação demorou muito para responder. Tente novamente.',
  [ERROR_CODES.NO_CONNECTION]: 'Sem conexão com a internet. Verifique sua rede.',
  
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciais inválidas. Verifique seus dados.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  [ERROR_CODES.UNAUTHORIZED]: 'Você não tem permissão para esta ação.',
  
  [ERROR_CODES.VALIDATION_FAILED]: 'Dados inválidos. Verifique os campos do formulário.',
  [ERROR_CODES.REQUIRED_FIELD]: 'Preencha todos os campos obrigatórios.',
  [ERROR_CODES.INVALID_FORMAT]: 'Formato de dados inválido.',
  
  [ERROR_CODES.INTERNAL_ERROR]: 'Erro interno do servidor. Tente novamente em alguns minutos.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível.',
  [ERROR_CODES.RATE_LIMIT]: 'Muitas tentativas. Aguarde alguns minutos.',
  
  [ERROR_CODES.NOT_FOUND]: 'Recurso não encontrado.',
  [ERROR_CODES.PERMISSION_DENIED]: 'Acesso negado. Você não tem permissão.',
  [ERROR_CODES.INVALID_REQUEST]: 'Solicitação inválida.',
  
  [ERROR_CODES.FORM_SUBMISSION_FAILED]: 'Erro ao enviar formulário. Tente novamente.',
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'Erro no upload do arquivo. Verifique o formato e tamanho.',
  [ERROR_CODES.DATA_CORRUPTION]: 'Dados corrompidos. Recarregue a página.',
} as const;

// Error factory functions
export class AppErrorFactory {
  private static generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createError(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: Partial<AppError> = {}
  ): AppError {
    return {
      id: this.generateId(),
      message,
      category,
      severity,
      timestamp: new Date(),
      retryable: false,
      ...options,
    };
  }

  static fromNetworkError(error: any, context?: Record<string, any>): AppError {
    const isTimeout = error.name === 'TimeoutError' || error.code === 'TIMEOUT';
    const isNoConnection = !navigator.onLine || error.code === 'NETWORK_ERROR';
    
    return this.createError(
      error.message || 'Erro de rede',
      ErrorCategory.NETWORK,
      isNoConnection ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      {
        code: isTimeout ? ERROR_CODES.TIMEOUT : 
              isNoConnection ? ERROR_CODES.NO_CONNECTION : 
              ERROR_CODES.NETWORK_ERROR,
        userMessage: isTimeout ? USER_ERROR_MESSAGES[ERROR_CODES.TIMEOUT] :
                    isNoConnection ? USER_ERROR_MESSAGES[ERROR_CODES.NO_CONNECTION] :
                    USER_ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        retryable: true,
        context,
        stack: error.stack,
      }
    );
  }

  static fromValidationError(error: z.ZodError, context?: Record<string, any>): AppError {
    return this.createError(
      'Erro de validação',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      {
        code: ERROR_CODES.VALIDATION_FAILED,
        userMessage: USER_ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED],
        retryable: false,
        context: {
          ...context,
          validationErrors: error.errors,
        },
        details: {
          fieldErrors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      }
    );
  }

  static fromSupabaseError(error: any, context?: Record<string, any>): AppError {
    const isAuthError = error.message?.includes('auth') || error.status === 401;
    const isNotFound = error.status === 404;
    const isRateLimit = error.status === 429;
    
    let category = ErrorCategory.SERVER;
    let severity = ErrorSeverity.MEDIUM;
    let code = ERROR_CODES.INTERNAL_ERROR;
    let userMessage = USER_ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR];
    
    if (isAuthError) {
      category = ErrorCategory.AUTHENTICATION;
      code = ERROR_CODES.UNAUTHORIZED;
      userMessage = USER_ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED];
    } else if (isNotFound) {
      category = ErrorCategory.NOT_FOUND;
      code = ERROR_CODES.NOT_FOUND;
      userMessage = USER_ERROR_MESSAGES[ERROR_CODES.NOT_FOUND];
    } else if (isRateLimit) {
      category = ErrorCategory.SERVER;
      code = ERROR_CODES.RATE_LIMIT;
      userMessage = USER_ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT];
      severity = ErrorSeverity.HIGH;
    }
    
    return this.createError(
      error.message || 'Erro do servidor',
      category,
      severity,
      {
        code,
        userMessage,
        retryable: !isAuthError && !isNotFound,
        context: {
          ...context,
          supabaseError: {
            code: error.code,
            status: error.status,
            hint: error.hint,
          },
        },
        stack: error.stack,
      }
    );
  }

  static fromJavaScriptError(error: Error, context?: Record<string, any>): AppError {
    const isTypeError = error instanceof TypeError;
    const isReferenceError = error instanceof ReferenceError;
    
    return this.createError(
      error.message,
      ErrorCategory.CLIENT,
      ErrorSeverity.MEDIUM,
      {
        code: ERROR_CODES.INTERNAL_ERROR,
        userMessage: 'Erro interno da aplicação. Recarregue a página.',
        retryable: true,
        context: {
          ...context,
          errorType: error.constructor.name,
          isTypeError,
          isReferenceError,
        },
        stack: error.stack,
      }
    );
  }
}

// Error utilities
export const errorUtils = {
  // Check if error is retryable
  isRetryable: (error: AppError): boolean => {
    return error.retryable === true;
  },

  // Check if error should be reported to logging service
  shouldReport: (error: AppError): boolean => {
    return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL;
  },

  // Get user-friendly message
  getUserMessage: (error: AppError): string => {
    return error.userMessage || error.message || 'Erro inesperado';
  },

  // Format error for logging
  formatForLogging: (error: AppError): Record<string, any> => {
    return {
      id: error.id,
      message: error.message,
      code: error.code,
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  },

  // Group errors by category
  groupByCategory: (errors: AppError[]): Record<ErrorCategory, AppError[]> => {
    return errors.reduce((groups, error) => {
      if (!groups[error.category]) {
        groups[error.category] = [];
      }
      groups[error.category].push(error);
      return groups;
    }, {} as Record<ErrorCategory, AppError[]>);
  },
};