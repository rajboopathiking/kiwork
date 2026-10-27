# KIWORK — Setup Guide (Phase 1 → working app)

You are 4 steps away from a running KIWORK. Everything is free.

## 1. Create a Supabase project (~2 min)
1. Go to https://supabase.com → Sign up (GitHub works) → **New project**
2. Name: `kiwork`, pick any region near you, set a DB password (save it)
3. Wait ~1–2 min for provisioning

## 2. Run the database schema (~1 min)
1. In Supabase dashboard: left sidebar → **SQL Editor** → **New query**
2. Open `kiwork/supabase/schema.sql`, copy ALL of it, paste in, click **Run**
3. You should see "Success".
   → Tables, RLS security, auto-profile trigger, 4 storage buckets and 10 seeded topics are ready.

## 3. Connect the app (~1 min)
1. Dashboard → ⚙️ **Project Settings** → **API**
2. Copy **Project URL** and **anon public** key
3. Edit `kiwork/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co   (paste yours)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...          (paste yours)
```
4. Restart the dev server (Ctrl+C, then below)

## 4. Run it
```bash
cd /Users/boopathiraj/Documents/Project/Langchain-Revision/kiwork
npm run dev
```
Open http://localhost:3000

---

## Test the full loop
1. http://localhost:3000/signup → create account (pick a username!)
2. Supabase will send a confirmation email (Authentication → check later/develop: if you want to skip email confirm at first, go to **Authentication → Providers → Email → Turn ON "Confirm email" OFF** while prototyping)
3. Log in → navbar should show your initial avatar + Share button + Log out
4. Supabase → Table editor → `profiles`: your profile row was auto-created with your username ✔

## Optional: Google login (5 min, can skip)
1. https://console.cloud.google.com → APIs & Services → Credentials → OAuth client ID (Web)
   - Authorized redirect URI: https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
2. Supabase → Authentication → Providers → Google → paste Client ID + Secret → Save
3. The Google button on /login works immediately

## Deploy free (when ready)
```bash
npm i -g vercel && vercel
```
Add the 2 env vars in the Vercel dashboard → done. Free URL like kiwork.vercel.app.

---

## What's live now (Phase 1)
- Landing page with KIWORK story
- Signup / Login (email+password, magic link, Google)
- Auto username → your portfolio URL `/@yourname`
- Explore page with format filters (empty-state + Supabase setup notice)
- Navbar login state, logout, Help/How-it-works page

## Coming next (Phase 2) — the core loop
- Real upload wizard (Format → content → tags → publish)
- Video = pasting a YouTube link (embedded player, auto thumbnail)
- Audio/Image/Doc file uploads to Supabase Storage
- Post viewer pages per format
- View counters, topics on posts
