import { Reveal } from "../components/ui";

export default function Finale() {
  return (
    <section id="status" className="relative mx-auto w-full max-w-4xl scroll-mt-24 px-6 pb-16 pt-24 text-center md:pt-36">
      <Reveal>
        <p className="kicker mb-8 text-ink-faint">07 — Status</p>
        <h2 className="display text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
          The blueprint ends
          <br />
          <span className="serif-i text-our">where the game begins.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-[14.5px] leading-relaxed text-ink-dim">
          Chapter map, all thirty-three memory mappings, signature mechanics, scene / player / companion
          architecture, the eight-stage color system, constellation, vision, hands, cameras, world reaction,
          dialogue, save &amp; replay, the Supabase model, the sealed-wish architecture, mobile and audio design,
          the asset manifest, fourteen weeks of milestones, the vertical slice, and the QA plan — the full
          specification, ready for production.
        </p>
      </Reveal>

      <Reveal delay={150} className="mt-14">
        <div className="panel mx-auto max-w-2xl p-8 md:p-10">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-2 w-2 rounded-full bg-soul-blue shadow-[0_0_12px_rgba(127,196,255,0.8)] [animation:pulseSoft_4s_ease-in-out_infinite]" />
            <span className="h-2 w-2 rounded-full bg-hazel-gold shadow-[0_0_12px_rgba(224,179,106,0.8)] [animation:pulseSoft_4s_ease-in-out_1.3s_infinite]" />
            <span className="h-2 w-2 rounded-full bg-our shadow-[0_0_14px_rgba(147,220,187,0.9)] [animation:pulseSoft_4s_ease-in-out_2.6s_infinite]" />
          </div>
          <p className="display mb-3 text-2xl text-ink">First task — complete.</p>
          <p className="text-[13px] leading-relaxed text-ink-dim">
            Next step on your word: <span className="text-our">Milestone M0 · Foundation</span> — repository,
            engine boot, input, movement, camera, save skeleton — then M1, the vertical slice where she takes her
            first steps up the hill and the first star wakes for her.
          </p>
          <p className="serif-i mt-6 text-[15px] text-ink/80">
            "They did not discover the universe. They created a little part of it together."
          </p>
        </div>
      </Reveal>

      <Reveal delay={250} className="mt-16">
        <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-ink-faint">
          The Universe That Waited For Us · Production Blueprint v1.0 · made with love, for her
        </p>
      </Reveal>
    </section>
  );
}
