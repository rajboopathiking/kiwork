# KIWORK — Product Plan (Prototype)

> "Learn something → Share it in any format → Build a helpful community."

Inspired by NextWork.ai, but focused on **knowledge uploads in every format** (video, audio, images, PPTX, blogs, PDFs) instead of projects.

---

## 1. Product Vision

- You study something new (a topic, a tool, a concept) → record/document what you learned → upload it to KIWORK in whatever format suits you.
- Others who are studying the same thing find your content, learn from it, and help you/others back.
- Free to build, free to use (prototype stage).
- Every user gets a **public learning portfolio** (like NextWork profiles) — a shareable link showing everything they learned and shared.

### Who it's for
1. Students (college/school) sharing notes, summaries, PPTs.
2. Working professionals documenting what they learn (courses, tutorials).
3. Anyone who learned something and wants to teach it back ("learner becomes teacher").

---

## 2. Core Features (Prototype Scope)

### A. Upload / Post (the heart)
One "Post" can be any of these 6 formats:

| Format | How stored | How displayed |
|---|---|---|
| Blog post | Rich text saved in DB | Built-in reader page |
| Video | **YouTube / Vimeo embed link only** (no direct uploads) | Embedded player page |
| Audio | File upload (mp3/ogg) OR YouTube link | Audio player |
| Images | File upload (multiple) | Gallery / carousel |
| PPTX / DOCX | File upload | Card + download; optional preview via Google Office viewer |
| PDF | File upload | Inline PDF viewer (PDF.js / browser native) |

Every post also has: **title, description, topic tags, language, visibility (public/private), author.**

### B. Community
- Likes (quick support signal)
- Comments / questions on posts (ask doubts, get answers)
- Follow users
- Save/bookmark posts for later
- "Helped?" button → counts how many people benefited from a post (community-friendliness metric)

### C. Discovery
- Explore feed: Latest / Trending
- Browse by Topic (e.g. AI, Web Dev, Study Skills, English, Career)
- Search: posts, people, topics
- Follow-based feed (later)

### D. Profile / Portfolio
- Public URL `/@username`
- Shows all posts grouped by format + topics, stats (posts, learners helped, followers)
- Shareable link (recruiters/friends can open without logging in, like NextWork)

---

## 3. Free Tech Stack (Prototype)

