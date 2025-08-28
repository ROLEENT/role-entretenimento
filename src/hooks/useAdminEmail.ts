import { useSecureAuth } from './useSecureAuth';

export function useAdminEmail(): string | undefined {
  const { user } = useSecureAuth();
  return user?.email;
}