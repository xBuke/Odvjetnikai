# Setup Instructions for Law Firm SaaS

## Quick Setup Guide

### 1. Environment Variables

Create a `.env.local` file in the root directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database-setup.sql`
4. Click **Run** to execute the script

This will create:
- `clients` table with sample data
- `cases` table with sample data  
- `documents` table
- `billing` table with sample data
- `calendar_events` table with sample data
- Proper indexes and Row Level Security policies

### 3. Storage Setup

1. Go to your Supabase project dashboard
2. Navigate to **Storage**
3. Click **Create a new bucket**
4. Name it `documents`
5. Make it **Public** (for file downloads)
6. Click **Create bucket**

#### Storage Policies (Optional but Recommended)

After creating the bucket, set up these policies in the **Storage** > **Policies** section:

**For Upload:**
- Policy name: `Allow authenticated users to upload documents`
- Target roles: `authenticated`
- Policy definition: `true`

**For View:**
- Policy name: `Allow authenticated users to view documents`
- Target roles: `authenticated`
- Policy definition: `true`

**For Delete:**
- Policy name: `Allow authenticated users to delete documents`
- Target roles: `authenticated`
- Policy definition: `true`

### 4. Test the Application

1. Run `npm run dev`
2. Go to `http://localhost:3000`
3. You should be redirected to `/login`
4. Register a new account or use existing credentials
5. Test creating, editing, and deleting clients

### 5. Troubleshooting

If you see "Error saving client: {}":

1. **Check environment variables**: Make sure `.env.local` exists and has correct values
2. **Check database**: Ensure you ran the `database-setup.sql` script
3. **Check console**: Look for more detailed error messages in browser console
4. **Check Supabase logs**: Go to Supabase dashboard > Logs to see server-side errors

If you see "Bucket not found" error:

1. **Create storage bucket**: Go to Supabase dashboard > Storage > Create bucket named "documents"
2. **Set bucket to public**: Make sure the bucket is public for file downloads
3. **Check storage policies**: Ensure proper policies are set for authenticated users
4. **Restart application**: After creating the bucket, restart your dev server

### 6. Common Issues

- **"Supabase configuration missing"**: Environment variables not set
- **"relation 'clients' does not exist"**: Database setup script not run
- **"permission denied"**: Row Level Security policies not configured
- **"invalid JWT"**: Authentication not properly set up
- **"Bucket not found"**: Storage bucket not created in Supabase dashboard

### 7. Next Steps

After successful setup:
1. Customize the sample data in `database-setup.sql`
2. Add more fields to tables as needed
3. Configure email templates in Supabase Auth settings
4. Set up proper backup and monitoring
