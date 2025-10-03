#!/usr/bin/env node

/**
 * Script to apply the subscription status fix migration
 * This script applies the migration that fixes subscription_status error in RLS
 */

const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250108_fix_subscription_columns_and_rls.sql');
const migrationContent = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Subscription Status Fix Migration');
console.log('=====================================');
console.log('');
console.log('This migration will:');
console.log('✅ Add subscription_status and subscription_plan columns to profiles table');
console.log('✅ Recreate RLS policies for cases, clients, documents, billing tables');
console.log('✅ Allow access only when profiles.subscription_status = "active" AND profiles.id = auth.uid()');
console.log('✅ Give demo user (demo@odvjetnikai.com) read-only access (SELECT only)');
console.log('');
console.log('📄 Migration SQL:');
console.log('==================');
console.log(migrationContent);
console.log('');
console.log('🚀 To apply this migration:');
console.log('1. Copy the SQL above');
console.log('2. Go to your Supabase Dashboard');
console.log('3. Navigate to SQL Editor');
console.log('4. Paste and run the SQL');
console.log('');
console.log('⚠️  Important Notes:');
console.log('- This migration is idempotent (safe to run multiple times)');
console.log('- It will drop and recreate RLS policies');
console.log('- Demo user will have read-only access to all tables');
console.log('- Active subscribers will have full access to their own data');
console.log('');
console.log('✅ Migration ready to apply!');
