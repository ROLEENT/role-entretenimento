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
  keywords?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 AI Chatbot - Recebendo requisição...');
    
    const { message, chatHistory = [], userLocation } = await req.json();
    
    console.log('📝 Mensagem:', message);
    console.log('📍 Localização:', userLocation);
    
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Mensagem é obrigatória' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('🔑 OpenAI Key disponível:', !!openAIApiKey);
    
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return new Response(JSON.stringify({ error: 'Configuração da IA não encontrada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // System prompt simplificado
    const systemPrompt = `Você é um assistente especializado em eventos culturais brasileiros para a plataforma ROLÊ.

Características:
- Seja conversacional, amigável e use linguagem brasileira natural
- Ajude usuários a encontrar eventos culturais (shows, festas, exposições, teatro, etc.)
- Use a função search_events para buscar dados reais quando apropriado
- Foca em cidades brasileiras: São Paulo, Rio, Porto Alegre, Curitiba, Florianópolis
- Use emojis moderadamente para deixar mais amigável

Se o usuário perguntar sobre eventos, use a função search_events para encontrar eventos reais.`;

    // Function to search events (simplificada)
    const searchEvents = async (params: EventSearchParams) => {
      console.log('🔍 Buscando eventos com parâmetros:', params);
      
      try {
        let query = supabase
          .from('events')
          .select(`
            id, title, description, date_start, date_end, city, state, 
            price_min, price_max, image_url, external_url
          `)
          .eq('status', 'active')
          .gte('date_start', new Date().toISOString())
          .order('date_start', { ascending: true })
          .limit(6);

        if (params.city) {
          query = query.ilike('city', `%${params.city}%`);
        }

        if (params.keywords) {
          query = query.or(`title.ilike.%${params.keywords}%,description.ilike.%${params.keywords}%`);
        }

        const { data: events, error } = await query;

        if (error) {
          console.error('❌ Erro na busca de eventos:', error);
          return [];
        }

        console.log(`✅ Encontrados ${events?.length || 0} eventos`);
        return events || [];
      } catch (error) {
        console.error('❌ Erro na função de busca:', error);
        return [];
      }
    };

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message }
    ];

    // OpenAI function calling configuration
    const tools = [
      {
        type: "function",
        function: {
          name: "search_events",
          description: "Busca eventos culturais na plataforma",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description: "Cidade para buscar eventos"
              },
              keywords: {
                type: "string", 
                description: "Palavras-chave para buscar eventos"
              }
            }
          }
        }
      }
    ];

    // Call OpenAI API
    console.log('🚀 Chamando OpenAI...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages,
        tools,
        tool_choice: 'auto',
        max_completion_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('❌ Erro na API OpenAI:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Erro no serviço de IA',
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await openAIResponse.json();
    console.log('✅ Resposta OpenAI recebida');

    let finalResponse = '';
    let eventsData = [];
    
    // Check if AI wants to use function calling
    const firstChoice = aiData.choices[0];
    if (firstChoice.message.tool_calls) {
      console.log('🔍 AI solicitou busca de eventos');
      
      // Execute function calls
      for (const toolCall of firstChoice.message.tool_calls) {
        if (toolCall.function.name === 'search_events') {
          const params = JSON.parse(toolCall.function.arguments);
          console.log('📋 Argumentos da busca:', params);
          
          eventsData = await searchEvents(params);
          
          // Build response with events
          if (eventsData.length > 0) {
            finalResponse = `Encontrei ${eventsData.length} eventos interessantes para você! 🎉\n\n`;
            finalResponse += 'Aqui estão os destaques:\n\n';
            eventsData.forEach((event: any, index: number) => {
              finalResponse += `${index + 1}. **${event.title}**\n`;
              finalResponse += `📍 ${event.city}, ${event.state}\n`;
              finalResponse += `📅 ${new Date(event.date_start).toLocaleDateString('pt-BR')}\n`;
              if (event.price_min && event.price_max) {
                finalResponse += `💰 R$ ${event.price_min} - R$ ${event.price_max}\n`;
              }
              finalResponse += '\n';
            });
          } else {
            finalResponse = 'Não encontrei eventos específicos para sua busca, mas há muitas opções incríveis rolando! 🎭\n\n';
            finalResponse += 'Que tal me dizer uma cidade específica ou tipo de evento que você curte? ';
            finalResponse += 'Posso te ajudar a encontrar shows, teatro, exposições e muito mais! 🎵🎨';
          }
        }
      }
    } else {
      finalResponse = firstChoice.message.content;
      console.log('💬 Resposta direta (sem busca)');
    }

    return new Response(JSON.stringify({ 
      message: finalResponse,
      events: eventsData,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro no chatbot:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});