import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, planId = 'basic' } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the user exists and is on trial
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('subscription_status', 'trial')
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found or not on trial' },
        { status: 404 }
      );
    }

    // Check if user already has a Stripe customer
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (!authUser?.user) {
      return NextResponse.json(
        { error: 'User not found in auth' },
        { status: 404 }
      );
    }

    let customerId = authUser.user.user_metadata?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      
      customerId = customer.id;
      
      // Update user metadata with Stripe customer ID
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...authUser.user.user_metadata,
          stripe_customer_id: customerId,
        },
      });
    }

    // Get the price ID based on plan
    const priceId = process.env[`NEXT_PUBLIC_STRIPE_PRICE_${planId.toUpperCase()}`] || 
                   process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Calculate trial end date (7 days from now)
    const trialEndDate = Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);

    // Create subscription with 7-day trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      trial_end: trialEndDate,
      metadata: {
        userId: userId,
        userEmail: userEmail,
        plan: planId,
        trial_subscription: 'true',
      },
    });

    // Update user profile with subscription info
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'trial',
        subscription_plan: planId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customerId,
      trialEndDate: new Date(trialEndDate * 1000).toISOString(),
    });

  } catch (error) {
    console.error('Error creating trial subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
