# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight React PWA for submitting and managing grievances between two users ("Bug" and "James"). Features shared password authentication, auto-logout timer, Discord notifications, dual role views, and comprehensive security hardening.

**Tech Stack**: React 19, Tailwind CSS, Supabase (Postgres + Edge Functions), DOMPurify, Lucide icons

## Development Commands

### Local Development
```bash
npm install              # Install dependencies
npm start                # Start dev server (localhost:3000)
npm test                 # Run tests in watch mode
npm run build            # Production build
```

### Testing Single Files
```bash
npm test -- App.test.js  # Run specific test file
```

### Utility Scripts
```bash
npm run update:notes     # Update patch notes from patchNotes.json
```

## Environment Setup

Create `.env.local` with required variables:
```bash
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ACCESS_PASSWORD=shared-password
REACT_APP_DISCORD_USER_ID=discord-user-id
```

See `docs/setup/ENVIRONMENT_SETUP.md` for detailed configuration instructions.

## Architecture & Key Patterns

### Single-Component Architecture
The entire application lives in `src/App.js` (~1100 lines). This is intentional for this small project. Main sections:

1. **Authentication Layer** (`PasswordScreen` component)
   - Validates against `REACT_APP_ACCESS_PASSWORD`
   - Uses `sessionStorage` for persistence (no re-login on refresh)
   - Blocks all content until authenticated

2. **Role Selection** (`RoleSelection` component)
   - Session-only role storage (not persisted)
   - Two roles: "boyfriend" (James's inbox view) and "girlfriend" (Bug's submission view)
   - Smooth crossfade transitions between views using `StackFade` helper

3. **AFK Timer** (lines 341-415 in App.js)
   - 15-minute inactivity timeout with 2-minute warning
   - Tracks multiple event types: `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`
   - Auto-logout on timeout, clears session

4. **Main Portal Views**
   - **Girlfriend View**: Submit grievance form with Discord notification buttons
   - **Boyfriend View**: Split into "Filed Grievances" (active) and "Completed Grievances" sections
   - Both views share the same data, just filtered differently

### State Management
All state is component-local using React hooks. No Redux/Context needed:
- `grievances[]`: All grievances from Supabase
- `role`: Current user role (null = show selection screen)
- `authenticated`: Boolean for password authentication
- `transitioning`: Controls crossfade animations between screens
- `formData`: Controlled inputs for grievance submission

### Data Flow
```
Supabase DB (grievances table)
    ↓ loadGrievances()
    ↓ setGrievances()
    ↓ Split by completed status
    ↓ Render active/completed sections
```

### Crossfade Transition System
Uses a custom `StackFade` component with coordinated state:
- `outgoing`: Screen fading out ('selection' | 'portal')
- `incoming`: Screen fading in ('selection' | 'portal')
- `transitioning`: Boolean lock to prevent multiple transitions
- `pendingRole`: Role to apply after transition completes
- 700ms transition duration (const `FADE_MS`)

## Security Implementation

**Multi-layer security** (see `docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md`):

1. **Password Authentication**: Client-side shared password (sessionStorage)
2. **Auto-Logout**: 15-min inactivity with 2-min warning
3. **Input Validation**: Title (200 chars), Description (2000 chars)
4. **XSS Protection**: DOMPurify sanitization on all user input (src/App.js:21-23)
5. **Rate Limiting**: 30s for submissions, 60s for notifications (localStorage-based)
6. **CORS**: Discord Edge Function restricted to production domain only
7. **CSP**: Content Security Policy headers in `public/index.html`
8. **RLS**: Row-Level Security policies for Supabase (see setup guide)

### Critical Security Functions
- `sanitizeInput()` (line 21): Strips all HTML tags before display/storage
- `validateGrievance()` (line 25): Enforces character limits
- `checkRateLimit()` / `setRateLimit()` (lines 44-54): Client-side rate limiting
- Always sanitize before: database insert, UI display, Discord notification

## Supabase Integration

### Database Schema
Table: `grievances`
- `id`: UUID (primary key)
- `title`: text
- `description`: text
- `severity`: text ('minor', 'major', 'critical')
- `status`: text (default: 'Under Review')
- `completed`: boolean
- `created_at`: timestamp

### Edge Function
`supabase/functions/notify-discord/index.ts`
- Sends Discord mentions via webhook
- Types: `notify` (standard) or `attention` (urgent ping)
- CORS restricted to: `https://grievance-portal-nu.vercel.app`
- Requires `DISCORD_WEBHOOK_URL` secret in Supabase

### RLS Setup
**IMPORTANT**: After database changes, follow `docs/setup/SUPABASE_RLS_SETUP.md` to apply security policies. The app uses permissive policies (allows all with anon key) since password protection is the primary auth layer.

## UI/UX Patterns

