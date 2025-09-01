import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface LinkProfileRequest {
  handle: string;
  email: string;
  password: string;
  claimCode?: string;
  verificationMethod?: 'email' | 'phone' | 'document';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { handle, email, password, claimCode, verificationMethod = 'email' }: LinkProfileRequest = await req.json();

    console.log('Link profile request:', { handle, email, claimCode, verificationMethod });

    // Find profile by handle
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('handle', handle)
      .is('user_id', null)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found or already linked:', profileError);
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado ou já vinculado' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate claim code
    if (claimCode && claimCode !== handle) {
      return new Response(
        JSON.stringify({ error: 'Código de reivindicação inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create claim request
    const { data: claimRequest, error: claimError } = await supabase
      .from('profile_claim_requests')
      .insert({
        profile_user_id: profile.user_id,
        requester_email: email,
        verification_code: verificationCode,
        verification_method: verificationMethod,
        verification_data: { handle, requested_at: new Date().toISOString() }
      })
      .select()
      .single();

    if (claimError) {
      console.error('Error creating claim request:', claimError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar solicitação de reivindicação' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        profile_handle: handle,
        claimed_profile: true,
        verification_code: verificationCode
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário: ' + authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Update profile with new user_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        user_id: authData.user.id,
        email: email,
        updated_at: new Date().toISOString()
      })
      .eq('handle', handle);

    if (updateError) {
      console.error('Error linking profile:', updateError);
      // Clean up user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao vincular perfil' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create admin notification
    await supabase
      .from('admin_notifications')
      .insert({
        type: 'profile_claim',
        title: 'Nova reivindicação de perfil',
        message: `Usuário ${email} reivindicou o perfil @${handle}`,
        data: {
          profile_handle: handle,
          user_email: email,
          user_id: authData.user.id,
          verification_code: verificationCode
        },
        priority: 'normal'
      });

    console.log('Profile claimed successfully:', handle, 'by user:', authData.user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user,
        profile: { ...profile, user_id: authData.user.id },
        verification_code: verificationCode,
        message: 'Perfil reivindicado com sucesso! Aguarde aprovação dos administradores.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in link-profile function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);