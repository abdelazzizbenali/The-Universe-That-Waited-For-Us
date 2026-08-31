/* Edge Function — seal-wish
   Receives a wish, encrypts it server-side with a key that never leaves the
   server, stores only ciphertext, and returns nothing but a receipt.

   Deploy:
     supabase secrets set WISH_KEY="<32-byte base64>"
     supabase functions deploy seal-wish

   The client's anon key can call this. It cannot read the table afterwards. */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function importKey() {
  const raw = Uint8Array.from(atob(Deno.env.get("WISH_KEY")!), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt"]);
}

/** Next occurrence of the birthday after `from`, at midnight. */
function nextBirthday(from: Date, month: number, day: number) {
  const y = from.getUTCFullYear();
  const thisYear = new Date(Date.UTC(y, month - 1, day, 0, 0, 0));
  return thisYear > from ? thisYear : new Date(Date.UTC(y + 1, month - 1, day, 0, 0, 0));
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

    const body = await req.json();
    const text = String(body.text ?? "").slice(0, 4000).trim();
    const year = Number(body.birthday_year) || new Date().getUTCFullYear();
    const month = Number(body.birthday_month) || 1;
    const day = Number(body.birthday_day) || 1;
    if (!text) return new Response(JSON.stringify({ error: "empty" }), { status: 400, headers: cors });

    // encrypt — the plaintext is never written anywhere
    const key = await importKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(text)
    );

    const unlockAt = nextBirthday(new Date(), month, day);

    // service role: bypasses RLS, which no client can do
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await admin.from("wishes").upsert(
      {
        player_id: user.id,
        birthday_year: year,
        sealed_body: b64(cipher),
        iv: b64(iv.buffer),
        unlock_at: unlockAt.toISOString(),
      },
      { onConflict: "player_id,birthday_year" }
    );
    if (error) throw error;

    await admin.from("birthday_state").upsert({
      player_id: user.id,
      birthday_year: year,
      sealed: true,
      unlock_at: unlockAt.toISOString(),
      opened: false,
    });

    // the receipt contains no part of the wish
    return new Response(
      JSON.stringify({ ok: true, unlock_at: unlockAt.toISOString() }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
