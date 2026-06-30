/* Sthyra CPM — single source of backend identity (ARCH-3 / DUP-1 / SEC-4 / MAINT-3).
   Inlined FIRST by build.mjs and supervisor.build.mjs, so app.js and supervisor.js
   both read window.__SthyraConfig instead of each hardcoding the URL + keys.
   The key is a Supabase publishable/anon key — RLS is the real security boundary
   (see supabase/migrations/0001_harden_rls.sql). Rotating it is now a one-file edit. */
window.__SthyraConfig = {
  base:    "https://rajvfosoxgkyanwmdphq.supabase.co",
  url:     "https://rajvfosoxgkyanwmdphq.supabase.co/rest/v1",
  key:     "sb_publishable_u3pa8Z9iEZE8A7GSZnGXOQ_dAsjUbOp",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhanZmb3NveGdreWFud21kcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDg3MDgsImV4cCI6MjA5NTY4NDcwOH0.MejkaPs8AFleMTTGDqk_v1TJcb_3y9-E1ptj_adIgOI"
};
