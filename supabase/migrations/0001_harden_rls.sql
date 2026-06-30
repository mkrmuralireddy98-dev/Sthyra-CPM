-- ============================================================================
-- Sthyra CPM — RLS hardening (SEC-1 / SEC-5)
-- Status: APPLIED to project rajvfosoxgkyanwmdphq on 2026-06-30.
-- ----------------------------------------------------------------------------
-- Scoped strictly to cpm_* tables. This Supabase project is SHARED with another
-- app (cofounder_*); a blanket "revoke ... on all tables in schema public" would
-- break it, so we only touch tables matching cpm\_%.
--
-- Effect: reads stay public (anon SELECT) so the dashboard renders without a
-- login; writes (issue resolution, QC verdicts, stage approvals) require a
-- signed-in user. The app sends the user's JWT on writes (see app.js sb()).
-- Verified: anon write -> 401, authenticated write -> 204, anon read -> 200.
-- ============================================================================

do $$
declare r record;
begin
  -- replace the old demo anon-write policies on cpm_* tables
  for r in select policyname, tablename from pg_policies
           where schemaname='public' and tablename like 'cpm\_%' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
  -- public read, authenticated write; also revoke anon write grants (belt + suspenders)
  for r in select tablename from pg_tables
           where schemaname='public' and tablename like 'cpm\_%' loop
    execute format('alter table public.%I enable row level security', r.tablename);
    execute format('revoke insert, update, delete on public.%I from anon', r.tablename);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)',
                   r.tablename||'_read', r.tablename);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)',
                   r.tablename||'_write', r.tablename);
  end loop;
end $$;

-- Demo inspector account used by the app's sign-in drawer:
--   email inspector@sthyra.demo  /  password Sthyra@2026  (email-confirmed)
-- Seed scripts (.claude/*-seed.mjs) must now run with the SERVICE-ROLE key
-- (SUPABASE_KEY env) since anon can no longer insert.

-- FOLLOW-UPS (not yet done):
--  * Scope the authenticated write policy to project membership instead of
--    "using (true)" once a memberships table exists.
--  * Stamp approved_by/inspector from auth.uid() server-side (replace the
--    client "Eng. Ramesh" literal) — see app.js setQcStage/submitQC.
--  * Apply the same lockdown to the supervisor app's sth_* tables once that
--    app has its own auth flow.

-- Verify no anon write policy remains:
--   select * from pg_policies where schemaname='public' and tablename like 'cpm\_%'
--     and 'anon' = any(roles) and cmd in ('INSERT','UPDATE','DELETE','ALL');
