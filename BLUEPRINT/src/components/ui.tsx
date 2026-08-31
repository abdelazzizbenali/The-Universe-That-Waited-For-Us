import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={`reveal ${className}`} style={{ ["--reveal-delay" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Section({
  id,
  index,
  kicker,
  title,
  lede,
  children,
}: {
  id: string;
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <Reveal>
        <div className="mb-10 md:mb-14">
          <div className="mb-4 flex items-center gap-4">
            <span className="kicker text-our">{index}</span>
            <span className="h-px flex-1 bg-line" />
            <span className="kicker text-ink-faint">{kicker}</span>
          </div>
          <h2 className="display max-w-3xl text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl">{title}</h2>
          {lede && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-dim">{lede}</p>}
        </div>
      </Reveal>
      {children}
    </section>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "blue" | "hazel" | "our" }) {
  const map: Record<string, string> = {
    default: "",
    blue: "!border-soul-blue/40 !text-soul-blue",
    hazel: "!border-hazel-gold/40 !text-hazel-gold",
    our: "!border-our/40 !text-our",
  };
  return <span className={`chip ${map[tone]}`}>{children}</span>;
}

export function Field({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[118px_1fr] gap-3 border-t border-line py-3 first:border-t-0 sm:grid-cols-[150px_1fr]">
      <div className="kicker pt-[3px] text-[0.6rem] text-ink-faint">{k}</div>
      <div className="text-[13px] leading-relaxed text-ink-dim [&_em]:font-[family-name:var(--font-display)] [&_em]:italic [&_em]:text-ink">{children}</div>
    </div>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <p className="serif-i border-l-2 border-our/50 pl-4 text-[17px] leading-relaxed text-ink/90">“{children}”</p>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/(--[^\n]*)/g, '<span class="c-c">$1</span>')
    .replace(/\b(create table|create policy|alter table|primary key|references|enable row level security|for all|for select|using|with check|not null|default|on delete cascade|unique|cascade)\b/g, '<span class="c-k">$1</span>')
    .replace(/\b(uuid|timestamptz|jsonb|smallint|int|text|bytea|boolean)\b/g, '<span class="c-g">$1</span>')
    .replace(/('[^']*')/g, '<span class="c-s">$1</span>');
  return (
    <pre className="codeblock p-5 md:p-6">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}
