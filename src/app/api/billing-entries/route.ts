import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDbErrorToUserMessage } from '@/lib/subscription';
import { createBillingEntrySchema, updateBillingEntrySchema, validateRequestBody } from '@/lib/validation';
import { getUserFromRequest, handleApiError, createSuccessResponse, validateRequestMethod } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    validateRequestMethod(request, ['POST']);
    
    const body = await request.json();
    const validatedData = validateRequestBody(createBillingEntrySchema, body);
    const user = await getUserFromRequest(request);

    // Insert the billing entry with user_id
    const { data, error } = await supabaseAdmin
      .from('billing_entries')
      .insert([{
        client_id: validatedData.client_id,
        case_id: validatedData.case_id,
        hours: validatedData.hours,
        rate: validatedData.rate,
        notes: validatedData.notes,
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
    return handleApiError(error, 'POST /api/billing-entries');
  }
}

export async function GET(request: NextRequest) {
  try {
    validateRequestMethod(request, ['GET']);
    const user = await getUserFromRequest(request);

    // Get billing entries for the user with client and case information
    const { data, error } = await supabaseAdmin
      .from('billing_entries')
      .select(`
        *,
        clients (
          name
        ),
        cases (
          title
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch billing entries' },
        { status: 500 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'GET /api/billing-entries');
  }
}

export async function PUT(request: NextRequest) {
  try {
    validateRequestMethod(request, ['PUT']);
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Billing entry ID is required' },
        { status: 400 }
      );
    }

    const validatedData = validateRequestBody(updateBillingEntrySchema, updateData);
    const user = await getUserFromRequest(request);

    // Update the billing entry (RLS will ensure user can only update their own entries)
    const { data, error } = await supabaseAdmin
      .from('billing_entries')
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
        { success: false, error: 'Billing entry not found or access denied' },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);

  } catch (error) {
    return handleApiError(error, 'PUT /api/billing-entries');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateRequestMethod(request, ['DELETE']);
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Billing entry ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(request);

    // Delete the billing entry (RLS will ensure user can only delete their own entries)
    const { error } = await supabaseAdmin
      .from('billing_entries')
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

    return createSuccessResponse({ message: 'Billing entry deleted successfully' });

  } catch (error) {
    return handleApiError(error, 'DELETE /api/billing-entries');
  }
}
