-- The delete policy already restricts rows to auth.uid(); this grants the
-- authenticated role the SQL privilege needed by the SECURITY INVOKER RPC.
grant delete on table public.game_saves to authenticated;
