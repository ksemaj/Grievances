## Grievance Portal

A lightweight React app for logging grievances with a playful UX. Bug can submit entries; James can view, complete, and get Discord notifications. Ships as a PWA with iOS/Android icons.

### Features
- Submit grievances with title, description, severity
- “James’s Inbox” view with active/completed sections
- One-tap notifications:
  - Notify (normal)
  - Attention NOW (urgent mention)
- Smooth role-selection and page transitions
- PWA: Add to Home Screen, maskable icons

### Tech stack
- React + Tailwind CSS
- Supabase (Postgres + Edge Functions)
- Lucide icons

### Getting started
1. Install deps:
   ```bash
   npm install
   ```
2. Create `.env`:
   ```bash
   REACT_APP_SUPABASE_URL=your-url
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run:
   ```bash
   npm start
   ```

### Supabase Edge Function
This app calls `notify-discord` to ping James in Discord.

- Function source: `supabase/functions/notify-discord/index.ts`
- Required env on the function:
  - `DISCORD_WEBHOOK_URL`

Deploy with Supabase CLI (example):
```bash
supabase functions deploy notify-discord --project-ref your-project-ref
supabase secrets set --env-file ./supabase/.env
```

### PWA / Icons
- iOS icon: place `public/icons/icon-180.png` (180×180 PNG).
- Manifest icons (maskable): `public/logo192.png`, `public/logo512.png`.
- iOS head tag and manifest are already configured.

### Environment variables
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- Function secret (server): `DISCORD_WEBHOOK_URL`

### License
Personal project; feel free to adapt for your own use.
