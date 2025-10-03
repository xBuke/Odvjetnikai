// Script to create Supabase storage bucket
// Run this with: node create-storage-bucket.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You need to add this to your .env.local

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY (get this from Supabase Dashboard > Settings > API)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBucket() {
  try {
    console.log('🔄 Creating storage bucket...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
    
    if (documentsBucket) {
      console.log('✅ Bucket "documents" already exists');
      return;
    }
    
    // Create the bucket
    const { error } = await supabase.storage.createBucket('documents', {
      public: false, // Private bucket for security
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf'
      ],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully created storage bucket "documents"');
    console.log('📁 Bucket is private and ready for secure file uploads');
    console.log('🔒 Files will be accessed via signed URLs for security');
    
  } catch (error) {
    console.error('❌ Error creating storage bucket:', error.message);
    process.exit(1);
  }
}

createStorageBucket();
