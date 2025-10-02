# Supabase Migrations

This directory contains SQL migration files for the Law Firm SaaS application.

## Migration Files

### 20250103_add_documents_bucket.sql
- **Purpose**: Sets up the documents storage bucket with Row Level Security policies
- **Features**:
  - Creates a 'documents' storage bucket (if it doesn't exist)
  - Enables Row Level Security on storage.objects
  - Adds policies for SELECT, INSERT, and DELETE operations
  - Ensures users can only access their own documents
  - Idempotent (safe to run multiple times)

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
