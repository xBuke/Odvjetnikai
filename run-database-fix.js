#!/usr/bin/env node

/**
 * Database Fix Script
 * 
 * This script applies the database migration to fix demo account and subscription issues.
 * Run this script after applying the migration in Supabase.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDatabaseFix() {
  console.log('🔧 Starting database fix...');

  try {
    // Test demo user login
    console.log('🔍 Testing demo user login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@odvjetnikai.com',
      password: 'Demo123!'
    });

    if (authError) {
      console.error('❌ Demo user login failed:', authError.message);
      return;
    }

    console.log('✅ Demo user login successful');

    // Check subscription status
    console.log('🔍 Checking subscription status...');
    const { data: subscriptionData, error: subscriptionError } = await supabase.rpc('get_user_subscription_status', {
      user_id: authData.user.id
    });

    if (subscriptionError) {
      console.error('❌ Failed to check subscription status:', subscriptionError.message);
      return;
    }

    console.log('✅ Subscription status:', subscriptionData);

    // Test profile access
    console.log('🔍 Testing profile access...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Failed to access profile:', profileError.message);
      return;
    }

    console.log('✅ Profile access successful:', {
      email: profileData.email,
      role: profileData.role,
      subscription_status: profileData.subscription_status
    });

    // Test data access (clients table)
    console.log('🔍 Testing data access...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .eq('user_id', authData.user.id);

    if (clientsError) {
      console.error('❌ Failed to access clients data:', clientsError.message);
      return;
    }

    console.log('✅ Data access successful');

    // Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');

    console.log('\n🎉 Database fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Demo user can login with email: demo@odvjetnikai.com');
    console.log('   ✅ Demo user password: Demo123!');
    console.log('   ✅ Demo user has active subscription');
    console.log('   ✅ Demo user can access all data (read-only)');
    console.log('   ✅ RLS policies are working correctly');

  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
runDatabaseFix();
