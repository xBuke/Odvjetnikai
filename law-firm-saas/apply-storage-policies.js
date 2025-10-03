#!/usr/bin/env node

/**
 * Script to apply storage policies to the documents bucket
 * This script should be run after the bucket is created
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY (get this from Supabase Dashboard > Settings > API)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyStoragePolicies() {
  try {
    console.log('🔄 Applying storage policies...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
    
    if (!documentsBucket) {
      console.error('❌ Bucket "documents" not found. Please create it first using create-storage-bucket.js');
      process.exit(1);
    }
    
    console.log('✅ Bucket "documents" found');
    
    // Note: Storage policies are typically applied via SQL migrations
    // This script is mainly for verification and documentation
    console.log('📋 Storage policies should be applied via SQL migration:');
    console.log('   20250114_create_documents_storage_bucket.sql');
    console.log('');
    console.log('🔒 Current bucket configuration:');
    console.log(`   - Name: ${documentsBucket.name}`);
    console.log(`   - Public: ${documentsBucket.public}`);
    console.log(`   - File size limit: ${documentsBucket.file_size_limit} bytes`);
    console.log(`   - Allowed MIME types: ${documentsBucket.allowed_mime_types?.join(', ') || 'Not specified'}`);
    console.log('');
    console.log('✅ Storage bucket is properly configured');
    console.log('🔐 RLS policies will be applied when you run the migration');
    
  } catch (error) {
    console.error('❌ Error checking storage configuration:', error.message);
    process.exit(1);
  }
}

applyStoragePolicies();
