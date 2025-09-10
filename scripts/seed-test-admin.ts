import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nutlcbnruabjsxecqpnd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedTestAdmin() {
  const email = process.env.E2E_ADMIN_EMAIL || 'admin.e2e@role.test';
  const password = process.env.E2E_ADMIN_PASSWORD || 'RoleE2E!2025';

  console.log('🌱 Seeding test admin user...');

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    let userId: string;

    if (existingUser.user) {
      console.log('✅ Test admin user already exists');
      userId = existingUser.user.id;
    } else {
      // Create test admin user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (createError) {
        console.error('❌ Error creating test admin user:', createError);
        process.exit(1);
      }

      if (!newUser.user) {
        console.error('❌ No user returned from creation');
        process.exit(1);
      }

      userId = newUser.user.id;
      console.log('✅ Test admin user created');
    }

    // Check if admin exists in admin_users table
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (!adminUser) {
      // Create admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          email,
          full_name: 'E2E Test Admin',
          password_hash: 'dummy_hash_for_e2e', // Not used in practice
          is_active: true
        });

      if (adminError) {
        console.error('❌ Error creating admin user record:', adminError);
        process.exit(1);
      }

      console.log('✅ Admin user record created');
    } else {
      console.log('✅ Admin user record already exists');
    }

    // Check if approved admin exists
    const { data: approvedAdmin } = await supabase
      .from('approved_admins')
      .select('id')
      .eq('email', email)
      .single();

    if (!approvedAdmin) {
      // Create approved admin record
      const { error: approvedError } = await supabase
        .from('approved_admins')
        .insert({
          email,
          approved_by: 'system',
          is_active: true
        });

      if (approvedError) {
        console.error('❌ Error creating approved admin record:', approvedError);
        process.exit(1);
      }

      console.log('✅ Approved admin record created');
    } else {
      console.log('✅ Approved admin record already exists');
    }

    console.log('🎉 Test admin setup complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedTestAdmin();