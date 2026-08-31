import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { METADATA } from "../data/blueprint";

export default function Hero() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="top" className={`relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 ${open ? "letterbox-open" : ""}`}>
      <div className="letterbox-bar letterbox-top" />
      <div className="letterbox-bar letterbox-bottom" />

      <div
        className="relative z-[4] mx-auto max-w-4xl text-center transition-all duration-[1600ms] ease-out"
        style={{ opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(24px)" }}
      >
        <p className="kicker mb-8 text-ink-faint">{METADATA.doc}</p>

        <h1 className="display text-[13vw] leading-[0.95] text-ink sm:text-7xl md:text-8xl">
          The Universe
          <br />
          <span className="serif-i text-soul-blue">that Waited</span>{" "}
          <span className="serif-i text-hazel-gold">for Us</span>
        </h1>

        <p className="serif-i mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink-dim md:text-xl">
          {METADATA.subtitle}
        </p>

        <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-2.5">
          {METADATA.stack.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-faint">
          {METADATA.structure}
        </p>
      </div>

      <div
        className="absolute bottom-10 z-[4] flex flex-col items-center gap-3 transition-opacity delay-1000 duration-1000"
        style={{ opacity: open ? 1 : 0 }}
      >
        <span className="kicker text-[0.58rem] text-ink-faint">Scroll — the stars are listening</span>
        <ArrowDown className="h-4 w-4 animate-bounce text-our" strokeWidth={1.5} />
      </div>
    </div>
  );
}
