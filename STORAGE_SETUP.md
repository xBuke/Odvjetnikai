# Supabase Storage Configuration

## Overview

This document describes the Supabase storage configuration for the Odvjetnikai law firm SaaS application, specifically the `documents` bucket setup with Row Level Security (RLS) policies and secure document serving using signed URLs.

## Storage Bucket Configuration

### Documents Bucket

- **Name**: `documents`
- **Type**: Private bucket (not public)
- **File Size Limit**: 50MB
- **Security**: Uses signed URLs for document access (1-hour expiration)
- **Demo Mode**: Public URLs available when `NEXT_PUBLIC_DEMO_MODE=true`
- **Allowed MIME Types**:
  - `application/pdf` - PDF documents
  - `image/jpeg` - JPEG images
  - `image/jpg` - JPG images
  - `image/png` - PNG images
  - `application/msword` - Microsoft Word documents (.doc)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Microsoft Word documents (.docx)
  - `text/plain` - Plain text files
  - `application/rtf` - Rich Text Format files

## Row Level Security (RLS) Policies

The storage bucket is configured with comprehensive RLS policies to ensure secure access:

### 1. Upload Policy (INSERT)
- **Policy Name**: `Authenticated users can upload their own documents`
- **Access**: Authenticated users only
- **Restriction**: Users can only upload files they own
- **SQL Condition**: `bucket_id = 'documents' AND auth.uid() = owner AND auth.role() = 'authenticated'`

### 2. View Policy (SELECT)
- **Policy Name**: `Authenticated users can view their own documents`
- **Access**: Authenticated users only
- **Restriction**: Users can only view/download their own files
- **SQL Condition**: `bucket_id = 'documents' AND auth.uid() = owner AND auth.role() = 'authenticated'`

### 3. Delete Policy (DELETE)
- **Policy Name**: `Authenticated users can delete their own documents`
- **Access**: Authenticated users only
- **Restriction**: Users can only delete their own files
- **SQL Condition**: `bucket_id = 'documents' AND auth.uid() = owner AND auth.role() = 'authenticated'`

### 4. Optional Demo Mode Policy (SELECT)
- **Policy Name**: `Public can view documents in demo mode` (commented out)
- **Access**: Public (when demo mode is enabled)
- **Purpose**: Allows public access to documents for demonstration purposes
- **Note**: This policy is commented out by default for security. Uncomment and configure if demo mode is needed.

## Setup Instructions

### 1. Apply the Migration

Run the migration file in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of:
-- supabase/migrations/20250114_create_documents_storage_bucket.sql
```

### 2. Verify the Setup

After running the migration, verify the configuration:

```sql
-- Check if the bucket was created
SELECT * FROM storage.buckets WHERE name = 'documents';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check the policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 3. Test the Configuration

Test the storage functionality:

1. **Upload Test**: Try uploading a document through your application
2. **Access Test**: Verify that users can only access their own files
3. **Delete Test**: Confirm that users can delete their own files
4. **Security Test**: Verify that users cannot access other users' files

## Security Considerations

### Private Bucket
- The bucket is configured as private (not public)
- Files are accessed via signed URLs when needed
- This provides better security than public buckets

### User Isolation
- Each user can only access their own files
- No cross-user file access is possible
- All operations require authentication

### File Type Restrictions
- Only specific MIME types are allowed
- This prevents upload of potentially dangerous file types
- File size is limited to 50MB

## Security Implementation

### Document Access Control

The application implements a two-tier security model for document access:

#### Production Mode (Default)
- **Signed URLs**: All document downloads use signed URLs with 1-hour expiration
- **User Verification**: Server-side verification ensures users can only access their own documents
- **API Endpoint**: `/api/documents/signed-url` generates secure download links
- **No Public Access**: Documents are never publicly accessible

#### Demo Mode
- **Public URLs**: Uses public URLs for easier development and demo purposes
- **Environment Variable**: Controlled by `NEXT_PUBLIC_DEMO_MODE=true`
- **Development Only**: Should not be used in production environments

### Implementation Details

The security is implemented through:

1. **File Path Storage**: Documents are stored with file paths instead of public URLs
2. **Dynamic URL Generation**: URLs are generated on-demand when users request downloads
3. **User Ownership Verification**: Server-side checks ensure users can only access their own documents
4. **Time-Limited Access**: Signed URLs expire after 1 hour for additional security

## Usage in Application

### Uploading Files
```javascript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`docs/${fileName}`, file);
```

### Downloading Files
```javascript
const { data } = await supabase.storage
  .from('documents')
  .download(`docs/${fileName}`);
```

### Getting Signed URL (Production)
```javascript
const { data } = await supabase.storage
  .from('documents')
  .createSignedUrl(`docs/${fileName}`, 3600); // 1 hour expiry
```

### Getting Public URL (Demo Mode Only)
```javascript
const { data: { publicUrl } } = await supabase.storage
  .from('documents')
  .getPublicUrl(`docs/${fileName}`);
```

### Deleting Files
```javascript
const { error } = await supabase.storage
  .from('documents')
  .remove([`docs/${fileName}`]);
```

## Troubleshooting

### Common Issues

1. **Bucket Not Found**: Ensure the migration was run successfully
2. **Permission Denied**: Check that the user is authenticated and owns the file
3. **File Type Not Allowed**: Verify the file MIME type is in the allowed list
4. **File Too Large**: Check that the file is under 50MB

### Debugging

Enable debug logging in your application to see detailed error messages:

```javascript
// In your Supabase client configuration
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

## Migration History

- **2025-01-14**: Initial storage bucket creation with RLS policies
- **Previous**: Demo user system (removed in favor of trial system)

## Related Files

- `supabase/migrations/20250114_create_documents_storage_bucket.sql` - Main migration file
- `supabase/config.toml` - Local development configuration
- `src/app/documents/page.tsx` - Frontend document management
- `src/app/api/upload/validate/route.ts` - File validation API
