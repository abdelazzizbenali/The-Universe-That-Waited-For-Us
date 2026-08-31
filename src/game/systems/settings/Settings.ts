/* Settings — player preferences, kept locally.
   Volumes, mute, zoom, and reduced motion. Nothing sensitive is stored here. */

export interface SettingsState {
  master: number; // 0..1
  music: number; // 0..1
  effects: number; // 0..1
  muted: boolean;
  reducedMotion: boolean;
  zoom: number; // camera zoom multiplier — 1.0 is the default "up close"
}

const KEY = "utwfu.settings.v2";

/** Default camera zoom. Chosen so the painted environments fill the
 *  landscape viewport with a comfortable amount of world visible (~4x the
 *  previous wide-out framing of 1.0). */
export const DEFAULT_ZOOM = 2.2;
export const MIN_ZOOM = 1.2;
export const MAX_ZOOM = 4.0;

const DEFAULTS: SettingsState = {
  master: 0.85,
  music: 0.8,
  effects: 0.9,
  muted: false,
  reducedMotion: false,
  zoom: DEFAULT_ZOOM,
};

type Listener = (s: SettingsState) => void;

export class Settings {
  state: SettingsState;
  private listeners: Listener[] = [];

  constructor() {
    this.state = this.read();
    // clamp zoom to range (in case persisted value drifts)
    this.state.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.state.zoom));
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
    if (partial.zoom !== undefined) {
      this.state.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, partial.zoom));
    }
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

  get zoom() {
    return this.state.zoom;
  }

  /** Scales particle counts; reduced motion thins them without removing them. */
  particles(n: number) {
    return this.state.reducedMotion ? Math.max(3, Math.round(n * 0.4)) : n;
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
