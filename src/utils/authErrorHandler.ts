/**
 * Utility for handling auth errors consistently across the app
 */

export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 'invalid_grant',
  SESSION_EXPIRED: 'session_expired',
  TOKEN_EXPIRED: 'token_expired',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  CONNECTION_ERROR: 'connection_error'
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
}

export const mapSupabaseAuthError = (error: any): AuthError => {
  const message = error.message || 'Erro de autenticação desconhecido';
  
  // Map common Supabase auth errors
  if (message.includes('Invalid login credentials')) {
    return {
      code: AuthErrorCodes.INVALID_CREDENTIALS,
      message: 'Email ou senha incorretos. Verifique suas credenciais.'
    };
  }
  
  if (message.includes('JWT expired') || message.includes('token_expired')) {
    return {
      code: AuthErrorCodes.TOKEN_EXPIRED,
      message: 'Sua sessão expirou. Por favor, faça login novamente.'
    };
  }
  
  if (message.includes('row-level security') || message.includes('insufficient')) {
    return {
      code: AuthErrorCodes.INSUFFICIENT_PERMISSIONS,
      message: 'Você não tem permissão para realizar esta ação.'
    };
  }
  
  if (message.includes('connection') || message.includes('network')) {
    return {
      code: AuthErrorCodes.CONNECTION_ERROR,
      message: 'Erro de conexão. Verifique sua internet e tente novamente.'
    };
  }
  
  return {
    code: AuthErrorCodes.SESSION_EXPIRED,
    message,
    details: error
  };
};

export const handleAuthError = (error: any): AuthError => {
  const authError = mapSupabaseAuthError(error);
  
  // Dispatch custom event for session monitor
  const errorEvent = new CustomEvent('authError', {
    detail: authError
  });
  window.dispatchEvent(errorEvent);
  
  return authError;
};

export const isRetryableError = (error: AuthError): boolean => {
  const retryableCodes: AuthErrorCode[] = [
    AuthErrorCodes.CONNECTION_ERROR,
    AuthErrorCodes.TOKEN_EXPIRED
  ];
  return retryableCodes.includes(error.code);
};