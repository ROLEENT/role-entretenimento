import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting data restoration process...')

    // Criar backup pré-restauração
    console.log('Creating pre-restoration backups...')
    await supabase.rpc('create_table_backup', {
      p_table_name: 'artists',
      p_backup_type: 'pre_restore',
      p_created_by: 'system',
      p_notes: 'Backup before lost data restoration'
    })

    await supabase.rpc('create_table_backup', {
      p_table_name: 'organizers',
      p_backup_type: 'pre_restore',
      p_created_by: 'system',
      p_notes: 'Backup before lost data restoration'
    })

    await supabase.rpc('create_table_backup', {
      p_table_name: 'venues',
      p_backup_type: 'pre_restore',
      p_created_by: 'system',
      p_notes: 'Backup before lost data restoration'
    })

    // Recuperar dados perdidos do audit log
    const { data: deletedRecords, error: auditError } = await supabase
      .from('admin_audit_log')
      .select('*')
      .eq('action', 'DELETE')
      .in('table_name', ['artists', 'organizers', 'venues'])

    if (auditError) {
      console.error('Error fetching audit log:', auditError)
      throw auditError
    }

    console.log(`Found ${deletedRecords?.length || 0} deleted records`)

    let restoredArtists = 0
    let restoredOrganizers = 0
    let restoredVenues = 0

    // Processar cada registro deletado
    for (const record of deletedRecords || []) {
      const oldValues = record.old_values
      
      if (!oldValues || !oldValues.id) {
        console.log(`Skipping record without valid data: ${record.id}`)
        continue
      }

      try {
        if (record.table_name === 'artists') {
          // Verificar se já existe
          const { data: existing } = await supabase
            .from('artists')
            .select('id')
            .eq('id', oldValues.id)
            .single()

          if (!existing) {
            // Mapear campos para estrutura atual
            const artistData = {
              id: oldValues.id,
              stage_name: oldValues.stage_name || oldValues.name,
              artist_type: oldValues.artist_type || 'artist',
              city: oldValues.city,
              instagram: oldValues.instagram,
              booking_email: oldValues.booking_email || oldValues.email,
              booking_whatsapp: oldValues.booking_whatsapp || oldValues.whatsapp,
              bio_short: oldValues.bio_short || oldValues.bio,
              profile_image_url: oldValues.profile_image_url || oldValues.avatar_url,
              slug: oldValues.slug,
              bio_long: oldValues.bio_long,
              real_name: oldValues.real_name,
              pronouns: oldValues.pronouns,
              home_city: oldValues.home_city,
              fee_range: oldValues.fee_range,
              website_url: oldValues.website_url || oldValues.website,
              spotify_url: oldValues.spotify_url,
              soundcloud_url: oldValues.soundcloud_url,
              youtube_url: oldValues.youtube_url,
              beatport_url: oldValues.beatport_url,
              audius_url: oldValues.audius_url,
              responsible_name: oldValues.responsible_name,
              responsible_role: oldValues.responsible_role,
              image_credits: oldValues.image_credits,
              cover_image_url: oldValues.cover_image_url,
              accommodation_notes: oldValues.accommodation_notes,
              tech_rider_url: oldValues.tech_rider_url,
              presskit_url: oldValues.presskit_url,
              show_format: oldValues.show_format,
              team_size: oldValues.team_size,
              set_time_minutes: oldValues.set_time_minutes,
              tech_stage: oldValues.tech_stage,
              tech_audio: oldValues.tech_audio,
              tech_light: oldValues.tech_light,
              internal_notes: oldValues.internal_notes,
              cities_active: oldValues.cities_active || [],
              availability_days: oldValues.availability_days || [],
              priority: oldValues.priority || 0,
              status: oldValues.status || 'active',
              image_rights_authorized: oldValues.image_rights_authorized || false,
              created_at: oldValues.created_at,
              updated_at: oldValues.updated_at
            }

            const { error: insertError } = await supabase
              .from('artists')
              .insert([artistData])

            if (insertError) {
              console.error(`Error restoring artist ${oldValues.stage_name}:`, insertError)
            } else {
              console.log(`Restored artist: ${oldValues.stage_name}`)
              restoredArtists++
            }
          }
        }

        if (record.table_name === 'organizers') {
          const { data: existing } = await supabase
            .from('organizers')
            .select('id')
            .eq('id', oldValues.id)
            .single()

          if (!existing) {
            const organizerData = {
              id: oldValues.id,
              name: oldValues.name,
              contact_email: oldValues.contact_email || oldValues.email,
              site: oldValues.site || oldValues.website,
              instagram: oldValues.instagram,
              bio: oldValues.bio,
              city: oldValues.city,
              phone: oldValues.phone,
              whatsapp: oldValues.whatsapp,
              avatar_url: oldValues.avatar_url,
              cover_url: oldValues.cover_url,
              created_at: oldValues.created_at,
              updated_at: oldValues.updated_at
            }

            const { error: insertError } = await supabase
              .from('organizers')
              .insert([organizerData])

            if (insertError) {
              console.error(`Error restoring organizer ${oldValues.name}:`, insertError)
            } else {
              console.log(`Restored organizer: ${oldValues.name}`)
              restoredOrganizers++
            }
          }
        }

        if (record.table_name === 'venues') {
          const { data: existing } = await supabase
            .from('venues')
            .select('id')
            .eq('id', oldValues.id)
            .single()

          if (!existing) {
            const venueData = {
              id: oldValues.id,
              name: oldValues.name,
              address: oldValues.address,
              city: oldValues.city,
              state: oldValues.state,
              country: oldValues.country || 'Brasil',
              latitude: oldValues.latitude,
              longitude: oldValues.longitude,
              capacity: oldValues.capacity,
              website: oldValues.website,
              instagram: oldValues.instagram,
              phone: oldValues.phone,
              email: oldValues.email,
              description: oldValues.description,
              image_url: oldValues.image_url,
              cover_url: oldValues.cover_url,
              accessibility_features: oldValues.accessibility_features || [],
              venue_types: oldValues.venue_types || [],
              amenities: oldValues.amenities || [],
              status: oldValues.status || 'active',
              created_at: oldValues.created_at,
              updated_at: oldValues.updated_at
            }

            const { error: insertError } = await supabase
              .from('venues')
              .insert([venueData])

            if (insertError) {
              console.error(`Error restoring venue ${oldValues.name}:`, insertError)
            } else {
              console.log(`Restored venue: ${oldValues.name}`)
              restoredVenues++
            }
          }
        }

      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error)
      }
    }

    const summary = {
      success: true,
      totalProcessed: deletedRecords?.length || 0,
      restored: {
        artists: restoredArtists,
        organizers: restoredOrganizers,
        venues: restoredVenues
      },
      message: `Successfully restored ${restoredArtists + restoredOrganizers + restoredVenues} records`
    }

    console.log('Restoration completed:', summary)

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Restoration error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})