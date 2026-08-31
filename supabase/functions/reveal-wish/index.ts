/* Edge Function — reveal-wish
   Returns a wish ONLY if its unlock date has already passed. Before that it
   answers 403 and sends nothing back. The decryption key lives here, never
   in the browser bundle.

   Deploy: supabase functions deploy reveal-wish */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function importKey() {
  const raw = fromB64(Deno.env.get("WISH_KEY")!);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["decrypt"]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userData } = await anon.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "no session" }), { status: 401, headers: cors });

    const { birthday_year } = await req.json();

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: row } = await admin
      .from("wishes")
      .select("id, sealed_body, iv, unlock_at, birthday_year")
      .eq("player_id", user.id)
      .eq("birthday_year", birthday_year)
      .maybeSingle();

    if (!row) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: cors });

    // the gate — this is the whole point of the function
    if (new Date(row.unlock_at) > new Date()) {
      return new Response(
        JSON.stringify({ error: "not yet", unlock_at: row.unlock_at }),
        { status: 403, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const key = await importKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(row.iv) },
      key,
      fromB64(row.sealed_body)
    );

    await admin.from("wishes").update({ opened_at: new Date().toISOString() }).eq("id", row.id);
    await admin
      .from("birthday_state")
      .update({ opened: true })
      .eq("player_id", user.id)
      .eq("birthday_year", row.birthday_year);

    return new Response(
      JSON.stringify({ ok: true, text: new TextDecoder().decode(plain) }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
