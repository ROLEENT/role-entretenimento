import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  location?: string;
  source: string;
  event_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('Fetching calendar events for user:', userId);

    // Get user's favorite events
    const { data: favoriteEvents, error: favError } = await supabase
      .from('event_favorites')
      .select(`
        event_id,
        events!inner (
          id,
          title,
          summary,
          start_at,
          end_at,
          venue_id,
          venues (name, address)
        )
      `)
      .eq('user_id', userId);

    if (favError) {
      console.error('Error fetching favorites:', favError);
      throw favError;
    }

    // Get user's checked-in events
    const { data: checkinEvents, error: checkinError } = await supabase
      .from('event_checkins')
      .select(`
        event_id,
        events!inner (
          id,
          title,
          summary,
          start_at,
          end_at,
          venue_id,
          venues (name, address)
        )
      `)
      .eq('user_id', userId);

    if (checkinError) {
      console.error('Error fetching checkins:', checkinError);
      throw checkinError;
    }

    // Get user's manual calendar events
    const { data: manualEvents, error: manualError } = await supabase
      .from('user_calendar_events')
      .select('*')
      .eq('user_id', userId);

    if (manualError) {
      console.error('Error fetching manual events:', manualError);
      throw manualError;
    }

    console.log('Found events:', {
      favorites: favoriteEvents?.length || 0,
      checkins: checkinEvents?.length || 0,
      manual: manualEvents?.length || 0
    });

    // Combine and process events
    const allEvents: CalendarEvent[] = [];
    const now = new Date();

    // Add favorite events
    favoriteEvents?.forEach(fav => {
      if (fav.events && fav.events.start_at) {
        const startDate = new Date(fav.events.start_at);
        if (startDate >= now) { // Only future events
          allEvents.push({
            id: `fav-${fav.events.id}`,
            title: fav.events.title,
            description: fav.events.summary || '',
            start_datetime: fav.events.start_at,
            end_datetime: fav.events.end_at || fav.events.start_at,
            all_day: false,
            location: fav.events.venues?.name || '',
            source: 'favorite',
            event_id: fav.events.id
          });
        }
      }
    });

    // Add checkin events (if not already favorite)
    checkinEvents?.forEach(checkin => {
      if (checkin.events && checkin.events.start_at) {
        const startDate = new Date(checkin.events.start_at);
        if (startDate >= now) { // Only future events
          const existingFav = allEvents.find(e => e.event_id === checkin.events.id);
          if (!existingFav) {
            allEvents.push({
              id: `checkin-${checkin.events.id}`,
              title: checkin.events.title,
              description: checkin.events.summary || '',
              start_datetime: checkin.events.start_at,
              end_datetime: checkin.events.end_at || checkin.events.start_at,
              all_day: false,
              location: checkin.events.venues?.name || '',
              source: 'attending',
              event_id: checkin.events.id
            });
          }
        }
      }
    });

    // Add manual events
    manualEvents?.forEach(manual => {
      const startDate = new Date(manual.start_datetime);
      if (startDate >= now) { // Only future events
        allEvents.push({
          id: manual.id,
          title: manual.title,
          description: manual.description || '',
          start_datetime: manual.start_datetime,
          end_datetime: manual.end_datetime,
          all_day: manual.all_day,
          location: manual.location || '',
          source: 'manual'
        });
      }
    });

    // Sort events by date
    allEvents.sort((a, b) => 
      new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    );

    console.log('Total future events to export:', allEvents.length);

    // Generate ICS content
    const formatDate = (date: string, allDay: boolean = false) => {
      const d = new Date(date);
      if (allDay) {
        return d.toISOString().split('T')[0].replace(/[-]/g, '');
      }
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeText = (text: string) => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ROLÊ Entretenimento//Personal Calendar//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Meus Eventos ROLÊ',
      'X-WR-TIMEZONE:America/Sao_Paulo',
      'X-WR-CALDESC:Calendário pessoal de eventos culturais do ROLÊ'
    ];

    allEvents.forEach(event => {
      const eventId = `role-${event.id}@roleentretenimento.com`;
      const startDateTime = formatDate(event.start_datetime, event.all_day);
      const endDateTime = formatDate(event.end_datetime, event.all_day);
      const createdAt = formatDate(new Date().toISOString());

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${eventId}`,
        event.all_day 
          ? `DTSTART;VALUE=DATE:${startDateTime}`
          : `DTSTART:${startDateTime}`,
        event.all_day 
          ? `DTEND;VALUE=DATE:${endDateTime}`
          : `DTEND:${endDateTime}`,
        `SUMMARY:${escapeText(event.title)}`,
        `DESCRIPTION:${escapeText(event.description || '')}`,
        `LOCATION:${escapeText(event.location || '')}`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        `CREATED:${createdAt}`,
        `LAST-MODIFIED:${createdAt}`,
        `CATEGORIES:${event.source.toUpperCase()}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const icsString = icsContent.join('\r\n');

    return new Response(icsString, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="meus-eventos-role.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error generating ICS:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate calendar', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});