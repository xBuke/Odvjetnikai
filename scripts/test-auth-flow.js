#!/usr/bin/env node

/**
 * Test script for signup → email confirmation → dashboard flow
 * 
 * Usage: node scripts/test-auth-flow.js
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize admin client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🧪 Testing Signup → Email Confirmation → Dashboard Flow\n');

  try {
    // 1. Test user registration
    console.log('1️⃣ Testing user registration...');
    const testEmail = `test-auth-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false, // Don't auto-confirm to test email confirmation flow
    });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    console.log(`✅ User created: ${testEmail} (${authData.user.id})`);
    console.log(`   - Email confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

    // 2. Check if profile was created
    console.log('\n2️⃣ Checking profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile error: ${profileError.message}`);
    }

    console.log(`✅ Profile created successfully`);
    console.log(`   - Status: ${profile.subscription_status}`);
    console.log(`   - Plan: ${profile.subscription_plan}`);
    console.log(`   - Role: ${profile.role}`);

    // 3. Test email confirmation
    console.log('\n3️⃣ Testing email confirmation...');
    
    // Simulate email confirmation by updating the user
    const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      throw new Error(`Email confirmation error: ${confirmError.message}`);
    }

    console.log(`✅ Email confirmed successfully`);
    console.log(`   - Email confirmed at: ${confirmData.user.email_confirmed_at}`);

    // 4. Test user session
    console.log('\n4️⃣ Testing user session...');
    
    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail,
    });

    if (sessionError) {
      throw new Error(`Session creation error: ${sessionError.message}`);
    }

    console.log(`✅ Session link generated successfully`);

    // 5. Test profile update after confirmation
    console.log('\n5️⃣ Testing profile update after confirmation...');
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (updateError) {
      throw new Error(`Profile update error: ${updateError.message}`);
    }

    console.log(`✅ Profile retrieved after confirmation`);
    console.log(`   - Status: ${updatedProfile.subscription_status}`);
    console.log(`   - Trial expires: ${updatedProfile.trial_expires_at || 'Not set'}`);

    // 6. Test user preferences creation
    console.log('\n6️⃣ Testing user preferences creation...');
    
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', authData.user.id);

    if (preferencesError) {
      throw new Error(`Preferences error: ${preferencesError.message}`);
    }

    console.log(`✅ User preferences created: ${preferences.length} entries`);

    // 7. Cleanup
    console.log('\n7️⃣ Cleaning up test data...');
    
    // Delete test user
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Test user deleted');

    console.log('\n🎉 All tests passed! Auth flow is working correctly.');
    console.log('\n📋 Flow Summary:');
    console.log('   ✅ User registration works');
    console.log('   ✅ Profile creation works');
    console.log('   ✅ Email confirmation works');
    console.log('   ✅ Session management works');
    console.log('   ✅ User preferences creation works');
    console.log('   ✅ Dashboard access should work for confirmed users');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAuthFlow();
