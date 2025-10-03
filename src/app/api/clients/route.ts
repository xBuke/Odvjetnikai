import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDbErrorToUserMessage } from '@/lib/subscription';
import { createClientSchema, updateClientSchema, validateRequestBody } from '@/lib/validation';
import { getUserFromRequest, handleApiError, createSuccessResponse, validateRequestMethod } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    validateRequestMethod(request, ['POST']);
    
    const body = await request.json();
    const validatedData = validateRequestBody(createClientSchema, body);
    const user = await getUserFromRequest(request);

    // Insert the client with user_id
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert([{
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        oib: validatedData.oib,
        notes: validatedData.notes || '',
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
    return handleApiError(error, 'POST /api/clients');
  }
}

export async function GET(request: NextRequest) {
  try {
    validateRequestMethod(request, ['GET']);
    const user = await getUserFromRequest(request);

    // Get clients for the user
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'GET /api/clients');
  }
}

export async function PUT(request: NextRequest) {
  try {
    validateRequestMethod(request, ['PUT']);
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const validatedData = validateRequestBody(updateClientSchema, updateData);
    const user = await getUserFromRequest(request);

    // Update the client (RLS will ensure user can only update their own clients)
    const { data, error } = await supabaseAdmin
      .from('clients')
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
        { success: false, error: 'Client not found or access denied' },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'PUT /api/clients');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateRequestMethod(request, ['DELETE']);
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(request);

    // Delete the client (RLS will ensure user can only delete their own clients)
    const { error } = await supabaseAdmin
      .from('clients')
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

    return createSuccessResponse({ message: 'Client deleted successfully' });

  } catch (error) {
    return handleApiError(error, 'DELETE /api/clients');
  }
}
