export interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class TelemetryService {
  private events: TelemetryEvent[] = [];

  track(event: string, properties?: Record<string, any>) {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: new Date()
    };
    
    this.events.push(telemetryEvent);
    
    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Telemetry:', telemetryEvent);
    }
    
    // Aqui você pode integrar com serviços como Google Analytics, Mixpanel, etc.
    // analytics.track(event, properties);
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

export const telemetry = new TelemetryService();

// Eventos específicos para perfis
export const profileEvents = {
  createStart: (type: string) => telemetry.track('profile_create_start', { profile_type: type }),
  createSuccess: (profileId: string, type: string) => telemetry.track('profile_create_success', { profile_id: profileId, profile_type: type }),
  follow: (profileId: string, followerType: string) => telemetry.track('profile_follow', { profile_id: profileId, follower_type: followerType }),
  unfollow: (profileId: string, followerType: string) => telemetry.track('profile_unfollow', { profile_id: profileId, follower_type: followerType }),
  handleCheck: (handle: string, available: boolean) => telemetry.track('profile_handle_check', { handle, available }),
  imageUpload: (type: 'avatar' | 'cover', size: number) => telemetry.track('profile_image_upload', { image_type: type, file_size: size }),
  stepProgress: (step: string, type: string) => telemetry.track('profile_form_step', { step, profile_type: type })
};