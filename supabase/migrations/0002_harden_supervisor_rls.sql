-- ============================================================================
-- Sthyra Supervisor (reality-capture) — RLS + storage hardening (SEC-1/SEC-2)
-- Status: APPLIED to project rajvfosoxgkyanwmdphq on 2026-06-30.
-- ----------------------------------------------------------------------------
-- Mirrors the command-center lockdown for the supervisor's sth_* tables and the
-- sth-media storage bucket. Scoped to sth_% only. Reads + anonymous SHARED links
-- stay open (anon SELECT); writes (capture/note/calibration/share) require a
-- signed-in inspector (supervisor.js now sends the user's JWT, see sb()).
-- Verified: anon write -> 401, authenticated write -> 201/204, anon read -> 200,
-- anon storage upload -> blocked, authenticated upload -> 200, anonymous share
-- view still renders.
-- ============================================================================

do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname='public' and tablename like 'sth\_%' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
  for r in select tablename from pg_tables
           where schemaname='public' and tablename like 'sth\_%' loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('revoke insert, update, delete on public.%I from anon', r.tablename);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)',
                   r.tablename||'_read', r.tablename);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)',
                   r.tablename||'_write', r.tablename);
  end loop;
end $$;

-- Storage: keep sth-media public READ (shared captures/plans must load) but
-- require auth to WRITE; the app also dropped x-upsert so uploads can't overwrite.
drop policy if exists sth_media_anon_write on storage.objects;
create policy sth_media_auth_write on storage.objects
  for insert to authenticated with check (bucket_id = 'sth-media');

-- App-side (supervisor.js): Supabase Auth sign-in (avatar), JWT on writes,
-- requireAuth() gates the 12 write handlers; share tokens now use a CSPRNG
-- (crypto.getRandomValues, 22 chars); the share "copy" button no longer
-- interpolates the URL into an inline onclick (SEC-4); pipeline/worker.mjs
-- encodeURIComponent's its CLI capture id (SEC-5).

-- FOLLOW-UPS (NOT done — flagged):
--  * SEC-6: edge function cpm-pipeline (supabase/functions/cpm-pipeline/index.ts)
--    uses CORS '*' and authorizes on the anon JWT while writing under service role.
--    Restrict CORS to known origins and require an authenticated user (or shared
--    HMAC) before service-role writes. Left as-is to avoid breaking the autoprocess
--    trigger that invokes it with the anon JWT.
--  * Share links are still UI-scoped: anon SELECT on sth_* lets a share viewer read
--    beyond the shared capture. Expose shared reads through a token-validating RPC /
--    row-filtered view for true per-share scoping.
--  * Scope authenticated writes to project membership instead of "using (true)".
