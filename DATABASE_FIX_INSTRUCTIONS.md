# Database Fix Instructions

## Problem Summary

The database had several issues that prevented demo account login and proper subscription handling:

1. **Demo account password mismatch**: Login page showed `Demo123!` but database had `demo123`
2. **Inconsistent subscription functions**: Some used `auth.users.raw_user_meta_data`, others used `public.profiles`
3. **Demo user subscription status**: Demo user didn't have active subscription
4. **Conflicting RLS policies**: Multiple versions of policies existed

## Solution

A comprehensive migration has been created to fix all issues:

### Migration File
- `supabase/migrations/20250110_fix_demo_account_and_subscription.sql`

### Key Fixes Applied

1. **Consistent Subscription Handling**
   - All subscription functions now use `public.profiles` table
   - New users get `active` subscription by default
   - Demo user gets `active` subscription

2. **Demo Account Fix**
   - Recreated demo user with correct password: `Demo123!`
   - Email: `demo@odvjetnikai.com`
   - Role: `demo`
   - Subscription: `active`

3. **RLS Policies Cleanup**
   - Removed all conflicting policies
   - Created consistent policies for all tables
   - Demo users get read-only access
   - Active subscribers get full access

4. **Frontend Updates**
   - Updated `SubscriptionGuard.tsx` to allow demo user access
   - Updated login logic to allow demo user access

## How to Apply the Fix

### Step 1: Apply Migration in Supabase

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250110_fix_demo_account_and_subscription.sql`
4. Run the migration

### Step 2: Verify the Fix

Run the verification script:

```bash
cd law-firm-saas
node run-database-fix.js
```

### Step 3: Test Demo Login

1. Go to your application login page
2. Use these credentials:
   - **Email**: `demo@odvjetnikai.com`
   - **Password**: `Demo123!`
3. You should be able to login and access the application

## Demo Account Details

- **Email**: `demo@odvjetnikai.com`
- **Password**: `Demo123!`
- **Role**: `demo` (read-only access)
- **Subscription**: `active`

## What the Demo User Can Do

- ✅ Login to the application
- ✅ View all data (clients, cases, documents, billing, etc.)
- ❌ Cannot create, edit, or delete data (read-only)

## For Your Own Account

If you're still having subscription issues with your own account:

1. Check your profile in the database:
   ```sql
   SELECT * FROM public.profiles WHERE email = 'your-email@example.com';
   ```

2. If your subscription_status is not 'active', update it:
   ```sql
   UPDATE public.profiles 
   SET subscription_status = 'active' 
   WHERE email = 'your-email@example.com';
   ```

## Troubleshooting

### Demo Login Still Not Working

1. Check if the migration ran successfully
2. Verify demo user exists:
   ```sql
   SELECT * FROM auth.users WHERE email = 'demo@odvjetnikai.com';
   SELECT * FROM public.profiles WHERE email = 'demo@odvjetnikai.com';
   ```

### Your Account Still Inactive

1. Check your profile:
   ```sql
   SELECT * FROM public.profiles WHERE email = 'your-email@example.com';
   ```

2. Update subscription status:
   ```sql
   UPDATE public.profiles 
   SET subscription_status = 'active' 
   WHERE email = 'your-email@example.com';
   ```

### RLS Policy Issues

If you're getting permission errors:

1. Check if policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

2. Re-run the migration if policies are missing

## Files Modified

- `supabase/migrations/20250110_fix_demo_account_and_subscription.sql` (new)
- `src/components/auth/SubscriptionGuard.tsx` (updated)
- `src/app/login/page.tsx` (updated)
- `run-database-fix.js` (new)
- `DATABASE_FIX_INSTRUCTIONS.md` (new)

## Next Steps

After applying this fix:

1. Test demo login
2. Test your own account login
3. Verify all functionality works as expected
4. Consider setting up proper Stripe integration for production subscriptions
