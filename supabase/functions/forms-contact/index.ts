import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

async function saveContactForm(formData: ContactFormData) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      status: 'pending',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving contact form:', error);
    throw error;
  }

  return data;
}

async function sendNotificationEmail(formData: ContactFormData) {
  // Here you would integrate with your email service
  // For now, we'll just log the notification
  console.log('New contact form submission:', {
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
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

    const formData: ContactFormData = await req.json();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Save to database
    const submission = await saveContactForm(formData);
    
    // Send notification (async, don't wait)
    sendNotificationEmail(formData).catch(error => {
      console.error('Error sending notification email:', error);
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Mensagem enviada com sucesso!',
      id: submission.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in forms-contact function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível enviar a mensagem. Tente novamente.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});