/* ============================================================
   THE ART BIBLE
   The single source of visual truth for the whole game.
   Every scene, effect and UI element should read from here
   rather than inventing its own colours or densities.
   ============================================================ */

/* ---------------- 1. CORE PALETTE ---------------- */

export const CORE = {
  skyBlue: 0x7fc4ff,
  babyBlue: 0xbfd9ff,
  mint: 0x9fe3c9,
  white: 0xeaf2ff,
  pink: 0xf2b8c6,
  cyan: 0x93dcbb,
  softGreen: 0x9aab62,
} as const;

/** Darker and warmer support tones. The core palette is a foundation,
    not a cage — night scenes need depth, warm scenes need candlelight. */
export const SUPPORT = {
  void: 0x05070f,
  deepNight: 0x070b1a,
  indigo: 0x0c1430,
  navy: 0x111c3c,
  slate: 0x1b2551,
  dusk: 0x243a6e,
  candle: 0xf4e3c0,
  amber: 0xe0b36a,
  ember: 0x8a5f38,
  paper: 0xf4dca8,
} as const;

/* ---------------- 2. THE TWO SOULS ---------------- */

/** HER — hazel: brown, gold and green, layered, warm and elegant. */
export const HAZEL = {
  core: 0xf4dca8,
  gold: 0xe0b36a,
  green: 0x9aab62,
  brown: 0x8a5f38,
  spill: 0xe0b36a,
} as const;

/** HIM — blue: sky, cyan and deep blue. Calm, luminous, protective. */
export const BLUE = {
  core: 0xd6eeff,
  sky: 0x7fc4ff,
  cyan: 0x8fd8ea,
  deep: 0x3e7cc4,
  spill: 0x7fc4ff,
} as const;

/** OUR COLOR — born of both, identical to neither. */
export const OUR = {
  core: 0xcdffe5,
  mid: 0x93dcbb,
  edge: 0x9fe3c9,
} as const;

/* ---------------- 3. WORLD PALETTES ---------------- */

export interface WorldPalette {
  skyTop: number;
  skyBottom: number;
  ridgeFar: number;
  ridgeMid: number;
  ridgeNear: number;
  ground: number;
  fog: number;
  light: number;
  /** Ambient particle tint. */
  motes: number;
  /** 0..1 — how much light the scene carries. */
  warmth: number;
}

export const WORLDS: Record<string, WorldPalette> = {
  /** Prologue and early night: cool, quiet, unfinished. */
  nightHill: {
    skyTop: 0x070b1a, skyBottom: 0x0c1434,
    ridgeFar: 0x16244a, ridgeMid: 0x111c3c, ridgeNear: 0x0c1430,
    ground: 0x0a1130, fog: 0x8fa8d8, light: 0xbcd6ff, motes: 0xbfd9ff, warmth: 0.1,
  },
  /** Campus morning: pale, hopeful, still cool. */
  campus: {
    skyTop: 0x0a1030, skyBottom: 0x1a2a52,
    ridgeFar: 0x1a2a52, ridgeMid: 0x142244, ridgeNear: 0x0e1738,
    ground: 0x0e1738, fog: 0x9fb8e8, light: 0xe0b36a, motes: 0xbfd9ff, warmth: 0.25,
  },
  /** Library, first visit: cool, hushed, slightly distant. */
  libraryCold: {
    skyTop: 0x0d1330, skyBottom: 0x14204a,
    ridgeFar: 0x1a2550, ridgeMid: 0x141d44, ridgeNear: 0x101838,
    ground: 0x0d1533, fog: 0x9fb0d0, light: 0xf4e3c0, motes: 0xf4e3c0, warmth: 0.3,
  },
  /** Library, later: the same room, warmer because they are. */
  libraryWarm: {
    skyTop: 0x121a3c, skyBottom: 0x22305e,
    ridgeFar: 0x223066, ridgeMid: 0x1a2550, ridgeNear: 0x16204a,
    ground: 0x101838, fog: 0xd8c9a8, light: 0xf0c98a, motes: 0xf4e3c0, warmth: 0.62,
  },
  /** Daytime bus: functional, a little worn, daylight through glass. */
  busDay: {
    skyTop: 0x0b122c, skyBottom: 0x0e1738,
    ridgeFar: 0x2a3f78, ridgeMid: 0x1a2650, ridgeNear: 0x121c42,
    ground: 0x0d1533, fog: 0x9fb0d0, light: 0xbfd9ff, motes: 0xbfd9ff, warmth: 0.28,
  },
  /** Evening bus: amber glass, tired warmth. */
  busDusk: {
    skyTop: 0x141026, skyBottom: 0x241a3a,
    ridgeFar: 0x3a2a52, ridgeMid: 0x241c46, ridgeNear: 0x1a1434,
    ground: 0x120e28, fog: 0xd8a878, light: 0xe0b36a, motes: 0xe0b36a, warmth: 0.55,
  },
  /** Night bus: deep blue with small painful yellow lights. */
  busNight: {
    skyTop: 0x05080f, skyBottom: 0x0a0f1e,
    ridgeFar: 0x0c1226, ridgeMid: 0x080d1c, ridgeNear: 0x05080f,
    ground: 0x070b16, fog: 0x4a5f9e, light: 0xf4e3c0, motes: 0x6f86b8, warmth: 0.12,
  },
  /** Evening road to the university. */
  road: {
    skyTop: 0x070b1a, skyBottom: 0x0e1430,
    ridgeFar: 0x14224a, ridgeMid: 0x0f1a3a, ridgeNear: 0x0a1128,
    ground: 0x090e24, fog: 0x6f86b8, light: 0xe0b36a, motes: 0xbfd9ff, warmth: 0.3,
  },
  /** Vision world: spacious, uncertain, light that hurts. */
  vision: {
    skyTop: 0x070b1c, skyBottom: 0x101a3e,
    ridgeFar: 0x142244, ridgeMid: 0x0e1836, ridgeNear: 0x090f28,
    ground: 0x090f28, fog: 0x7f9ad0, light: 0xf4e3c0, motes: 0x9fe3c9, warmth: 0.2,
  },
  /** Dream / cosmic spaces. */
  cosmic: {
    skyTop: 0x080c22, skyBottom: 0x141d44,
    ridgeFar: 0x1c2a56, ridgeMid: 0x14204a, ridgeNear: 0x0d1533,
    ground: 0x0a1028, fog: 0x8fa8d8, light: 0x9fe3c9, motes: 0x93dcbb, warmth: 0.35,
  },
  /** The garden where the flowers are given. */
  garden: {
    skyTop: 0x0b1230, skyBottom: 0x1e2b52,
    ridgeFar: 0x22305e, ridgeMid: 0x18244a, ridgeNear: 0x0e1836,
    ground: 0x122043, fog: 0xc9a8c0, light: 0xf2b8c6, motes: 0xf2b8c6, warmth: 0.55,
  },
  /** The final world, before it wakes: sparse, cold, waiting. */
  finalAsleep: {
    skyTop: 0x05070f, skyBottom: 0x0a1024,
    ridgeFar: 0x111c3c, ridgeMid: 0x0b1228, ridgeNear: 0x070c1c,
    ground: 0x070c1c, fog: 0x6f86b8, light: 0x9fb8e8, motes: 0x9fb8e8, warmth: 0.08,
  },
  /** The final world, awake: luminous, dreamlike, alive. */
  finalAwake: {
    skyTop: 0x0a1228, skyBottom: 0x1e3050,
    ridgeFar: 0x24406e, ridgeMid: 0x182a4e, ridgeNear: 0x0f1c38,
    ground: 0x0d1834, fog: 0x9fe3c9, light: 0x93dcbb, motes: 0x9fe3c9, warmth: 0.85,
  },
};

