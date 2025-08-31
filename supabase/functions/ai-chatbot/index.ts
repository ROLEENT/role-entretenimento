import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatbotRequest {
  message: string;
  history: ChatMessage[];
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

async function getRelevantEvents(location?: { latitude: number; longitude: number; city?: string }) {
  try {
    let query = supabase
      .from('events')
      .select('id, title, description, date_start, city, venue_name')
      .eq('status', 'active')
      .gte('date_start', new Date().toISOString())
      .order('date_start')
      .limit(10);

    if (location?.city) {
      query = query.ilike('city', `%${location.city}%`);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return events || [];
  } catch (error) {
    console.error('Error in getRelevantEvents:', error);
    return [];
  }
}

async function getSystemPrompt(location?: { latitude: number; longitude: number; city?: string }) {
  const events = await getRelevantEvents(location);
  
  const eventsContext = events.length > 0 ? 
    `Eventos próximos disponíveis:\n${events.map(e => 
      `- ${e.title} em ${e.city} (${e.venue_name}) - ${new Date(e.date_start).toLocaleDateString('pt-BR')}`
    ).join('\n')}` : 
    'Nenhum evento próximo encontrado na região.';

  return `Você é um assistente virtual especializado em eventos de música eletrônica. Sua função é ajudar usuários a descobrir eventos, artistas e informações relacionadas à cena eletrônica.

Características:
- Seja amigável, empolgado e conhecedor da cultura eletrônica
- Forneça informações precisas sobre eventos, artistas e locais
- Sugira eventos baseados na localização e preferências do usuário
- Use linguagem jovem e descontraída, mas sempre profissional
- Seja conciso mas informativo

${eventsContext}

Sempre que relevante, mencione eventos específicos da lista acima. Se o usuário perguntar sobre eventos em uma cidade específica, foque nos eventos dessa região.`;
}

async function generateResponse(request: ChatbotRequest): Promise<string> {
  if (!openAIApiKey) {
    return 'Desculpe, o serviço de chatbot está temporariamente indisponível.';
  }

  const systemPrompt = await getSystemPrompt(request.location);
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...request.history.slice(-6), // Keep last 6 messages for context
    { role: 'user', content: request.message }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return 'Desculpe, não consegui processar sua mensagem no momento. Tente novamente.';
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.';
  }
}

async function logChatInteraction(message: string, response: string, location?: any) {
  try {
    await supabase
      .from('chatbot_interactions')
      .insert({
        user_message: message,
        bot_response: response,
        location: location,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData: ChatbotRequest = await req.json();
    
    if (!requestData.message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await generateResponse(requestData);
    
    // Log interaction (async, don't wait)
    logChatInteraction(requestData.message, response, requestData.location).catch(console.error);
    
    return new Response(JSON.stringify({ 
      response,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in ai-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      response: 'Desculpe, ocorreu um erro interno. Tente novamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});