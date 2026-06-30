-- ============================================================================
-- Sthyra CPM — RLS hardening (SEC-1 / SEC-5)  ·  Phase 0
-- ----------------------------------------------------------------------------
-- DO NOT APPLY TO THE LIVE PROJECT YET.
--
-- This removes anonymous write access and makes the authenticated user the
-- security boundary. The apps currently have NO login flow and send only the
-- publishable/anon key, so running this BEFORE a Supabase Auth flow exists will
-- make every write (resolve issue, submit QC, approve stage gate) start failing.
-- Land a sign-in flow first, then apply this in the same change.
--
-- Addresses verified findings:
--   SEC-1 (critical) unauthenticated full CRUD to Postgres
--   SEC-5 (high)     forgeable, unattributable quality sign-offs
-- ============================================================================

-- 1. Revoke anonymous writes on every app table (anon keeps SELECT for the
--    read-only public dashboard; tighten per table as needed).
revoke insert, update, delete on all tables in schema public from anon;

-- 2. Writes require an authenticated user. Repeat per writable table; scope by
--    project membership once a memberships table exists.
do $$
declare t text;
begin
  foreach t in array array['cpm_issues','cpm_qc_processes','cpm_qc_stages','cpm_qc_items']
  loop
    execute format('drop policy if exists %I on public.%I', t||'_write_auth', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (true) with check (true)',
      t||'_write_auth', t);
  end loop;
end $$;

-- 3. Stamp approver identity & time SERVER-SIDE (replaces the hardcoded
--    "Eng. Ramesh" / "13 Jun" the client sends). Requires uuid columns
--    referencing auth.users; adjust if currently text.
-- alter table public.cpm_qc_stages    alter column approved_by set default auth.uid();
-- alter table public.cpm_qc_stages    alter column approved_at set default now();
-- alter table public.cpm_qc_processes alter column inspector   set default auth.uid();
-- alter table public.cpm_qc_processes alter column checked_at  set default now();

-- 4. Seed scripts must run with the SERVICE-ROLE key from a server/CI context,
--    never the browser. See .claude/qc-seed.mjs / est-seed.mjs (SUPABASE_KEY env).

-- 5. Verify no anon write policy survives:
--    select * from pg_policies where schemaname='public' and 'anon' = any(roles)
--      and cmd in ('INSERT','UPDATE','DELETE');
