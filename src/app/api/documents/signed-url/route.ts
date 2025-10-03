import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUserFromRequest, handleApiError, createSuccessResponse, validateRequestMethod } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    validateRequestMethod(request, ['POST']);
    const user = await getUserFromRequest(request);
    
    const body = await request.json();
    const { filePath } = body;
    
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path is required' },
        { status: 400 }
      );
    }

    // Verify the user owns this document by checking the documents table
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, file_url')
      .eq('user_id', user.id)
      .ilike('file_url', `%${filePath}%`)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Create signed URL with 1 hour expiration (3600 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(filePath, 3600);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return createSuccessResponse({
      signedUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
    });

  } catch (error) {
    return handleApiError(error, 'POST /api/documents/signed-url');
  }
}
