import { useVenueCompletionStatus, useEventCompletionStatus } from '@/hooks/useCompletionStatus';

export const filterByCompletion = <T>(
  items: T[],
  completionFilter: string,
  getCompletionStatus: (item: T) => { status: 'complete' | 'good' | 'incomplete' }
) => {
  if (!completionFilter || completionFilter === 'all') {
    return items;
  }

  return items.filter(item => {
    const { status } = getCompletionStatus(item);
    return status === completionFilter;
  });
};

export const useVenueCompletionFilter = () => {
  return (venues: any[], completionFilter: string) => {
    return filterByCompletion(venues, completionFilter, (venue) => {
      // Using the hook's logic directly
      const { status } = useVenueCompletionStatus(venue);
      return { status };
    });
  };
};

export const useEventCompletionFilter = () => {
  return (events: any[], completionFilter: string) => {
    return filterByCompletion(events, completionFilter, (event) => {
      // Using the hook's logic directly
      const { status } = useEventCompletionStatus(event);
      return { status };
    });
  };
};