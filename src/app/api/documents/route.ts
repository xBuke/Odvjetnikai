import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDbErrorToUserMessage } from '@/lib/subscription';
import { createDocumentSchema, updateDocumentSchema, validateRequestBody } from '@/lib/validation';
import { getUserFromRequest, handleApiError, createSuccessResponse, validateRequestMethod } from '@/lib/api-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    validateRequestMethod(request, ['POST']);
    
    const body = await request.json();
    const validatedData = validateRequestBody(createDocumentSchema, body);
    const user = await getUserFromRequest(request);

    // Insert the document with user_id
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert([{
        name: validatedData.name,
        file_url: validatedData.file_url,
        case_id: validatedData.case_id,
        file_size: validatedData.file_size,
        file_type: validatedData.file_type,
        type: validatedData.type,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Check if it's a trial limit error
      if (error.message.includes('Trial limit') || error.message.includes('Trial expired')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 409 }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { success: false, error: formatDbErrorToUserMessage(error.message) },
        { status: 500 }
      );
    }

    return createSuccessResponse(data, 201);

  } catch (error) {
    return handleApiError(error, 'POST /api/documents');
  }
}

export async function GET(request: NextRequest) {
  try {
    validateRequestMethod(request, ['GET']);
    const user = await getUserFromRequest(request);

    // Get documents for the user with case information
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        cases (
          title
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'GET /api/documents');
  }
}

export async function PUT(request: NextRequest) {
  try {
    validateRequestMethod(request, ['PUT']);
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const validatedData = validateRequestBody(updateDocumentSchema, updateData);
    const user = await getUserFromRequest(request);

    // Update the document (RLS will ensure user can only update their own documents)
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update(validatedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: formatDbErrorToUserMessage(error.message) },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'PUT /api/documents');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateRequestMethod(request, ['DELETE']);
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(request);

    // Delete the document (RLS will ensure user can only delete their own documents)
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: formatDbErrorToUserMessage(error.message) },
        { status: 500 }
      );
    }

    return createSuccessResponse({ message: 'Document deleted successfully' });

  } catch (error) {
    return handleApiError(error, 'DELETE /api/documents');
  }
}
