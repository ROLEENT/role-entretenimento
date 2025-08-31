import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface NewsletterSignup {
  email: string;
  name?: string;
  interests?: string[];
  source?: string;
}

async function saveNewsletterSignup(signupData: NewsletterSignup) {
  // Check if email already exists
  const { data: existing, error: checkError } = await supabase
    .from('newsletter_subscribers')
    .select('id, is_active')
    .eq('email', signupData.email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
    throw checkError;
  }

  if (existing) {
    if (existing.is_active) {
      throw new Error('Email já está cadastrado na newsletter');
    } else {
      // Reactivate existing subscription
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: true,
          name: signupData.name,
          interests: signupData.interests || [],
          source: signupData.source,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Create new subscription
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email: signupData.email,
      name: signupData.name,
      interests: signupData.interests || [],
      source: signupData.source || 'website',
      is_active: true,
      subscribed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function sendWelcomeEmail(email: string, name?: string) {
  // Here you would integrate with your email service
  // For now, we'll just log the welcome email
  console.log('Sending welcome email to:', {
    email,
    name,
    timestamp: new Date().toISOString()
  });
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

    const signupData: NewsletterSignup = await req.json();
    
    // Validate required fields
    if (!signupData.email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      return new Response(JSON.stringify({ error: 'Formato de email inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Save subscription
    const subscription = await saveNewsletterSignup(signupData);
    
    // Send welcome email (async, don't wait)
    sendWelcomeEmail(signupData.email, signupData.name).catch(error => {
      console.error('Error sending welcome email:', error);
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Inscrição realizada com sucesso!',
      id: subscription.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in forms-newsletter function:', error);
    
    if (error.message === 'Email já está cadastrado na newsletter') {
      return new Response(JSON.stringify({ 
        error: error.message
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível realizar a inscrição. Tente novamente.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});