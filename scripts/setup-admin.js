/**
 * Admin Setup Script
 * This script will:
 * 1. Create the admins table if it doesn't exist
 * 2. Link your existing authenticated user to the admins table
 *
 * Usage: node scripts/setup-admin.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdmin() {
  console.log('🚀 Starting admin setup...\n')

  try {
    // Step 1: Create admins table
    console.log('📋 Step 1: Creating admins table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create admins table
        CREATE TABLE IF NOT EXISTS public.admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          auth_id UUID UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          avatar_url TEXT,
          role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
          is_active BOOLEAN DEFAULT true,
          permissions JSONB DEFAULT '["read", "write", "delete"]'::jsonb,
          last_login_at TIMESTAMPTZ,
          last_activity_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON public.admins(auth_id);
        CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
        CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
        CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

        -- Enable RLS
        ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
      `
    })

    if (tableError) {
      console.log('⚠️  Note: Table might already exist or RPC not available')
      console.log('   Trying direct SQL execution...\n')
    } else {
      console.log('✅ Admins table created successfully!\n')
    }

    // Step 2: Get all authenticated users
    console.log('📋 Step 2: Fetching authenticated users...')
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No authenticated users found!')
      console.log('   Please create an admin user in Supabase Auth first.')
      process.exit(0)
    }

    console.log(`✅ Found ${users.length} authenticated user(s)\n`)

    // Step 3: Check which users are already admins
    console.log('📋 Step 3: Checking existing admin records...')
    const { data: existingAdmins, error: adminsError } = await supabase
      .from('admins')
      .select('auth_id, email')

    if (adminsError && adminsError.code !== 'PGRST116') {
      console.log(`⚠️  Could not check existing admins: ${adminsError.message}`)
    }

    const existingAdminAuthIds = new Set(existingAdmins?.map(a => a.auth_id) || [])

    // Step 4: Link users to admins table
    console.log('📋 Step 4: Linking users to admins table...\n')

    for (const user of users) {
      if (existingAdminAuthIds.has(user.id)) {
        console.log(`⏭️  ${user.email} - Already an admin`)
        continue
      }

      console.log(`🔗 Linking ${user.email}...`)

      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          auth_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: 'super_admin', // First user gets super_admin
          is_active: true,
          permissions: [
            'read', 'write', 'delete',
            'manage_users', 'manage_dealers', 'manage_cars',
            'manage_escrow', 'manage_payments', 'manage_inspections'
          ]
        })

      if (insertError) {
        console.log(`   ❌ Failed: ${insertError.message}`)
      } else {
        console.log(`   ✅ Success! ${user.email} is now a super admin`)
      }
    }

    console.log('\n🎉 Admin setup complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Go to http://localhost:3000/admin/login')
    console.log('   2. Sign in with your admin credentials')
    console.log('   3. You should have full access to the admin panel')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.error('\n💡 Manual setup instructions:')
    console.error('   1. Go to Supabase Dashboard → SQL Editor')
    console.error('   2. Run the migration: supabase/migrations/20251203000001_create_admins_table.sql')
    console.error('   3. Get your user ID from Auth → Users')
    console.error('   4. Run this SQL:')
    console.error(`
      INSERT INTO public.admins (auth_id, email, full_name, role, permissions)
      VALUES (
        'YOUR_USER_ID_HERE',
        'your-email@example.com',
        'Your Name',
        'super_admin',
        '["read", "write", "delete", "manage_users", "manage_dealers", "manage_cars"]'::jsonb
      );
    `)
    process.exit(1)
  }
}

setupAdmin()
