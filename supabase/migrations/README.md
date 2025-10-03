# Supabase Migrations

This directory contains SQL migration files for the Law Firm SaaS application.

## Migration Files

### Core Database Setup
- **20250103_add_billing_update_function.sql** - Billing table update triggers
- **20250103_add_handle_new_user_function.sql** - New user initialization function
- **20250103_add_user_preferences_update_function.sql** - User preferences triggers
- **20250103_fix_database_schema_rls_search_path.sql** - RLS search path fixes

### Storage & Documents
- **20250103_add_documents_bucket.sql.backup** - Documents storage bucket setup (backup)
- **20250106_add_punomoc_tuzba_document_types.sql** - Additional document types

### Subscription & Billing
- **20250103_add_stripe_subscription_support.sql** - Stripe subscription integration
- **20250104_add_subscription_status_column.sql** - Subscription status column
- **20250107_fix_subscription_status_rls.sql** - Subscription status RLS fixes
- **20250108_fix_subscription_columns_and_rls.sql** - Subscription columns and RLS updates

### Trial System
- **20250112_add_trial_fields_to_profiles.sql** - Trial fields for user profiles
- **20250112_update_rls_for_trial_users.sql** - RLS policies for trial users

### User Management
- **20250105_add_case_status_column.sql** - Case status column
- **20250109_update_handle_new_user_and_add_demo_user.sql** - User handling updates
- **20250110_fix_demo_account_and_subscription.sql** - Demo account fixes
- **20250111_update_handle_new_user_and_subscription_plan.sql** - User and subscription plan updates
- **20250113_remove_demo_user_and_cleanup.sql** - Demo user removal and cleanup

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)
```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### Option 2: Manual Application via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of the migration file
4. Click **Run** to execute the migration

### Option 3: Using Supabase CLI for Local Development
```bash
# Start local Supabase (for development)
supabase start

# Apply migrations to local database
supabase db reset
```

## Migration Best Practices

1. **Idempotent**: All migrations should be safe to run multiple times
2. **Descriptive Names**: Use clear, descriptive names with timestamps
3. **Comments**: Include comments explaining the purpose and changes
4. **Testing**: Test migrations on a development environment first
5. **Backup**: Always backup your database before applying migrations in production

## Storage Bucket Policies

The documents bucket policies ensure:
- **Security**: Users can only access their own files
- **Privacy**: No cross-user data access
- **Compliance**: Follows Row Level Security best practices

### Policy Details
- **SELECT**: Users can view/download their own documents
- **INSERT**: Users can upload documents (automatically assigned as owner)
- **DELETE**: Users can delete their own documents
- **UPDATE**: Currently disabled (can be enabled if needed)

## Troubleshooting

If you encounter issues:
1. Check that the storage extension is enabled
2. Verify that RLS is enabled on storage.objects
3. Ensure the bucket exists before applying policies
4. Check the Supabase logs for detailed error messages
