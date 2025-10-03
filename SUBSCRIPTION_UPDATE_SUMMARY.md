# Subscription System Update Summary

## Overview
This update implements the requested changes to the Odvjetnikai project's subscription system, including database migrations, webhook handling, and testing capabilities.

## Changes Made

### 1. Database Migration (`20250111_update_handle_new_user_and_subscription_plan.sql`)

**Key Changes:**
- **Updated `handle_new_user` function**: Now only inserts `id`, `full_name`, `avatar_url`, `role`, and `subscription_status` into profiles
- **Set default subscription_status to 'inactive'**: New users start with inactive subscriptions
- **Removed subscription_plan from trigger**: The function no longer sets a default subscription plan
- **Added idempotent subscription_plan column**: Ensures the column exists without errors if already present

**Security Features:**
- Uses `IF NOT EXISTS` checks for column additions
- Proper error handling with `ON CONFLICT DO NOTHING`
- Maintains existing RLS policies

### 2. Webhook API Route (`/api/subscription/webhook/route.ts`)

**Features:**
- Handles Stripe webhook events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`
- Updates user subscription status and plan in `public.profiles` table
- Proper error handling and logging
- Returns appropriate HTTP status codes

**Security Features:**
- Input validation for JSON payloads
- Error logging without exposing stack traces to clients
- Uses admin client for database operations
- Handles missing user IDs gracefully

### 3. Test API Route (`/api/subscription/test/route.ts`)

**Features:**
- **POST endpoint**: Accepts `email` and `plan` to manually update subscriptions
- **GET endpoint**: Check current subscription status by email
- Validates plan values (`basic`, `premium`, `enterprise`, `PRO`)
- Returns updated profile data as JSON

**Security Features:**
- Input validation for required fields
- Plan validation against allowed values
- Proper error handling with appropriate HTTP status codes
- Uses admin client for user lookups

### 4. Admin Client Setup (`supabaseAdmin.ts`)

**Features:**
- Separate admin client with service role key
- Configured for server-side operations
- Proper environment variable handling
- Auto-refresh and session persistence disabled for security

## API Usage Examples

### Test Subscription Update
```bash
# Update user subscription
curl -X POST http://localhost:3000/api/subscription/test \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "plan": "PRO"}'

# Check subscription status
curl http://localhost:3000/api/subscription/test?email=user@example.com
```

### Webhook Testing
```bash
# Simulate Stripe webhook
curl -X POST http://localhost:3000/api/subscription/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "metadata": {
          "user_id": "user-uuid",
          "plan": "PRO"
        }
      }
    }
  }'
```

## Security Considerations

1. **Idempotent Operations**: All database operations use `IF NOT EXISTS` or `ON CONFLICT` clauses
2. **Error Handling**: Comprehensive error handling without exposing sensitive information
3. **Input Validation**: All API endpoints validate input parameters
4. **Admin Access**: Server-side operations use admin client with service role key
5. **Logging**: Errors are logged for debugging without exposing stack traces

## Migration Order

1. Run the SQL migration: `20250111_update_handle_new_user_and_subscription_plan.sql`
2. Deploy the new API routes
3. Test with the test endpoint before integrating with real payment provider

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `STRIPE_WEBHOOK_SECRET` (for webhook verification)

## Testing Checklist

- [ ] New users get `subscription_status: 'inactive'` by default
- [ ] `subscription_plan` column exists and is nullable
- [ ] Test API route can update subscriptions
- [ ] Webhook route handles different event types
- [ ] Error handling works correctly
- [ ] No stack traces exposed to clients
