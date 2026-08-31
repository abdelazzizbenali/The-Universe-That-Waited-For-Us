import { useEffect, useState } from "react";
import { useScrollProgress } from "./ui";

const SECTIONS = [
  { id: "promise", label: "The Promise" },
  { id: "chapters", label: "Chapter Map" },
  { id: "memories", label: "Memory Atlas" },
  { id: "mechanics", label: "Mechanics" },
  { id: "systems", label: "Systems" },
  { id: "data", label: "Data & Wish" },
  { id: "production", label: "Production" },
  { id: "status", label: "Status" },
];

export default function Chrome() {
  const p = useScrollProgress();
  const [active, setActive] = useState("promise");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* reading progress — blue → hazel → OUR */}
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-white/5">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${p * 100}%`,
            background: "linear-gradient(90deg,#7fc4ff 0%,#e0b36a 55%,#93dcbb 100%)",
            boxShadow: "0 0 12px rgba(147,220,187,0.5)",
          }}
        />
      </div>

      {/* top bar */}
      <header
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 transition-all duration-500 sm:px-8 ${
          scrolled ? "bg-void/70 backdrop-blur-md" : ""
        }`}
      >
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-our opacity-60 [animation:pulseSoft_5s_ease-in-out_infinite]" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-our" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-dim transition-colors group-hover:text-ink">
            The Universe That Waited For Us
          </span>
        </a>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint sm:block">
          Production Blueprint v1.0
        </span>
      </header>

      {/* side rail */}
      <nav className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="group flex items-center gap-3">
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.24em] transition-all duration-300 ${
                active === s.id ? "text-our opacity-100" : "text-ink-faint opacity-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`rail-dot block h-1.5 w-1.5 rounded-full bg-ink-faint/50 ${active === s.id ? "active" : ""}`}
            />
          </a>
        ))}
      </nav>
    </>
  );
}
