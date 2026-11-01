create table public.game_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_saves_data_object check (jsonb_typeof(save_data) = 'object')
);

alter table public.game_saves enable row level security;

revoke all on table public.game_saves from public, anon, authenticated;
grant select, insert, update, delete on table public.game_saves to authenticated;

create policy "Users can read their own save"
  on public.game_saves
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own save"
  on public.game_saves
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own save"
  on public.game_saves
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own save"
  on public.game_saves
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
