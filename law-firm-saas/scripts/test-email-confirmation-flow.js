/**
 * Test script to verify email confirmation flow
 * 
 * This script tests:
 * 1. User signup -> profile created with null/inactive status
 * 2. Email confirmation -> trial activated automatically
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEmailConfirmationFlow() {
  console.log('🧪 Testing Email Confirmation Flow...\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Step 1: Create user via signup
    console.log('1️⃣ Creating user via signup...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: false, // Don't auto-confirm email
    });

    if (authError) {
      console.error('❌ Auth signup error:', authError);
      return;
    }

    console.log('✅ User created:', authData.user.id);
    console.log('📧 Email confirmed:', authData.user.email_confirmed_at);

    // Step 2: Check profile status after signup (should be null/inactive)
    console.log('\n2️⃣ Checking profile status after signup...');
    const { data: profileAfterSignup, error: profileError1 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError1) {
      console.error('❌ Profile fetch error:', profileError1);
      return;
    }

    console.log('📊 Profile after signup:');
    console.log('   - subscription_status:', profileAfterSignup.subscription_status);
    console.log('   - subscription_plan:', profileAfterSignup.subscription_plan);
    console.log('   - trial_expires_at:', profileAfterSignup.trial_expires_at);
    console.log('   - trial_limit:', profileAfterSignup.trial_limit);

    // Verify status is null/inactive
    if (profileAfterSignup.subscription_status === 'trialing') {
      console.log('❌ ERROR: Profile should NOT have trialing status before email confirmation!');
      return;
    } else {
      console.log('✅ Profile status is correct (not trialing before email confirmation)');
    }

    // Step 3: Simulate email confirmation by updating email_confirmed_at
    console.log('\n3️⃣ Simulating email confirmation...');
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      {
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Email confirmation error:', updateError);
      return;
    }

    console.log('✅ Email confirmed:', updatedUser.user.email_confirmed_at);

    // Step 4: Check profile status after email confirmation (should be trialing)
    console.log('\n4️⃣ Checking profile status after email confirmation...');
    const { data: profileAfterConfirm, error: profileError2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError2) {
      console.error('❌ Profile fetch error:', profileError2);
      return;
    }

    console.log('📊 Profile after email confirmation:');
    console.log('   - subscription_status:', profileAfterConfirm.subscription_status);
    console.log('   - subscription_plan:', profileAfterConfirm.subscription_plan);
    console.log('   - trial_expires_at:', profileAfterConfirm.trial_expires_at);
    console.log('   - trial_limit:', profileAfterConfirm.trial_limit);

    // Verify trial was activated
    if (profileAfterConfirm.subscription_status === 'trialing' && 
        profileAfterConfirm.trial_expires_at && 
        profileAfterConfirm.trial_limit === 20) {
      console.log('✅ SUCCESS: Trial was activated by email confirmation trigger!');
    } else {
      console.log('❌ ERROR: Trial was NOT activated by email confirmation trigger!');
      console.log('   Expected: subscription_status=trialing, trial_expires_at set, trial_limit=20');
      return;
    }

    // Step 5: Cleanup
    console.log('\n5️⃣ Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (deleteError) {
      console.error('⚠️ Cleanup error:', deleteError);
    } else {
      console.log('✅ Test user deleted');
    }

    console.log('\n🎉 Email confirmation flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmailConfirmationFlow();
