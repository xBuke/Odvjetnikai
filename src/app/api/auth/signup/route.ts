import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error('No user data returned from signup');
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create basic profile entry (trial will be activated by email confirmation trigger)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create profile:', {
        userId: authData.user.id,
        email: authData.user.email,
        error: profileError,
        errorMessage: profileError.message,
        errorDetails: profileError.details,
        errorHint: profileError.hint,
        errorCode: profileError.code
      });
      
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Create default user preferences
    const { error: preferencesError } = await supabaseAdmin
      .from('user_preferences')
      .insert([{
        user_id: authData.user.id,
        page: 'cases',
        sort_field: 'created_at',
        sort_direction: 'desc'
      }]);

    if (preferencesError) {
      console.error('Failed to create user preferences:', preferencesError);
      // Don't fail the signup for preferences error, just log it
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at
      },
      profile: profileData
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
