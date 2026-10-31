-- Secure per-player snapshot slots. One independent snapshot per slot.
create table public.game_saves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  slot smallint not null
    constraint game_saves_slot_range check (slot between 1 and 3),
  name text not null default 'Avance'
    constraint game_saves_name_length check (char_length(name) between 1 and 60),
  save_version smallint not null
    constraint game_saves_version_supported check (save_version in (1, 2)),
  state jsonb not null
    constraint game_saves_state_object check (
      jsonb_typeof(state) = 'object'
      and octet_length(state::text) <= 2 * 1024 * 1024
    ),
  summary jsonb not null default '{}'::jsonb
    constraint game_saves_summary_object check (
      jsonb_typeof(summary) = 'object'
      and octet_length(summary::text) <= 64 * 1024
    ),
  revision integer not null default 1
    constraint game_saves_revision_positive check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_saves_owner_slot_unique unique (owner_id, slot)
);

create index game_saves_owner_updated_idx
  on public.game_saves (owner_id, updated_at desc);

alter table public.game_saves enable row level security;

create policy "Users can read their own saves"
  on public.game_saves for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can insert their own saves"
  on public.game_saves for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Users can update their own saves"
  on public.game_saves for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own saves"
  on public.game_saves for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_game_saves_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, pg_temp
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger game_saves_set_updated_at
  before update on public.game_saves
  for each row execute function public.set_game_saves_updated_at();
