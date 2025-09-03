// V3 event schema - redirects to new comprehensive schema
import { 
  eventSchema as eventV3Schema, 
  type EventFormData as EventV3FormData,
  validateEventForPublish 
} from './eventSchema';

export { eventV3Schema, validateEventForPublish };
export type { EventV3FormData };

// Legacy alias for backward compatibility
export type EventFormV3 = EventV3FormData;