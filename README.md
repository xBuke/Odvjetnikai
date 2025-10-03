# Law Firm SaaS - Croatian Legal Practice Management System

A modern [Next.js](https://nextjs.org) application for managing law firms, localized for the Croatian market with comprehensive legal practice management features.

## Project Overview

This application provides a complete solution for Croatian law firms to manage their practice, including client management, case tracking, billing, document storage, and calendar scheduling. The system is built with security and data privacy in mind, using Row Level Security (RLS) to ensure each user can only access their own data.

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
- **💰 Billing & Invoicing** - Time tracking and invoice generation
- **📄 Document Management** - Secure document storage and organization
- **📅 Calendar & Scheduling** - Meeting planning and deadline tracking
- **📊 Dashboard** - Key practice metrics and overview
- **🌍 Croatian Localization** - Fully localized for Croatian legal market
- **🔒 Row Level Security** - Secure data isolation between users

## Setup (Local Development)

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

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

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it `documents`
4. Set it as **Public** (for file downloads)
5. Click **Create bucket**

#### Storage Policies (Recommended)

After creating the bucket, set up these policies in **Storage** > **Policies**:

- **Upload**: Allow authenticated users to upload documents
- **View**: Allow authenticated users to view documents  
- **Delete**: Allow authenticated users to delete documents

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

### 6. Authentication

- **Register**: Navigate to `/register` to create a new account
- **Login**: Use `/login` to sign in
- **Logout**: Click the logout button in the top-right corner

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

## Croatian Localization

The application is fully localized for the Croatian legal market:

- Croatian client names and company data
- Croatian legal context and case types
- Croatian document names and contracts
- Croatian addresses and contact information
- Croatian legal terminology

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## License

This project is private and proprietary. All rights reserved.