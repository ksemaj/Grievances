# Grievance Portal

A lightweight React app where Bug submits grievances and James manages them, with smooth transitions and Discord notifications. Ships as a PWA with iOS/Android icons.

## Features
- Submit grievances with title, description, severity
- James’s Inbox: active and completed sections
- One-tap notifications: Notify and Attention NOW
- Crossfade transitions and role selection screen
- PWA support: Add to Home Screen, maskable icons

## Tech stack
- React + Tailwind CSS
- Supabase (Postgres + Edge Functions)
- Lucide icons

## Setup
1. Install deps
   ```bash
   npm install
   ```
2. Env vars (`.env`)
   ```bash
   REACT_APP_SUPABASE_URL=your-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run dev server
   ```bash
   npm start
   ```

## Supabase function
- Source: `supabase/functions/notify-discord/index.ts`
- Required secret: `DISCORD_WEBHOOK_URL`

## PWA / Icons
- iOS: place `public/icons/icon-180.png` (180×180 PNG)
- Manifest icons (maskable): `public/logo192.png`, `public/logo512.png`

## Deployment
[Deployed with Vercel](https://vercel.com)

## License
Personal project; adapt as you wish.
