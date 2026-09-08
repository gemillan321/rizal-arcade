-- Rollback-only integration checks. Run as postgres after add_game_badges.sql.
begin;
set local lock_timeout = '5s';
do $$
declare
  v_student uuid;
  v_game text;
  v_awarded timestamptz;
  v_after timestamptz;
begin
  select id into v_student from public.rizal_arcade_profiles
  where role = 'student' and active and not must_change_password limit 1;
  if v_student is null then raise exception 'An eligible student is required for verification'; end if;
  perform set_config('request.jwt.claim.sub', v_student::text, true);
  foreach v_game in array array['values','novels','codebreaker','scholar','hearts','museum','global','dapitan','revolution','crossword'] loop
    perform public.submit_rizal_arcade_score(v_game, 0);
    select awarded_at into v_awarded from public.rizal_arcade_badges where student_id = v_student and game_id = v_game;
    if v_awarded is null then raise exception 'Missing badge for %', v_game; end if;
    perform public.submit_rizal_arcade_score(v_game, 1);
    perform public.submit_rizal_arcade_score(v_game, 0);
    select awarded_at into v_after from public.rizal_arcade_badges where student_id = v_student and game_id = v_game;
    if v_after is distinct from v_awarded then raise exception 'Replay changed award date for %', v_game; end if;
  end loop;
  if (select count(*) from public.rizal_arcade_badges where student_id = v_student) <> 10 then raise exception 'Expected ten distinct game badges'; end if;
  if exists (
    select 1 from public.rizal_arcade_scores s join public.rizal_arcade_profiles p on p.id = s.student_id and p.role = 'student'
    where not exists (select 1 from public.rizal_arcade_badges b where b.student_id = s.student_id and b.game_id = s.game_id)
  ) then raise exception 'Existing score missing its backfilled award'; end if;
  if has_table_privilege('authenticated', 'public.rizal_arcade_badges', 'insert,update,delete')
    or has_table_privilege('anon', 'public.rizal_arcade_badges', 'select')
    or has_function_privilege('authenticated', 'public.award_rizal_arcade_game_badge()', 'execute')
    then raise exception 'Unexpected badge write privileges'; end if;
end $$;

set local role authenticated;
do $$
begin
  if (select count(*) from public.rizal_arcade_badges) <> 10 then raise exception 'Student cannot read own ten awards'; end if;
  if exists (select 1 from public.rizal_arcade_badges where student_id <> auth.uid()) then raise exception 'Other student awards leaked'; end if;
  begin
    insert into public.rizal_arcade_badges (student_id, game_id) values (auth.uid(), 'values');
    raise exception 'Direct badge write accepted';
  exception when insufficient_privilege then null;
  end;
  perform set_config('request.jwt.claim.sub', '', true);
  if exists (select 1 from public.rizal_arcade_badges) then raise exception 'Signed-out session can read awards'; end if;
  begin
    perform public.submit_rizal_arcade_score('values', 100);
    raise exception 'Signed-out score accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select 'PASS: ten awards, zero-score completion, stable replay dates, backfill, student-only reads, no client writes, no signed-out awards. Test writes rolled back.' as verification;
rollback;
