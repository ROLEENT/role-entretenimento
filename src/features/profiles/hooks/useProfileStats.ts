import { useMemo } from "react";
import { useProfileEvents } from "./useProfileEvents";
import { useProfileMedia } from "./useProfileMedia";

export function useProfileStats(profileHandle: string, profileType: string, profileUserId: string) {
  const { data: events = [], isLoading: eventsLoading } = useProfileEvents(profileHandle, profileType);
  const { data: media = [], isLoading: mediaLoading } = useProfileMedia(profileUserId);

  // Memoize stats to prevent unnecessary re-renders
  const stats = useMemo(() => ({
    eventCount: events.length,
    mediaCount: media.length,
    isLoading: eventsLoading || mediaLoading,
  }), [events.length, media.length, eventsLoading, mediaLoading]);

  return stats;
}