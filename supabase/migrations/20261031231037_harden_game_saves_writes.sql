-- Keep save revisions server-managed so clients cannot bypass compare-and-swap.
create or replace function public.set_game_saves_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, pg_temp
as $function$
begin
  new.updated_at := now();
  new.revision := old.revision + 1;
  return new;
end;
$function$;

revoke insert, update, delete on table public.game_saves from authenticated;
grant select on table public.game_saves to authenticated;
grant insert (slot, name, save_version, state, summary)
  on table public.game_saves to authenticated;
grant update (name, save_version, state, summary)
  on table public.game_saves to authenticated;

create or replace function public.delete_game_save(
  p_slot smallint,
  p_expected_revision integer
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  deleted_count integer;
begin
  delete from public.game_saves
  where owner_id = (select auth.uid())
    and slot = p_slot
    and revision = p_expected_revision;
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$function$;

revoke all on function public.delete_game_save(smallint, integer) from public;
revoke all on function public.delete_game_save(smallint, integer) from anon;
grant execute on function public.delete_game_save(smallint, integer) to authenticated;
