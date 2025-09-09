import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProfiles, getProfileByHandle, ProfileType, ListFilters } from "../api";
import { followProfile, unfollowProfile } from "../services";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function useProfiles(filters: ListFilters) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: async () => {
      try {
        console.log("🔍 useProfiles fetching with filters:", filters);
        const result = await listProfiles(filters);
        console.log("✅ useProfiles success:", result);
        return result;
      } catch (error) {
        console.error("❌ useProfiles error:", error);
        // Return empty result instead of throwing to prevent page crashes
        return { data: [], total: 0 };
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1, // Only retry once
  });
}

export function useProfile(handle: string) {
  return useQuery({
    queryKey: ['profile', handle],
    queryFn: () => getProfileByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFollowMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const followMutation = useMutation({
    mutationFn: ({ profileId }: { profileId: string }) => {
      if (!user) throw new Error('User not authenticated');
      return followProfile(profileId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Perfil seguido",
        description: "Você agora está seguindo este perfil.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao seguir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: ({ profileId }: { profileId: string }) => {
      if (!user) throw new Error('User not authenticated');
      return unfollowProfile(profileId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Deixou de seguir",
        description: "Você não está mais seguindo este perfil.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deixar de seguir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
  };
}