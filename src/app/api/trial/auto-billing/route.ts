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
    // Verify this is a legitimate request (you might want to add API key verification)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all users whose trial has expired in the last hour
    const { data: expiredTrials, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, subscription_status, trial_expires_at')
      .eq('subscription_status', 'trial')
      .lt('trial_expires_at', new Date().toISOString())
      .gte('trial_expires_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

    if (error) {
      console.error('Error fetching expired trials:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!expiredTrials || expiredTrials.length === 0) {
      return NextResponse.json({ message: 'No expired trials found' });
    }

    const results = [];

    for (const user of expiredTrials) {
      try {
        // Check if user already has a Stripe customer
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
        
        if (!authUser?.user) {
          console.error(`User not found: ${user.id}`);
          continue;
        }

        let customerId = authUser.user.user_metadata?.stripe_customer_id;

        // Create Stripe customer if doesn't exist
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              supabase_user_id: user.id,
            },
          });
          
          customerId = customer.id;
          
          // Update user metadata with Stripe customer ID
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...authUser.user.user_metadata,
              stripe_customer_id: customerId,
            },
          });
        }

        // Create subscription with trial period that just ended
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_basic',
            },
          ],
          trial_end: Math.floor(Date.now() / 1000), // End trial immediately
          metadata: {
            userId: user.id,
            userEmail: user.email,
            auto_billing: 'true',
          },
        });

        // Update user profile to active subscription
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: 'basic',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        results.push({
          userId: user.id,
          email: user.email,
          subscriptionId: subscription.id,
          status: 'success',
        });

        console.log(`Auto-billing created for user ${user.id} (${user.email})`);

      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.push({
          userId: user.id,
          email: user.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${expiredTrials.length} expired trials`,
      results,
    });

  } catch (error) {
    console.error('Error in auto-billing endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
