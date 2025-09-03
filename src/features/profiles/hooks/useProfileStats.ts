import { useProfileEvents } from "./useProfileEvents";
import { useProfileMedia } from "./useProfileMedia";

export function useProfileStats(profileHandle: string, profileType: string, profileUserId: string) {
  const { data: events = [] } = useProfileEvents(profileHandle, profileType);
  const { data: media = [] } = useProfileMedia(profileUserId);

  return {
    eventCount: events.length,
    mediaCount: media.length,
  };
}