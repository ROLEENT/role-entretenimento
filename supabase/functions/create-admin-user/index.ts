import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função de validação de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função de validação de senha
function isValidPassword(password: string): boolean {
  return password && password.length >= 8
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password } = await req.json()

    // Etapa 1: Validação de entrada
    console.log(`[CREATE-ADMIN-USER] Iniciando processo para email: ${email}`)
    
    if (!email || !isValidEmail(email)) {
      console.error('[CREATE-ADMIN-USER] Email inválido:', email)
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!password || !isValidPassword(password)) {
      console.error('[CREATE-ADMIN-USER] Senha inválida - deve ter pelo menos 8 caracteres')
      return new Response(
        JSON.stringify({ error: 'Senha deve ter pelo menos 8 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Etapa 2: Verificação de estado atual
    console.log('[CREATE-ADMIN-USER] Verificando estado atual...')
    
    // Verificar se usuário existe em auth.users
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
    const authUserExists = existingAuthUser?.users?.find(u => u.email === email)
    console.log(`[CREATE-ADMIN-USER] Usuário existe em auth.users: ${!!authUserExists}`)

    // Verificar se registro existe em admin_users
    const { data: adminUserData, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()
    
    const adminUserExists = adminUserData && !adminCheckError
    console.log(`[CREATE-ADMIN-USER] Usuário existe em admin_users: ${!!adminUserExists}`)

    // Etapa 3: Sincronização inteligente
    let authUser = authUserExists
    let shouldCreateAdminRecord = !adminUserExists
    let scenario = ''

    if (authUserExists && adminUserExists) {
      // Cenário A: Usuário existe em ambas tabelas
      scenario = 'A - Ambas tabelas'
      console.log('[CREATE-ADMIN-USER] Cenário A: Atualizando timestamps')
      
      const { error: updateError } = await supabaseAdmin
        .from('admin_users')
        .update({ 
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        })
        .eq('email', email)

      if (updateError) {
        console.error('[CREATE-ADMIN-USER] Erro ao atualizar admin_users:', updateError)
      }

    } else if (!authUserExists && adminUserExists) {
      // Cenário B: Usuário existe só em admin_users
      scenario = 'B - Só admin_users'
      console.log('[CREATE-ADMIN-USER] Cenário B: Criando em auth.users')
      
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: adminUserData.full_name || 'Admin User'
        }
      })

      if (authError) {
        console.error('[CREATE-ADMIN-USER] Erro ao criar auth.users:', authError)
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      authUser = newAuthUser?.user
      shouldCreateAdminRecord = false // Já existe

      // Atualizar admin_users com timestamp
      await supabaseAdmin
        .from('admin_users')
        .update({ 
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        })
        .eq('email', email)

    } else if (authUserExists && !adminUserExists) {
      // Cenário C: Usuário existe só em auth.users
      scenario = 'C - Só auth.users'
      console.log('[CREATE-ADMIN-USER] Cenário C: Criando em admin_users')
      shouldCreateAdminRecord = true

    } else {
      // Cenário D: Usuário não existe em nenhuma
      scenario = 'D - Nenhuma tabela'
      console.log('[CREATE-ADMIN-USER] Cenário D: Criando em ambas')
      
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: 'Admin User'
        }
      })

      if (authError) {
        console.error('[CREATE-ADMIN-USER] Erro ao criar auth.users:', authError)
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      authUser = newAuthUser?.user
      shouldCreateAdminRecord = true
    }

    // Criar registro em admin_users se necessário
    if (shouldCreateAdminRecord && authUser) {
      console.log('[CREATE-ADMIN-USER] Criando registro em admin_users')
      
      const { error: insertError } = await supabaseAdmin
        .from('admin_users')
        .insert({
          email: email,
          password_hash: password, // Em produção, usar hash adequado
          full_name: authUser.user_metadata?.display_name || 'Admin User',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('[CREATE-ADMIN-USER] Erro ao inserir admin_users:', insertError)
        // Não falhar completamente se auth.users foi criado com sucesso
      }
    }

    // Etapa 4: Resposta final
    console.log(`[CREATE-ADMIN-USER] Processo concluído com sucesso - Cenário: ${scenario}`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser?.id,
        email: authUser?.email || email,
        scenario: scenario,
        message: 'Conta administrativa sincronizada com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[CREATE-ADMIN-USER] Erro inesperado:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})