-- Force policies even for table owners that do not bypass RLS.
alter table public.game_saves enable row level security;
alter table public.game_saves force row level security;
