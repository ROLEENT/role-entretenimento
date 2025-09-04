/**
 * Remove milliseconds from Date for cleaner PostgREST queries
 * Avoids 400 errors with timestamp parsing
 */
export function getCleanTimestamp(date: Date): string {
  // Create a new date without milliseconds
  const cleanDate = new Date(date);
  cleanDate.setMilliseconds(0);
  return cleanDate.toISOString();
}

/**
 * Get clean timestamp range for date filters
 */
export function getCleanDateRange(startDate: Date, endDate: Date) {
  return {
    start: getCleanTimestamp(startDate),
    end: getCleanTimestamp(endDate)
  };
}