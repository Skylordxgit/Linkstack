import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Server-only Supabase client using the service role key — bypasses Row Level
 * Security. Only ever import this in backend code, never expose the key to
 * the frontend/browser.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
