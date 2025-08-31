import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageProcessRequest {
  imageUrl: string;
  operations: {
    resize?: { width: number; height: number; quality?: number };
    crop?: { x: number; y: number; width: number; height: number };
    format?: 'jpeg' | 'png' | 'webp';
    watermark?: { text: string; position: string };
  }[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function processImage(imageUrl: string, operations: any[]): Promise<Response> {
  try {
    // For now, we'll return the original image
    // In production, you would integrate with image processing services like:
    // - Cloudinary
    // - ImageKit
    // - Sharp (if running on server)
    // - Or use Supabase Storage transformations when available
    
    console.log('Processing image:', imageUrl);
    console.log('Operations:', operations);
    
    // Placeholder: return original image
    const response = await fetch(imageUrl);
    const imageData = await response.arrayBuffer();
    
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1 year
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

async function logImageOperation(operation: string, details: any) {
  try {
    await supabase.from('image_processing_log').insert({
      operation,
      details,
      processed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log operation:', error);
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

    const { imageUrl, operations }: ImageProcessRequest = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate image URL is from our storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!imageUrl.includes(supabaseUrl)) {
      return new Response(
        JSON.stringify({ error: 'Invalid image URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the operation
    await logImageOperation('process', { imageUrl, operations });

    // Process the image
    const processedImage = await processImage(imageUrl, operations);
    
    return processedImage;

  } catch (error) {
    console.error('Error in image-processor function:', error);
    
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