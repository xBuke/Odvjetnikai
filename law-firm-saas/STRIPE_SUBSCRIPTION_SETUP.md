# Stripe Subscription Setup Guide

This guide explains how to set up the Stripe subscription flow for the Law Firm SaaS application.

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Price IDs for subscription plans
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_basic_plan_id
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_pro_plan_id
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_enterprise_plan_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Setup Steps

### 1. Create Products and Prices in Stripe Dashboard

1. Go to your Stripe Dashboard
2. Navigate to Products
3. Create three products:

**Basic Plan (€147/month)**
- Product Name: "Basic Plan"
- Price: €147.00
- Billing: Monthly
- Copy the Price ID and set it as `NEXT_PUBLIC_STRIPE_PRICE_BASIC`

**Pro Plan (€297/month)**
- Product Name: "Pro Plan" 
- Price: €297.00
- Billing: Monthly
- Copy the Price ID and set it as `NEXT_PUBLIC_STRIPE_PRICE_PRO`

**Enterprise Plan (€597/month)**
- Product Name: "Enterprise Plan"
- Price: €597.00
- Billing: Monthly
- Copy the Price ID and set it as `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE`

### 2. Set Up Webhook Endpoint

1. Go to Stripe Dashboard > Webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret and set it as `STRIPE_WEBHOOK_SECRET`

## Database Setup

The database migration `20250103_add_stripe_subscription_support.sql` includes:

- Functions to check and update subscription status
- RLS policies that require active subscriptions for data access
- Trigger to set default subscription status for new users

Run the migration in your Supabase project.

## Subscription Flow

### 1. User Registration
- New users are created with `subscription_status: 'inactive'`
- They can access login/register pages but not protected content

### 2. Subscription Purchase
- User visits `/pricing` page
- Selects a plan and clicks "Subscribe"
- Redirected to Stripe Checkout
- After successful payment, webhook updates subscription status to 'active'

### 3. Access Control
- Active subscribers can access all features
- Inactive users are redirected to `/subscription-inactive` page
- RLS policies enforce subscription requirements at database level

### 4. Subscription Management
- Webhooks handle subscription status changes
- Payment failures set status to 'inactive'
- Cancellations set status to 'inactive'

## Testing

1. Start your development server: `npm run dev`
2. Register a new user
3. Try to access protected routes (should redirect to subscription-inactive)
4. Go to `/pricing` and test subscription flow with Stripe test cards
5. Verify webhook updates subscription status

## Test Cards

Use these Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Troubleshooting

- Check webhook logs in Stripe Dashboard
- Verify environment variables are set correctly
- Ensure database migration has been applied
- Check browser console for any JavaScript errors
