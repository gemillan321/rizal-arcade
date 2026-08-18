create table if not exists public.rizal_arcade_scores (
  player_key uuid not null,
  player_name text not null,
  game_id text not null,
  score integer not null,
  achieved_at timestamptz not null default now(),
  primary key (player_key, game_id),
  constraint rizal_arcade_name_valid check (
    char_length(player_name) between 2 and 24
    and player_name = btrim(player_name)
    and player_name !~ '[[:cntrl:]<>]'
  ),
  constraint rizal_arcade_game_valid check (game_id in ('values', 'novels', 'codebreaker')),
  constraint rizal_arcade_score_valid check (
    (game_id = 'values' and score between 0 and 900)
    or (game_id = 'novels' and score between 0 and 870)
    or (game_id = 'codebreaker' and score between 0 and 1200)
  )
);

alter table public.rizal_arcade_scores drop constraint if exists rizal_arcade_score_valid;
alter table public.rizal_arcade_scores add constraint rizal_arcade_score_valid check (
  (game_id = 'values' and score between 0 and 900)
  or (game_id = 'novels' and score between 0 and 870)
  or (game_id = 'codebreaker' and score between 0 and 1200)
);

create index if not exists rizal_arcade_leaderboard_rank
  on public.rizal_arcade_scores (game_id, score desc, achieved_at asc);

alter table public.rizal_arcade_scores enable row level security;

revoke all on table public.rizal_arcade_scores from public, anon, authenticated;
grant select (player_name, game_id, score, achieved_at) on public.rizal_arcade_scores to anon, authenticated;

drop policy if exists "Anyone can read the Rizal Arcade leaderboard" on public.rizal_arcade_scores;
create policy "Anyone can read the Rizal Arcade leaderboard"
  on public.rizal_arcade_scores for select to anon, authenticated using (true);

create or replace function public.submit_rizal_arcade_score(
  p_player_key uuid,
  p_player_name text,
  p_game_id text,
  p_score integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(btrim(p_player_name), '[[:space:]]+', ' ', 'g');
  v_max_score integer;
begin
  if p_player_key is null then
    raise exception using errcode = '22023', message = 'A player key is required.';
  end if;

  if v_name is null or char_length(v_name) not between 2 and 24 or v_name ~ '[[:cntrl:]<>]' then
    raise exception using errcode = '22023', message = 'Display name must contain 2–24 safe characters.';
  end if;

  v_max_score := case p_game_id
    when 'values' then 900
    when 'novels' then 870
    when 'codebreaker' then 1200
    else null
  end;

  if v_max_score is null or p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception using errcode = '22023', message = 'Score is outside the allowed range.';
  end if;

  insert into public.rizal_arcade_scores as existing (player_key, player_name, game_id, score, achieved_at)
  values (p_player_key, v_name, p_game_id, p_score, now())
  on conflict (player_key, game_id)
  do update set
    player_name = excluded.player_name,
    score = greatest(existing.score, excluded.score),
    achieved_at = case when excluded.score > existing.score then now() else existing.achieved_at end;
end;
$$;

revoke all on function public.submit_rizal_arcade_score(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.submit_rizal_arcade_score(uuid, text, text, integer) to anon, authenticated;
