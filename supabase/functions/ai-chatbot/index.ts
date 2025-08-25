import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface EventSearchParams {
  city?: string;
  category?: string;
  dateStart?: string;
  location?: string;
  priceRange?: { min: number; max: number };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory = [], userLocation } = await req.json();
    
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Mensagem é obrigatória' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY não configurada');
      return new Response(JSON.stringify({ error: 'Configuração da IA não encontrada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // System prompt especializado em eventos culturais
    const systemPrompt = `Você é um assistente especializado em eventos culturais brasileiros para a plataforma ROLÊ. 

INSTRUÇÕES PRINCIPAIS:
- Seja conversacional, amigável e use linguagem brasileira natural
- Ajude usuários a encontrar eventos culturais (shows, festas, exposições, teatro, etc.)
- Quando sugerir eventos, SEMPRE use a função search_events para buscar dados reais
- Considere a localização do usuário quando disponível
- Seja específico sobre datas, horários, preços quando disponível
- Se não encontrar eventos, sugira cidades próximas ou categorias similares

SOBRE A PLATAFORMA ROLÊ:
- Plataforma de descoberta de eventos culturais no Brasil
- Foca em cenas musicais, arte, cultura underground e mainstream
- Cobre principais cidades: São Paulo, Rio, Porto Alegre, Curitiba, Florianópolis
- Categorias: Música, Arte, Teatro, Dança, Literatura, Cinema, etc.

CONTEXTO CULTURAL:
- Entenda gírias e referências da cultura brasileira
- Reconheça estilos musicais brasileiros (samba, funk, bossa nova, sertanejo, etc.)
- Conheça festivais e eventos tradicionais brasileiros

FORMATO DE RESPOSTA:
- Seja conciso mas informativo
- Use emojis moderadamente para deixar mais amigável
- Inclua sempre links ou referências quando sugerir eventos específicos
- Se não conseguir ajudar, direcione para a busca manual na plataforma`;

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message }
    ];

    // Function to search events
    const searchEvents = async (params: EventSearchParams) => {
      console.log('Buscando eventos com parâmetros:', params);
      
      try {
        let query = supabase
          .from('events')
          .select(`
            id, title, description, date_start, date_end, city, state, 
            price_min, price_max, image_url, external_url,
            venues(name, address, lat, lng),
            organizers(name, site, instagram),
            categories(name, slug)
          `)
          .eq('status', 'active')
          .gte('date_start', new Date().toISOString())
          .order('date_start', { ascending: true })
          .limit(10);

        if (params.city) {
          query = query.ilike('city', `%${params.city}%`);
        }

        if (params.dateStart) {
          query = query.gte('date_start', params.dateStart);
        }

        if (params.priceRange) {
          query = query.lte('price_min', params.priceRange.max);
          if (params.priceRange.min > 0) {
            query = query.gte('price_max', params.priceRange.min);
          }
        }

        const { data: events, error } = await query;

        if (error) {
          console.error('Erro na busca de eventos:', error);
          return { events: [], error: error.message };
        }

        console.log(`Encontrados ${events?.length || 0} eventos`);
        return { events: events || [], error: null };
      } catch (error) {
        console.error('Erro na função de busca:', error);
        return { events: [], error: 'Erro interno na busca' };
      }
    };

    // OpenAI function calling configuration
    const tools = [
      {
        type: "function",
        function: {
          name: "search_events",
          description: "Busca eventos culturais na plataforma baseado em critérios específicos",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description: "Cidade para buscar eventos (ex: São Paulo, Rio de Janeiro)"
              },
              category: {
                type: "string", 
                description: "Categoria do evento (ex: música, arte, teatro)"
              },
              dateStart: {
                type: "string",
                description: "Data inicial para busca no formato ISO (ex: 2024-01-01)"
              },
              location: {
                type: "string",
                description: "Local específico ou região"
              },
              priceRange: {
                type: "object",
                properties: {
                  min: { type: "number", description: "Preço mínimo" },
                  max: { type: "number", description: "Preço máximo" }
                }
              }
            }
          }
        }
      }
    ];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        tools,
        tool_choice: 'auto',
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('Erro na API OpenAI:', errorText);
      return new Response(JSON.stringify({ error: 'Erro no serviço de IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await openAIResponse.json();
    console.log('Resposta da OpenAI:', JSON.stringify(aiData, null, 2));

    let finalResponse = '';
    let eventsData = null;
    
    // Check if AI wants to use function calling
    const firstChoice = aiData.choices[0];
    if (firstChoice.message.tool_calls) {
      console.log('AI solicitou busca de eventos');
      
      // Execute function calls
      for (const toolCall of firstChoice.message.tool_calls) {
        if (toolCall.function.name === 'search_events') {
          const params = JSON.parse(toolCall.function.arguments);
          const searchResult = await searchEvents(params);
          eventsData = searchResult.events;
          
          // Create a follow-up message with search results
          const contextMessage = `Encontrei ${eventsData.length} eventos. Dados: ${JSON.stringify(eventsData.slice(0, 5))}`;
          
          // Make another API call with the search results
          const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              messages: [
                ...messages,
                { role: 'assistant', content: `Vou buscar eventos para você.` },
                { role: 'system', content: contextMessage }
              ],
              max_tokens: 1000,
              temperature: 0.7,
            }),
          });

          const followUpData = await followUpResponse.json();
          finalResponse = followUpData.choices[0].message.content;
        }
      }
    } else {
      finalResponse = firstChoice.message.content;
    }

    return new Response(JSON.stringify({ 
      message: finalResponse,
      events: eventsData,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no chatbot:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});