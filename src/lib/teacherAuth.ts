import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY } from "@/lib/supabase";

// TEACHER LOGIN (2026-10-23): Teacher HQ has its OWN Supabase client with its OWN storage key.
// Kid pages use the normal client (src/lib/supabase.ts) and never see a teacher login, so a teacher
// signed in on the same browser can never change how kids read or save.
// Created only when Teacher HQ asks for it (never on kid pages).
let client: SupabaseClient | null = null;
export function teacherDb(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { storageKey: "mpe-teacher-auth", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}
