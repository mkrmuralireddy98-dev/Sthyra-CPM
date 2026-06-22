-- ============================================================================
-- Sthyra CPM — auto-process trigger: fire the analysis pipeline on upload
-- ----------------------------------------------------------------------------
-- WHAT THIS DOES
--   When a 360° capture finishes uploading (its row in public.cpm_captures has
--   status = 'uploaded'), this asynchronously calls the cpm-pipeline edge
--   function via pg_net's net.http_post(). The edge function then runs the
--   frame-extraction → BIM-align → AI-detect → diff → discrepancy → issue
--   pipeline and writes results back, advancing the same row's status through
--   'processing' → 'analyzed' (or 'failed').
--
--     INSERT/UPDATE cpm_captures.status = 'uploaded'
--         → cpm_trigger_pipeline()  (this trigger fn)
--         → net.http_post(.../functions/v1/cpm-pipeline, {capture_id})   [async]
--         → edge function processes and PATCHes status = processing/analyzed
--
-- RECURSION GUARD  (why this can never loop)  — VERIFIED
--   The edge function will itself UPDATE this same row (status → 'processing',
--   then 'analyzed'/'failed', plus processing_step/steps/coverage_pct/…). The
--   trigger fn guards against re-firing on those writes in TWO independent ways,
--   so the pipeline cannot retrigger itself:
--     (1) STATUS-VALUE GUARD (sufficient on its own): it only acts when
--         NEW.status = 'uploaded'. The edge function never sets status back to
--         'uploaded' — it only moves it forward to 'processing'/'analyzed'/
--         'failed' — so every write it makes fails this check and the function
--         returns NEW without an HTTP call.
--     (2) TRANSITION GUARD (redundant belt-and-suspenders): even an UPDATE that
--         leaves status = 'uploaded' unchanged (e.g. touching some other column
--         in the same statement that also sets status) is ignored, because we
--         also require OLD.status IS DISTINCT FROM NEW.status (or
--         TG_OP = 'INSERT'). The pipeline therefore fires exactly ONCE, on the
--         transition *into* 'uploaded', and never again.
--   Additionally the trigger is declared AFTER UPDATE OF status, so it is only
--   even evaluated when the status column is part of the UPDATE's SET list —
--   writes to unrelated columns don't invoke the function at all. (The OF
--   clause narrows *invocation*; guards (1)/(2) make the *no-op* certain even
--   when status is written but is not a fresh transition into 'uploaded'.)
--   Trace: INSERT(uploaded)->fires once; PATCH(processing)->guard false->no-op;
--   PATCH(analyzed)->guard false->no-op. No loop. (A retry that re-sets
--   'failed'->'uploaded' intentionally fires again — desired re-processing.)
--
-- SECURITY
--   - cpm_trigger_pipeline() is SECURITY DEFINER so the HTTP call is queued
--     with the owner's rights regardless of which (anon) role inserted the
--     capture row. pg_net itself runs out-of-band as the background worker.
--   - The request carries an Authorization: Bearer <ANON_JWT> header. The edge
--     function gateway only needs a VALID project JWT (verify_jwt=true), and the
--     anon JWT is publishable/non-secret — so we deliberately do NOT embed the
--     service-role key here. The edge function performs its own privileged
--     writes (cpm_issues etc.) using its own SUPABASE_SERVICE_ROLE_KEY env var,
--     server-side, so the secret never touches the database. This is strictly
--     more secure than putting the service key in this DDL.
--   - search_path is pinned (see SET below): a SECURITY DEFINER function must
--     never resolve objects via a caller-controlled search_path.
--
-- DELIVERY SEMANTICS
--   net.http_post() is ASYNCHRONOUS and fire-and-forget: it enqueues the
--   request and returns a request id immediately inside the trigger; the actual
--   POST is performed later by the pg_net background worker. The triggering
--   transaction does NOT block on, see, or roll back based on the HTTP
--   response. Responses (status/body/errors) land in net._http_response and can
--   be inspected there for debugging. A failed delivery will NOT be retried
--   automatically and will NOT re-fire this trigger.
-- ============================================================================

-- pg_net: async HTTP from inside Postgres. Installed into the dedicated
-- `extensions` schema (Supabase convention). NOTE (verified against the live
-- project): pg_net creates and OWNS a separate `net` schema, and its callable
-- objects — including net.http_post() — live in `net`, not in `extensions`.
-- The WITH SCHEMA clause governs where the *extension* is registered; the
-- function is reached as net.http_post(...). search_path below therefore
-- includes `net`.
create extension if not exists pg_net with schema extensions;

-- ----------------------------------------------------------------------------
-- Trigger function
-- ----------------------------------------------------------------------------
create or replace function public.cpm_trigger_pipeline()
returns trigger
language plpgsql
security definer
-- Pin search_path: SECURITY DEFINER fns must not resolve objects via a
-- caller-controlled search_path. net.http_post lives in the `net` schema
-- (verified); `net` is listed explicitly even though the call below is also
-- fully schema-qualified.
set search_path = public, extensions, net, pg_temp
as $$
begin
  -- GUARD: act only on the transition INTO 'uploaded'.
  --   • INSERT  → fire when the row is born already 'uploaded'.
  --   • UPDATE  → fire only when status actually CHANGED to 'uploaded'
  --               (OLD.status IS DISTINCT FROM NEW.status). This is the
  --               recursion guard: the edge function's later writes set status
  --               to processing/analyzed/failed (never 'uploaded'), so they all
  --               fail this condition and this function becomes a no-op for
  --               them — the pipeline cannot retrigger itself.
  -- NOTE: TG_OP = 'INSERT' is listed first so that on INSERT (where OLD does
  -- not exist) the OR short-circuits before OLD.status is ever evaluated.
  if new.status = 'uploaded'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then

    -- Fire-and-forget: enqueue the POST to the cpm-pipeline edge function.
    -- net.http_post returns a request id (ignored here); the pg_net worker
    -- performs the call out-of-band after this transaction.
    -- Named arguments are used deliberately: the verified signature is
    --   net.http_post(url text, body jsonb, params jsonb, headers jsonb,
    --                  timeout_milliseconds int)
    -- i.e. body comes BEFORE headers positionally. Named args make the call
    -- order-independent and correct; params/timeout fall to their defaults.
    perform net.http_post(
      url     := 'https://rajvfosoxgkyanwmdphq.supabase.co/functions/v1/cpm-pipeline',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   -- Anon JWT (publishable, non-secret): satisfies the gateway's
                   -- verify_jwt; the function self-elevates with its own service
                   -- key. Swap for THIS project's anon JWT if redeploying elsewhere.
                   'Authorization', 'Bearer <ANON_JWT>'
                 ),
      body    := jsonb_build_object('capture_id', new.id)
    );
  end if;

  -- AFTER trigger: return value is ignored, but returning NEW is the convention.
  return new;
end;
$$;

comment on function public.cpm_trigger_pipeline() is
  'AFTER trigger: on transition of cpm_captures.status into ''uploaded'', '
  'async-calls the cpm-pipeline edge function via pg_net (fire-and-forget). '
  'Guarded against recursion: only fires on the transition into ''uploaded'', '
  'so the pipeline''s own processing/analyzed writes never re-fire it.';

-- ----------------------------------------------------------------------------
-- Trigger
-- ----------------------------------------------------------------------------
-- Idempotent (re)create so this file can be re-applied safely.
drop trigger if exists cpm_captures_autoprocess on public.cpm_captures;

create trigger cpm_captures_autoprocess
  after insert or update of status on public.cpm_captures
  for each row
  execute function public.cpm_trigger_pipeline();
