# Project Setup Guide

## ✅ Current Status

The authentication system is now working! The main issues have been resolved:

1. **Email validation**: Fixed by using proper email formats (e.g., `divyanshus068@gmail.com`)
2. **Redirect errors**: Fixed by removing try-catch around redirects
3. **Email confirmation**: Fixed by using correct redirect URL (`/auth/confirm`)
4. **Email verification**: Fixed to handle both `code` and `token_hash` parameters from Supabase
5. **Email verification method**: Fixed to use correct `verifyOtp` method without email parameter

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Getting Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Add them to your `.env.local` file

## Email Configuration

If you're getting email validation errors:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Check "Enable email confirmations" is enabled
4. Configure your email provider if needed

## Fixing Email Validation Issues

If you're getting "Email address is invalid" errors:

### Option 1: Disable Email Restrictions

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Scroll down to "Email Templates"
4. Make sure "Enable email confirmations" is ON
5. Check that there are no email domain restrictions

### Option 2: Configure Allowed Email Domains

1. Go to Authentication > Settings
2. Look for "Email Templates" section
3. If there are domain restrictions, add your test domains
4. Or temporarily disable email restrictions for testing

### Option 3: Use a Different Email

Try using emails from common domains like:

- `test@gmail.com`
- `user@example.com`
- `admin@test.com`

## Testing the Setup

Visit `/test-supabase` to test your Supabase connection and signup functionality.

## Authentication Flow

1. **Signup**: User registers with email/password
2. **Email Verification**: User receives confirmation email
3. **Email Confirmation**: User clicks link in email → `/auth/confirm?code=xxx`
4. **Success**: User is redirected to `/chat`
5. **Error**: User is redirected to `/error` with specific message

## Debugging

The application now includes comprehensive logging:

- **Signup process**: Logs email, environment variables, and user creation
- **Email verification**: Logs all parameters received from Supabase
- **Page visits**: Logs when users visit verify-email, chat, and error pages
- **Error tracking**: Detailed error messages with specific error codes

Check the terminal console for detailed logs during the authentication process.

## Common Issues

### "Email address is invalid" error

- Make sure the email format is valid (e.g., `test@example.com`)
- Single character emails like `s@gmail.com` may be rejected
- Check your Supabase project's email validation settings
- Try the test page at `/test-supabase` to debug

### "Unexpected token '<'" error

- This usually means Supabase environment variables are missing
- Check your `.env.local` file exists and has correct values
- Restart your development server after adding environment variables

### Supabase Connection Issues

1. Verify your environment variables are correct
2. Check that your Supabase project is active
3. Ensure your project URL and API key are from the same project
4. Try the test page at `/test-supabase`

### Email Verification Issues

1. Check that the email confirmation is enabled in Supabase
2. Verify the redirect URL is correct (`/auth/confirm`)
3. Check the email templates in Supabase dashboard
4. Test with a real email address
5. Check console logs for detailed error information
6. **NEW**: If getting "Token has expired or is invalid" error:
   - Check Supabase project settings: Authentication → Settings → Email Templates
   - Make sure "Enable email confirmations" is ON
   - Check Site URL is set to: `http://localhost:3000`
   - Token expiration time (default: 1 hour) - try clicking the link immediately
   - Visit `/test-supabase` and use the "Test Verification Method" button

## Running the Project

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to see the application.
Visit http://localhost:3000/test-supabase to test Supabase connection.
