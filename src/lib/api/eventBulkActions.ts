import { supabaseServer } from "@/lib/supabase/server";

export async function bulkSoftDeleteEvents(eventIds: string[]) {
  const { error } = await supabaseServer.rpc('soft_delete_events', {
    p_ids: eventIds
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function bulkRestoreEvents(eventIds: string[]) {
  const { error } = await supabaseServer.rpc('restore_events', {
    p_ids: eventIds
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function bulkHardDeleteEvents(eventIds: string[]) {
  const { error } = await supabaseServer.rpc('hard_delete_events', {
    p_ids: eventIds
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function restoreEvent(eventId: string) {
  const { error } = await supabaseServer.rpc('restore_event', {
    p_event_id: eventId
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function hardDeleteEvent(eventId: string) {
  const { error } = await supabaseServer.rpc('hard_delete_event', {
    p_event_id: eventId
  });
  
  if (error) {
    throw new Error(error.message);
  }
}