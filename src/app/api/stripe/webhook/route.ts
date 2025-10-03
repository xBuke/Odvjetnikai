import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      
      default:
        if (process.env.NODE_ENV === 'development') {
          console.log(`Unhandled event type: ${event.type}`);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const userEmail = session.metadata?.userEmail;
  
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  try {
    // Update user subscription status to active
    const { error } = await supabase.rpc('update_user_subscription_status', {
      user_id: userId,
      status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string
    });

    if (error) {
      console.error('Error updating subscription status:', error);
      return;
    }

    // Send welcome email with login credentials
    if (userEmail) {
      await sendWelcomeEmail(userEmail, userId);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Subscription activated for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  try {
    const { error } = await supabase.rpc('update_user_subscription_status', {
      user_id: userId,
      status: 'active',
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id
    });

    if (error) {
      console.error('Error updating subscription status:', error);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Subscription created for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  try {
    const status = subscription.status === 'active' ? 'active' : 'inactive';
    
    const { error } = await supabase.rpc('update_user_subscription_status', {
      user_id: userId,
      status: status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id
    });

    if (error) {
      console.error('Error updating subscription status:', error);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Subscription updated for user ${userId}: ${status}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  try {
    const { error } = await supabase.rpc('update_user_subscription_status', {
      user_id: userId,
      status: 'inactive',
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id
    });

    if (error) {
      console.error('Error updating subscription status:', error);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Subscription cancelled for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  
  if (!subscriptionId) {
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Ensure subscription is active
    const { error } = await supabase.rpc('update_user_subscription_status', {
      user_id: userId,
      status: 'active',
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id
    });

    if (error) {
      console.error('Error updating subscription status:', error);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Invoice payment succeeded for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription;
  
  if (!subscriptionId) {
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Set subscription to inactive due to payment failure
    const { error } = await supabase.rpc('update_user_subscription_status', {
      user_id: userId,
      status: 'inactive',
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id
    });

    if (error) {
      console.error('Error updating subscription status:', error);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Invoice payment failed for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function sendWelcomeEmail(userEmail: string, userId: string) {
  try {
    // Get user details from Supabase
    const { data: user, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !user) {
      console.error('Error getting user for welcome email:', error);
      return;
    }

    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // For now, we'll just log the email content
    
    const emailContent = {
      to: userEmail,
      subject: 'Welcome to Law Firm SaaS - Your Subscription is Active!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Welcome to Law Firm SaaS!</h1>
          <p>Your subscription has been successfully activated. You can now access all features of our law firm management platform.</p>
          
          <h2 style="color: #1f2937;">Your Login Credentials:</h2>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Password:</strong> [The password you set during registration]</p>
          
          <h2 style="color: #1f2937;">What's Next?</h2>
          <ul>
            <li>Log in to your dashboard</li>
            <li>Add your first client</li>
            <li>Create your first case</li>
            <li>Upload important documents</li>
            <li>Set up your calendar</li>
          </ul>
          
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The Law Firm SaaS Team</p>
        </div>
      `
    };

    // TODO: Implement actual email sending service
    // Example with a hypothetical email service:
    // await emailService.send(emailContent);
    
    // For now, we'll just log that the email would be sent (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Welcome email would be sent:', emailContent);
    }
    
  } catch (error) {
    // Log error for debugging (consider using proper logging service in production)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error sending welcome email:', error);
    }
  }
}
