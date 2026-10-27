-- ============================================================
-- KIWORK — Phase 1 Database Schema
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
--
-- Creates: profiles, topics, posts, comments, likes, helped,
-- saves, follows + RLS policies + storage buckets + seed topics
-- ============================================================

-- ---------- 1. PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  links jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------- 2. TOPICS ----------
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text
);

-- ---------- 3. POSTS ----------
-- format: blog = rich text in `body`
--         video = YouTube/Vimeo link in `media_url` (NO direct uploads)
--         audio = uploaded file URL in `media_url`
--         image = gallery object in `files`
--         doc   = pptx/pdf file URL in `media_url`
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  format text not null check (format in ('blog','video','audio','image','doc')),
  title text not null,
  description text,
  body text,
  media_url text,
  media_url_2 text,                          -- thumbnail
  files jsonb,                               -- image gallery / extras
  language text not null default 'en',
  visibility text not null default 'public' check (visibility in ('public','private')),
  views int not null default 0,
  created_at timestamptz not null default now(),
  search tsvector generated always as (
    to_tsvector('english',
      coalesce(title,'') || ' ' ||
      coalesce(description,'') || ' ' ||
      coalesce(body,''))
  ) stored
);

create index if not exists posts_author_idx on public.posts (author_id, created_at desc);
create index if not exists posts_feed_idx on public.posts (visibility, created_at desc);
create index if not exists posts_search_idx on public.posts using gin (search);

-- ---------- 4. POST ↔ TOPIC ----------
create table if not exists public.post_topics (
  post_id uuid not null references public.posts(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (post_id, topic_id)
);

-- ---------- 5. COMMUNITY TABLES ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  primary key (user_id, post_id)
);

-- "This helped me" — the community-friendliness counter
create table if not exists public.helped (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  primary key (user_id, post_id)
);

create table if not exists public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Uses raw_user_meta_data { username, full_name } from signUp().
-- Generates available username automatically.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_base text;
  v_candidate text;
  v_suffix int := 0;
begin
  v_base := coalesce(nullif(new.raw_user_meta_data->>'username',''), 'learner');
  v_base := regexp_replace(v_base, '[^a-zA-Z0-9_]', '', 'g');
  if v_base = '' or char_length(v_base) < 3 then
    v_base := 'learner' || left(new.id::text, 4);
  end if;
  v_base := left(lower(v_base), 20);
  v_candidate := v_base;
  while exists (select 1 from public.profiles where username = v_candidate) loop
    v_suffix := v_suffix + 1;
    v_candidate := left(v_base, 17) || v_suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    v_candidate,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), 'New Learner'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles    enable row level security;
alter table public.topics      enable row level security;
alter table public.posts       enable row level security;
alter table public.post_topics enable row level security;
alter table public.comments    enable row level security;
alter table public.likes       enable row level security;
alter table public.helped      enable row level security;
alter table public.saves       enable row level security;
alter table public.follows     enable row level security;

-- profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- topics
create policy "topics_select" on public.topics for select using (true);
create policy "topics_insert" on public.topics for insert to authenticated with check (true);

-- posts
create policy "posts_select" on public.posts for select
  using (visibility = 'public' or auth.uid() = author_id);
create policy "posts_insert" on public.posts for insert to authenticated
  with check (auth.uid() = author_id);
create policy "posts_update" on public.posts for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "posts_delete" on public.posts for delete to authenticated
  using (auth.uid() = author_id);

-- post_topics (owner of the post may attach/detach)
create policy "pt_select" on public.post_topics for select using (true);
create policy "pt_insert" on public.post_topics for insert to authenticated
  with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));
create policy "pt_delete" on public.post_topics for delete to authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

-- comments
create policy "comments_select" on public.comments for select
  using (exists (select 1 from public.posts p where p.id = post_id and (p.visibility = 'public' or p.author_id = auth.uid())));
create policy "comments_insert" on public.comments for insert to authenticated
  with check (auth.uid() = author_id);
create policy "comments_delete" on public.comments for delete to authenticated
  using (auth.uid() = author_id);

-- likes / helped / saves / follows
create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete to authenticated using (auth.uid() = user_id);

create policy "helped_select" on public.helped for select using (true);
create policy "helped_insert" on public.helped for insert to authenticated with check (auth.uid() = user_id);
create policy "helped_delete" on public.helped for delete to authenticated using (auth.uid() = user_id);

create policy "saves_select" on public.saves for select using (true);
create policy "saves_insert" on public.saves for insert to authenticated with check (auth.uid() = user_id);
create policy "saves_delete" on public.saves for delete to authenticated using (auth.uid() = user_id);

create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert to authenticated
  with check (auth.uid() = follower_id and follower_id <> following_id);
create policy "follows_delete" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- ============================================================
-- STORAGE BUCKETS (no video bucket — videos are YouTube links only)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true), ('images','images', true),
       ('audios','audios', true), ('docs','docs', true)
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects for select
  using (bucket_id in ('avatars','images','audios','docs'));

-- uploads: authenticated users, files stored inside their own folder:
-- {user_id}/{random-name}.ext
create policy "storage_insert_own" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars','images','audios','docs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_update_own" on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars','images','audios','docs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_delete_own" on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars','images','audios','docs')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- SEED: default topics (edit/extend freely)
-- ============================================================
insert into public.topics (name, slug, icon) values
  ('AI & Machine Learning', 'ai-ml', 'sparkles'),
  ('Web Development',       'web-dev', 'code'),
  ('Mobile Development',    'mobile', 'smartphone'),
  ('Cloud & DevOps',        'cloud-devops', 'cloud'),
  ('Data & Databases',      'data', 'database'),
  ('Study Skills',          'study-skills', 'book-open'),
  ('Career & Interviews',   'career', 'briefcase'),
  ('Design & UI',           'design', 'palette'),
  ('Languages',             'languages', 'languages'),
  ('Other',                 'other', 'shapes')
on conflict (slug) do nothing;
