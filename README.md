# Grievance Portal

A lightweight React app for submitting and managing grievances. Built with React 19, Vite 7, Tailwind CSS, and Supabase.

## Overview

This app allows two users (James and Bug - James's girlfriend) to interact with a grievance portal system. Bug submits grievances and James manages them with a shared password authentication system.

## Features

- Password-protected access with shared authentication
- Auto-logout after 15 minutes of inactivity (with 2-minute warning)
- Submit grievances with title, description, severity
- Input validation and XSS protection with DOMPurify
- Rate limiting to prevent spam (30s for submissions, 60s for notifications)
- Real-time sync across all connected users
- Discord notifications

## Tech Stack

- React 19 + Vite 7 + Tailwind CSS
- Supabase (Postgres + Edge Functions)
- Lucide icons

## Quick Start

```bash
npm install
```

Create `.env.local`:
```bash
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ACCESS_PASSWORD=your-password
VITE_DISCORD_USER_ID=your-discord-id
```

Run:
```bash
npm run dev
```

## Documentation

- [`docs/setup/QUICK_START.md`](docs/setup/QUICK_START.md)
- [`docs/setup/ENVIRONMENT_SETUP.md`](docs/setup/ENVIRONMENT_SETUP.md)
- [`docs/setup/SUPABASE_RLS_SETUP.md`](docs/setup/SUPABASE_RLS_SETUP.md)
- [`docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md`](docs/security/SECURITY_IMPLEMENTATION_SUMMARY.md)
