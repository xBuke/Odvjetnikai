import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover',
    });

    // Get webhook secret from environment variables
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    // Get the raw body and signature from the request
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify the webhook signature to ensure the request is from Stripe
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Received Stripe webhook event: ${event.type}`);
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          console.log(`Unhandled event type: ${event.type}`);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing checkout.session.completed event');
    }
    
    // Extract customer email and subscription plan from session
    const customerEmail = session.customer_details?.email;
    const subscriptionPlan = session.metadata?.plan || 'basic'; // Fallback to 'basic' if no plan metadata
    
    if (!customerEmail) {
      console.error('No customer email found in checkout session');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Looking up user by email: ${customerEmail}`);
    }

    // Look up user by email in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", customerEmail)
      .single();

    if (profileError || !profile) {
      console.error("Error finding user by email:", profileError);
      return;
    }
    const userId = profile.id;

    if (process.env.NODE_ENV === 'development') {
      console.log(`Found user: ${userId} for email: ${customerEmail}`);
    }

    // Update profiles table with subscription status and plan
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: subscriptionPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user subscription in profiles:', updateError);
      throw updateError;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully activated subscription for user ${userId} with plan ${subscriptionPlan}`);
    }
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing subscription updated event');
    }
    
    // Extract user information from subscription metadata
    const userId = subscription.metadata?.user_id;
    const status = subscription.status === 'active' ? 'active' : 'inactive';
    const plan = subscription.metadata?.plan || 'basic'; // Fallback to 'basic' if no plan metadata
    
    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Updating subscription for user ${userId}: ${status} (${plan})`);
    }

    // Update user subscription status using admin client
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: status,
        subscription_plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully updated subscription for user ${userId}: ${status} (${plan})`);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Processing subscription deleted event');
    }
    
    // Extract user information from subscription metadata
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Deactivating subscription for user ${userId}`);
    }

    // Update user subscription status to inactive using admin client
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_plan: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully deactivated subscription for user ${userId}`);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}
