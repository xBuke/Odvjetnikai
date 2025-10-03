# Odvjetnik - Croatian Legal Practice Management System

A modern [Next.js](https://nextjs.org) application for managing law firms, localized for the Croatian market with comprehensive legal practice management features.

## Project Overview

This application provides a complete solution for Croatian law firms to manage their practice, including client management, case tracking, billing, document storage, and calendar scheduling. The system is built with security and data privacy in mind, using Row Level Security (RLS) to ensure each user can only access their own data.

## Recent Updates

### ✅ Latest Features (January 2025)
- **Trial System**: 7-day free trial with automatic billing conversion
- **Stripe Integration**: Complete subscription management with webhooks
- **Auto-billing**: Automated trial-to-subscription conversion
- **Enhanced Security**: Improved RLS policies and data protection
- **File Validation**: Comprehensive document upload validation
- **Contract Templates**: Croatian legal document templates
- **Billing System**: Advanced invoicing and time tracking

## Tech Stack

- **Frontend**: Next.js 15.5.4 with React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security
- **File Storage**: Supabase Storage
- **Calendar**: React Big Calendar
- **PDF Generation**: jsPDF with html2canvas
- **Date Handling**: date-fns and moment.js
- **Icons**: Lucide React

## Features

- **🔐 Secure Authentication** - Email/password authentication with Supabase
- **👥 Client Management** - Complete client database with Croatian names and data
- **⚖️ Case Management** - Track legal cases with Croatian legal context
- **💰 Billing & Invoicing** - Time tracking and invoice generation with Stripe integration
- **📄 Document Management** - Secure document storage and organization with file validation
- **📅 Calendar & Scheduling** - Meeting planning and deadline tracking
- **📊 Dashboard** - Key practice metrics and overview
- **🌍 Croatian Localization** - Fully localized for Croatian legal market
- **🔒 Row Level Security** - Secure data isolation between users
- **🆓 Free Trial** - 7-day trial with automatic subscription conversion
- **💳 Subscription Management** - Stripe-powered billing with webhook handling
- **📋 Contract Templates** - Pre-built Croatian legal document templates

## Setup (Local Development)

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration (for production)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id

# Trial System Configuration
CRON_SECRET=your_secure_random_string
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_your_basic_price_id
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_your_pro_price_id
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_your_enterprise_price_id

# Demo Mode Configuration
# Set to 'true' to enable demo mode (uses public URLs for easier access)
# Set to 'false' or leave empty for production mode (uses signed URLs for security)
NEXT_PUBLIC_DEMO_MODE=false
```

> **⚠️ Security Note:** The above are example placeholder values. Never commit real API keys or secrets to version control.

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for webhook handling and admin operations. Get this from your Supabase Dashboard > Settings > API.

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `database-setup.sql`
4. Click **Run** to execute the script

This creates:
- All required tables (`clients`, `cases`, `documents`, `billing`, `billing_entries`, `calendar_events`, `deadlines`, `user_preferences`)
- Proper indexes for performance
- Row Level Security policies
- Sample data for testing

### 4. Storage Setup

#### Option A: Automated Setup (Recommended)

Run the provided script to create the storage bucket:

```bash
node create-storage-bucket.js
```

#### Option B: Manual Setup

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it `documents`
4. Set it as **Private** (for security)
5. Set file size limit to **50MB**
6. Add allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `application/rtf`
7. Click **Create bucket**

#### Storage Policies

The storage policies are automatically applied via the migration file `20250114_create_documents_storage_bucket.sql`. These policies ensure:

- **Authenticated users can upload** their own documents
- **Authenticated users can view** only their own documents  
- **Authenticated users can delete** their own documents
- **Private bucket** - files accessed via signed URLs for security
- **Production uses signed URLs** for all confidential documents with 1-hour expiration

For detailed storage configuration, see [STORAGE_SETUP.md](./STORAGE_SETUP.md).

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Authentication & Trial System

- **Register**: Navigate to `/register` to create a new account
- **Login**: Use `/login` to sign in
- **Logout**: Click the logout button in the top-right corner
- **Free Trial**: All new users automatically get a 7-day free trial with access to all features (limit 20 items per category)
- **Auto-billing**: Trial automatically converts to paid subscription after 7 days
- **Subscription Management**: Visit `/pricing` to manage your subscription

All routes are protected - unauthenticated users will be redirected to the login page.

## Database (Supabase)

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - Each user can only access their own data
- **Secure policies** - Comprehensive SELECT, INSERT, UPDATE, DELETE policies
- **Authentication required** - All operations require valid authentication

### Migrations

The project includes several migration files in the `supabase/migrations/` directory:

- `20250103_add_billing_update_function.sql` - Billing table update triggers
- `20250103_add_documents_bucket.sql` - Document storage setup
- `20250103_add_handle_new_user_function.sql` - New user initialization
- `20250103_add_user_preferences_update_function.sql` - User preferences triggers

### Security Notes

- All tables use `user_id` foreign key references to `auth.users(id)`
- RLS policies ensure data isolation between users
- Storage policies control file access permissions
- JWT tokens are used for secure API communication
- **Document Security**: Production uses signed URLs for all confidential documents with 1-hour expiration
- **Demo Mode**: Set `NEXT_PUBLIC_DEMO_MODE=true` for development/demo purposes (uses public URLs)
- **API Security**: All API routes validate user authentication and ownership
- **File Access**: Documents are accessed via signed URLs that expire after 1 hour
- **Environment Variables**: Never commit real API keys or secrets to version control
- **CI/CD Security**: Automated security audits and secret scanning in CI pipeline

## Deployment (Vercel)

### 1. Prepare for Deployment

1. Ensure all environment variables are set in your Vercel project
2. Run `npm run build` locally to verify the build works
3. Test all functionality in production mode

### 2. Deploy to Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### 3. Environment Variables in Production

Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues

**"Error saving client: {}"**
- Check environment variables are set correctly
- Verify database setup script was run
- Check browser console for detailed errors

**"Bucket not found"**
- Create the `documents` storage bucket in Supabase
- Ensure bucket is set to public
- Restart the development server

**"permission denied"**
- Verify RLS policies are configured
- Check user authentication status
- Review Supabase logs for detailed errors

**"relation 'clients' does not exist"**
- Run the `database-setup.sql` script in Supabase SQL Editor
- Verify all tables were created successfully

### Verification Steps

1. Check `.env.local` exists with correct values
2. Verify all tables exist in Supabase dashboard
3. Confirm storage bucket "documents" is created
4. Test authentication flow (register/login)
5. Check browser console for any errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure all database operations respect RLS policies
- Test authentication flows thoroughly
- Maintain Croatian localization

## Trial System & Subscription Management

### Free Trial Features
- **7-day trial period** for all new users
- **20 items limit** per category (clients, cases, documents, etc.)
- **Full feature access** during trial period
- **Automatic conversion** to paid subscription after trial expires
- **Trial banner** showing remaining days and limits

### Subscription Plans
- **Basic Plan**: $29/month - Essential features for small practices
- **Pro Plan**: $49/month - Advanced features for growing firms
- **Enterprise Plan**: $99/month - Full features for large practices
- **Yearly Discount**: 20% off when paying annually

### Auto-billing System
- **Cron job integration** for automatic trial-to-subscription conversion
- **Stripe webhook handling** for real-time subscription updates
- **Graceful handling** of failed payments and subscription issues
- **Email notifications** for subscription status changes

## Croatian Localization

The application is fully localized for the Croatian legal market:

- Croatian client names and company data
- Croatian legal context and case types
- Croatian document names and contracts
- Croatian addresses and contact information
- Croatian legal terminology
- Croatian contract templates and legal documents

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## License

This project is private and proprietary. All rights reserved.