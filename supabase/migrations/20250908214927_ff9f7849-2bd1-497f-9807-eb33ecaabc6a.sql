-- Create proper lineup slots with artist links for the event
-- First, get the event ID and artist IDs
DO $$
DECLARE
  v_event_id UUID;
  v_hate_moss_id UUID;
  v_resp3x_id UUID;
  v_slot_hate_moss UUID;
  v_slot_resp3x UUID;
BEGIN
  -- Get event ID
  SELECT id INTO v_event_id FROM events WHERE slug = 'hate-moss-ita-resp3x-no-janaino';
  
  -- Get artist profile IDs
  SELECT id INTO v_hate_moss_id FROM entity_profiles WHERE handle = 'hate-moss' AND type = 'artista';
  SELECT id INTO v_resp3x_id FROM entity_profiles WHERE handle = 'resp3x' AND type = 'artista';
  
  IF v_event_id IS NOT NULL AND v_hate_moss_id IS NOT NULL AND v_resp3x_id IS NOT NULL THEN
    -- Create lineup slots if they don't exist
    INSERT INTO event_lineup_slots (
      event_id,
      slot_name,
      start_time,
      position,
      is_headliner,
      stage
    ) VALUES 
      (
        v_event_id,
        'Hate Moss',
        '2025-09-11 22:00:00+00',
        1,
        true,
        'Principal'
      ),
      (
        v_event_id,
        'Resp3x',
        '2025-09-11 21:00:00+00',
        2,
        false,
        'Principal'
      )
    ON CONFLICT (event_id, slot_name) DO UPDATE SET
      start_time = EXCLUDED.start_time,
      position = EXCLUDED.position,
      is_headliner = EXCLUDED.is_headliner
    RETURNING id INTO v_slot_hate_moss;
    
    -- Get slot IDs for artist assignment
    SELECT id INTO v_slot_hate_moss FROM event_lineup_slots 
    WHERE event_id = v_event_id AND slot_name = 'Hate Moss';
    
    SELECT id INTO v_slot_resp3x FROM event_lineup_slots 
    WHERE event_id = v_event_id AND slot_name = 'Resp3x';
    
    -- Link artists to slots if slots exist
    IF v_slot_hate_moss IS NOT NULL THEN
      INSERT INTO event_lineup_slot_artists (
        slot_id,
        artist_id,
        artist_name,
        position,
        role
      ) VALUES (
        v_slot_hate_moss,
        v_hate_moss_id,
        'Hate Moss',
        1,
        'headliner'
      ) ON CONFLICT (slot_id, artist_id) DO NOTHING;
    END IF;
    
    IF v_slot_resp3x IS NOT NULL THEN
      INSERT INTO event_lineup_slot_artists (
        slot_id,
        artist_id,
        artist_name,
        position,
        role
      ) VALUES (
        v_slot_resp3x,
        v_resp3x_id,
        'Resp3x',
        1,
        'support'
      ) ON CONFLICT (slot_id, artist_id) DO NOTHING;
    END IF;
  END IF;
END $$;