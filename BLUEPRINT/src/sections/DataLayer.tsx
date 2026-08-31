import { Lock, CloudUpload, KeyRound, CalendarClock } from "lucide-react";
import { SCHEMA_SQL, WISH_WRITE_PATH, WISH_READ_PATH } from "../data/blueprint";
import { Section, Reveal, Field, CodeBlock } from "../components/ui";

export default function DataLayer() {
  return (
    <Section
      id="data"
      index="05"
      kicker="Persistence · Supabase · the sealed wish"
      title={
        <>
          Memory that survives <span className="serif-i text-hazel-gold">the closing of a browser</span>
        </>
      }
      lede="Anonymous identity, cloud-synced progress, replay-safe collectibles — and one object held to a higher standard than everything else: her private wish, sealed server-side, unreadable by anyone (including her) until her next birthday."
    >
      {/* save / load */}
      <Reveal>
        <div className="panel mb-10 grid gap-x-10 p-6 md:grid-cols-3 md:p-8">
          <div className="md:col-span-1">
            <CloudUpload className="mb-4 h-5 w-5 text-our" strokeWidth={1.5} />
            <h3 className="display mb-2 text-2xl text-ink">Save / load</h3>
            <p className="text-[12.5px] leading-relaxed text-ink-dim">
              Autosave at every segment boundary and milestone interaction. LocalStorage writes instantly; a
              debounced sync (1.5s) reconciles to Supabase. Offline play queues writes and merges on reconnect,
              last-writer-wins per field with version tags.
            </p>
          </div>
          <div className="md:col-span-2">
            <Field k="Identity">supabase.auth.signInAnonymously() on first launch; the refreshed session is her permanent, invisible key. No accounts, no passwords — the game is a gift, not a service.</Field>
            <Field k="Resume">Boot hydrates game_progress → SceneRouter mounts exactly her chapter, segment, checkpoint, color stage and aliveness. The world she returns to is the world she left — flowers stay open, stars stay lit.</Field>
            <Field k="Replay safety">Replays write only to replay_count. Progression fields are monotonic — no action can move her story backward.</Field>
          </div>
        </div>
      </Reveal>

      {/* schema */}
      <Reveal>
        <div className="mb-4 flex items-baseline gap-4">
          <h3 className="display text-2xl text-ink">Data model</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">Postgres · RLS everywhere · least privilege</span>
        </div>
        <CodeBlock code={SCHEMA_SQL} />
      </Reveal>

      {/* wish architecture */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-baseline gap-4">
          <h3 className="display text-2xl text-ink">The private wish — architecture of a secret</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <Lock className="h-5 w-5 text-our" strokeWidth={1.5} />
              <p className="kicker text-our">Write path — sealing</p>
            </div>
            <ol className="space-y-5">
              {WISH_WRITE_PATH.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-our/40 font-mono text-[10px] text-our">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{s.t}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="panel p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-hazel-gold" strokeWidth={1.5} />
              <p className="kicker text-hazel-gold">Read path — next birthday</p>
            </div>
            <ol className="space-y-5">
              {WISH_READ_PATH.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hazel-gold/40 font-mono text-[10px] text-hazel-gold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{s.t}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="panel flex flex-col items-start gap-4 border-our/30 bg-our/[0.05] p-6 md:flex-row md:items-center md:p-7">
          <KeyRound className="h-6 w-6 shrink-0 text-our" strokeWidth={1.5} />
          <div className="text-[12.5px] leading-relaxed text-ink-dim">
            <span className="text-ink">Security invariants —</span> the service-role key never ships in the client
            bundle; the wishes table grants no anon read of any kind; plaintext exists only in the sealing request
            and, years later, in a single reveal response after its gate date. Her birthday date lives in a
            server-side config, not in shipped code. Devtools, network inspection, and database browsing all yield
            ciphertext or nothing. <em>A wish that can be peeked at is not a wish.</em>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
