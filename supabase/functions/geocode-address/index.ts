import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeocodeRequest {
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

interface GeocodeResponse {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, city, state, country = "Brasil" }: GeocodeRequest = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Build full address for geocoding
    const fullAddress = [address, city, state, country].filter(Boolean).join(", ");
    
    // Use Nominatim (OpenStreetMap) for geocoding - free and reliable
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=br`;
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'ROLÊ Events Platform (contact@example.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Address not found",
          message: "Não foi possível encontrar as coordenadas para este endereço" 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const result = data[0];
    const geocodeResult: GeocodeResponse = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formatted_address: result.display_name
    };

    return new Response(
      JSON.stringify(geocodeResult),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in geocode-address function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Erro interno do servidor ao fazer geocoding" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);