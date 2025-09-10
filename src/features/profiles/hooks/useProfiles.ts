import { useQuery } from "@tanstack/react-query";
import { getProfileByHandle, listProfiles, ListFilters } from "@/features/profiles/api";

export function useProfile(handle: string) {
  return useQuery({
    queryKey: ["profile", handle],
    queryFn: () => getProfileByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry for 404s
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    }
  });
}

export function useProfiles(filters: ListFilters) {
  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: () => listProfiles(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}