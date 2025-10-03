import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    // In a real implementation, you would verify the Stripe signature here
    // For now, we'll parse the body directly
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON payload:', err);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    // Use the imported supabase client
    
    // Extract user information from session metadata or customer
    const userId = session.metadata?.user_id || session.customer;
    const plan = session.metadata?.plan || 'basic';
    
    if (!userId) {
      console.error('No user ID found in checkout session');
      return;
    }

    // Update user subscription status
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }

    console.log(`Successfully activated subscription for user ${userId} with plan ${plan}`);
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    // Use the imported supabase client
    
    // Extract user information from subscription metadata
    const userId = subscription.metadata?.user_id;
    const status = subscription.status === 'active' ? 'active' : 'inactive';
    const plan = subscription.metadata?.plan || 'basic';
    
    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }

    // Update user subscription status
    const { error } = await supabase
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

    console.log(`Successfully updated subscription for user ${userId}: ${status} (${plan})`);
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    // Use the imported supabase client
    
    // Extract user information from subscription metadata
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user ID found in subscription metadata');
      return;
    }

    // Update user subscription status to inactive
    const { error } = await supabase
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

    console.log(`Successfully deactivated subscription for user ${userId}`);
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}
