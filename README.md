# Grievance Portal

A lightweight React app where Bug submits grievances and James manages them, with smooth transitions and Discord notifications. Ships as a PWA with iOS/Android icons.

## Features
- 🔐 Password-protected access with shared authentication
- ⏰ Auto-logout after 15 minutes of inactivity (with 2-minute warning)
- 📝 Submit grievances with title, description, severity
- ✅ Input validation and XSS protection with DOMPurify
- ⏱️ Rate limiting to prevent spam (30s for submissions, 60s for notifications)
- 📊 James's Inbox: active and completed sections
- 🔔 One-tap notifications: Notify and Attention NOW
- 🎨 Crossfade transitions and role selection screen
- 📱 PWA support: Add to Home Screen, maskable icons
- 🛡️ Content Security Policy and CORS protection

## Tech stack
- React 19 + Vite 7 + Tailwind CSS
- Supabase (Postgres + Edge Functions)
- Lucide icons

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment variables
   - See [`docs/setup/ENVIRONMENT_SETUP.md`](docs/setup/ENVIRONMENT_SETUP.md) for detailed instructions
   - Create `.env.local` with:
     ```bash
     VITE_SUPABASE_URL=your-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     VITE_ACCESS_PASSWORD=your-password
     VITE_DISCORD_USER_ID=your-discord-id
     ```
3. Set up database security
   - Follow [`docs/setup/SUPABASE_RLS_SETUP.md`](docs/setup/SUPABASE_RLS_SETUP.md) to enable Row-Level Security
4. Run dev server
   ```bash
   npm run dev
   ```

## Supabase function
- Source: `supabase/functions/notify-discord/index.ts`
- Required secret: `DISCORD_WEBHOOK_URL`

## PWA / Icons
- iOS: place `public/icons/icon-180.png` (180×180 PNG)
- Manifest icons (maskable): `public/logo192.png`, `public/logo512.png`

## Security Features

This app implements multiple layers of security:

1. **Password Authentication**: Shared password (client-side) prevents unauthorized access
2. **Auto-Logout Timer**: 15-minute inactivity timeout with 2-minute warning
3. **Input Validation**: Title (200 chars) and description (2000 chars) limits
4. **XSS Protection**: DOMPurify sanitizes all user input before display
5. **Rate Limiting**: 30s cooldown for submissions, 60s for notifications
6. **CORS Restriction**: Discord function only accepts requests from production domain
7. **Content Security Policy**: Browser-level XSS protection via meta tag
8. **Row-Level Security**: Database-level access control (see [`docs/setup/SUPABASE_RLS_SETUP.md`](docs/setup/SUPABASE_RLS_SETUP.md))

## Deployment

1. Deploy with [Vercel](https://vercel.com)
2. Add environment variables in Vercel dashboard (Settings → Environment Variables)
3. Set up RLS policies in Supabase (see [`docs/setup/SUPABASE_RLS_SETUP.md`](docs/setup/SUPABASE_RLS_SETUP.md))
4. Ensure Discord webhook URL is set in Supabase Edge Functions

## Documentation

### Setup Guides
- [`docs/setup/QUICK_START.md`](docs/setup/QUICK_START.md) - Get running in 5 minutes
- [`docs/setup/ENVIRONMENT_SETUP.md`](docs/setup/ENVIRONMENT_SETUP.md) - Environment variables configuration guide
- [`docs/setup/SUPABASE_RLS_SETUP.md`](docs/setup/SUPABASE_RLS_SETUP.md) - Database security setup instructions

### Features
- [`docs/features/AFK_TIMER_FEATURE.md`](docs/features/AFK_TIMER_FEATURE.md) - Auto-logout timer documentation

### Security
- [`docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md`](docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md) - Complete technical security details

## License
Personal project; adapt as you wish.
