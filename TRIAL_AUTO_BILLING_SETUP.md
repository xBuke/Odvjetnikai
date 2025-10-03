# Trial Auto-Billing Setup Guide

Ovaj vodič objašnjava kako postaviti automatsko naplaćivanje nakon 7-dnevnog trial-a.

## Pregled sustava

1. **Registracija**: Korisnici se mogu registrirati direktno i automatski dobivaju 7-dnevni trial
2. **Trial period**: 7 dana besplatnog pristupa svim funkcionalnostima
3. **Automatsko naplaćivanje**: Nakon isteka trial-a, automatski se kreira Stripe subscription
4. **Cron job**: Provjerava svaki sat za istekle trial-e i pokreće naplaćivanje

## Potrebne promjene

### 1. Environment Variables

Dodajte u `.env.local`:

```env
# Cron job secret for API authentication
CRON_SECRET=your_secure_random_string_here

# Stripe price IDs
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_your_basic_price_id
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_your_pro_price_id
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_your_enterprise_price_id
```

### 2. Database Migration

Pokrenite migraciju u Supabase SQL Editor:

```sql
-- Kopirajte sadržaj iz:
-- supabase/migrations/20250115_add_auto_trial_subscription.sql
```

### 3. Stripe Setup

1. **Kreirajte produkte u Stripe Dashboard**:
   - Basic Plan: €147/mjesec
   - Pro Plan: €297/mjesec  
   - Enterprise Plan: €597/mjesec

2. **Dodajte webhook endpoint**:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 4. Cron Job Setup

#### Opcija A: Vercel Cron Jobs (Preporučeno)

Dodajte u `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/trial/auto-billing",
      "schedule": "0 * * * *"
    }
  ]
}
```

#### Opcija B: External Cron Service

Koristite servis kao što je cron-job.org:

- URL: `https://yourdomain.com/api/trial/auto-billing`
- Method: POST
- Headers: `Authorization: Bearer your_cron_secret`
- Schedule: Svaki sat (0 * * * *)

#### Opcija C: Server Cron Job

Dodajte u crontab:

```bash
# Provjeri istekle trial-e svaki sat
0 * * * * cd /path/to/your/app && node scripts/check-expired-trials.js
```

## API Endpoints

### POST /api/trial/auto-billing

Automatski kreira Stripe subscription za korisnike čiji je trial istekao.

**Headers:**
```
Authorization: Bearer your_cron_secret
```

**Response:**
```json
{
  "message": "Processed 3 expired trials",
  "results": [
    {
      "userId": "uuid",
      "email": "user@example.com",
      "subscriptionId": "sub_xxx",
      "status": "success"
    }
  ]
}
```

### POST /api/trial/create-subscription

Kreira Stripe subscription s trial period-om za postojećeg korisnika.

**Body:**
```json
{
  "userId": "uuid",
  "userEmail": "user@example.com",
  "planId": "basic"
}
```

## Testiranje

### 1. Test registracije

1. Idite na `/login?tab=register`
2. Registrirajte se s novim email-om
3. Provjerite da li se korisnik kreira s `subscription_status = 'trial'`
4. Provjerite da li se prikazuje TrialBanner

### 2. Test automatskog naplaćivanja

1. Kreirajte test korisnika s `trial_expires_at` u prošlosti
2. Pokrenite cron job ručno:
   ```bash
   curl -X POST https://yourdomain.com/api/trial/auto-billing \
     -H "Authorization: Bearer your_cron_secret"
   ```
3. Provjerite da li se kreira Stripe subscription

### 3. Test Stripe webhook-a

1. Koristite Stripe CLI za testiranje:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Simulirajte subscription events

## Monitoring

### Logovi

Svi API pozivi se logiraju u konzoli. Za production, preporučujemo:

1. **Vercel**: Koristite Vercel Analytics
2. **Custom**: Integrirajte s Sentry ili sličnim servisom

### Alerts

Postavite alerts za:

1. **Failed auto-billing**: Kada cron job ne uspije
2. **Stripe webhook failures**: Kada webhook ne uspije
3. **High trial expiration rate**: Kada se mnogo trial-a istječe istovremeno

## Troubleshooting

### Česti problemi

1. **Cron job ne radi**:
   - Provjerite CRON_SECRET
   - Provjerite da li je endpoint dostupan
   - Provjerite logove

2. **Stripe subscription se ne kreira**:
   - Provjerite Stripe API ključeve
   - Provjerite da li postoje price ID-ovi
   - Provjerite webhook konfiguraciju

3. **Trial banner se ne prikazuje**:
   - Provjerite da li je korisnik na trial-u
   - Provjerite da li je TrialBanner komponenta uključena

### Debug mode

Za development, dodajte u `.env.local`:

```env
NODE_ENV=development
```

Ovo će omogućiti detaljnije logove.

## Sigurnost

1. **CRON_SECRET**: Koristite jaku, nasumičnu vrijednost
2. **API endpoints**: Svi endpoints zahtijevaju autentifikaciju
3. **Stripe webhooks**: Uvijek verificirajte webhook signature
4. **Rate limiting**: Razmislite o dodavanju rate limiting-a

## Backup plan

Ako automatsko naplaćivanje ne uspije:

1. **Manual intervention**: Admin može ručno kreirati subscription
2. **Email notifications**: Pošaljite email korisnicima o isteku trial-a
3. **Grace period**: Dodajte kratko razdoblje nakon isteka trial-a
