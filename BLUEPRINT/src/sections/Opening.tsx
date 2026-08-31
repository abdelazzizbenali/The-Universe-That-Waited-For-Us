import { Sparkles, ShieldCheck, Palette, Globe2, Feather, Hourglass } from "lucide-react";
import { PILLARS, ARC } from "../data/blueprint";
import { Section, Reveal, Quote } from "../components/ui";

const ICONS = [Sparkles, ShieldCheck, Palette, Globe2, Feather, Hourglass];

export default function Opening() {
  return (
    <Section
      id="promise"
      index="00"
      kicker="Absolute creative principles"
      title={
        <>
          The promise this game <span className="serif-i text-our">makes to her</span>
        </>
      }
      lede="Six non-negotiable principles govern every decision in production. They are not aspirations — they are acceptance criteria. A scene that violates one does not ship."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal key={p.n} delay={i * 70}>
              <div className="panel panel-hover h-full p-6">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-our" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] tracking-[0.3em] text-ink-faint">{p.n}</span>
                </div>
                <h3 className="display mb-3 text-xl text-ink">{p.title}</h3>
                <p className="text-[13px] leading-relaxed text-ink-dim">{p.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* canon doctrine */}
      <Reveal className="mt-14">
        <div className="panel relative overflow-hidden p-7 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-our/10 blur-3xl" />
          <p className="kicker mb-5 text-hazel-gold">The canon doctrine</p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4 text-[13.5px] leading-relaxed text-ink-dim">
              <p>
                Every real-life detail in the source story is <em>canonical</em>. The small details are the
                load-bearing ones: the phone-held "thank you", the 16:00 bus, the yellow light, the bottle of water,
                the 07:30 call, the chocolate from her mother. Nothing is cut. Nothing is generic.
              </p>
              <p>
                Where exact historical words are unknown, the game never fabricates quotation. It reaches for
                narration, atmosphere and symbolism — and a <em>canon-lint rule in CI</em> fails the build if any
                quoted string appears without <span className="font-mono text-[11px] text-our">canonQuote: true</span> in
                the dialogue script.
              </p>
            </div>
            <div className="space-y-4">
              <Quote>I didn't just play a game. I walked through our story.</Quote>
              <Quote>I was remembered. I was noticed. I was cared for. I was loved in the little things.</Quote>
              <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.26em] text-ink-faint">
                — the two sentences the ending is engineered to produce
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* master arc ribbon */}
      <Reveal className="mt-14">
        <p className="kicker mb-6 text-ink-faint">The master emotional arc — 29 beats</p>
        <div className="flex flex-wrap items-center gap-y-3">
          {ARC.map((beat, i) => (
            <span key={i} className="flex items-center">
              <span className="group flex items-center gap-2">
                <span className="font-mono text-[9px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[12.5px] text-ink-dim transition-colors duration-300 hover:text-our">{beat}</span>
              </span>
              {i < ARC.length - 1 && <span className="mx-3 h-px w-4 bg-line" />}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-soul-blue/10 via-transparent to-hazel-gold/10 p-8 text-center md:p-12">
          <p className="display mx-auto max-w-3xl text-2xl leading-snug text-ink md:text-[2rem]">
            Love was never one huge moment.{" "}
            <span className="serif-i text-our">It was every little moment that kept choosing the other.</span>
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
            the game's deepest idea — and the design rubric for every scene
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