### Theming
- **Dark Mode**: Toggle persists in component state (not localStorage)
- **Role-Based Themes**:
  - Girlfriend (Bug): Pink/purple gradients
  - Boyfriend (James): Blue/indigo gradients
- **James Theme**: Body class `james-theme` for custom scrollbar styling

### Animations
- Crossfade transitions: 700ms opacity + scale + transform
- Parallax effects on role selection (mouse movement)
- Shake animation on password error
- Float animation on main icon
- Smooth hover/scale effects on buttons

### Responsive Design
- Tailwind breakpoints: Mobile-first, then `md:` for desktop
- Touch-friendly buttons (large tap targets)
- PWA-optimized with maskable icons

## Common Development Tasks

### Adding a New Grievance Field
1. Update Supabase table schema
2. Add to `formData` state initialization (line 318)
3. Add input in girlfriend view form (around line 762)
4. Update `handleSubmit()` to include new field (line 490)
5. Display in grievance cards (line 907, 993)

### Modifying Rate Limits
Edit constants at top of App.js (lines 16-18):
```javascript
const SUBMISSION_COOLDOWN = 30000;    // milliseconds
const NOTIFICATION_COOLDOWN = 60000;
```

### Changing Inactivity Timeout
Edit constants around line 342:
```javascript
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;  // 15 minutes
const WARNING_TIME = 2 * 60 * 1000;          // 2 minutes warning
```

### Updating Patch Notes
1. Edit `src/patchNotes.json`
2. Run `npm run update:notes`
3. Version format: `"X.Y"` (e.g., "1.3")
4. Notes display in `<PatchNotes />` component on role selection

### Testing Discord Notifications
When testing locally, Discord function will reject due to CORS (expects production domain). To test:
1. Temporarily change CORS in `supabase/functions/notify-discord/index.ts` to allow localhost
2. Deploy Edge Function update to Supabase
3. Test from localhost
4. Revert CORS back to production domain

## Deployment

### Vercel (Recommended)
1. Connect repo to Vercel
2. Set environment variables in dashboard (Settings → Environment Variables)
3. Auto-deploys on push to `main`
4. Production URL must match CORS in Discord Edge Function

### Supabase Edge Functions
```bash
# Deploy Discord notification function
supabase functions deploy notify-discord

# Set webhook secret
supabase secrets set DISCORD_WEBHOOK_URL=your-webhook-url
```

## File Structure

```
src/
  App.js              # Main application (all components)
  index.js            # React entry point
  index.css           # Global styles + Tailwind imports
  patchNotes.json     # Version history data

supabase/functions/
  notify-discord/
    index.ts          # Discord webhook Edge Function

docs/
  setup/              # Setup guides (environment, RLS, quick start)
  security/           # Security implementation details
  features/           # Feature documentation (AFK timer)

public/
  index.html          # HTML template with CSP headers
  manifest.json       # PWA configuration
  icons/              # iOS and Android icons

scripts/
  update-patch-notes.js  # Syncs patchNotes.json to App.js
```

## Testing

### Test Coverage
- Basic smoke tests in `src/App.test.js`
- Manual testing checklist in `docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md`

### Key Test Scenarios
1. Password authentication (correct/incorrect)
2. Role switching and transitions
3. Grievance CRUD operations
4. Rate limiting enforcement
5. Input validation and character limits
6. XSS protection (try `<script>alert('xss')</script>` in inputs)
7. Auto-logout timer and warning
8. Dark mode across all screens

## Troubleshooting

### "No policies exist" error
RLS is enabled but policies aren't set. Follow `docs/setup/SUPABASE_RLS_SETUP.md`

### Rate limiting not working
Check localStorage keys: `lastSubmission`, `lastNotification`, `lastAttention`. Clear to reset.

### Transitions stuck
The `transitioning` state lock prevents concurrent transitions. If stuck, check for errors in transition callbacks (setTimeout around lines 580-586).

### Discord notifications not sending
1. Verify `DISCORD_WEBHOOK_URL` secret in Supabase
2. Check CORS settings in Edge Function
3. Verify `REACT_APP_DISCORD_USER_ID` environment variable
4. Check Supabase Edge Function logs

### Auto-logout not triggering
Verify all event listeners are attached (line 399) and timers aren't being cleared prematurely. Check that `authenticated` is true.

## Code Style & Conventions

- **Inline styles only when dynamic** (e.g., parallax transforms)
- **Tailwind classes** for all static styling
- **DOMPurify sanitization** before any user content display
- **Environment variables** for all secrets (never hardcode)
- **Comments** mark removed features (e.g., "// Removed in v1.0")
- **Event handlers** use arrow functions to preserve `this` context

## GitHub Workflow

The repo has a PR check (`.github/workflows/enforce-on-main.yml`) that validates `patchNotes.json` structure on PRs to `main`. Ensures version format is valid before merging.
