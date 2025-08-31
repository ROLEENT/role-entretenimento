import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface JobApplication {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  motivation: string;
  resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  availability: string;
  salary_expectation?: string;
}

async function saveJobApplication(applicationData: JobApplication) {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      name: applicationData.name,
      email: applicationData.email,
      phone: applicationData.phone,
      position: applicationData.position,
      experience: applicationData.experience,
      motivation: applicationData.motivation,
      resume_url: applicationData.resume_url,
      portfolio_url: applicationData.portfolio_url,
      linkedin_url: applicationData.linkedin_url,
      availability: applicationData.availability,
      salary_expectation: applicationData.salary_expectation,
      status: 'pending',
      applied_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving job application:', error);
    throw error;
  }

  return data;
}

async function sendApplicationNotification(applicationData: JobApplication) {
  // Here you would integrate with your email service
  // For now, we'll just log the notification
  console.log('New job application received:', {
    name: applicationData.name,
    email: applicationData.email,
    position: applicationData.position,
    timestamp: new Date().toISOString()
  });
}

async function sendConfirmationEmail(email: string, name: string) {
  // Here you would send a confirmation email to the applicant
  console.log('Sending application confirmation to:', {
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

    const applicationData: JobApplication = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'position', 'experience', 'motivation', 'availability'];
    for (const field of requiredFields) {
      if (!applicationData[field as keyof JobApplication]) {
        return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicationData.email)) {
      return new Response(JSON.stringify({ error: 'Formato de email inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Save application
    const application = await saveJobApplication(applicationData);
    
    // Send notifications (async, don't wait)
    Promise.all([
      sendApplicationNotification(applicationData),
      sendConfirmationEmail(applicationData.email, applicationData.name)
    ]).catch(error => {
      console.error('Error sending notification emails:', error);
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Candidatura enviada com sucesso!',
      id: application.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in forms-apply function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível enviar a candidatura. Tente novamente.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});