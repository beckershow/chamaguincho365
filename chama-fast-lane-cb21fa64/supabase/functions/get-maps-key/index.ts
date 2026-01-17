import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// List of allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://8394645f-ec77-44b6-bc2c-5b081e651ca3.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if the origin is in our allowed list
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow GET and POST requests (Supabase client uses POST by default)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
  }

  try {
    // Validate origin is from allowed domains
    const isValidOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
      origin === allowed || origin.endsWith('.lovableproject.com')
    );
    
    if (!isValidOrigin) {
      console.warn(`Blocked request from unauthorized origin: ${origin}`);
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Note: The Google Maps API key should have HTTP referrer restrictions 
    // configured in Google Cloud Console to prevent abuse even if this 
    // endpoint is compromised. This is Google's recommended security approach.
    
    return new Response(
      JSON.stringify({ apiKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