/* ---------------- 4. DENSITY RULES ---------------- */

/** Star counts by narrative stage. The sky fills as the story does. */
export const STAR_DENSITY = {
  empty: 14,
  sparse: 34,
  early: 60,
  moderate: 95,
  full: 150,
  celebration: 210,
} as const;

/** Ambient particle counts. Never spam: atmosphere, not confetti. */
export const MOTE_DENSITY = {
  faint: 8,
  room: 16,
  dusty: 26,
  alive: 34,
} as const;

/* ---------------- 5. LIGHTING PRINCIPLES ---------------- */

export const LIGHT = {
  /** Light pools ground a scene; never light everything evenly. */
  poolAlpha: { faint: 0.08, soft: 0.13, warm: 0.2, strong: 0.3 },
  /** Vignettes focus attention inward without hiding information. */
  vignetteAlpha: { none: 0, subtle: 0.22, moody: 0.34, heavy: 0.48 },
  /** Contact shadows — characters must never float. */
  shadowAlpha: 0.5,
} as const;

/* ---------------- 6. TYPOGRAPHY ---------------- */

export const TYPE = {
  /** One narrative voice. */
  display: "Fraunces, Georgia, serif",
  /** One quiet accent for system text and labels. */
  mono: "JetBrains Mono, monospace",
  size: { label: "9px", small: "11px", body: "13px", card: "20px" },
  colour: { ink: "#eaf2ff", dim: "#9fb0d0", faint: "#5c6c8f", our: "#93dcbb" },
} as const;

/* ---------------- 7. CAMERA RULES ---------------- */

export const SHOT = {
  /** Wide: establish a place and its scale. */
  wide: 0.92,
  /** Neutral: ordinary exploration. */
  neutral: 1,
  /** Medium: two people sharing a moment. */
  medium: 1.14,
  /** Close: a hand, a face, a decision. */
  close: 1.24,
  /** Intimate: reserved for the few largest beats. */
  intimate: 1.34,
} as const;

/* ---------------- 8. HELPERS ---------------- */

/** Blends two palette colours — used for OUR COLOR progression. */
export function mix(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/**
 * The colour a shared element should be at a given story stage (0..7).
 * Early: still clearly blue or hazel. Late: unmistakably OUR COLOR.
 */
export function ourColorAt(stage: number, from: "hazel" | "blue" = "hazel"): number {
  const base = from === "hazel" ? HAZEL.gold : BLUE.sky;
  return mix(base, OUR.mid, Math.min(1, Math.max(0, stage / 7)));
}
