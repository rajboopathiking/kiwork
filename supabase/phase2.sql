-- ============================================================
-- KIWORK — Phase 2 additions
-- Run ONCE in Supabase SQL Editor (after schema.sql)
-- ============================================================

-- Public post view counter (anyone can bump views of a single post)
create or replace function public.increment_views(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set views = views + 1 where id = p_post_id;
$$;

grant execute on function public.increment_views(uuid) to anon, authenticated;
