-- Simple insert for lineup slots without conflicts
DO $$
DECLARE
  v_event_id UUID;
  v_hate_moss_id UUID;
  v_resp3x_id UUID;
BEGIN
  -- Get event ID
  SELECT id INTO v_event_id FROM events WHERE slug = 'hate-moss-ita-resp3x-no-janaino';
  
  -- Get artist profile IDs
  SELECT id INTO v_hate_moss_id FROM entity_profiles WHERE handle = 'hate-moss' AND type = 'artista';
  SELECT id INTO v_resp3x_id FROM entity_profiles WHERE handle = 'resp3x' AND type = 'artista';
  
  IF v_event_id IS NOT NULL THEN
    -- Delete existing slots for clean setup
    DELETE FROM event_lineup_slot_artists WHERE slot_id IN (
      SELECT id FROM event_lineup_slots WHERE event_id = v_event_id
    );
    DELETE FROM event_lineup_slots WHERE event_id = v_event_id;
    
    -- Create new lineup slots
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
      );
  END IF;
END $$;