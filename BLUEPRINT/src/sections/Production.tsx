import { Smartphone, AudioLines, Layers, Milestone as MilestoneIcon, Scissors, FlaskConical } from "lucide-react";
import { MOBILE_SPECS, ASSETS, MILESTONES, SLICE_SCOPE, SLICE_ACCEPTANCE, TESTING } from "../data/blueprint";
import { Section, Reveal, Field, Chip } from "../components/ui";

export default function Production() {
  return (
    <Section
      id="production"
      index="06"
      kicker="Mobile · audio · assets · milestones · QA"
      title={
        <>
          How it gets <span className="serif-i text-soul-blue">made</span>
        </>
      }
      lede="Staged development, a ruthlessly defined vertical slice, and a quality bar that measures feeling, not just function: never 'it works' — always 'it feels like someone made this specifically for her.'"
    >
      {/* mobile */}
      <Reveal>
        <div className="mb-4 flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-our" strokeWidth={1.5} />
          <h3 className="display text-2xl text-ink">Mobile architecture — iPhone-class Safari, landscape</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {MOBILE_SPECS.map((m, i) => (
            <div key={m.k} className={`panel panel-hover p-5 ${i === 4 ? "md:col-span-2 xl:col-span-1" : ""}`}>
              <p className="kicker mb-2 text-[0.58rem] text-soul-blue">{m.k}</p>
              <p className="text-[12px] leading-relaxed text-ink-dim">{m.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* audio */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-center gap-3">
          <AudioLines className="h-5 w-5 text-hazel-gold" strokeWidth={1.5} />
          <h3 className="display text-2xl text-ink">Audio architecture — a score that waits its turn</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="panel p-6 md:p-7">
            <Field k="Mixer">AudioDirector owns 4 buses: ambience · motif · room · heart. Every scene declares a mix preset; transitions are 2–6s equal-power crossfades. No loud loops, ever.</Field>
            <Field k="Ducking">Companion-safe-radius, THE LOOK, and dialogue duck ambience in real time. Hand-hold scenes collapse all buses except heart — breath + heartbeat at −18dB under silence.</Field>
            <Field k="Thematic return">Finale layering rule: library motif + flower theme + hand-hold breath merge gradually during the Long Walk; birthday resolves them; the wish returns to near-silence plus magic sparkle bus.</Field>
            <Field k="Unlock">iOS AudioContext resumes on the title screen's first touch; all stems lazy-load after first gesture to keep boot under 3s.</Field>
          </div>
          <div className="panel p-6 md:p-7">
            <p className="kicker mb-4 text-[0.58rem] text-ink-faint">Stem map (loops unless noted)</p>
            <div className="space-y-2.5">
              {[
                ["wind_bed / hill", "prologue · finale"],
                ["airy piano motif", "chapter 1 · returns in finale"],
                ["library warmth", "library scenes"],
                ["crowd bed A/B", "both buses"],
                ["vision space", "vision world"],
                ["flower theme", "bouquet · bloom event"],
                ["night road", "escort"],
                ["finale arrangement", "long walk → reunion"],
                ["birthday resolution", "birthday reveal"],
                ["breath + heartbeat", "hand system (loops, -18dB)"],
                ["wish sparkle", "one-shot bus"],
              ].map(([n, u]) => (
                <div key={n} className="flex items-baseline justify-between gap-4 border-b border-line/50 pb-2">
                  <span className="font-mono text-[11px] text-ink/80">{n}</span>
                  <span className="text-right text-[10.5px] text-ink-faint">{u}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* assets */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-center gap-3">
          <Layers className="h-5 w-5 text-soul-blue" strokeWidth={1.5} />
          <h3 className="display text-2xl text-ink">Asset list — painterly, palette-locked, atlas-packed</h3>
        </div>
        <div className="space-y-4">
          {ASSETS.map((g) => (
            <div key={g.group} className="panel p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="kicker text-ink/80">{g.group}</p>
                <span className="font-mono text-[10px] text-our">{g.n}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((it) => (
                  <Chip key={it}>{it}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11.5px] text-ink-faint">
          Palette lock: sky blue · baby blue · mint · white · subtle pink · soft cyan · soft green. Excluded by
          decree: excessive hearts, valentine kitsch, neon cyberpunk, confetti, glassmorphism abuse.
        </p>
      </Reveal>

      {/* milestones */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-center gap-3">
          <MilestoneIcon className="h-5 w-5 text-our" strokeWidth={1.5} />
          <h3 className="display text-2xl text-ink">Development milestones — fourteen weeks</h3>
        </div>
        <div className="relative">
          <div className="absolute bottom-4 left-[7px] top-4 w-px bg-line" />
          <div className="space-y-5">
            {MILESTONES.map((m) => (
              <div key={m.id} className="relative pl-8">
                <span className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-our/60 bg-our/15" />
                <div className="panel panel-hover p-5 md:p-6">
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-mono text-[11px] tracking-[0.3em] text-our">{m.id}</span>
                    <h4 className="display text-xl text-ink">{m.name}</h4>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">{m.span}</span>
                  </div>
                  <p className="mb-2 text-[12.5px] leading-relaxed text-ink-dim">{m.out}</p>
                  <p className="text-[11.5px] leading-relaxed text-ink/70">
                    <span className="kicker mr-2 text-[0.52rem] text-hazel-gold">Exit when</span>
                    {m.exit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* vertical slice */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-center gap-3">
          <Scissors className="h-5 w-5 text-soul-blue" strokeWidth={1.5} />
          <h3 className="display text-2xl text-ink">The vertical slice — proof of soul</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-6 md:p-7">
            <p className="kicker mb-4 text-[0.58rem] text-hazel-gold">In scope — exactly six scenes</p>
            <ol className="space-y-2.5">
              {SLICE_SCOPE.map((s, i) => (
                <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed text-ink-dim">
                  <span className="font-mono text-[10px] text-hazel-gold">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="panel p-6 md:p-7">
            <p className="kicker mb-4 text-[0.58rem] text-our">Acceptance criteria — all must pass</p>
            <ul className="space-y-2.5">
              {SLICE_ACCEPTANCE.map((a, i) => (
                <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed text-ink-dim">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-our" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* testing */}
      <Reveal className="mt-14">
        <div className="mb-4 flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-hazel-gold" strokeWidth={1.5} />
          <h3 className="display text-2xl text-ink">Testing strategy</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["Unit (Vitest)", TESTING.unit],
              ["Integration", TESTING.integration],
              ["Device matrix", TESTING.devices],
              ["Experiential QA", TESTING.experiential],
            ] as const
          ).map(([title, items]) => (
            <div key={title} className="panel h-full p-6">
              <p className="kicker mb-4 text-[0.58rem] text-soul-blue">{title}</p>
              <ul className="space-y-2.5">
                {items.map((t, i) => (
                  <li key={i} className="flex gap-2.5 text-[11.5px] leading-relaxed text-ink-dim">
                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-hazel-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
