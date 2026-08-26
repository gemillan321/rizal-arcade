-- Rizal Arcade authenticated classroom schema.
-- This replaces the prototype nickname leaderboard and removes its unverified scores.

drop function if exists public.submit_rizal_arcade_score(uuid, text, text, integer);
drop function if exists public.submit_rizal_arcade_score(text, integer);
drop table if exists public.rizal_arcade_scores cascade;

create table if not exists public.rizal_arcade_sections (
  id uuid primary key default gen_random_uuid(),
  section_code text not null,
  school_year text not null,
  term text not null,
  subject_code text not null default 'RIZLIFE',
  subject_name text not null default 'Life and Works of Rizal',
  instructor_name text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_code, school_year, term)
);

create table if not exists public.rizal_arcade_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'student')),
  student_id text unique,
  first_name text not null default '',
  middle_name text not null default '',
  last_name text not null default '',
  display_name text not null,
  roster_email text,
  course_code text not null default '',
  section_id uuid references public.rizal_arcade_sections(id),
  must_change_password boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rizal_arcade_student_shape check (
    (role = 'admin' and student_id is null)
    or (role = 'student' and student_id is not null and section_id is not null)
  ),
  constraint rizal_arcade_display_name_valid check (
    char_length(display_name) between 2 and 120
    and display_name = btrim(display_name)
    and display_name !~ '[[:cntrl:]<>]'
  )
);

create table public.rizal_arcade_scores (
  student_id uuid not null references public.rizal_arcade_profiles(id) on delete cascade,
  section_id uuid not null references public.rizal_arcade_sections(id) on delete cascade,
  player_name text not null,
  game_id text not null check (game_id in ('values', 'novels', 'codebreaker', 'scholar')),
  score integer not null,
  achieved_at timestamptz not null default now(),
  primary key (student_id, section_id, game_id),
  constraint rizal_arcade_score_valid check (
    (game_id = 'values' and score between 0 and 900)
    or (game_id = 'novels' and score between 0 and 870)
    or (game_id = 'codebreaker' and score between 0 and 1200)
    or (game_id = 'scholar' and score between 0 and 870)
  )
);

create index rizal_arcade_leaderboard_rank
  on public.rizal_arcade_scores (section_id, game_id, score desc, achieved_at asc);

alter table public.rizal_arcade_sections enable row level security;
alter table public.rizal_arcade_profiles enable row level security;
alter table public.rizal_arcade_scores enable row level security;

create or replace function public.is_rizal_arcade_admin()
returns boolean
language sql
stable
security definer
set search_path = 'public', 'pg_temp'
as $$
  select exists (
    select 1 from public.rizal_arcade_profiles
    where id = auth.uid() and role = 'admin' and active
  );
$$;

revoke all on function public.is_rizal_arcade_admin() from public, anon, authenticated;
grant execute on function public.is_rizal_arcade_admin() to authenticated;

drop policy if exists "Students read their section" on public.rizal_arcade_sections;
create policy "Students read their section"
  on public.rizal_arcade_sections for select to authenticated
  using (
    public.is_rizal_arcade_admin()
    or id = (select section_id from public.rizal_arcade_profiles where id = auth.uid() and active)
  );

drop policy if exists "Users read their own profile and admins read all" on public.rizal_arcade_profiles;
create policy "Users read their own profile and admins read all"
  on public.rizal_arcade_profiles for select to authenticated
  using (id = auth.uid() or public.is_rizal_arcade_admin());

drop policy if exists "Students read only their section leaderboard" on public.rizal_arcade_scores;
create policy "Students read only their section leaderboard"
  on public.rizal_arcade_scores for select to authenticated
  using (
    public.is_rizal_arcade_admin()
    or section_id = (select section_id from public.rizal_arcade_profiles where id = auth.uid() and active)
  );

revoke all on public.rizal_arcade_sections from public, anon, authenticated;
revoke all on public.rizal_arcade_profiles from public, anon, authenticated;
revoke all on public.rizal_arcade_scores from public, anon, authenticated;
grant select on public.rizal_arcade_sections to authenticated;
grant select on public.rizal_arcade_profiles to authenticated;
grant select (section_id, player_name, game_id, score, achieved_at) on public.rizal_arcade_scores to authenticated;

create or replace function public.complete_rizal_arcade_first_login()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Sign in is required.';
  end if;
  update public.rizal_arcade_profiles
  set must_change_password = false, updated_at = now()
  where id = auth.uid() and active;
  if not found then
    raise exception using errcode = '42501', message = 'The Rizal Arcade profile is inactive or missing.';
  end if;
end;
$$;

revoke all on function public.complete_rizal_arcade_first_login() from public, anon, authenticated;
grant execute on function public.complete_rizal_arcade_first_login() to authenticated;

create or replace function public.submit_rizal_arcade_score(p_game_id text, p_score integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.rizal_arcade_profiles%rowtype;
  v_max_score integer;
begin
  select * into v_profile
  from public.rizal_arcade_profiles
  where id = auth.uid() and role = 'student' and active and not must_change_password;
  if not found then
    raise exception using errcode = '42501', message = 'An active student account is required.';
  end if;

  v_max_score := case p_game_id
    when 'values' then 900
    when 'novels' then 870
    when 'codebreaker' then 1200
    when 'scholar' then 870
    else null
  end;
  if v_max_score is null or p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception using errcode = '22023', message = 'Score is outside the allowed range.';
  end if;

  insert into public.rizal_arcade_scores as existing (student_id, section_id, player_name, game_id, score, achieved_at)
  values (v_profile.id, v_profile.section_id, v_profile.display_name, p_game_id, p_score, now())
  on conflict (student_id, section_id, game_id)
  do update set
    player_name = excluded.player_name,
    score = greatest(existing.score, excluded.score),
    achieved_at = case when excluded.score > existing.score then now() else existing.achieved_at end;
end;
$$;

revoke all on function public.submit_rizal_arcade_score(text, integer) from public, anon, authenticated;
grant execute on function public.submit_rizal_arcade_score(text, integer) to authenticated;

-- One-time helper for the first administrator:
-- 1. Create an email/password user in Supabase Authentication > Users.
-- 2. Run: select public.promote_rizal_arcade_admin('professor@school.edu', 'Professor');
create or replace function public.promote_rizal_arcade_admin(p_email text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_user_id is null then
    raise exception using errcode = '22023', message = 'Create this email in Supabase Authentication first.';
  end if;
  insert into public.rizal_arcade_profiles (id, role, display_name, active)
  values (v_user_id, 'admin', btrim(p_display_name), true)
  on conflict (id) do update set role = 'admin', display_name = excluded.display_name, active = true, updated_at = now();
  return v_user_id;
end;
$$;

revoke all on function public.promote_rizal_arcade_admin(text, text) from public, anon, authenticated;
