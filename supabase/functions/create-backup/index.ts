import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CreateBackupRequest {
  backup_type: 'full' | 'config';
  admin_email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { backup_type, admin_email }: CreateBackupRequest = await req.json();

    if (!backup_type || !admin_email) {
      return new Response(
        JSON.stringify({ error: 'backup_type and admin_email are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify admin access
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', admin_email)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting ${backup_type} backup for admin: ${admin_email}`);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${backup_type}_${timestamp}.sql`;

    // Create backup metadata record
    const { data: backupRecord, error: metadataError } = await supabase
      .from('backup_metadata')
      .insert({
        filename,
        backup_type,
        status: 'running',
        admin_email
      })
      .select()
      .single();

    if (metadataError) {
      console.error('Error creating backup metadata:', metadataError);
      throw new Error('Failed to create backup metadata');
    }

    // Start background backup process
    EdgeRuntime.waitUntil(performBackup(backupRecord.id, backup_type, filename));

    return new Response(
      JSON.stringify({ 
        message: 'Backup initiated successfully',
        backup_id: backupRecord.id,
        filename,
        status: 'running'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in create-backup function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function performBackup(backupId: string, backupType: string, filename: string) {
  try {
    console.log(`Performing ${backupType} backup: ${filename}`);

    // Get tables to backup based on type
    const tablesToBackup = getTablesByBackupType(backupType);
    
    let backupData = '';
    let totalSize = 0;

    // Generate SQL backup
    backupData += `-- Backup created at ${new Date().toISOString()}\n`;
    backupData += `-- Backup type: ${backupType}\n\n`;

    for (const table of tablesToBackup) {
      try {
        // Get table structure and data
        const { data: tableData, error } = await supabase
          .from(table)
          .select('*');

        if (error) {
          console.error(`Error backing up table ${table}:`, error);
          continue;
        }

        if (tableData && tableData.length > 0) {
          backupData += `-- Table: ${table}\n`;
          backupData += `TRUNCATE TABLE public.${table} CASCADE;\n`;
          
          // Insert statements
          for (const row of tableData) {
            const columns = Object.keys(row).join(', ');
            const values = Object.values(row)
              .map(val => {
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return val;
              })
              .join(', ');
            
            backupData += `INSERT INTO public.${table} (${columns}) VALUES (${values});\n`;
          }
          backupData += '\n';
        }
      } catch (tableError) {
        console.error(`Error processing table ${table}:`, tableError);
      }
    }

    totalSize = new Blob([backupData]).size;

    // Store backup in Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('backups')
      .upload(filename, backupData, {
        contentType: 'application/sql',
        upsert: false
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      // Update backup status to failed
      await supabase
        .from('backup_metadata')
        .update({
          status: 'failed',
          error_message: `Storage error: ${storageError.message}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', backupId);
      return;
    }

    // Update backup metadata to completed
    const { error: updateError } = await supabase
      .from('backup_metadata')
      .update({
        status: 'completed',
        file_size: totalSize,
        completed_at: new Date().toISOString()
      })
      .eq('id', backupId);

    if (updateError) {
      console.error('Error updating backup metadata:', updateError);
    }

    console.log(`Backup completed successfully: ${filename} (${totalSize} bytes)`);

  } catch (error) {
    console.error('Error in performBackup:', error);
    
    // Update backup status to failed
    await supabase
      .from('backup_metadata')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', backupId);
  }
}

function getTablesByBackupType(backupType: string): string[] {
  if (backupType === 'full') {
    return [
      'admin_users',
      'approved_admins',
      'agenda_itens',
      'agenda_cities',
      'agenda_item_artists',
      'agenda_media',
      'agenda_occurrences',
      'agenda_ticket_tiers',
      'artists',
      'artist_types',
      'artists_artist_types',
      'artists_genres',
      'organizers',
      'venues',
      'partners',
      'categories',
      'blog_posts',
      'blog_post_categories',
      'highlights',
      'advertisements',
      'genres',
      'profiles',
      'badges',
      'applications',
      'backup_metadata'
    ];
  } else if (backupType === 'config') {
    return [
      'categories',
      'artist_types',
      'genres',
      'advertisements',
      'badges'
    ];
  }
  
  return [];
}