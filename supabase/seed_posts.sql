-- ============================================================
-- KIWORK — Sample Seed Posts (Optional)
-- Run this in Supabase SQL Editor AFTER you have created at least one account/profile
-- ============================================================

do $$
declare
  v_author_id uuid;
  v_ai_topic uuid;
  v_web_topic uuid;
  v_skills_topic uuid;
  v_cloud_topic uuid;
  v_post_id uuid;
begin
  -- Find an author (uses the first registered profile)
  select id into v_author_id from public.profiles order by created_at asc limit 1;
  
  if v_author_id is null then
    raise notice 'Please sign up or create at least one user before running seed posts.';
    return;
  end if;

  select id into v_ai_topic from public.topics where slug = 'ai-ml' limit 1;
  select id into v_web_topic from public.topics where slug = 'web-dev' limit 1;
  select id into v_skills_topic from public.topics where slug = 'study-skills' limit 1;
  select id into v_cloud_topic from public.topics where slug = 'cloud-devops' limit 1;

  -- 1. Video post (YouTube)
  insert into public.posts (
    author_id, format, title, description, media_url, media_url_2, language, visibility, views
  ) values (
    v_author_id,
    'video',
    'How Transformers Actually Work (Attention Mechanism Explained Visually)',
    'My notes and favorite breakdown of multi-head self-attention, query/key/value matrices, and positional encoding from 3Blue1Brown.',
    'https://www.youtube.com/watch?v=wjZofJX0v4U',
    'https://img.youtube.com/vi/wjZofJX0v4U/hqdefault.jpg',
    'en',
    'public',
    42
  ) returning id into v_post_id;

  if v_ai_topic is not null then
    insert into public.post_topics (post_id, topic_id) values (v_post_id, v_ai_topic) on conflict do nothing;
  end if;

  -- 2. Blog post
  insert into public.posts (
    author_id, format, title, description, body, language, visibility, views
  ) values (
    v_author_id,
    'blog',
    '5 Mental Models That Changed How I Debug React & Next.js Apps',
    'A summary of five mental models for React state, server/client boundaries, and hydration mismatches.',
    '<h2>1. Server Components vs Client Components are Environments, Not Syntax</h2><p>RSC runs once on the server to build a streamable virtual tree. Client components are hydration boundaries, not traditional SPAs.</p><h2>2. State is a Snapshot Over Time</h2><p>Never think of setState as modifying a live variable; you are scheduling a re-render with a new state tuple.</p><h2>3. Effects are Synchronizers, Not Event Handlers</h2><p>If you find yourself using useEffect to calculate derived data, compute it during rendering instead.</p><h2>4. Hydration is Re-attaching Event Listeners</h2><p>When SSR output mismatches client output, React has to patch the DOM, causing visual jumps or performance dips.</p><h2>5. URL is the Single Source of Truth for Shareable State</h2><p>Query parameters make states bookmarkable and shareable without complex global store sync.</p>',
    'en',
    'public',
    78
  ) returning id into v_post_id;

  if v_web_topic is not null then
    insert into public.post_topics (post_id, topic_id) values (v_post_id, v_web_topic) on conflict do nothing;
  end if;

  -- 3. Study Skills Post
  insert into public.posts (
    author_id, format, title, description, body, language, visibility, views
  ) values (
    v_author_id,
    'blog',
    'The Feynman Technique: How to Learn Hard Topics 3x Faster',
    'Step-by-step framework to teach whatever you study to a 12-year-old so you identify blind spots.',
    '<h2>The 4 Steps of Feynman Technique</h2><ol><li><strong>Choose a concept:</strong> Write the title at the top of a blank page.</li><li><strong>Teach it to a 12-year-old:</strong> Use plain language. No buzzwords or technical jargon allowed.</li><li><strong>Identify knowledge gaps:</strong> When you get stuck or use big words to hide vagueness, go back to source material.</li><li><strong>Simplify and use analogies:</strong> Connect abstract concepts to physical everyday objects.</li></ol>',
    'en',
    'public',
    115
  ) returning id into v_post_id;

  if v_skills_topic is not null then
    insert into public.post_topics (post_id, topic_id) values (v_post_id, v_skills_topic) on conflict do nothing;
  end if;

  -- 4. Cloud / DevOps Video
  insert into public.posts (
    author_id, format, title, description, media_url, media_url_2, language, visibility, views
  ) values (
    v_author_id,
    'video',
    'Docker & Containerization in 100 Seconds',
    'Quick refresher on what Docker images, containers, and layers are under the hood.',
    'https://www.youtube.com/watch?v=Gjnup-PuquQ',
    'https://img.youtube.com/vi/Gjnup-PuquQ/hqdefault.jpg',
    'en',
    'public',
    63
  ) returning id into v_post_id;

  if v_cloud_topic is not null then
    insert into public.post_topics (post_id, topic_id) values (v_post_id, v_cloud_topic) on conflict do nothing;
  end if;

  raise notice 'Successfully seeded sample posts for author: %', v_author_id;
end;
$$;
