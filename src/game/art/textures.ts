/* Procedural texture factory — every sprite in the slice is painted on
   canvas at boot (no external assets). Palette-locked, soft, glowing. */
import Phaser from "phaser";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function addRad(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  stops: [number, string][]
) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach(([p, col]) => grad.addColorStop(p, col));
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function rgba(hex: number, a: number) {
  const r = (hex >> 16) & 255;
  const gg = (hex >> 8) & 255;
  const b = hex & 255;
  return `rgba(${r},${gg},${b},${a})`;
}

function auraTexture(size: number, core: number, mid: number, edge: number) {
  const { c, g } = canvas(size, size);
  const r = size / 2;
  addRad(g, r, r, r, [
    [0, rgba(core, 0.9)],
    [0.2, rgba(mid, 0.55)],
    [0.55, rgba(edge, 0.22)],
    [1, rgba(edge, 0)],
  ]);
  return c;
}

/**
 * The soul's core, painted as a readable iris: a dark pupil, a ring of the
 * soul's true colour, a light-catch highlight and a soft outer bloom. Even
 * at small sizes the eye colour stays identifiable.
 */
function coreTexture(size: number, bright: number, mid: number, deep?: number) {
  const { c, g } = canvas(size, size);
  const r = size / 2;
  // outer bloom
  addRad(g, r, r, r, [
    [0, rgba(bright, 0.6)],
    [0.42, rgba(mid, 0.4)],
    [0.78, rgba(mid, 0.12)],
    [1, rgba(mid, 0)],
  ]);
  // iris body — the colour that must stay recognizable
  addRad(g, r, r, r * 0.46, [
    [0, rgba(bright, 1)],
    [0.55, rgba(mid, 0.95)],
    [1, rgba(deep ?? mid, 0.7)],
  ]);
  // fine iris striations
  g.strokeStyle = rgba(bright, 0.35);
  g.lineWidth = Math.max(0.6, size * 0.006);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    g.beginPath();
    g.moveTo(r + Math.cos(a) * r * 0.16, r + Math.sin(a) * r * 0.16);
    g.lineTo(r + Math.cos(a) * r * 0.44, r + Math.sin(a) * r * 0.44);
    g.stroke();
  }
  // pupil
  g.fillStyle = "rgba(6,10,22,0.82)";
  g.beginPath();
  g.arc(r, r, r * 0.17, 0, Math.PI * 2);
  g.fill();
  // light catch
  addRad(g, r - r * 0.14, r - r * 0.15, r * 0.13, [
    [0, "rgba(255,255,255,0.95)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  return c;
}

/* (richer starTexture is defined below, with halo and sparkle) */

function moteTexture(size: number) {
  const { c, g } = canvas(size, size);
  addRad(g, size / 2, size / 2, size / 2, [
    [0, "rgba(255,255,255,0.9)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  return c;
}

function flowerTexture(size: number, open: boolean, petal: number, heart: number) {
  const { c, g } = canvas(size, size);
  const cx = size / 2;
  const base = size * 0.86;
  // stem
  g.strokeStyle = rgba(0x9aab62, 0.8);
  g.lineWidth = size * 0.045;
  g.beginPath();
  g.moveTo(cx, base);
  g.quadraticCurveTo(cx + size * 0.06, size * 0.6, cx, size * 0.42);
  g.stroke();
  // leaf
  g.fillStyle = rgba(0x9aab62, 0.55);
  g.beginPath();
  g.ellipse(cx + size * 0.09, size * 0.66, size * 0.1, size * 0.035, 0.5, 0, Math.PI * 2);
  g.fill();
  const hy = size * 0.4;
  const glow = g.createRadialGradient(cx, hy, 0, cx, hy, size * 0.3);
  glow.addColorStop(0, rgba(petal, 0.35));
  glow.addColorStop(1, rgba(petal, 0));
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  if (open) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.fillStyle = rgba(petal, 0.92);
      g.beginPath();
      g.ellipse(
        cx + Math.cos(a) * size * 0.13,
        hy + Math.sin(a) * size * 0.13,
        size * 0.11,
        size * 0.065,
        a,
        0,
        Math.PI * 2
      );
      g.fill();
    }
    addRad(g, cx, hy, size * 0.08, [
      [0, rgba(heart, 1)],
      [1, rgba(heart, 0.15)],
    ]);
  } else {
    // closed bud
    g.fillStyle = rgba(petal, 0.55);
    g.beginPath();
    g.ellipse(cx, hy, size * 0.085, size * 0.13, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = rgba(0x9aab62, 0.7);
    g.beginPath();
    g.ellipse(cx, hy + size * 0.1, size * 0.06, size * 0.06, 0, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

function birdTexture(size: number) {
  const { c, g } = canvas(size, size);
  const cx = size / 2;
  const cy = size / 2;
  g.strokeStyle = "rgba(214,238,255,0.9)";
  g.lineWidth = size * 0.05;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(cx - size * 0.4, cy);
  g.quadraticCurveTo(cx - size * 0.18, cy - size * 0.28, cx, cy);
  g.quadraticCurveTo(cx + size * 0.18, cy - size * 0.28, cx + size * 0.4, cy);
  g.stroke();
  return c;
}

function spiritTexture(size: number) {
  const { c, g } = canvas(size, size);
  const cx = size / 2;
  const cy = size / 2;
  addRad(g, cx, cy, size * 0.42, [
    [0, "rgba(159,227,201,0.55)"],
    [1, "rgba(159,227,201,0)"],
  ]);
  g.fillStyle = "rgba(234,242,255,0.92)";
  g.beginPath();
  g.arc(cx - size * 0.08, cy, size * 0.045, 0, Math.PI * 2);
  g.arc(cx + size * 0.08, cy, size * 0.045, 0, Math.PI * 2);
  g.fill();
  return c;
}

function shaftTexture(w: number, h: number) {
  const { c, g } = canvas(w, h);
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(244,249,255,0.5)");
  grad.addColorStop(1, "rgba(244,249,255,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(w * 0.25, 0);
  g.lineTo(w * 0.75, 0);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.closePath();
  g.fill();
  return c;
}

function vignetteTexture(size: number) {
  const { c, g } = canvas(size, size);
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, r * 0.34, r, r, r);
  grad.addColorStop(0, "rgba(234,242,255,0)");
  grad.addColorStop(1, "rgba(214,228,250,0.5)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function seatGlowTexture(size: number) {
  const { c, g } = canvas(size, size);
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(127,196,255,0.55)");
  grad.addColorStop(0.6, "rgba(127,196,255,0.18)");
  grad.addColorStop(1, "rgba(127,196,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/** A star with a soft halo and a brighter core — not a flat dot. */
function starTexture(size: number) {
  const { c, g } = canvas(size, size);
  const r = size / 2;
  const halo = g.createRadialGradient(r, r, 0, r, r, r);
  halo.addColorStop(0, "rgba(255,255,255,0.95)");
  halo.addColorStop(0.12, "rgba(226,242,255,0.62)");
  halo.addColorStop(0.34, "rgba(190,226,255,0.26)");
  halo.addColorStop(0.7, "rgba(160,205,255,0.07)");
  halo.addColorStop(1, "rgba(160,205,255,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, size, size);
  // faint four-point sparkle for the brighter ones
  g.strokeStyle = "rgba(240,248,255,0.5)";
  g.lineWidth = Math.max(1, size * 0.022);
  g.beginPath();
  g.moveTo(r, r * 0.2);
  g.lineTo(r, r * 1.8);
  g.moveTo(r * 0.2, r);
  g.lineTo(r * 1.8, r);
  g.stroke();
  return c;
}

/** Soft elliptical contact shadow — grounds characters and props. */
function shadowTexture(size: number) {
  const { c, g } = canvas(size, size / 2);
  const cx = size / 2;
  const cy = size / 4;
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "rgba(4,7,16,0.55)");
  grad.addColorStop(0.55, "rgba(4,7,16,0.22)");
  grad.addColorStop(1, "rgba(4,7,16,0)");
  g.save();
  g.translate(cx, cy);
  g.scale(1, 0.42);
  g.translate(-cx, -cy);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cy, size / 2, 0, Math.PI * 2);
  g.fill();
  g.restore();
  return c;
}

/** Wide atmospheric glow for lamps, light pools and memory stars. */
function haloTexture(size: number) {
  const { c, g } = canvas(size, size);
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.32)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.09)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/** Horizontal fog / mist band for atmospheric depth. */
function fogTexture(w: number, h: number) {
  const { c, g } = canvas(w, h);
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(190,215,255,0)");
  grad.addColorStop(0.45, "rgba(190,215,255,0.5)");
  grad.addColorStop(1, "rgba(190,215,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  return c;
}

/** A tuft of grass — used in clusters for terrain detail. */
function grassTexture(size: number) {
  const { c, g } = canvas(size, size);
  g.strokeStyle = "rgba(122,180,150,0.85)";
  g.lineWidth = Math.max(1.2, size * 0.045);
  g.lineCap = "round";
  const base = size * 0.92;
  for (let i = 0; i < 5; i++) {
    const x = size * (0.22 + i * 0.14);
    const lean = (i - 2) * size * 0.05;
    g.beginPath();
    g.moveTo(x, base);
    g.quadraticCurveTo(x + lean * 0.5, size * 0.45, x + lean, size * 0.18 + (i % 2) * size * 0.08);
    g.stroke();
  }
  return c;
}

/** Rounded bush / foliage mass for midground and foreground. */
function bushTexture(size: number) {
  const { c, g } = canvas(size, size);
  g.fillStyle = "rgba(20,40,52,0.9)";
  const blobs = [
    [0.3, 0.68, 0.3],
    [0.55, 0.6, 0.34],
    [0.78, 0.72, 0.26],
    [0.44, 0.5, 0.24],
  ] as [number, number, number][];
  for (const [bx, by, br] of blobs) {
    g.beginPath();
    g.arc(size * bx, size * by, size * br, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

/** Small rock / terrain detail. */
function rockTexture(size: number) {
  const { c, g } = canvas(size, size);
  g.fillStyle = "rgba(30,44,74,0.95)";
  g.beginPath();
  g.ellipse(size * 0.5, size * 0.66, size * 0.42, size * 0.3, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(52,74,116,0.7)";
  g.beginPath();
  g.ellipse(size * 0.42, size * 0.56, size * 0.24, size * 0.16, -0.3, 0, Math.PI * 2);
  g.fill();
  return c;
}

function circleTex(size: number, hex: number, alpha: number) {
  const { c, g } = canvas(size, size);
  g.fillStyle = rgba(hex, alpha);
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  g.fill();
  return c;
}

/* ============================================================
   SOUL BODY PARTS — stylized 2D game character anatomy.
   Assembled into a humanoid skeleton by Soul.ts: head, hair,
   torso, upper/lower arms, hands, thighs, shins, feet, eyes.
   Flat shapes with a single soft shade pass — game art, not
   rendering. The aura surrounds this body; it never replaces it.
   ============================================================ */

/** Soft rounded head with a light-side shade and a warm rim. */
function headTexture(size: number, base: number, shade: number, rim: number) {
  const { c, g } = canvas(size, size);
  const r = size * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  // base head shape — slightly egg-like, gentle chin
  g.fillStyle = rgba(base, 1);
  g.beginPath();
  g.ellipse(cx, cy, r * 0.86, r, 0, 0, Math.PI * 2);
  g.fill();
  // shade on the lower-right for form
  g.fillStyle = rgba(shade, 0.45);
  g.beginPath();
  g.ellipse(cx + r * 0.2, cy + r * 0.16, r * 0.7, r * 0.82, 0, 0, Math.PI * 2);
  g.fill();
  // luminous rim light — souls glow from within
  g.strokeStyle = rgba(rim, 0.75);
  g.lineWidth = size * 0.028;
  g.beginPath();
  g.ellipse(cx, cy, r * 0.86, r, 0, 0, Math.PI * 2);
  g.stroke();
  return c;
}

/** Hair silhouette — the main way the two souls read differently. */
function hairTexture(size: number, kind: "her" | "him", tint: number) {
  const { c, g } = canvas(size, size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  g.fillStyle = rgba(tint, 0.95);
  if (kind === "her") {
    // long, soft, falling past the shoulders
    g.beginPath();
    g.ellipse(cx, cy - r * 0.22, r * 0.98, r * 0.86, 0, Math.PI, 0);
    g.fill();
    g.beginPath();
    g.moveTo(cx - r * 0.95, cy - r * 0.3);
    g.quadraticCurveTo(cx - r * 1.25, cy + r * 1.5, cx - r * 0.5, cy + r * 1.75);
    g.quadraticCurveTo(cx - r * 0.8, cy + r * 0.4, cx - r * 0.72, cy - r * 0.2);
    g.fill();
    g.beginPath();
    g.moveTo(cx + r * 0.95, cy - r * 0.3);
    g.quadraticCurveTo(cx + r * 1.25, cy + r * 1.5, cx + r * 0.5, cy + r * 1.75);
    g.quadraticCurveTo(cx + r * 0.8, cy + r * 0.4, cx + r * 0.72, cy - r * 0.2);
    g.fill();
  } else {
    // short, tidier, a softer crown
    g.beginPath();
    g.ellipse(cx, cy - r * 0.3, r * 0.94, r * 0.7, 0, Math.PI, 0);
    g.fill();
    g.beginPath();
    g.moveTo(cx - r * 0.92, cy - r * 0.25);
    g.quadraticCurveTo(cx - r * 0.98, cy + r * 0.3, cx - r * 0.78, cy + r * 0.35);
    g.quadraticCurveTo(cx - r * 0.86, cy - r * 0.05, cx - r * 0.8, cy - r * 0.28);
    g.fill();
  }
  return c;
}

/** Tapered torso — narrower at the waist, soft shoulders. */
function torsoTexture(w: number, h: number, base: number, shade: number, rim: number) {
  const { c, g } = canvas(w, h);
  const cx = w / 2;
  g.fillStyle = rgba(base, 1);
  g.beginPath();
  g.moveTo(cx - w * 0.34, h * 0.08);
  g.quadraticCurveTo(cx - w * 0.44, h * 0.42, cx - w * 0.26, h * 0.95);
  g.lineTo(cx + w * 0.26, h * 0.95);
  g.quadraticCurveTo(cx + w * 0.44, h * 0.42, cx + w * 0.34, h * 0.08);
  g.quadraticCurveTo(cx, h * -0.04, cx - w * 0.34, h * 0.08);
  g.fill();
  g.fillStyle = rgba(shade, 0.4);
  g.beginPath();
  g.moveTo(cx + w * 0.06, h * 0.05);
  g.quadraticCurveTo(cx + w * 0.42, h * 0.45, cx + w * 0.24, h * 0.95);
  g.lineTo(cx + w * 0.32, h * 0.95);
  g.quadraticCurveTo(cx + w * 0.46, h * 0.4, cx + w * 0.34, h * 0.06);
  g.fill();
  g.strokeStyle = rgba(rim, 0.5);
  g.lineWidth = Math.max(1, w * 0.05);
  g.beginPath();
  g.moveTo(cx - w * 0.34, h * 0.08);
  g.quadraticCurveTo(cx - w * 0.44, h * 0.42, cx - w * 0.26, h * 0.95);
  g.stroke();
  return c;
}

/** Capsule path with a manual fallback — ctx.roundRect is Safari 16.4+. */
function capsule(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.arcTo(x + w, y, x + w, y + r, r);
  g.lineTo(x + w, y + h - r);
  g.arcTo(x + w, y + h, x + w - r, y + h, r);
  g.lineTo(x + r, y + h);
  g.arcTo(x, y + h, x, y + h - r, r);
  g.lineTo(x, y + r);
  g.arcTo(x, y, x + r, y, r);
  g.closePath();
}

/** A limb segment, reused (scaled) for arms and legs. */
function limbTexture(w: number, h: number, base: number, rim: number) {
  const { c, g } = canvas(w, h);
  const cx = w / 2;
  g.fillStyle = rgba(base, 1);
  capsule(g, cx - w * 0.3, 0, w * 0.6, h);
  g.fill();
  g.strokeStyle = rgba(rim, 0.45);
  g.lineWidth = Math.max(1, w * 0.1);
  capsule(g, cx - w * 0.3, 0, w * 0.6, h);
  g.stroke();
  return c;
}

/** Hand / foot — a small soft rounded mass with a glow edge. */
function extremityTexture(size: number, base: number, rim: number) {
  const { c, g } = canvas(size, size);
  const cx = size / 2;
  g.fillStyle = rgba(base, 1);
  g.beginPath();
  g.ellipse(cx, cx, size * 0.34, size * 0.4, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = rgba(rim, 0.6);
  g.lineWidth = size * 0.07;
  g.beginPath();
  g.ellipse(cx, cx, size * 0.34, size * 0.4, 0, 0, Math.PI * 2);
  g.stroke();
  return c;
}

/** A single stylized eye: sclera, coloured iris, pupil, light catch. */
function eyeTexture(size: number, iris: number, deep: number) {
  const { c, g } = canvas(size, size);
  const cx = size / 2;
  // sclera
  g.fillStyle = "rgba(244,250,255,0.96)";
  g.beginPath();
  g.ellipse(cx, cx, size * 0.42, size * 0.32, 0, 0, Math.PI * 2);
  g.fill();
  // iris — the colour that must stay identifiable
  g.fillStyle = rgba(iris, 1);
  g.beginPath();
  g.arc(cx, cx, size * 0.26, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = rgba(deep, 0.6);
  g.beginPath();
  g.arc(cx, cx + size * 0.05, size * 0.2, 0, Math.PI * 2);
  g.fill();
  // pupil
  g.fillStyle = "rgba(8,12,26,0.9)";
  g.beginPath();
  g.arc(cx, cx, size * 0.12, 0, Math.PI * 2);
  g.fill();
  // catch light
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.beginPath();
  g.arc(cx - size * 0.09, cx - size * 0.09, size * 0.06, 0, Math.PI * 2);
  g.fill();
  return c;
}

/** Registers the full body set for one soul. */
function makeBody(
  put: (k: string, c: HTMLCanvasElement) => void,
  id: "hazel" | "blue",
  p: { base: number; shade: number; rim: number; hair: number; iris: number; deep: number }
) {
  put(`b-head-${id}`, headTexture(64, p.base, p.shade, p.rim));
  put(`b-hair-${id}`, hairTexture(64, id === "hazel" ? "her" : "him", p.hair));
  put(`b-torso-${id}`, torsoTexture(40, 56, p.base, p.shade, p.rim));
  put(`b-limb-${id}`, limbTexture(16, 40, p.base, p.rim));
  put(`b-hand-${id}`, extremityTexture(20, p.base, p.rim));
  put(`b-eye-${id}`, eyeTexture(28, p.iris, p.deep));
}

export function makeTextures(scene: Phaser.Scene) {
  const T = scene.textures;
  const put = (key: string, cnv: HTMLCanvasElement) => {
    if (T.exists(key)) T.remove(key);
    T.addCanvas(key, cnv);
  };

  // hazel keeps brown, gold and green; blue keeps sky, cyan and deep blue
  put("aura-hazel", auraTexture(256, 0xf4dca8, 0xe0b36a, 0x8a5f38));
  put("core-hazel", coreTexture(128, 0xf4dca8, 0xe0b36a, 0x9aab62));
  put("aura-blue", auraTexture(256, 0xd6eeff, 0x7fc4ff, 0x3e7cc4));
  put("core-blue", coreTexture(128, 0xd6eeff, 0x7fc4ff, 0x3e7cc4));
  put("aura-our", auraTexture(256, 0xcdffe5, 0x93dcbb, 0x9fe3c9));
  put("star", starTexture(48));
  put("mote", moteTexture(32));
  put("dust", moteTexture(12));
  put("flower-closed", flowerTexture(72, false, 0xf2b8c6, 0xfff0d6));
  put("flower-open", flowerTexture(72, true, 0xf2b8c6, 0xfff0d6));
  put("flower-open-mint", flowerTexture(72, true, 0x9fe3c9, 0xf4dca8));
  put("bird", birdTexture(72));
  put("spirit", spiritTexture(56));
  put("shaft", shaftTexture(180, 420));
  put("vignette", vignetteTexture(512));
  put("seat-glow", seatGlowTexture(160));
  put("dot-blue", circleTex(16, 0xd6eeff, 0.95));
  put("dot-hazel", circleTex(16, 0xf4dca8, 0.95));

  // grounding, atmosphere and terrain detail
  put("shadow", shadowTexture(128));
  put("halo", haloTexture(128));
  put("fog", fogTexture(256, 96));
  put("grass", grassTexture(48));
  put("bush", bushTexture(96));
  put("rock", rockTexture(56));
  // two more flower varieties so clusters are not uniform
  put("flower-open-blue", flowerTexture(72, true, 0xbfd9ff, 0xf4dca8));
  put("flower-open-gold", flowerTexture(72, true, 0xf4dca8, 0xfff0d6));

  /* the two souls, as actual bodies.
     HER — warm hazel: gold skin-light, brown hair, hazel iris.
     HIM — cool blue: pale sky light, deep blue hair, blue iris. */
  makeBody(put, "hazel", {
    base: 0xf6e2c0,
    shade: 0xc79a68,
    rim: 0xffd9a0,
    hair: 0x6b4630,
    iris: 0xb98a4e,
    deep: 0x7d8f4a,
  });
  makeBody(put, "blue", {
    base: 0xd8ecff,
    shade: 0x6f9ed0,
    rim: 0xa8e0ff,
    hair: 0x24406e,
    iris: 0x4f9fe0,
    deep: 0x2f6ba8,
  });
}
