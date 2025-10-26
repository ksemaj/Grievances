# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight React PWA for submitting and managing grievances between two users ("Bug" and "James"). Features shared password authentication, auto-logout timer, Discord notifications, dual role views, real-time sync, and comprehensive security hardening.

**Tech Stack**: React 19, **Vite 7** ⚡, Tailwind CSS, Supabase (Postgres + Edge Functions), DOMPurify, Lucide icons

## Development Commands

### Local Development
```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (localhost:3000)
npm test                 # Run tests with vitest
npm run build            # Production build (~1s with Vite!)
npm run preview          # Preview production build
```

### Testing Single Files
```bash
npm test -- App.test.jsx  # Run specific test file
```

## Environment Setup

Create `.env.local` with required variables:
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ACCESS_PASSWORD=shared-password
VITE_DISCORD_USER_ID=discord-user-id
```

**Note**: All environment variables use `VITE_` prefix (changed from `REACT_APP_` after Vite migration).

See `docs/setup/ENVIRONMENT_SETUP.md` for detailed configuration instructions.

### PostCSS Configuration (Required for Tailwind)

Vite requires PostCSS to process Tailwind CSS. The project includes `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**If styling doesn't load**: This file must exist in the project root. Without it, Tailwind classes won't be processed and the app will have no styling.

## Architecture & Key Patterns

### Modular Architecture (v2.0)

The application is now organized into modular components and utilities:

```
src/
├── components/          # Reusable UI components
│   ├── PasswordScreen.jsx
│   ├── RoleSelection.jsx
│   ├── PatchNotes.jsx
│   └── StackFade.jsx
├── hooks/               # Custom React hooks (future)
├── utils/               # Pure utility functions
│   ├── sanitize.js      # XSS protection with DOMPurify
│   ├── validate.js      # Form validation logic
│   └── rateLimit.js     # Client-side rate limiting
├── constants/           # Configuration constants
│   └── config.js        # All magic numbers and config values
├── services/            # External service integrations
│   └── supabase.js      # Supabase client + env validation
├── App.jsx              # Main application (~825 lines, down from 1091!)
└── main.jsx             # Vite entry point
```

### Main Application Flow

1. **Authentication Layer** (`PasswordScreen` component)
   - Validates against `VITE_ACCESS_PASSWORD`
   - Uses `sessionStorage` for persistence (no re-login on refresh)
   - Blocks all content until authenticated

2. **Role Selection** (`RoleSelection` component)
   - Session-only role storage (not persisted)
   - Two roles: "boyfriend" (James's inbox view) and "girlfriend" (Bug's submission view)
   - Smooth crossfade transitions using `StackFade` component

3. **AFK Timer** (in App.jsx:302-373)
   - 15-minute inactivity timeout with 2-minute warning
   - Tracks multiple event types: `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`
   - Auto-logout on timeout, clears session
   - Uses `useCallback` to prevent stale closures

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

**Initial Load:**
```
Supabase DB (grievances table)
    ↓ loadGrievances() (on mount)
    ↓ setGrievances()
    ↓ Split by completed status
    ↓ Render active/completed sections
```

**Real-Time Updates (v2.2):**
```
Supabase Real-Time Channel
    ↓ Subscribe to postgres_changes
    ↓ Listen for INSERT/UPDATE/DELETE
    ↓ Automatically update grievances state
    ↓ UI updates instantly across all connected users
```

The app uses Supabase real-time subscriptions to keep all users in sync. When Bug submits a grievance, James sees it instantly. When James marks one complete, Bug sees the update immediately. Manual refresh buttons remain as fallback, but are rarely needed.

### Crossfade Transition System

Uses the `StackFade` component with coordinated state:
- `outgoing`: Screen fading out ('selection' | 'portal')
- `incoming`: Screen fading in ('selection' | 'portal')
- `transitioning`: Boolean lock to prevent multiple transitions
- `pendingRole`: Role to apply after transition completes
- 700ms transition duration (from `FADE_DURATION` constant)

## Security Implementation

**Multi-layer security** (see `docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md`):

1. **Password Authentication**: Client-side shared password (sessionStorage)
2. **Auto-Logout**: 15-min inactivity with 2-min warning
3. **Input Validation**: Title (200 chars), Description (2000 chars)
4. **XSS Protection**: DOMPurify sanitization with safe HTML formatting allowed
5. **Rate Limiting**: 30s for submissions, 60s for notifications (localStorage-based)
6. **CORS**: Discord Edge Function restricted to production domain only
7. **CSP**: Content Security Policy headers in `index.html`
8. **RLS**: Row-Level Security policies for Supabase (see setup guide)
9. **Env Validation**: Supabase service validates required environment variables on startup

### Critical Security Functions

**In `src/utils/sanitize.js`:**
- `sanitizeInput(text, allowFormatting=true)`: Strips dangerous HTML, allows `<b>`, `<i>`, `<em>`, `<strong>`, `<br>` for formatting

**In `src/utils/validate.js`:**
- `validateGrievance(title, description)`: Enforces character limits, returns error array

**In `src/utils/rateLimit.js`:**
- `checkRateLimit(key, cooldownMs)`: Returns true if action allowed
- `setRateLimit(key)`: Marks action as performed
- `getRemainingCooldown(key, cooldownMs)`: Returns seconds remaining

**In `src/services/supabase.js`:**
- `getAccessPassword()`: Validates and returns password (throws if missing)
- `getDiscordUserId()`: Returns Discord user ID (warns if missing)

Always sanitize before: database insert, UI display, Discord notification.

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
2. Add to `formData` state initialization (App.jsx:280)
3. Add input in girlfriend view form (around line 500)
4. Update `handleSubmit()` to include new field (App.jsx:428)
5. Display in grievance cards (around lines 620, 700)

