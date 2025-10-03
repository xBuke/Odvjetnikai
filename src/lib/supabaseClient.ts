import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only throw errors in production if environment variables are missing
// Skip this check during build process to allow static generation
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_VERCEL_ENV) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
