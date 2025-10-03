# Trial Implementation Summary

## Overview
This document summarizes the implementation of the 7-day Trial subscription with entity limits for the Odvjetnikai law firm SaaS application.

## ✅ Completed Features

### 1. **Helper Libraries**
- **`src/lib/subscription.ts`** - Profile interface and utility functions
  - `isTrial()`, `isTrialExpired()`, `daysLeft()`, `trialLimit()`
  - `formatDbErrorToUserMessage()` for Croatian error messages
- **`src/lib/ui-limit.ts`** - Entity creation limit checking
  - `canCreateEntity(profile, currentCount)` function

### 2. **Trial Banner Component**
- **`src/components/billing/TrialBanner.tsx`**
  - Shows for users with `subscription_status === "trial"`
  - Displays days left and 20-entity limit for active trials
  - Shows expiration message for expired trials
  - Always includes CTA button linking to `/pricing`
  - Styled with Tailwind (amber for active, red for expired)

### 3. **Dashboard Pages Updated**
All three dashboard pages (`cases`, `clients`, `documents`) now include:
- TrialBanner component at the top
- Entity counters showing `(X/20 iskorišteno tijekom triala)` for trial users
- Trial limit checks before entity creation
- Croatian error messages when limits are reached

### 4. **Entity Creation Guards**
- Frontend protection using `canCreateEntity(profile, currentCount)`
- Croatian toast messages:
  - `"Trial je istekao. Nadogradi plan za nastavak."`
  - `"Dosegnut je trial limit (20). Nadogradi plan za nastavak."`
- Prevents API calls when blocked

### 5. **API Routes**
New API routes created:
- **`/api/clients/route.ts`** - POST/GET for client management
- **`/api/cases/route.ts`** - POST/GET for case management  
- **`/api/documents/route.ts`** - POST/GET for document management

Features:
- Handle trial limit/expired errors with 409 Conflict status
- Return 500 for generic errors
- Proper authentication and error handling

### 6. **Database Schema Updates**
- **`20250112_add_trial_fields_to_profiles.sql`**
  - Adds `trial_expires_at` and `trial_limit` columns to profiles table
  - Creates trial management functions
- **`20250112_update_rls_for_trial_users.sql`**
  - Updates RLS policies to allow trial users
  - Adds triggers to enforce trial limits on insert

### 7. **AuthContext Enhanced**
- Added `profile` state with full profile data
- Added `refreshProfile()` function
- Fetches trial-related fields from database
- Provides fallback profile data if database profile doesn't exist

## 🎯 Key Features

1. **7-day Trial Support** - Users can have `subscription_status = 'trial'` with expiration tracking
2. **20 Entity Limit** - Trial users limited to 20 total entities (clients + cases + documents)
3. **Frontend Guards** - UI prevents creation when limits reached
4. **Backend Enforcement** - Database triggers and RLS policies enforce limits
5. **Croatian Messages** - All user-facing text in Croatian as requested
6. **Trial Banner** - Prominent display of trial status and days remaining
7. **Entity Counters** - Shows usage against trial limits
8. **Error Handling** - Proper 409/500 status codes for different error types

## 🚀 Usage

### Starting a Trial
```sql
-- Set user to trial status
SELECT start_trial_for_user('user-uuid-here');
```

### Checking Trial Status
```typescript
import { isTrial, isTrialExpired, daysLeft } from '@/lib/subscription';

if (isTrial(profile)) {
  if (isTrialExpired(profile)) {
    // Trial expired
  } else {
    const days = daysLeft(profile);
    // Show days remaining
  }
}
```

### Checking Entity Limits
```typescript
import { canCreateEntity } from '@/lib/ui-limit';

const limitCheck = canCreateEntity(profile, currentCount);
if (!limitCheck.ok) {
  showToast(limitCheck.reason, 'error');
  return;
}
```

## 📋 Migration Order

Run these migrations in order:
1. `database-setup.sql`
2. `add-document-type-enum.sql`
3. `add-user-id-to-cases.sql`
4. `add-updated-at-triggers.sql`
5. `supabase/migrations/20250103_add_documents_bucket.sql`
6. `supabase/migrations/20250112_add_trial_fields_to_profiles.sql`
7. `supabase/migrations/20250112_update_rls_for_trial_users.sql`

## 🔧 Configuration

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Database Functions Available
- `start_trial_for_user(user_id)`
- `is_user_on_trial(user_id)`
- `is_trial_expired(user_id)`
- `get_trial_days_left(user_id)`
- `check_trial_entity_limit(user_id, entity_type, current_count)`

## 🎨 UI Components

### TrialBanner
- Automatically shows for trial users
- Displays trial status and days remaining
- Includes upgrade CTA button
- Responsive design with proper styling

### Entity Counters
- Shows current usage vs trial limit
- Only visible for trial users
- Format: `(X/20 iskorišteno tijekom triala)`

## 🛡️ Security

- RLS policies updated to allow trial users
- Database triggers enforce limits at insert time
- Frontend and backend validation
- Proper error handling and user feedback

## 📱 User Experience

- Clear trial status indication
- Helpful error messages in Croatian
- Smooth upgrade flow to pricing page
- Non-intrusive but visible trial information
