# Username Authentication System

This update adds username-based authentication to the law firm SaaS application.

## Changes Made

### 1. Database Schema Updates

- **New `profiles` table**: Stores username linked to `auth.users.id`
- **Unique constraint**: Ensures usernames are unique
- **Automatic profile creation**: Trigger creates profile when user signs up
- **Database functions**: 
  - `get_email_by_username()`: Retrieves email for username login
  - `is_username_available()`: Checks username availability

### 2. Registration Form Updates

- **New username field**: Added username input with User icon
- **Username validation**: Checks availability before registration
- **Error handling**: Shows "Korisničko ime zauzeto" for duplicate usernames
- **User metadata**: Stores username in `user_metadata` during signup

### 3. Login Form Updates

- **Username input**: Replaced email field with username field
- **Backend lookup**: Fetches email by username for authentication
- **Error handling**: Shows appropriate error messages for invalid usernames

### 4. Authentication Context Updates

- **Updated signUp**: Now accepts username parameter
- **Updated signIn**: Now accepts username instead of email
- **New function**: `checkUsernameAvailability()` for validation
- **Database integration**: Uses RPC functions for username operations

## Setup Instructions

### For New Installations

Run the complete `database-setup.sql` file which includes all the username authentication features.

### For Existing Installations

Run the `username-auth-migration.sql` file to add username support to your existing database.

## Usage

### Registration
1. User enters: username, email, password, confirm password
2. System checks username availability
3. If available, creates user account with username in metadata
4. Profile is automatically created via database trigger

### Login
1. User enters: username, password
2. System looks up email by username
3. Authenticates using email and password
4. User is logged in successfully

## Error Messages

- **"Korisničko ime zauzeto"**: Username already exists
- **"Korisničko ime nije pronađeno"**: Username doesn't exist during login
- **"Email nije pronađen za ovog korisnika"**: Email lookup failed

## Security Features

- **Row Level Security**: Profiles table has proper RLS policies
- **Unique constraints**: Database-level username uniqueness
- **Secure functions**: All database functions use SECURITY DEFINER
- **Input validation**: Client-side and server-side validation

## Files Modified

- `src/app/register/page.tsx` - Added username field and validation
- `src/app/login/page.tsx` - Changed to username-based login
- `src/contexts/AuthContext.tsx` - Updated authentication methods
- `database-setup.sql` - Added profiles table and functions
- `username-auth-migration.sql` - Migration script for existing databases
