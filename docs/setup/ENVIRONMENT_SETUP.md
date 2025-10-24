# Environment Variables Setup Guide

This guide explains how to set up your environment variables for local development and production deployment.

## Required Environment Variables

You need to create a `.env.local` file in the root of your project with the following variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Password Protection
REACT_APP_ACCESS_PASSWORD=choose-a-strong-password

# Discord User ID
REACT_APP_DISCORD_USER_ID=217849233133404161
```

## How to Set Up

### 1. Create `.env.local` File

In the project root directory, create a file named `.env.local` (note the dot at the beginning).

### 2. Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** → paste as `REACT_APP_SUPABASE_URL`
5. Copy the **anon public** key → paste as `REACT_APP_SUPABASE_ANON_KEY`

### 3. Set a Password

Choose a strong password that both you and your girlfriend will use to access the portal. This is your first line of defense.

**Example**: `REACT_APP_ACCESS_PASSWORD=MySecurePassword123!`

### 4. Configure Discord User ID

The Discord user ID is already set to James's ID. To find other Discord user IDs:

1. Enable Developer Mode in Discord: Settings → Advanced → Developer Mode
2. Right-click on a user → Copy ID
3. Paste into the environment variable

## Example `.env.local` File

```bash
REACT_APP_SUPABASE_URL=https://abcdefghijk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjE1Njc4OTAsImV4cCI6MTkzNzE0Mzg5MH0.example-key-here
REACT_APP_ACCESS_PASSWORD=GrievancePortal2024!
REACT_APP_DISCORD_USER_ID=217849233133404161
```

## For Production (Vercel)

After deploying to Vercel, you need to add these same environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `REACT_APP_SUPABASE_URL`
   - Value: your Supabase URL
   - Click **Add**
4. Repeat for all 4 variables
5. Redeploy your site for changes to take effect

## Security Notes

- **NEVER commit `.env.local` to git** - it's already in `.gitignore`
- **NEVER share your anon key publicly** - it's in the environment variables, not the code
- **Choose a strong password** - at least 12 characters with mixed case, numbers, and symbols
- After creating `.env.local`, **restart your development server** (`npm start`)

## Troubleshooting

### "Password not configured" error

This means `REACT_APP_ACCESS_PASSWORD` is not set. Make sure:
1. You created `.env.local` in the project root (same level as `package.json`)
2. The variable name is spelled exactly right
3. You restarted the dev server after creating the file

### Can't connect to Supabase

Check that:
1. Your Supabase URL and anon key are correct
2. There are no extra spaces before or after the values
3. The Supabase project is active and not paused

### Discord notifications not working

1. Verify the Discord user ID is correct
2. Check that the `DISCORD_WEBHOOK_URL` secret is set in Supabase Edge Functions
3. Ensure your Supabase function is deployed

## Next Steps

After setting up environment variables:

1. Run `npm install` to install new dependencies (DOMPurify)
2. Run `npm start` to test locally
3. Test the password screen
4. Try submitting a grievance
5. Deploy to Vercel and add environment variables there
6. Set up RLS policies in Supabase (see `SUPABASE_RLS_SETUP.md`)

