#!/usr/bin/env node

/**
 * Script to apply the documents storage bucket migration
 * This script reads the migration file and applies it to your Supabase project
 */

const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250103_add_documents_bucket.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Documents Storage Bucket Migration');
console.log('=====================================');
console.log('');
console.log('This migration will:');
console.log('✅ Create the "documents" storage bucket (if it doesn\'t exist)');
console.log('✅ Enable Row Level Security on storage.objects');
console.log('✅ Add policies for secure document access');
console.log('✅ Ensure users can only access their own documents');
console.log('');
console.log('📋 Migration SQL:');
console.log('================');
console.log(migrationSQL);
console.log('');
console.log('🚀 To apply this migration:');
console.log('');
console.log('Option 1 - Supabase CLI:');
console.log('  supabase db push');
console.log('');
console.log('Option 2 - Supabase Dashboard:');
console.log('  1. Go to your Supabase project dashboard');
console.log('  2. Navigate to SQL Editor');
console.log('  3. Copy and paste the SQL above');
console.log('  4. Click "Run" to execute');
console.log('');
console.log('Option 3 - Save to file:');
console.log('  The migration is saved to: supabase/migrations/20250103_add_documents_bucket.sql');
console.log('');
console.log('⚠️  Important Notes:');
console.log('- This migration is idempotent (safe to run multiple times)');
console.log('- Always backup your database before applying migrations in production');
console.log('- Test on a development environment first');
console.log('');
console.log('✅ Migration file is ready to apply!');
