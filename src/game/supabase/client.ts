/* Supabase client — env-gated. When credentials are not configured (gift
   build without backend), the client is null and SaveSystem runs purely on
   local persistence. Only the public anon key is ever read here; RLS does
   the guarding. Never put service-role credentials in this bundle. */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon, { auth: { persistSession: true } }) : null;

export async function ensureAnonymousSession(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) return data.session.user.id;
    const { data: signIn, error } = await supabase.auth.signInAnonymously();
    if (error || !signIn.user) return null;
    return signIn.user.id;
  } catch {
    return null;
  }
}
