import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function findOrphanedFiles(bucket: string): Promise<string[]> {
  try {
    console.log(`Checking for orphaned files in bucket: ${bucket}`);
    
    // Get all files from storage bucket
    const { data: files, error: storageError } = await supabase.storage
      .from(bucket)
      .list();

    if (storageError) {
      throw new Error(`Failed to list files: ${storageError.message}`);
    }

    if (!files || files.length === 0) {
      console.log(`No files found in bucket: ${bucket}`);
      return [];
    }

    console.log(`Found ${files.length} files in bucket: ${bucket}`);

    // For each bucket, check different tables for references
    const orphanedFiles: string[] = [];
    
    for (const file of files) {
      const publicUrl = supabase.storage.from(bucket).getPublicUrl(file.name).data.publicUrl;
      let isReferenced = false;

      // Check different tables based on bucket
      switch (bucket) {
        case 'highlights':
          const { data: highlights } = await supabase
            .from('highlights')
            .select('cover_url')
            .eq('cover_url', publicUrl);
          isReferenced = highlights && highlights.length > 0;
          break;
          
        case 'agenda-images':
          const { data: agenda } = await supabase
            .from('agenda_itens')
            .select('cover_url')
            .eq('cover_url', publicUrl);
          isReferenced = agenda && agenda.length > 0;
          break;
          
        case 'artist-images':
          const { data: artists } = await supabase
            .from('artists')
            .select('profile_image_url, cover_image_url')
            .or(`profile_image_url.eq.${publicUrl},cover_image_url.eq.${publicUrl}`);
          isReferenced = artists && artists.length > 0;
          break;
          
        case 'blog-images':
          const { data: posts } = await supabase
            .from('blog_posts')
            .select('cover_image')
            .eq('cover_image', publicUrl);
          isReferenced = posts && posts.length > 0;
          break;
          
        default:
          console.log(`Unknown bucket: ${bucket}, skipping reference check`);
          isReferenced = true; // Don't delete from unknown buckets
      }

      if (!isReferenced) {
        orphanedFiles.push(file.name);
      }
    }

    console.log(`Found ${orphanedFiles.length} orphaned files in ${bucket}`);
    return orphanedFiles;
    
  } catch (error) {
    console.error(`Error finding orphaned files in ${bucket}:`, error);
    throw error;
  }
}

async function cleanupOrphanedFiles(bucket: string, files: string[], dryRun: boolean = true): Promise<any> {
  if (files.length === 0) {
    return { message: `No orphaned files found in ${bucket}` };
  }

  if (dryRun) {
    return {
      message: `Found ${files.length} orphaned files in ${bucket} (dry run)`,
      files: files,
      bucket: bucket
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(files);

    if (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }

    return {
      message: `Successfully deleted ${files.length} orphaned files from ${bucket}`,
      deletedFiles: data,
      bucket: bucket
    };
  } catch (error) {
    console.error(`Error cleaning up files in ${bucket}:`, error);
    throw error;
  }
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

    const { bucket, dryRun = true } = await req.json();

    if (!bucket) {
      return new Response(
        JSON.stringify({ error: 'bucket parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting cleanup for bucket: ${bucket}, dryRun: ${dryRun}`);

    // Find orphaned files
    const orphanedFiles = await findOrphanedFiles(bucket);
    
    // Clean up or report
    const result = await cleanupOrphanedFiles(bucket, orphanedFiles, dryRun);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in storage-cleaner function:', error);
    
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