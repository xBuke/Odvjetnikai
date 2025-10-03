import { supabase } from './supabaseClient';

/**
 * Get document URL based on environment configuration
 * In production: uses signed URLs for security
 * In demo mode: uses public URLs for easier access
 */
export async function getDocumentUrl(filePath: string, isDemoMode: boolean = false): Promise<string> {
  if (isDemoMode || process.env.NODE_ENV === 'development') {
    // Use public URL for demo mode or development
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    return publicUrl;
  }

  // Production mode: use signed URL
  const { data: signedUrlData, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600); // 1 hour expiration

  if (error) {
    console.error('Error creating signed URL:', error);
    throw new Error('Failed to generate secure download URL');
  }

  return signedUrlData.signedUrl;
}

/**
 * Get signed URL for document download via API
 * This is used when we need to verify user ownership server-side
 */
export async function getSignedUrlViaApi(filePath: string): Promise<string> {
  const response = await fetch('/api/documents/signed-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filePath }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate download URL');
  }

  const data = await response.json();
  return data.signedUrl;
}

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}
