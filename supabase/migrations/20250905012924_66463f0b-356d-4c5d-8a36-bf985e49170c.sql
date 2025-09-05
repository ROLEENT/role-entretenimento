-- Corrigir queries de eventos para usar relacionamentos corretos
-- As tabelas já existem mas as queries estão incorretas

-- Vamos verificar se existe uma view para facilitar as queries
CREATE OR REPLACE VIEW events_with_relations AS
SELECT 
  e.*,
  COALESCE(
    ARRAY(
      SELECT json_build_object(
        'id', els.id,
        'slot_name', els.slot_name,
        'start_time', els.start_time,
        'end_time', els.end_time,
        'stage', els.stage,
        'position', els.position,
        'is_headliner', els.is_headliner,
        'notes', els.notes,
        'artists', COALESCE(
          ARRAY(
            SELECT json_build_object(
              'id', elsa.id,
              'artist_id', elsa.artist_id,
              'artist_name', elsa.artist_name,
              'position', elsa.position,
              'role', elsa.role
            )
            FROM event_lineup_slot_artists elsa 
            WHERE elsa.slot_id = els.id
            ORDER BY elsa.position
          ), '{}'::json[]
        )
      )
      FROM event_lineup_slots els 
      WHERE els.event_id = e.id
      ORDER BY els.position
    ), '{}'::json[]
  ) as lineup_slots,
  
  COALESCE(
    ARRAY(
      SELECT json_build_object(
        'id', ep.id,
        'partner_id', ep.partner_id,
        'partner_type', ep.partner_type,
        'role', ep.role,
        'display_name', ep.display_name,
        'position', ep.position,
        'is_main', ep.is_main
      )
      FROM event_partners ep 
      WHERE ep.event_id = e.id
      ORDER BY ep.position
    ), '{}'::json[]
  ) as partners,
  
  COALESCE(
    ARRAY(
      SELECT json_build_object(
        'id', eperf.id,
        'performer_name', eperf.performer_name,
        'performance_type', eperf.performance_type,
        'description', eperf.description,
        'start_time', eperf.start_time,
        'duration_minutes', eperf.duration_minutes,
        'stage', eperf.stage,
        'position', eperf.position,
        'contact_info', eperf.contact_info
      )
      FROM event_performances eperf 
      WHERE eperf.event_id = e.id
      ORDER BY eperf.position
    ), '{}'::json[]
  ) as performances,
  
  COALESCE(
    ARRAY(
      SELECT json_build_object(
        'id', eva.id,
        'artist_name', eva.artist_name,
        'art_type', eva.art_type,
        'description', eva.description,
        'installation_location', eva.installation_location,
        'contact_info', eva.contact_info,
        'artwork_images', eva.artwork_images,
        'position', eva.position
      )
      FROM event_visual_artists eva 
      WHERE eva.event_id = e.id
      ORDER BY eva.position
    ), '{}'::json[]
  ) as visual_artists

FROM events e;