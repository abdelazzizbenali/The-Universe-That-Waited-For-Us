import { CHAPTERS } from "../data/blueprint";
import { Section, Reveal, Field, Chip } from "../components/ui";

export default function Chapters() {
  return (
    <Section
      id="chapters"
      index="01"
      kicker="Final chapter map"
      title={
        <>
          Ten movements, <span className="serif-i text-soul-blue">thirty-two</span>{" "}
          <span className="serif-i text-hazel-gold">playable segments</span>
        </>
      }
      lede="A prologue, eight chapters and a finale. Each chapter owns its own world, systems and emotional climax — and carries the full specification set: purpose, environment, objective, mechanics, companion behavior, interactables, narration, visual, audio, camera, eye-color effect, OUR COLOR progression, constellation progression, climax and transition."
    >
      <div className="relative">
        {/* rail */}
        <div className="absolute bottom-0 left-[7px] top-2 w-px bg-gradient-to-b from-soul-blue/50 via-hazel-gold/40 to-our/60 md:left-[9px]" />

        <div className="space-y-16">
          {CHAPTERS.map((ch, ci) => (
            <Reveal key={ch.id}>
              <article className="relative pl-8 md:pl-12">
                <div
                  className={`absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 md:h-[19px] md:w-[19px] ${
                    ci < 4
                      ? "border-soul-blue/70 bg-soul-blue/20"
                      : ci < 8
                        ? "border-hazel-gold/70 bg-hazel-gold/20"
                        : "border-our/80 bg-our/25 shadow-[0_0_18px_rgba(147,220,187,0.5)]"
                  }`}
                />
                <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="font-mono text-sm tracking-[0.3em] text-our">{ch.index}</span>
                  <h3 className="display text-3xl text-ink md:text-4xl">{ch.title}</h3>
                  <Chip tone={ci < 4 ? "blue" : ci < 8 ? "hazel" : "our"}>{ch.memorySpan}</Chip>
                </div>

                <div className="panel mb-6 p-6 md:p-8">
                  <p className="mb-6 max-w-3xl text-[14px] leading-relaxed text-ink/85">{ch.purpose}</p>
                  <div className="grid gap-x-10 md:grid-cols-2">
                    <Field k="World">{ch.world}</Field>
                    <Field k="Interactables">{ch.interactables.join(" · ")}</Field>
                    <Field k="Visual">{ch.visual}</Field>
                    <Field k="Audio">{ch.audio}</Field>
                    <Field k="Camera">{ch.camera}</Field>
                    <Field k="Eye / color">{ch.color}</Field>
                    <Field k="Constellation">{ch.constellation}</Field>
                    <Field k="Transition">{ch.transition}</Field>
                  </div>
                  <div className="mt-6 rounded-xl border border-our/25 bg-our/5 p-4">
                    <p className="text-[13.5px] leading-relaxed text-ink">
                      <span className="kicker mr-3 text-[0.58rem] text-our">Climax</span>
                      {ch.climax}
                    </p>
                  </div>
                </div>

                {/* segments */}
                <div className="grid gap-4 xl:grid-cols-2">
                  {ch.segments.map((s) => (
                    <div key={s.id} className="panel panel-hover flex h-full flex-col p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="font-mono text-[11px] tracking-[0.25em] text-ink-faint">{s.id}</span>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {s.memories.length > 0 ? (
                            s.memories.map((m) => <Chip key={m}>memory {m}</Chip>)
                          ) : (
                            <Chip tone="our">finale system</Chip>
                          )}
                        </div>
                      </div>
                      <h4 className="display mb-2 text-xl text-ink">{s.title}</h4>
                      <p className="mb-3 text-[13px] leading-relaxed text-ink-dim">
                        <span className="text-ink/70">Objective — </span>
                        {s.objective}
                      </p>
                      <ul className="mb-3 space-y-1.5">
                        {s.mechanics.map((m, i) => (
                          <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-dim">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-our" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mb-4 text-[12.5px] leading-relaxed text-ink-dim">
                        <span className="text-hazel-gold">Companion — </span>
                        {s.companion}
                      </p>
                      <div className="mt-auto space-y-2 border-t border-line pt-3">
                        {s.eyeFx && (
                          <p className="text-[11.5px] leading-relaxed text-soul-blue/90">◈ {s.eyeFx}</p>
                        )}
                        {s.narration.map((n, i) => (
                          <p key={i} className="serif-i text-[13px] leading-relaxed text-ink/75">
                            “{n}”
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
