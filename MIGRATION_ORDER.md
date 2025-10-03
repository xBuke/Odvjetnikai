# Migration Order for Law Firm SaaS

This document outlines the correct order for running database migrations to ensure all dependencies are met.

## Migration Execution Order

### 1. Core Database Setup (Run First)
- **`database-setup.sql`** - Creates all core tables including `billing` and `billing_entries`
  - Creates: clients, cases, documents, billing, billing_entries, calendar_events, deadlines, user_preferences
  - Sets up indexes, RLS policies, and sample data
  - **Must run first** as other migrations depend on these tables

### 2. Table Modifications (Run After Core Setup)
- **`add-document-type-enum.sql`** - Adds document_type enum and type column to documents table
- **`add-user-id-to-cases.sql`** - Adds user_id columns to existing tables (now idempotent)
- **`create-user-preferences-table.sql`** - Creates user_preferences table (if not in database-setup.sql)
- **`update-user-preferences-table.sql`** - Updates user_preferences table structure

### 3. Triggers and Functions (Run After Table Creation)
- **`add-updated-at-triggers.sql`** - Adds automatic updated_at triggers (now idempotent)

### 4. Storage and Buckets (Run Last)
- **`supabase/migrations/20250103_add_documents_bucket.sql`** - Creates storage bucket for documents

## Standalone Migrations

These can be run independently if needed:

- **`create-billing-entries-table.sql`** - Standalone creation of billing_entries table
  - **Note**: This table is already created in `database-setup.sql`
  - Only use this if you need to create just the billing_entries table without the full schema

## Key Improvements Made

1. **Idempotency**: All migrations now check for table existence before referencing them
2. **Dependency Safety**: Migrations that reference `billing` table now check if it exists first
3. **Policy Management**: RLS policies are properly dropped and recreated for idempotency
4. **Error Prevention**: DO blocks prevent errors when tables don't exist

## Running Migrations

### Full Setup (Recommended)
```sql
-- Run in this order:
1. database-setup.sql
2. add-document-type-enum.sql
3. add-user-id-to-cases.sql
4. add-updated-at-triggers.sql
5. supabase/migrations/20250103_add_documents_bucket.sql
```

### Individual Table Setup
```sql
-- If you only need billing_entries table:
create-billing-entries-table.sql
```

## Validation

After running migrations, verify:
1. All tables exist: `\dt` in psql
2. RLS is enabled: Check table policies
3. Triggers are working: Test updating a record
4. Storage bucket exists: Check Supabase dashboard

## Troubleshooting

- If a migration fails, check if required tables exist first
- All migrations are now idempotent and can be re-run safely
- Check Supabase logs for detailed error messages