### Modifying Constants

Edit `src/constants/config.js`:
```javascript
export const SUBMISSION_COOLDOWN = 30000;     // milliseconds
export const NOTIFICATION_COOLDOWN = 60000;
export const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
export const WARNING_TIME = 2 * 60 * 1000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
```

All components importing these constants will automatically use the new values.

### Creating New Utility Functions

1. Add to appropriate file in `src/utils/`
2. Export as named export
3. Import where needed: `import { myFunction } from '../utils/myUtil'`

### Adding New Components

1. Create `.jsx` file in `src/components/`
2. Use default export: `export default function MyComponent() { ... }`
3. Import in App.jsx: `import MyComponent from './components/MyComponent'`

### Updating Patch Notes

1. Edit `src/patchNotes.json`
2. Add new version to the top of the `versions` array
3. Version format: `"X.Y"` (e.g., "2.2")
4. Notes display dynamically in `<PatchNotes />` component on role selection
5. Current version is always expanded, previous versions are collapsible

### Testing Discord Notifications

When testing locally, Discord function will reject due to CORS (expects production domain). To test:
1. Temporarily change CORS in `supabase/functions/notify-discord/index.ts` to allow localhost
2. Deploy Edge Function update to Supabase
3. Test from localhost
4. Revert CORS back to production domain

## Deployment

### Vercel (Recommended)

1. Connect repo to Vercel
2. **Update build settings**:
   - Build Command: `vite build`
   - Output Directory: `build`
3. Set environment variables in dashboard (use `VITE_` prefix!)
4. Auto-deploys on push to `main`
5. Production URL must match CORS in Discord Edge Function

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
  components/
    PasswordScreen.jsx
    RoleSelection.jsx
    PatchNotes.jsx
    StackFade.jsx
  utils/
    sanitize.js
    validate.js
    rateLimit.js
  constants/
    config.js
  services/
    supabase.js
  App.jsx              # Main application logic
  main.jsx             # Vite entry point
  index.css            # Global styles + Tailwind

supabase/functions/
  notify-discord/
    index.ts          # Discord webhook Edge Function

docs/
  setup/              # Setup guides (environment, RLS, quick start)
  security/           # Security implementation details
  features/           # Feature documentation (AFK timer)

public/
  manifest.json       # PWA configuration
  favicon.ico         # Favicon
  icons/              # iOS and Android icons
  logo192.png         # PWA icon 192x192
  logo512.png         # PWA icon 512x512

index.html            # Vite HTML entry point (root directory)
postcss.config.js     # PostCSS configuration (required for Tailwind)
tailwind.config.js    # Tailwind CSS configuration
vite.config.js        # Vite configuration
package.json          # Dependencies and scripts
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

The `transitioning` state lock prevents concurrent transitions. If stuck, check for errors in transition callbacks (setTimeout around App.jsx:307-315, 320-325).

### Discord notifications not sending

1. Verify `DISCORD_WEBHOOK_URL` secret in Supabase
2. Check CORS settings in Edge Function
3. Verify `VITE_DISCORD_USER_ID` environment variable
4. Check Supabase Edge Function logs

### Auto-logout not triggering

Verify all event listeners are attached (App.jsx:149) and timers aren't being cleared prematurely. Check that `authenticated` is true.

### Build errors after changes

1. Check for syntax errors
2. Ensure all imports are correct
3. Verify environment variables are set
4. Run `npm run build` to see detailed errors

### Tailwind CSS not loading / No styling

If the app loads but has no styling (plain unstyled HTML):

1. **Check PostCSS config exists**: Verify `postcss.config.js` is in project root
2. **Verify Tailwind content paths**: Check `tailwind.config.js` includes `"./index.html"` and `"./src/**/*.{js,jsx,ts,tsx}"`
3. **Clear Vite cache**: Delete `node_modules/.vite` and restart dev server
4. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
5. **Check console for errors**: Look for CSS loading errors in browser DevTools

## Code Style & Conventions

- **Inline styles only when dynamic** (e.g., parallax transforms)
- **Tailwind classes** for all static styling
- **DOMPurify sanitization** before any user content display
- **Environment variables** for all secrets (never hardcode)
- **Named exports** for utilities, **default exports** for components
- **Comments** explain "why", not "what"
- **Constants** extracted to `src/constants/config.js`

## Recent Major Changes

### Real-Time Sync (v2.2)

- 🔄 Supabase real-time subscriptions for instant updates
- ⚡ Grievances sync automatically across all connected users
- 👥 No manual refresh needed - changes appear instantly
- 🔌 Uses postgres_changes event listening
- 📡 Listens for INSERT, UPDATE, DELETE operations

### Vite Migration (v2.0-2.1)

- ⚡ Build time: ~30s → ~1s (30x faster!)
- 🔒 Vulnerabilities: 9 → 0
- 🚀 Dev server startup: ~10s → ~1s
- ✅ Modern tooling with active maintenance

### Code Organization

- 📁 Components extracted to `src/components/`
- 🛠️ Utilities extracted to `src/utils/`
- ⚙️ Constants extracted to `src/constants/`
- 🔌 Services centralized in `src/services/`
- 📉 App.jsx size: 1091 → 823 lines (-25%)

### Bug Fixes

- ✅ AFK timer dependency issue (useCallback)
- ✅ Notification validation (empty form check)
- ✅ Delete confirmation (prevents accidents)
- ✅ Error handling (user-friendly messages)

## GitHub Workflow

The repo has a PR check (`.github/workflows/enforce-on-main.yml`) that validates `patchNotes.json` structure on PRs to `main`. Ensures version format is valid before merging.
