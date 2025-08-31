import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const backupId = url.searchParams.get('backup_id');
    const adminEmail = req.headers.get('x-admin-email');

    if (!backupId || !adminEmail) {
      return new Response(
        JSON.stringify({ error: 'backup_id and admin email are required' }),
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
      .eq('email', adminEmail)
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

    // Get backup metadata
    const { data: backup, error: backupError } = await supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', backupId)
      .eq('status', 'completed')
      .single();

    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: 'Backup not found or not completed' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Download backup file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('backups')
      .download(backup.filename);

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download backup file' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return file for download
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${backup.filename}"`,
        'Content-Length': backup.file_size?.toString() || '0'
      }
    });

  } catch (error) {
    console.error('Error in download-backup function:', error);
    
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