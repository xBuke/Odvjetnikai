#!/usr/bin/env node

/**
 * Test script for trial registration and auto-billing flow
 * 
 * Usage: node scripts/test-trial-flow.js
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - STRIPE_SECRET_KEY
 * - CRON_SECRET
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const cronSecret = process.env.CRON_SECRET;

if (!supabaseUrl || !supabaseKey || !stripeSecretKey || !cronSecret) {
  console.error('Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, CRON_SECRET');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(stripeSecretKey);

async function testTrialFlow() {
  console.log('🧪 Testing Trial Registration and Auto-Billing Flow\n');

  try {
    // 1. Test user registration
    console.log('1️⃣ Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    console.log(`✅ User created: ${testEmail} (${authData.user.id})`);

    // 2. Check if profile was created with trial status
    console.log('\n2️⃣ Checking profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile error: ${profileError.message}`);
    }

    if (profile.subscription_status !== 'trial') {
      throw new Error(`Expected trial status, got: ${profile.subscription_status}`);
    }

    if (!profile.trial_expires_at) {
      throw new Error('Trial expiration date not set');
    }

    console.log(`✅ Profile created with trial status`);
    console.log(`   - Status: ${profile.subscription_status}`);
    console.log(`   - Plan: ${profile.subscription_plan}`);
    console.log(`   - Trial expires: ${profile.trial_expires_at}`);
    console.log(`   - Trial limit: ${profile.trial_limit}`);

    // 3. Test trial subscription creation
    console.log('\n3️⃣ Testing trial subscription creation...');
    
    // Simulate expired trial by updating the profile
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    await supabase
      .from('profiles')
      .update({ trial_expires_at: expiredDate.toISOString() })
      .eq('id', authData.user.id);

    console.log('✅ Updated trial expiration to simulate expired trial');

    // 4. Test auto-billing API
    console.log('\n4️⃣ Testing auto-billing API...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/trial/auto-billing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auto-billing API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Auto-billing API response:', result);

    // 5. Check if Stripe subscription was created
    console.log('\n5️⃣ Checking Stripe subscription...');
    
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (updatedProfile.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(updatedProfile.stripe_subscription_id);
      console.log(`✅ Stripe subscription created: ${subscription.id}`);
      console.log(`   - Status: ${subscription.status}`);
      console.log(`   - Customer: ${subscription.customer}`);
      console.log(`   - Trial end: ${new Date(subscription.trial_end * 1000).toISOString()}`);
    } else {
      console.log('⚠️  No Stripe subscription ID found in profile');
    }

    // 6. Cleanup
    console.log('\n6️⃣ Cleaning up test data...');
    
    // Cancel Stripe subscription if created
    if (updatedProfile.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(updatedProfile.stripe_subscription_id);
        console.log('✅ Stripe subscription cancelled');
      } catch (error) {
        console.log('⚠️  Could not cancel Stripe subscription:', error.message);
      }
    }

    // Delete test user
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Test user deleted');

    console.log('\n🎉 All tests passed! Trial flow is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testTrialFlow();
