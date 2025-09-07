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

    console.log('Starting daily backup process...')

    const tablesToBackup = ['artists', 'organizers', 'venues', 'events', 'agenda_itens']
    const backupResults = []

    for (const tableName of tablesToBackup) {
      try {
        console.log(`Creating backup for table: ${tableName}`)
        
        const { data: backupId, error } = await supabase.rpc('create_table_backup', {
          p_table_name: tableName,
          p_backup_type: 'daily',
          p_created_by: 'cron',
          p_notes: `Daily automated backup - ${new Date().toISOString().split('T')[0]}`
        })

        if (error) {
          console.error(`Error backing up ${tableName}:`, error)
          backupResults.push({
            table: tableName,
            success: false,
            error: error.message
          })
        } else {
          console.log(`Successfully backed up ${tableName} with ID: ${backupId}`)
          backupResults.push({
            table: tableName,
            success: true,
            backupId: backupId
          })
        }
      } catch (error) {
        console.error(`Exception backing up ${tableName}:`, error)
        backupResults.push({
          table: tableName,
          success: false,
          error: error.message
        })
      }
    }

    // Limpar backups antigos (manter apenas os últimos 7 dias)
    try {
      console.log('Cleaning up old backups...')
      const { error: cleanupError } = await supabase
        .from('system_backups')
        .delete()
        .eq('backup_type', 'daily')
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (cleanupError) {
        console.error('Error cleaning up old backups:', cleanupError)
      } else {
        console.log('Successfully cleaned up old backups')
      }
    } catch (error) {
      console.error('Exception during cleanup:', error)
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      tablesProcessed: tablesToBackup.length,
      results: backupResults,
      successCount: backupResults.filter(r => r.success).length,
      errorCount: backupResults.filter(r => !r.success).length
    }

    console.log('Daily backup completed:', summary)

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Daily backup error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})