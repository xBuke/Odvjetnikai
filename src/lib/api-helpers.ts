import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createApiResponse } from '@/lib/validation';

// Helper function to extract and verify user from request
export async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Authorization header required');
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');
  
  // Verify the token and get user
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error('Invalid or expired token');
  }

  return user;
}

// Helper function to handle API errors consistently
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context} error:`, error);
  
  let errorMessage = 'Internal server error';
  let statusCode = 500;

  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Handle specific error types
    if (error.message.includes('Authorization header required') || 
        error.message.includes('Invalid or expired token')) {
      statusCode = 401;
    } else if (error.message.includes('Validation error')) {
      statusCode = 400;
    } else if (error.message.includes('Trial limit') || 
               error.message.includes('Trial expired')) {
      statusCode = 409;
    }
  }

  return NextResponse.json(
    createApiResponse(false, undefined, errorMessage),
    { status: statusCode }
  );
}

// Helper function to create success response
export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse {
  return NextResponse.json(
    createApiResponse(true, data),
    { status: statusCode }
  );
}

// Helper function to validate request method
export function validateRequestMethod(request: NextRequest, allowedMethods: string[]): void {
  if (!allowedMethods.includes(request.method)) {
    throw new Error(`Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
  }
}
