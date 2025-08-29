import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString()
    
    console.log(`[${now}] Starting agenda scheduler execution`)

    // Publish items with publish_at <= now and status='draft'
    const { data: itemsToPublish, error: publishError } = await supabase
      .from('agenda_itens')
      .update({
        status: 'published',
        updated_at: now,
        updated_by: null // Sistema automático
      })
      .lte('publish_at', now)
      .eq('status', 'draft')
      .is('deleted_at', null)
      .select('id, title, slug')

    if (publishError) {
      console.error('Error publishing items:', publishError)
    } else if (itemsToPublish && itemsToPublish.length > 0) {
      console.log(`Published ${itemsToPublish.length} items:`, itemsToPublish.map(item => `${item.title} (${item.slug})`).join(', '))
    }

    // Unpublish items with unpublish_at <= now and status='published'
    const { data: itemsToUnpublish, error: unpublishError } = await supabase
      .from('agenda_itens')
      .update({
        status: 'draft',
        updated_at: now,
        updated_by: null // Sistema automático
      })
      .lte('unpublish_at', now)
      .eq('status', 'published')
      .is('deleted_at', null)
      .select('id, title, slug')

    if (unpublishError) {
      console.error('Error unpublishing items:', unpublishError)
    } else if (itemsToUnpublish && itemsToUnpublish.length > 0) {
      console.log(`Unpublished ${itemsToUnpublish.length} items:`, itemsToUnpublish.map(item => `${item.title} (${item.slug})`).join(', '))
    }

    const publishedCount = itemsToPublish?.length || 0
    const unpublishedCount = itemsToUnpublish?.length || 0
    const totalProcessed = publishedCount + unpublishedCount

    console.log(`[${now}] Agenda scheduler completed: ${publishedCount} published, ${unpublishedCount} unpublished, ${totalProcessed} total processed`)

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now,
        published: publishedCount,
        unpublished: unpublishedCount,
        total: totalProcessed
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Agenda scheduler error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})