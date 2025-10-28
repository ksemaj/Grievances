# Quick Start Guide - Security Hardened Version

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Create Environment File (2 min)
Create a file named `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://zyueyefahxfcccdgggpe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dWV5ZWZhaHhmY2NjZGdnZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzU2NDgsImV4cCI6MjA3NTU1MTY0OH0.m-eWD3cP6U_753yY8XU9z_W-lH4LMQT9G1GOyME3lV8
VITE_ACCESS_PASSWORD=baby
VITE_DISCORD_USER_ID=217849233133404161
```

**Where to find these:**
- Supabase URL & Key: Supabase Dashboard → Settings → API
- Password: Choose any strong password
- Discord ID: Already set (James's ID)

### Step 3: Start Development Server (1 min)
```bash
npm run dev
```

The app will open at http://localhost:3000

### Step 4: Test It Works (1 min)
1. Enter your password (the one you set in `.env.local`)
2. Select a role (James or Bug)
3. Try submitting a test grievance
4. Verify it appears in the list

✅ **You're done!** The app is now running locally with all security features enabled.

---

## 📦 Deploy to Production

### Deploy to Vercel (5 min)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
4. Add all 4 variables from `.env.local`
5. Redeploy

### Enable Database Security (5 min)
Follow the guide in `SUPABASE_RLS_SETUP.md` to add Row-Level Security policies.

---

## 🎉 What's New

Your portal now has:
- 🔐 Password protection
- ✅ Input validation (no more super long submissions!)
- 🛡️ XSS protection
- ⏱️ Rate limiting (30s cooldown for submissions)
- 🔔 Improved Discord notifications
- 📊 Character counters
- 🎨 Better error messages

---

## 🆘 Troubleshooting

**"Password not configured" error**
- Make sure `.env.local` exists in project root
- Check spelling: `VITE_ACCESS_PASSWORD`
- Restart dev server after creating `.env.local`

**Can't connect to Supabase**
- Verify your Supabase URL and anon key
- Check for extra spaces in `.env.local`
- Make sure Supabase project is active

**Changes not showing**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Clear browser cache
- Restart dev server

---

## 📚 More Details

- **Full setup guide**: `ENVIRONMENT_SETUP.md`
- **Security details**: `SECURITY_IMPLEMENTATION_SUMMARY.md`
- **Database security**: `SUPABASE_RLS_SETUP.md`
- **General info**: `README.md`

---

## ✨ Key Features

**For Bug (Girlfriend):**
- Submit grievances with title, description, severity
- Real-time character counter (no more "too long" errors!)
- Get confirmation when James is notified
- Mark grievances as complete when resolved

**For James (Boyfriend):**
- View all grievances in one place
- Separate active and completed sections
- Mark grievances as complete
- Delete old grievances

**New Security Features:**
- Password protection on first visit
- Can't spam submissions (30s cooldown)
- Can't spam notifications (60s cooldown)
- Input is validated and sanitized
- Character limits prevent database issues

---

Need help? Check the documentation files or look at the code comments!

