// Test script to verify user creation works after database fix
// Run this with: node test_user_creation.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('❌ Please set your Supabase environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserCreation() {
  console.log('🧪 Testing user creation...');
  
  // Generate a unique test email
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log(`📧 Creating user with email: ${testEmail}`);
    
    // Attempt to create a new user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('❌ User creation failed:', error.message);
      return false;
    }
    
    console.log('✅ User created successfully!');
    console.log('👤 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    
    // Wait a moment for the trigger to execute
    console.log('⏳ Waiting for database trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile created successfully!');
    console.log('📊 Profile data:', {
      id: profile.id,
      email: profile.email,
      subscription_status: profile.subscription_status,
      subscription_plan: profile.subscription_plan,
      trial_expires_at: profile.trial_expires_at,
      trial_limit: profile.trial_limit
    });
    
    // Check if user preferences were created
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', data.user.id);
    
    if (prefsError) {
      console.error('❌ User preferences creation failed:', prefsError.message);
      return false;
    }
    
    console.log('✅ User preferences created successfully!');
    console.log('⚙️ Preferences:', preferences);
    
    // Clean up - delete the test user
    console.log('🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
    
    if (deleteError) {
      console.warn('⚠️ Could not delete test user:', deleteError.message);
    } else {
      console.log('✅ Test user cleaned up successfully!');
    }
    
    console.log('\n🎉 All tests passed! User creation is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testUserCreation()
  .then(success => {
    if (success) {
      console.log('\n✅ Database fix is working correctly!');
      process.exit(0);
    } else {
      console.log('\n❌ Database fix needs attention. Please check the errors above.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
