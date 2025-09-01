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
  profileId: string;
  email: string;
  password: string;
  claimCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, email, password, claimCode }: LinkProfileRequest = await req.json();

    console.log('Link profile request:', { profileId, email, claimCode });

    // Verificar se o perfil existe e não está vinculado
    const { data: profile, error: profileError } = await supabase
      .from('entity_profiles')
      .select('*')
      .eq('id', profileId)
      .is('user_id', null)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found or already linked:', profileError);
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado ou já vinculado' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Se tem claim code, verificar se é válido (temporariamente aceitamos qualquer código)
    if (claimCode && claimCode !== profile.handle) {
      return new Response(
        JSON.stringify({ error: 'Código de reivindicação inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        profile_id: profileId,
        claimed_profile: true
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário: ' + authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Vincular perfil ao usuário
    const { error: updateError } = await supabase
      .from('entity_profiles')
      .update({ 
        user_id: authData.user.id,
        email: email,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (updateError) {
      console.error('Error linking profile:', updateError);
      // Tentar deletar o usuário criado se falhou a vinculação
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: 'Erro ao vincular perfil' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Profile linked successfully:', profileId, 'to user:', authData.user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user,
        profile: { ...profile, user_id: authData.user.id }
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