| Layer | Choice | Why / Free limits |
|---|---|---|
| Frontend | **Next.js 15 + Tailwind CSS** | Free, fast, SEO-friendly, deploys free on Vercel |
| Backend/DB | **Supabase (free tier)** | Postgres DB + Auth + File Storage in one. 500MB DB, **1GB file storage**, 50k monthly active users free |
| Auth | Supabase Auth | Email + Google login (both free) |
| File storage | Supabase Storage buckets | Separate buckets: audio, image, doc (video excluded) |
| Video hosting | **None — users paste YouTube/Vimeo links, we embed with react-player** | ₹0 hosting, infinite capacity, uploads stay on the creator's channel |
| Rich text editor | **Tiptap** (open source) | Blog writing |
| Media players | react-player (video), native `<audio>` | Free |
| PDF viewer | react-pdf / browser native | Free |
| PPTX preview | office365 viewer URL (Microsoft's free embed service) or plain download card | Free, no key |
| Icons | lucide-react | Free |
| Hosting | **Vercel free (Hobby plan)** | Free custom domain support too |

> Alternatives: Firebase Storage instead of Supabase; Pages/Netlify instead of Vercel. Supabase chosen because one free product covers DB + Auth + Storage together.

**Free-tier strategy:** video is always a YouTube/Vimeo embed — never stored on our side. This removes the biggest storage burden entirely; Supabase's 1GB storage is only used for audio, images, docs and avatars.

---

## 4. Pages (Sitemap)

```
/                Landing page + trending posts strip
/explore         Feed (filter: All | Blog | Video | Audio | Image | Doc) + Topic chips
/topic/[slug]    Posts under one topic
/post/[id]       Content viewer (player / reader / gallery / PDF) + comments + "Helped?" 
/upload          Create post wizard: 1) pick format → 2) write/upload → 3) tags & publish
/@username       Public learning portfolio
/@username/edit  Edit profile (logo, bio, links)
/dashboard       Your posts, saved posts, followers (private)
/search          Full search
/login  /signup  Supabase auth screens
/help /about     Simple static pages (community rules, how KIWORK works)
```

### Key UX rules
- Students open a post **without login** (read-only), login required only to upload/comment/follow.
- Upload flow must work on **mobile** (most students use phones).
- Every post gets a **public share link** — easy to paste into WhatsApp study groups.

---

## 5. Database Schema (Supabase / Postgres)

```sql
profiles (
  id uuid PK (matches auth.users.id),
  username text unique,
  full_name text, avatar_url text, bio text,
  links jsonb,            -- github/linkedin/etc
  created_at timestamptz
)

posts (
  id uuid PK default gen_random_uuid(),
  author_id uuid FK profiles,
  format text CHECK in ('blog','video','audio','image','doc'),   -- doc = pptx/pdf
  title text, description text,
  body text,                      -- blog rich text content
  media_url text,                 -- file URL, or YouTube/Vimeo link when format='video' (always a link)
  media_url_2 text,               -- thumbnail (video/doc first-slide)
  files jsonb,                    -- for image galleries / multiple docs
  external_flag bool,             -- true = YouTube/link embed (video is always true)
  language text default 'en',
  visibility text default 'public',
  views int default 0,
  created_at timestamptz,
  search tsvector                 -- full-text search index
)

topics ( id uuid PK, name text, slug text unique, icon text )
post_topics ( post_id FK, topic_id FK, PRIMARY KEY(post_id, topic_id) )

comments ( id uuid PK, post_id FK, author_id FK, body text, created_at )
likes ( user_id FK, post_id FK, PRIMARY KEY(user_id, post_id) )
helped ( user_id FK, post_id FK, PRIMARY KEY(user_id, post_id) )   -- "this helped me"
saves ( user_id FK, post_id FK, created_at, PRIMARY KEY(user_id, post_id) )
follows ( follower_id FK, following_id FK, created_at, PRIMARY KEY(follower_id, following_id) )
```

**Storage buckets:** `avatars`, `audios`, `images` (≤5MB each), `docs` (≤20MB). No video bucket — videos live on YouTube.

---

## 6. Build Phases

### Phase 1 — Foundation (Week 1)
- [ ] Supabase project setup (DB schema above, storage buckets for audio/images/docs/avatars, auth providers)
- [ ] Next.js app + Tailwind + layout (navbar: Explore, Upload, search, login)
- [ ] Auth pages + profile auto-create on signup (username picker)
- [ ] Landing page with product story

### Phase 2 — Upload & View (Week 2–3)  ← core loop
- [ ] Upload wizard (format picker → editor/uploader → tags → publish)
- [ ] File upload with progress + size validation
- [ ] Post viewer page: video player / audio player / image gallery / PDF / PPTX card / blog reader
- [ ] Explore feed with format filters + topic browse
- [ ] View counter

### Phase 3 — Community (Week 4)
- [ ] Likes, comments, "Helped" counter, saves
- [ ] Follow users + follower lists
- [ ] Public profile/portfolio page + share link
- [ ] Search (posts + people)

### Phase 4 — Polish (Week 5)
- [ ] Dark mode, responsive fixes, empty states
- [ ] Community guidelines + report button
- [ ] Share cards (og:image) for WhatsApp/Discord
- [ ] Seed content: ~15 real posts by you across all 6 formats → looks alive to new users
- [ ] Deploy: Vercel custom domain → soft launch with friends / study group

### Later (v2 ideas)
- Doubt/help board ("Help me learn this"), study circles, badges/levels, notifications, AI summary of uploaded material, offline events.

---

## 7. Success Metrics (prototype)

1. # posts uploaded in first 2 weeks (target: 50+)
2. % of uploads that are non-text formats (validates the multi-format idea)
3. # "Helped" clicks per post (community value)
4. # unique visitors via shared portfolio links

---

## 8. Cost = ₹0

Everything above runs on permanent free tiers. Only future cost: domain (~₹800/yr), optional.
