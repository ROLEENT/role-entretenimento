import { useAuth } from './useAuth';

export function useAdminEmail(): string | undefined {
  const { user } = useAuth();
  return user?.email;
}