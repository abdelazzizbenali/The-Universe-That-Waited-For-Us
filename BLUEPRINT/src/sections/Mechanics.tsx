import { Eye, Users, ShieldMinus, Hand, Glasses, Camera, Clock3, Palette, Timer, Sprout } from "lucide-react";
import { MECHANICS } from "../data/blueprint";
import { Section, Reveal } from "../components/ui";

const ICONS = [Eye, Users, ShieldMinus, Hand, Glasses, Camera, Clock3, Palette, Timer, Sprout];

export default function Mechanics() {
  return (
    <Section
      id="mechanics"
      index="03"
      kicker="Gameplay mechanics"
      title={
        <>
          Ten signature mechanics,{" "}
          <span className="serif-i text-our">each born from a real moment</span>
        </>
      }
      lede="None of these is a stock indie-game system with a romantic skin. Each one exists because something real happened first — a look held too long, a seat saved, a hand offered, a light avoided. The mechanic is the memory."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {MECHANICS.map((m, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal key={m.name} delay={(i % 2) * 80}>
              <div className="panel panel-hover h-full p-6 md:p-7">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="display text-2xl tracking-wide text-ink">{m.name}</h3>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-hazel-gold">
                      born from {m.from}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white/[0.03]">
                    <Icon className="h-5 w-5 text-soul-blue" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-dim">{m.body}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <p className="text-[11px] text-ink-faint">
                    <span className="kicker mr-2 text-[0.55rem]">Input</span>
                    {m.input}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-our/90">{m.reprisals}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-12">
        <div className="panel relative overflow-hidden p-7 md:p-9">
          <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-soul-blue/10 blur-3xl" />
          <p className="kicker mb-4 text-soul-blue">The hand-system arc — one gesture, three eras</p>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="display mb-1.5 text-lg text-ink">I. Uncertain</p>
              <p className="text-[12.5px] leading-relaxed text-ink-dim">
                "Give me your hand." An explicit prompt, a full offer animation, the player drives the final
                centimeters. Contact erases the bus and installs a private universe.
              </p>
            </div>
            <div>
              <p className="display mb-1.5 text-lg text-ink">II. Comfortable</p>
              <p className="text-[12.5px] leading-relaxed text-ink-dim">
                Crowded buses, shared laptops, walks home. One untexted tap. The interaction language itself
                narrates the relationship's growth.
              </p>
            </div>
            <div>
              <p className="display mb-1.5 text-lg text-ink">III. Inevitable</p>
              <p className="text-[12.5px] leading-relaxed text-ink-dim">
                The finale's last gesture: no prompt, no UI — just the reach the whole story taught her. Design as
                déjà vu: she already knows exactly what to do.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
