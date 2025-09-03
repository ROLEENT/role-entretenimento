// Legacy event schema - redirects to new comprehensive schema
import { eventSchema, type EventFormData } from './eventSchema';

export { eventSchema };
export type { EventFormData };

// Legacy alias for backward compatibility
export type EventForm = EventFormData;