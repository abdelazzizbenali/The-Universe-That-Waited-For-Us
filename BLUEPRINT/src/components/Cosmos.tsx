import { useEffect, useRef } from "react";

/* The blueprint's living background — a miniature of the game's core metaphor.
   Stars awaken with scroll (aliveness), the two souls converge, and near the
   end OUR COLOR blooms without ever erasing Blue or Hazel. */

type Star = { x: number; y: number; r: number; ph: number; sp: number; hue: number; born: number };
type Mote = { x: number; y: number; r: number; ph: number; tint: [number, number, number] };

const MAX_STARS = 340;
const FLOWERS = 44;

// soul keyframes: [progress, ax, ay, bx, by] — viewport-normalized
const KEYS: number[][] = [
  [0.0, 0.17, 0.70, 0.83, 0.30],
  [0.10, 0.22, 0.64, 0.78, 0.36],
  [0.30, 0.32, 0.58, 0.68, 0.42],
  [0.55, 0.40, 0.54, 0.60, 0.46],
  [0.80, 0.445, 0.52, 0.555, 0.48],
  [0.92, 0.487, 0.505, 0.513, 0.495],
  [1.0, 0.492, 0.502, 0.508, 0.498],
];

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function soulsAt(p: number): [number, number, number, number] {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = b[0] - a[0] || 1;
  const t = ease(Math.min(1, Math.max(0, (p - a[0]) / span)));
  return [
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
    a[4] + (b[4] - a[4]) * t,
  ];
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function Cosmos() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let pSmooth = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const r = rand(20251215);
    const stars: Star[] = Array.from({ length: MAX_STARS }, () => ({
      x: r(),
      y: r(),
      r: 0.4 + r() * 1.5,
      ph: r() * Math.PI * 2,
      sp: 0.4 + r() * 1.4,
      hue: r(),
      born: r(), // threshold of scroll progress at which the star "awakens"
    }));
    const flowers: Mote[] = Array.from({ length: FLOWERS }, () => ({
      x: r(),
      y: 0.72 + r() * 0.26,
      r: 1.5 + r() * 2.5,
      ph: r() * Math.PI * 2,
      tint: r() > 0.5 ? [147, 220, 187] : [242, 184, 198],
    }));

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const scrollP = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const drawSoul = (
      x: number,
      y: number,
      core: string,
      mid: string,
      radius: number,
      breathe: number,
      motes: [number, number, number],
      moteAlpha: number
    ) => {
      const R = radius * (1 + breathe * 0.06);
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, core);
      g.addColorStop(0.22, mid);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
      // white-hot core
      const cg = ctx.createRadialGradient(x, y, 0, x, y, R * 0.16);
      cg.addColorStop(0, "rgba(255,255,255,0.95)");
      cg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(x, y, R * 0.16, 0, Math.PI * 2);
      ctx.fill();
      // orbiting motes
      if (moteAlpha > 0.01) {
        ctx.fillStyle = `rgba(${motes[0]},${motes[1]},${motes[2]},${moteAlpha})`;
        for (let i = 0; i < 6; i++) {
          const a = breathe * 2 + (i * Math.PI) / 3;
          const mx = x + Math.cos(a) * R * 0.55;
          const my = y + Math.sin(a * 1.3) * R * 0.38;
          ctx.beginPath();
          ctx.arc(mx, my, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const t0 = performance.now();
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const pTarget = scrollP();
      pSmooth += (pTarget - pSmooth) * 0.045;
      const p = pSmooth;

      ctx.clearRect(0, 0, w, h);

      // vertical gradient wash that warms with progress
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#070b1a");
      bg.addColorStop(0.6, `rgba(${11 + p * 10}, ${18 + p * 14}, ${48 + p * 10}, 0.55)`);
      bg.addColorStop(1, "#070b1a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // stars — aliveness grows with scroll
      const alive = Math.floor(70 + p * (MAX_STARS - 70));
      for (let i = 0; i < MAX_STARS; i++) {
        const s = stars[i];
        const on = i < alive;
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        let a = on ? (0.25 + 0.55 * tw) : 0.05 * tw;
        if (s.born < p) a = Math.min(1, a + 0.25);
        const hueMix = s.hue;
        const cr = hueMix < 0.45 ? 191 : hueMix < 0.8 ? 224 : 147;
        const cg2 = hueMix < 0.45 ? 227 : hueMix < 0.8 ? 179 : 220;
        const cb = hueMix < 0.45 ? 255 : hueMix < 0.8 ? 106 : 187;
        ctx.fillStyle = `rgba(${cr},${cg2},${cb},${a})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // flowers awake late — the meadow remembers
      for (let i = 0; i < FLOWERS; i++) {
        const f = flowers[i];
        const open = Math.max(0, Math.min(1, (p - 0.5 - (i / FLOWERS) * 0.42) * 4));
        if (open <= 0.01) continue;
        const fx = f.x * w;
        const fy = f.y * h + Math.sin(t * 0.7 + f.ph) * 2;
        const [fr, fg, fb] = f.tint;
        ctx.globalAlpha = open * (0.5 + 0.4 * Math.sin(t * 0.9 + f.ph));
        ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
        for (let petal = 0; petal < 4; petal++) {
          const a = (petal * Math.PI) / 2 + f.ph;
          ctx.beginPath();
          ctx.arc(fx + Math.cos(a) * f.r, fy + Math.sin(a) * f.r, f.r * 0.75 * open, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // souls
      const [ax, ay, bx, by] = soulsAt(p);
      const Ax = ax * w;
      const Ay = ay * h + Math.sin(t * 0.5) * 6;
      const Bx = bx * w;
      const By = by * h + Math.sin(t * 0.5 + 2.1) * 6;
      const breathe = Math.sin(t * 1.1);
      const baseR = Math.min(w, h) * 0.055;

      const dist = Math.hypot(Ax - Bx, Ay - By) / Math.min(w, h);
      const closeness = Math.max(0, Math.min(1, 1 - dist / 0.6));

      // thread between them (The Constantine Thread motif) once near
      if (closeness > 0.35) {
        const tg = ctx.createLinearGradient(Ax, Ay, Bx, By);
        tg.addColorStop(0, "rgba(127,196,255,0.5)");
        tg.addColorStop(0.5, "rgba(147,220,187,0.55)");
        tg.addColorStop(1, "rgba(224,179,106,0.5)");
        ctx.strokeStyle = tg;
        ctx.lineWidth = 1;
        ctx.globalAlpha = (closeness - 0.35) * 1.2 * (0.6 + 0.4 * Math.sin(t * 2));
        ctx.beginPath();
        ctx.moveTo(Ax, Ay);
        const mx = (Ax + Bx) / 2 + Math.sin(t * 0.8) * 14;
        const my = (Ay + By) / 2 + Math.cos(t * 0.8) * 14;
        ctx.quadraticCurveTo(mx, my, Bx, By);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.globalCompositeOperation = "lighter";
      // hazel soul: layered brown / green / gold — never a flat color
      drawSoul(Ax, Ay, "rgba(244,220,168,1)", "rgba(168,142,84,0.75)", baseR, breathe, [224, 179, 106], 0.6 + 0.4 * closeness);
      const hg = ctx.createRadialGradient(Ax, Ay, 0, Ax, Ay, baseR * 0.8);
      hg.addColorStop(0, "rgba(154,171,98,0.35)");
      hg.addColorStop(1, "rgba(138,95,56,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(Ax, Ay, baseR * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // blue soul: sky-like, calm, luminous
      drawSoul(Bx, By, "rgba(210,236,255,1)", "rgba(127,196,255,0.7)", baseR, -breathe, [127, 196, 255], 0.6 + 0.4 * closeness);

      // OUR COLOR bloom — additive, never replacing
      if (closeness > 0.55) {
        const oA = (closeness - 0.55) * 2.2;
        const ox = (Ax + Bx) / 2;
        const oy = (Ay + By) / 2;
        const OR = baseR * (2.6 + Math.sin(t * 0.9) * 0.3);
        const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, OR);
        og.addColorStop(0, `rgba(190,255,222,${0.5 * oA})`);
        og.addColorStop(0.4, `rgba(147,220,187,${0.28 * oA})`);
        og.addColorStop(0.75, `rgba(232,207,143,${0.12 * oA})`);
        og.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(ox, oy, OR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
