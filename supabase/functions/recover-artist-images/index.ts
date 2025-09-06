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

    console.log('Starting artist image recovery...')

    // Get all images from storage - try both buckets
    let storageFiles = []
    
    // Try artist-images bucket first
    const { data: artistImages } = await supabase.storage
      .from('artist-images')
      .list('', { limit: 100 })
    
    // Try artists bucket  
    const { data: artistsFiles } = await supabase.storage
      .from('artists')
      .list('', { limit: 100 })
    
    storageFiles = [...(artistImages || []), ...(artistsFiles || [])]
    
    if (storageFiles.length === 0) {
      throw new Error('No files found in storage buckets')
    }

    console.log(`Found ${storageFiles?.length || 0} files in storage`)

    // Get all artists
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, stage_name, created_at, updated_at, profile_image_url')
      .order('created_at', { ascending: true })

    if (artistsError) {
      console.error('Artists error:', artistsError)
      throw artistsError
    }

    console.log(`Found ${artists?.length || 0} artists`)

    const updates = []
    const artistImagesUrl = `${supabaseUrl}/storage/v1/object/public/artist-images`
    const artistsUrl = `${supabaseUrl}/storage/v1/object/public/artists`

    // Try to match images to artists
    for (const artist of artists || []) {
      // Skip if already has a non-placeholder image
      if (artist.profile_image_url && !artist.profile_image_url.includes('placeholder') && !artist.profile_image_url.includes('lovable-uploads')) {
        continue
      }

      // Find the most recent image file that could belong to this artist
      const potentialFile = storageFiles?.find(file => {
        const fileName = file.name.toLowerCase()
        const artistName = artist.stage_name?.toLowerCase() || ''
        
        // Try to match by artist name in filename
        if (artistName && fileName.includes(artistName.replace(/\s+/g, '-'))) {
          return true
        }
        
        // Match by timing - find images uploaded around the time this artist was created/updated
        const fileTime = new Date(file.created_at).getTime()
        const artistCreated = new Date(artist.created_at).getTime()
        const artistUpdated = new Date(artist.updated_at).getTime()
        
        const timeDiff = Math.min(
          Math.abs(fileTime - artistCreated),
          Math.abs(fileTime - artistUpdated)
        )
        
        // If uploaded within 1 hour of artist creation/update
        return timeDiff < 60 * 60 * 1000
      })

      if (potentialFile) {
        // Determine which bucket the file is from
        const isFromArtistImages = artistImages?.some(f => f.name === potentialFile.name)
        const imageUrl = isFromArtistImages 
          ? `${artistImagesUrl}/${potentialFile.name}`
          : `${artistsUrl}/${potentialFile.name}`
          
        updates.push({
          id: artist.id,
          profile_image_url: imageUrl,
          artist_name: artist.stage_name,
          matched_file: potentialFile.name,
          bucket: isFromArtistImages ? 'artist-images' : 'artists'
        })
        
        console.log(`Matched ${artist.stage_name} -> ${potentialFile.name} (${isFromArtistImages ? 'artist-images' : 'artists'})`)
      }
    }

    console.log(`Found ${updates.length} potential matches`)

    // Apply updates
    const results = []
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('artists')
        .update({ profile_image_url: update.profile_image_url })
        .eq('id', update.id)

      if (updateError) {
        console.error(`Failed to update ${update.artist_name}:`, updateError)
        results.push({ ...update, success: false, error: updateError.message })
      } else {
        results.push({ ...update, success: true })
        
        // Also update entity_profiles if exists
        await supabase
          .from('entity_profiles')
          .update({ avatar_url: update.profile_image_url })
          .eq('source_id', update.id)
          .eq('type', 'artista')
      }
    }

    console.log('Recovery completed:', results)

    return new Response(JSON.stringify({
      success: true,
      totalFiles: storageFiles?.length || 0,
      totalArtists: artists?.length || 0,
      matchesFound: updates.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Recovery error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})