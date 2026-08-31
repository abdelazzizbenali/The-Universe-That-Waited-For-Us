/* WishVault — where her private wish goes.

   PRIMARY PATH (Supabase configured): the wish is POSTed to the seal-wish
   Edge Function, encrypted server-side with a key that never ships to the
   browser, and written to a table with NO client read policy. Not even she
   can fetch it back through the API. reveal-wish releases it only after
   unlock_at.

   FALLBACK PATH (no backend configured): the wish is encrypted in the
   browser with AES-GCM using a NON-EXTRACTABLE CryptoKey held in IndexedDB.
   The key object can be used but never read — `crypto.subtle.exportKey`
   refuses it — so opening devtools yields ciphertext and an unreadable key
   handle. The vault still refuses to decrypt before the unlock date.

   Either way: nothing readable is left lying around, and nothing is shown
   again until the next birthday. */

import { BIRTHDAY } from "../../config";
import { ensureAnonymousSession, supabase } from "../../supabase/client";

const DB_NAME = "utwfu-vault";
const STORE = "keys";
const KEY_ID = "wish-key";
const LOCAL_PREFIX = "utwfu.sealed.";

export interface SealReceipt {
  ok: boolean;
  unlockAt: string | null;
  mode: "cloud" | "local";
}

/* ---------------- non-extractable key storage ---------------- */

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<CryptoKey | undefined> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
    tx.onsuccess = () => resolve(tx.result as CryptoKey | undefined);
    tx.onerror = () => reject(tx.error);
  });
}

async function idbPut(key: string, value: CryptoKey) {
  const db = await idb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
    tx.onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function localKey(): Promise<CryptoKey> {
  const existing = await idbGet(KEY_ID);
  if (existing) return existing;
  // extractable: false — the raw bytes can never be read back out
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
  await idbPut(KEY_ID, key);
  return key;
}

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** Next occurrence of her birthday after now. */
export function nextBirthdayISO(from = new Date()): string {
  const y = from.getFullYear();
  const thisYear = new Date(y, BIRTHDAY.month - 1, BIRTHDAY.day, 0, 0, 0);
  const target = thisYear > from ? thisYear : new Date(y + 1, BIRTHDAY.month - 1, BIRTHDAY.day, 0, 0, 0);
  return target.toISOString();
}

export function currentBirthdayYear(from = new Date()): number {
  return from.getFullYear();
}

/* ---------------- the vault ---------------- */

export class WishVault {
  /** Guards against double taps, retries and refresh-mid-submit. */
  private inFlight: Promise<SealReceipt> | null = null;

  /** Seals a wish. Resolves once the wish is safely unreadable. */
  seal(text: string, year = currentBirthdayYear()): Promise<SealReceipt> {
    // a second press while the first is still going returns the same promise
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.doSeal(text, year).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async doSeal(text: string, year: number): Promise<SealReceipt> {
    const clean = text.trim().slice(0, 4000);
    if (!clean) return { ok: false, unlockAt: null, mode: "local" };

    // already sealed this year? never write a second one.
    if (this.hasSealed(year)) {
      return { ok: true, unlockAt: this.unlockAt(year)?.toISOString() ?? null, mode: "local" };
    }

    // ---- primary: server-side seal ----
    if (supabase) {
      try {
        const uid = await ensureAnonymousSession();
        if (uid) {
          const { data, error } = await supabase.functions.invoke("seal-wish", {
            body: {
              text: clean,
              birthday_year: year,
              birthday_month: BIRTHDAY.month,
              birthday_day: BIRTHDAY.day,
            },
          });
          if (!error && data?.ok) {
            const unlockAt = data.unlock_at ?? nextBirthdayISO();
            // a receipt only — it records THAT a wish exists and when it
            // opens. The words themselves live on the server, encrypted.
            localStorage.setItem(
              LOCAL_PREFIX + year,
              JSON.stringify({ mode: "cloud", unlockAt, createdAt: new Date().toISOString() })
            );
            return { ok: true, unlockAt, mode: "cloud" };
          }
        }
      } catch {
        /* fall through to the local vault rather than losing her words */
      }
    }

    // ---- fallback: local, key-sealed ----
    try {
      const key = await localKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipher = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(clean)
      );
      const unlockAt = nextBirthdayISO();
      localStorage.setItem(
        LOCAL_PREFIX + year,
        JSON.stringify({ body: b64(cipher), iv: b64(iv.buffer), unlockAt, createdAt: new Date().toISOString() })
      );
      return { ok: true, unlockAt, mode: "local" };
    } catch {
      return { ok: false, unlockAt: null, mode: "local" };
    }
  }

  /** Does a sealed wish exist for this year? (Never returns its contents.) */
  hasSealed(year = currentBirthdayYear()): boolean {
    return localStorage.getItem(LOCAL_PREFIX + year) !== null;
  }

  /** When does the given year's wish become readable? */
  unlockAt(year = currentBirthdayYear()): Date | null {
    const raw = localStorage.getItem(LOCAL_PREFIX + year);
    if (!raw) return null;
    try {
      return new Date(JSON.parse(raw).unlockAt);
    } catch {
      return null;
    }
  }

  /** True once the wish is allowed to be seen again. */
  isDue(year = currentBirthdayYear()): boolean {
    const at = this.unlockAt(year);
    return at !== null && at.getTime() <= Date.now();
  }

  /**
   * Reveals a wish — but only if its date has arrived. Returns null while it
   * is still waiting. This is the ONLY read path in the whole game.
   */
  async reveal(year: number): Promise<string | null> {
    if (supabase) {
      try {
        const uid = await ensureAnonymousSession();
        if (uid) {
          const { data } = await supabase.functions.invoke("reveal-wish", {
            body: { birthday_year: year },
          });
          if (data?.ok && typeof data.text === "string") return data.text;
        }
      } catch {
        /* fall through */
      }
    }
    if (!this.isDue(year)) return null; // the gate holds locally too
    const raw = localStorage.getItem(LOCAL_PREFIX + year);
    if (!raw) return null;
    try {
      const rec = JSON.parse(raw);
      // cloud receipts hold no ciphertext — only the server can open those
      if (rec.mode === "cloud" || !rec.body) return null;
      const key = await localKey();
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: unb64(rec.iv) },
        key,
        unb64(rec.body)
      );
      return new TextDecoder().decode(plain);
    } catch {
      return null;
    }
  }
}

export const wishVault = new WishVault();
