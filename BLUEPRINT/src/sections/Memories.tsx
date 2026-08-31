import { MEMORY_MAP } from "../data/blueprint";
import { Section, Reveal } from "../components/ui";

export default function Memories() {
  return (
    <Section
      id="memories"
      index="02"
      kicker="Memory → chapter · memory → gameplay"
      title={
        <>
          The memory atlas — <span className="serif-i text-hazel-gold">all thirty-three, all playable</span>
        </>
      }
      lede="The complete canonical mapping. No memory is omitted; none is reduced to a paragraph. Every row names its segment, its mechanics, the systems that carry it, and the star it leaves on the constellation."
    >
      <Reveal>
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-line">
                  {["#", "Canonical memory", "Segment", "Mechanics", "Carrying systems", "Constellation star"].map(
                    (h) => (
                      <th key={h} className="kicker px-5 py-4 text-[0.58rem] font-medium text-ink-faint">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {MEMORY_MAP.map((row, i) => (
                  <tr
                    key={row.m}
                    className={`group border-b border-line/60 transition-colors last:border-b-0 hover:bg-our/[0.04] ${
                      i % 2 === 1 ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 align-top">
                      <span className="font-mono text-[11px] text-hazel-gold">M{row.m}</span>
                    </td>
                    <td className="max-w-[300px] px-5 py-3.5 align-top text-[12.5px] leading-snug text-ink/85">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 align-top font-mono text-[11px] text-ink-dim">
                      {row.segment}
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {row.mechanics.map((m) => (
                          <span key={m} className="chip !py-1 !text-[0.55rem] !text-soul-blue/90 !border-soul-blue/25">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-5 py-3.5 align-top text-[11.5px] leading-snug text-ink-dim">
                      {row.systems.join(" · ")}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 align-top text-[11.5px] text-our">
                      ✦ {row.star}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="panel p-6">
            <p className="kicker mb-3 text-soul-blue">Compression rule</p>
            <p className="text-[12.5px] leading-relaxed text-ink-dim">
              Merging happens only where memories share one emotional beat (M15+M16, M30 woven into the ending
              chapter). Never to save scope.
            </p>
          </div>
          <div className="panel p-6">
            <p className="kicker mb-3 text-hazel-gold">Honesty rule</p>
            <p className="text-[12.5px] leading-relaxed text-ink-dim">
              Where day's details are not remembered (Day Three), the game renders forgiving fog — it refuses,
              mechanically, to invent them.
            </p>
          </div>
          <div className="panel p-6">
            <p className="kicker mb-3 text-our">Weight rule</p>
            <p className="text-[12.5px] leading-relaxed text-ink-dim">
              The smallest memory (the bottle) gets the smallest star on the constellation — and it shines
              disproportionately bright.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
