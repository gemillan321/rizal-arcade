-- Additive upgrade: run after repair_score_recording.sql (or the current fresh schema).
-- A saved completed round, including a zero-score round, earns one permanent game badge.
begin;
set local lock_timeout = '5s';

create table if not exists public.rizal_arcade_badges (
  student_id uuid not null references public.rizal_arcade_profiles(id) on delete cascade,
  game_id text not null check (game_id in ('values', 'novels', 'codebreaker', 'scholar', 'hearts', 'museum', 'global', 'dapitan', 'revolution', 'crossword')),
  awarded_at timestamptz not null default now(),
  primary key (student_id, game_id)
);

alter table public.rizal_arcade_badges enable row level security;
revoke all on public.rizal_arcade_badges from public, anon, authenticated;
grant select on public.rizal_arcade_badges to authenticated;

drop policy if exists "Students read their own badges" on public.rizal_arcade_badges;
create policy "Students read their own badges"
  on public.rizal_arcade_badges for select to authenticated
  using (student_id = (select auth.uid()) and exists (
    select 1 from public.rizal_arcade_profiles p
    where p.id = (select auth.uid()) and p.role = 'student' and p.active and not p.must_change_password
  ));

create or replace function public.award_rizal_arcade_game_badge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.rizal_arcade_badges (student_id, game_id, awarded_at)
  values (new.student_id, new.game_id, now())
  on conflict (student_id, game_id) do nothing;
  return new;
end;
$$;
revoke all on function public.award_rizal_arcade_game_badge() from public, anon, authenticated;

drop trigger if exists rizal_arcade_award_game_badge on public.rizal_arcade_scores;
create trigger rizal_arcade_award_game_badge
  after insert or update on public.rizal_arcade_scores
  for each row execute function public.award_rizal_arcade_game_badge();

-- Recognize existing account-owned results; never import device-local best scores.
-- Historical first-completion dates are unavailable, so use the earliest stored best date.
insert into public.rizal_arcade_badges (student_id, game_id, awarded_at)
select s.student_id, s.game_id, min(s.achieved_at)
from public.rizal_arcade_scores s
join public.rizal_arcade_profiles p on p.id = s.student_id and p.role = 'student'
group by s.student_id, s.game_id
on conflict (student_id, game_id) do nothing;

commit;
