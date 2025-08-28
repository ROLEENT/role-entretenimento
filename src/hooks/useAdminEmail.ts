import { useAdminV2Auth } from './useAdminV2Auth';

export function useAdminEmail(): string | undefined {
  const { user } = useAdminV2Auth();
  return user?.email;
}