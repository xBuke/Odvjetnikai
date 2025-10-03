import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, plan } = body;

    // Validate required fields
    if (!email || !plan) {
      return NextResponse.json(
        { error: 'Email and plan are required' },
        { status: 400 }
      );
    }

    // Validate plan
    const validPlans = ['basic', 'premium', 'enterprise', 'PRO'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be one of: basic, premium, enterprise, PRO' },
        { status: 400 }
      );
    }

    // Use the imported supabase client

    // Look up user by email in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("Error finding user by email:", profileError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = profile.id;

    // Update user subscription in profiles table
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user subscription:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Return the updated profile
    return NextResponse.json({
      success: true,
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        full_name: updatedProfile.full_name,
        subscription_status: updatedProfile.subscription_status,
        subscription_plan: updatedProfile.subscription_plan,
        updated_at: updatedProfile.updated_at
      }
    });

  } catch (error) {
    console.error('Test subscription update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to check current subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Use the imported supabase client

    // Look up user by email in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("Error finding user by email:", profileError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = profile.id;

    // Get current subscription status
    const { data: currentProfile, error: currentProfileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_status, subscription_plan, updated_at')
      .eq('id', userId)
      .single();

    if (currentProfileError || !currentProfile) {
      console.error('Error fetching profile:', currentProfileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: currentProfile
    });

  } catch (error) {
    console.error('Test subscription check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
