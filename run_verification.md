# Database Verification Instructions

## How to Run the Verification

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Verification Script**
   - Copy the contents of `database_verification.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Review the Results**
   - The script will provide a comprehensive report showing:
     - ✅ What's working correctly
     - ❌ What's missing or incorrect
   - Each section will show detailed information about your database state

## What the Verification Checks

### 1. Enum Types ✅
- `document_type` - Document classification types
- `subscription_plan` - Subscription plan types  
- `subscription_status` - Subscription status types
- `case_status` - Case timeline status
- `case_status_type` - General case status
- `billing_status` - Billing status types

### 2. Tables ✅
- `profiles` - User profiles with subscription info
- `clients` - Client information
- `cases` - Legal cases
- `documents` - Case documents
- `billing` - Billing records
- `billing_entries` - Time tracking entries
- `calendar_events` - Calendar events
- `deadlines` - Case deadlines
- `user_preferences` - User settings

### 3. Foreign Key Relationships ✅
- `profiles.id -> auth.users.id`
- `cases.user_id -> profiles.id`
- `documents.case_id -> cases.id`
- `documents.user_id -> profiles.id`
- `billing.user_id -> profiles.id`
- And all other relationships

### 4. Indexes ✅
- `idx_cases_user_id`
- `idx_documents_case_id`
- `idx_documents_user_id`
- `idx_billing_user_id`
- `idx_clients_user_id`
- `idx_profiles_email`
- `idx_profiles_subscription_status`
- And all other performance indexes

### 5. RLS (Row Level Security) ✅
- RLS enabled on all tables
- Proper policies for user data isolation
- Trial and subscription-aware policies

### 6. Functions ✅
- `handle_new_user()` - Auto-create profiles
- `user_has_active_subscription()` - Check subscription
- `update_user_subscription_status()` - Update subscription
- `start_trial_for_user()` - Start trial
- `is_user_on_trial()` - Check trial status
- `is_trial_expired()` - Check trial expiration
- `get_trial_days_left()` - Get remaining trial days
- `check_trial_entity_limit()` - Enforce trial limits

### 7. Triggers ✅
- Auto-update timestamps
- Trial limit enforcement
- New user profile creation

## Expected Results

If everything is working correctly, you should see:
- ✅ All enum types exist with correct values
- ✅ All tables exist with proper structure
- ✅ All foreign key relationships are in place
- ✅ All indexes are created
- ✅ RLS is enabled on all tables
- ✅ All required policies exist
- ✅ All functions are present
- ✅ All triggers are active

## If Something is Missing

If you see ❌ for any items:
1. Run the `complete_supabase_database_setup.sql` script again
2. Check for any error messages during execution
3. Re-run the verification script to confirm fixes

## Next Steps

After verification is complete:
1. Test user registration to ensure profiles are created
2. Test trial functionality
3. Test subscription management
4. Verify data isolation between users
