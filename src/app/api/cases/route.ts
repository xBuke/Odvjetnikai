import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDbErrorToUserMessage } from '@/lib/subscription';
import { createCaseSchema, updateCaseSchema, validateRequestBody } from '@/lib/validation';
import { getUserFromRequest, handleApiError, createSuccessResponse, validateRequestMethod } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    validateRequestMethod(request, ['POST']);
    
    const body = await request.json();
    const validatedData = validateRequestBody(createCaseSchema, body);
    const user = await getUserFromRequest(request);

    // Insert the case with user_id
    const { data, error } = await supabaseAdmin
      .from('cases')
      .insert([{
        title: validatedData.title,
        client_id: validatedData.client_id,
        status: validatedData.status,
        notes: validatedData.notes || '',
        case_type: validatedData.case_type,
        case_status: validatedData.case_status,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
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
    return handleApiError(error, 'POST /api/cases');
  }
}

export async function GET(request: NextRequest) {
  try {
    validateRequestMethod(request, ['GET']);
    const user = await getUserFromRequest(request);

    // Get cases for the user with client information
    const { data, error } = await supabaseAdmin
      .from('cases')
      .select(`
        *,
        clients (
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'GET /api/cases');
  }
}

export async function PUT(request: NextRequest) {
  try {
    validateRequestMethod(request, ['PUT']);
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Case ID is required' },
        { status: 400 }
      );
    }

    const validatedData = validateRequestBody(updateCaseSchema, updateData);
    const user = await getUserFromRequest(request);

    // Update the case (RLS will ensure user can only update their own cases)
    const { data, error } = await supabaseAdmin
      .from('cases')
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
        { success: false, error: 'Case not found or access denied' },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'PUT /api/cases');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateRequestMethod(request, ['DELETE']);
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Case ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(request);

    // Delete the case (RLS will ensure user can only delete their own cases)
    const { error } = await supabaseAdmin
      .from('cases')
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

    return createSuccessResponse({ message: 'Case deleted successfully' });

  } catch (error) {
    return handleApiError(error, 'DELETE /api/cases');
  }
}
