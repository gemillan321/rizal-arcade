-- Run once in the Supabase SQL Editor after deploying Scholar's Journey.
-- This migration preserves every existing student, section, and score.

alter table public.rizal_arcade_scores
  drop constraint if exists rizal_arcade_scores_game_id_check,
  drop constraint if exists rizal_arcade_score_valid;

alter table public.rizal_arcade_scores
  add constraint rizal_arcade_scores_game_id_check
    check (game_id in ('values', 'novels', 'codebreaker', 'scholar')),
  add constraint rizal_arcade_score_valid check (
    (game_id = 'values' and score between 0 and 900)
    or (game_id = 'novels' and score between 0 and 870)
    or (game_id = 'codebreaker' and score between 0 and 1200)
    or (game_id = 'scholar' and score between 0 and 870)
  );

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
