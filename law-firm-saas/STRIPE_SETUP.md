# Stripe Subscription Setup Guide

This guide will help you set up Stripe subscriptions for your Law Firm SaaS application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. A Supabase project with the database migrations applied
3. Environment variables configured

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Price IDs (create these in your Stripe dashboard)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Setup Steps

### 1. Create Products and Prices in Stripe Dashboard

1. Go to your Stripe Dashboard → Products
2. Create a new product called "Law Firm SaaS Professional"
3. Add two prices:
   - Monthly: $29/month
   - Yearly: $290/year (save $58)
4. Copy the Price IDs and add them to your environment variables

### 2. Set Up Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your environment variables

### 3. Apply Database Migrations

Run the following SQL in your Supabase SQL Editor:

```sql
-- Run the migration file: supabase/migrations/20250103_add_stripe_subscription_support.sql
```

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/pricing`
3. Click "Subscribe Now" to test the checkout flow
4. Use Stripe's test card numbers:
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002

## Features Implemented

✅ **Pricing Page**: Beautiful pricing page with monthly and yearly plans
✅ **Stripe Checkout**: Secure payment processing with Stripe Checkout
✅ **Webhook Handling**: Automatic subscription status updates
✅ **Access Control**: RLS policies restrict access to active subscribers only
✅ **Subscription Status Check**: Users with inactive subscriptions are redirected
✅ **Welcome Email**: Email sent after successful payment (template ready)
✅ **Database Integration**: Subscription status stored in user metadata

## Security Features

- Row Level Security (RLS) policies ensure only active subscribers can access data
- Webhook signature verification prevents unauthorized requests
- User subscription status checked on every protected route
- Secure handling of Stripe customer IDs and subscription IDs

## Production Deployment

1. Update environment variables with production Stripe keys
2. Update webhook endpoint URL to your production domain
3. Test the complete flow in production
4. Set up monitoring for webhook failures
5. Configure email service for welcome emails

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**: Check webhook URL and ensure it's accessible
2. **Subscription status not updating**: Verify webhook secret and database functions
3. **RLS policies blocking access**: Ensure user has `subscription_status = 'active'`
4. **Checkout session creation fails**: Verify Stripe keys and price IDs

### Debug Mode

Enable debug logging by adding to your environment:
```env
NODE_ENV=development
```

## Support

For issues with this implementation, check:
1. Stripe Dashboard logs
2. Supabase logs
3. Application console logs
4. Webhook delivery logs in Stripe Dashboard
