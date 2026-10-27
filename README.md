# KIWORK 💡

> **"Learn it. Share it. Help others learn it."**
> A free, friendly community web app where learners share what they study — in video, audio, slide deck, image, notes, or blog format — and build a shareable learning portfolio.

Inspired by NextWork, tailored for open student & self-learner knowledge sharing.

---

## 🌟 Features

### 1. Multi-Format Knowledge Uploads (5 Formats)
- **Video:** YouTube / Vimeo embeds (zero video hosting costs, infinite bandwidth).
- **Audio:** Audio lectures, recordings, or podcast notes with native HTML5 player.
- **Images:** Image slides, hand-written lecture notes, and diagrams in clean gallery format.
- **Documents & Slides:** PDF viewer (inline browser reader) and PPTX / DOCX slide preview cards.
- **Blog:** Rich text editor powered by Tiptap with typography styling.

### 2. Public Learning Portfolios (`/@username`)
- Shareable learning portfolio for every student/creator.
- Showcases all public notes, format breakdown, and impact metrics:
  - Total shares
  - **Learners helped** (count of community "Helped me" signals)
  - Followers
- Social links: GitHub, LinkedIn, and personal website.
- Dynamic social share preview cards (`og:image`) powered by `@vercel/og` (`/api/og`).

### 3. Community Engagement & Social Proof
- **"Helped me" button:** Signals real community value when a post unblocks someone.
- **Likes & Comments:** Real-time questions and answers per post.
- **Bookmarks / Saved Posts (`/saves`):** Save helpful posts for later revision.
- **Follow system:** Keep up with fellow learners whose learning paths inspire you.
- **Content Reporting & Moderation:** Flag inappropriate or spam posts for review.
- **WhatsApp & LinkedIn Share buttons:** 1-click sharing to study groups with pre-filled titles and links.

### 4. Search & Topic Discovery
- Instant search across posts, people, and topics.
- Topic tags (e.g. AI & ML, Web Dev, Cloud & DevOps, Study Skills).
- Explore feed with format filters (All | Blog | Video | Audio | Images | Doc).

### 5. Dark Mode & Responsive UX
- Full class-based dark mode toggle with system preference detection and localStorage persistence.
- Mobile-first responsive UI built with Tailwind CSS.

---

## 🛠️ Tech Stack & ₹0 Architecture

| Layer | Technology | Free Tier Advantage |
|---|---|---|
| **Frontend** | [Next.js 15+ (App Router)](https://nextjs.org) + [Tailwind CSS v4](https://tailwindcss.com) | Fast SSR, metadata generation, responsive UI |
| **Icons** | [Lucide React](https://lucide.dev) | Lightweight modern iconography |
| **Rich Text** | [Tiptap](https://tiptap.dev) | Headless prose editor |
| **Database & Auth** | [Supabase (PostgreSQL)](https://supabase.com) | Free 500MB DB, Auth (Email & Google), RLS security |
| **File Storage** | Supabase Storage | 1 GB free bucket storage for audio, images, docs, and avatars |
| **Video Hosting** | YouTube & Vimeo Embeds | ₹0 hosting, creators retain viewer metrics |
| **Social Cards** | `@vercel/og` (`next/og`) | Edge dynamic OpenGraph card generation |
| **Hosting** | [Vercel](https://vercel.com) | Free Hobby deployment with automatic SSL |

---

## 🚀 Quickstart

### 1. Clone & Install
```bash
git clone <repo-url>
cd kiwork
npm install
```

### 2. Configure Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → Run `supabase/schema.sql`.
3. (Optional) Run `supabase/phase2.sql` (view counter function) and `supabase/phase4.sql` (reports table).
4. Create `.env.local` based on `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Seed Sample Posts (Optional)
Once you have created at least one account via `/signup`, open Supabase SQL Editor and run `supabase/seed_posts.sql` to populate your explore feed with sample posts across multiple formats.

---

## 📂 Project Structure

```
kiwork/
├── src/
│   ├── app/
│   │   ├── [username]/      # Public learning portfolio (/@username)
│   │   ├── api/og/          # Dynamic Open Graph share image generator
│   │   ├── auth/            # OAuth callbacks & signout handlers
│   │   ├── explore/         # Format-filtered feed
│   │   ├── help/            # How it works & community guidelines
│   │   ├── login/ & signup/ # Auth screens
│   │   ├── post/[id]/       # Full content viewer + comments + engagement + report
│   │   ├── saves/           # Bookmarked posts feed
│   │   ├── search/          # Search posts & people
│   │   ├── settings/        # Edit profile (avatar, bio, social links)
│   │   ├── topic/[slug]/    # Posts by topic
│   │   └── upload/          # Multi-format upload wizard & Tiptap editor
│   ├── components/          # Reusable UI components (Navbar, Footer, PostCard, ShareRow, etc.)
│   └── lib/                 # Supabase client/server setup, auth helpers, media parsers
├── supabase/
│   ├── schema.sql           # Base tables, storage buckets, RLS policies, topics
│   ├── phase2.sql           # View counter increment function
│   ├── phase4.sql           # Content reports table & policies
│   └── seed_posts.sql       # Sample seed data across formats
└── PLAN.md                  # Detailed product roadmap & design specification
```

---

## 📜 Community Guidelines

1. **Be kind & supportive:** Every learner's journey is unique.
2. **Credit sources:** Attribute tutorials, textbooks, or creators that inspired your notes.
3. **No spam or deceptive content:** Share genuine insights and learning summaries.
4. **Safety first:** Keep discussions inclusive, respectful, and focused on learning.
