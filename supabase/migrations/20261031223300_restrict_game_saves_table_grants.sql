-- No anonymous access. Authenticated players can initially manage only their own rows via RLS.
revoke all on table public.game_saves from public, anon, authenticated;
grant select, insert, update, delete on table public.game_saves to authenticated;
