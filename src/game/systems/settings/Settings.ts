/* Settings — player preferences, kept locally.
   Volumes, mute, and reduced motion. Nothing sensitive is stored here. */

export interface SettingsState {
  master: number; // 0..1
  music: number; // 0..1
  effects: number; // 0..1
  muted: boolean;
  reducedMotion: boolean;
  zoom: number; // gameplay camera zoom
}

const KEY = "utwfu.settings.v1";

export const DEFAULT_CAMERA_ZOOM = 2.2;

const DEFAULTS: SettingsState = {
  master: 0.85,
  music: 0.8,
  effects: 0.9,
  muted: false,
  reducedMotion: false,
  zoom: DEFAULT_CAMERA_ZOOM,
};

type Listener = (s: SettingsState) => void;

export class Settings {
  state: SettingsState;
  private listeners: Listener[] = [];

  constructor() {
    this.state = this.read();
    // respect the OS-level preference on first run
    try {
      if (
        localStorage.getItem(KEY) === null &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ) {
        this.state.reducedMotion = true;
      }
    } catch {
      /* matchMedia unavailable — keep defaults */
    }
  }

  private read(): SettingsState {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SettingsState>) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  patch(partial: Partial<SettingsState>) {
    this.state = { ...this.state, ...partial };
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch {
      /* private mode — settings live for this session only */
    }
    this.listeners.forEach((fn) => fn(this.state));
  }

  onChange(fn: Listener) {
    this.listeners.push(fn);
    fn(this.state);
  }

  /** Effective gain for a bus, after mute and master. */
  gain(kind: "music" | "effects") {
    if (this.state.muted) return 0;
    return this.state.master * (kind === "music" ? this.state.music : this.state.effects);
  }

  get reducedMotion() {
    return this.state.reducedMotion;
  }

  /** Scales particle counts; reduced motion thins them without removing them. */
  particles(n: number) {
    return this.state.reducedMotion ? Math.max(3, Math.round(n * 0.4)) : n;
  }

  get zoom() {
    return PhaserSafeClamp(this.state.zoom || DEFAULT_CAMERA_ZOOM, 1.35, 3.2);
  }

  /** Scales camera/zoom movement amounts. */
  motion(v: number) {
    return this.state.reducedMotion ? v * 0.35 : v;
  }

  /** Shortens or lengthens a duration; reduced motion prefers calmer, not faster. */
  duration(ms: number) {
    return this.state.reducedMotion ? Math.round(ms * 1.15) : ms;
  }
}

function PhaserSafeClamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
