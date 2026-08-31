/* AudioDirector — fully procedural WebAudio. No assets: ambience beds are
   synthesized (filtered noise + oscillators), one-shots are tiny envelopes.
   Buses: ambience / motif / room / heart. Everything ducks smoothly. */

type BusName = "ambience" | "motif" | "room" | "heart";

interface Bed {
  name: string;
  bus: BusName;
  gain: GainNode;
  nodes: AudioNode[];
  stop: () => void;
}

export class AudioDirector {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private buses = new Map<BusName, GainNode>();
  private beds = new Map<string, Bed>();
  private noiseBuf: AudioBuffer | null = null;
  private motifTimer: ReturnType<typeof setTimeout> | null = null;
  private motifStep = 0;

  get unlocked() {
    return !!this.ctx;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);
    (["ambience", "motif", "room", "heart"] as BusName[]).forEach((b) => {
      const g = this.ctx!.createGain();
      g.gain.value = 1;
      g.connect(this.master);
      this.buses.set(b, g);
    });
    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  }

  private bus(name: BusName) {
    return this.buses.get(name)!;
  }

  private musicVol = 1;
  private fxVol = 1;

  /** Applied live from the settings panel. Music = ambience + motif. */
  setVolumes(music: number, effects: number, muted: boolean) {
    this.musicVol = muted ? 0 : music;
    this.fxVol = muted ? 0 : effects;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const ramp = (g: GainNode, v: number) => {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
      g.gain.linearRampToValueAtTime(Math.max(v, 0.0001), t + 0.25);
    };
    ramp(this.master, 1);
    // ambience carries the world; motif and heart carry the feeling
    const amb = this.buses.get("ambience");
    const mot = this.buses.get("motif");
    const room = this.buses.get("room");
    const heart = this.buses.get("heart");
    if (amb) ramp(amb, this.musicVol * this.ambienceDuck);
    if (mot) ramp(mot, this.musicVol);
    if (room) ramp(room, this.fxVol);
    if (heart) ramp(heart, this.fxVol);
  }

  /** Remembered so volume changes don't undo an in-scene duck. */
  private ambienceDuck = 1;

  private noiseSource() {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    src.start();
    return src;
  }

  /* ---------------- beds ---------------- */

  playBed(name: string, fade = 2.5) {
    if (!this.ctx) return;
    if (this.beds.has(name)) return;
    // stop everything else — beds are exclusive atmospheres
    for (const key of [...this.beds.keys()]) this.stopBed(key, fade);
    let bed: Bed | null = null;
    if (name === "night-wind") bed = this.makeWind(0.05, 340);
    if (name === "bus-engine") bed = this.makeEngine();
    if (name === "crowd") bed = this.makeCrowd();
    if (name === "library") bed = this.makeLibrary();
    if (name === "road-dusk") bed = this.makeWind(0.04, 500);
    if (name === "whispers") bed = this.makeWhispers();
    if (name === "vision-space") bed = this.makeVision();
    if (!bed) return;
    const target = bed.gain.gain.value;
    bed.gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    bed.gain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + fade);
    this.beds.set(name, bed);
  }

  stopBed(name: string, fade = 2) {
    const bed = this.beds.get(name);
    if (!bed || !this.ctx) return;
    this.beds.delete(name);
    const t = this.ctx.currentTime;
    bed.gain.gain.cancelScheduledValues(t);
    bed.gain.gain.setValueAtTime(Math.max(bed.gain.gain.value, 0.0001), t);
    bed.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
    setTimeout(() => bed.stop(), fade * 1000 + 80);
  }

  stopAllBeds(fade = 1.5) {
    for (const key of [...this.beds.keys()]) this.stopBed(key, fade);
  }

  /** Real-time duck of a running bed (e.g. crowd fades when she sits). */
  duckBed(name: string, level: number, seconds = 1.5) {
    const bed = this.beds.get(name);
    if (!bed || !this.ctx) return;
    const t = this.ctx.currentTime;
    bed.gain.gain.cancelScheduledValues(t);
    bed.gain.gain.setValueAtTime(Math.max(bed.gain.gain.value, 0.0001), t);
    bed.gain.gain.linearRampToValueAtTime(Math.max(level, 0.0001), t + seconds);
  }

  duckAmbience(level: number, seconds = 1.2) {
    this.ambienceDuck = Math.max(0, Math.min(1, level));
    if (!this.ctx) return;
    const g = this.bus("ambience").gain;
    const t = this.ctx.currentTime;
    // the duck is scaled by her chosen music volume, never fighting it
    const target = Math.max(this.ambienceDuck * this.musicVol, 0.0001);
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(g.value, 0.0001), t);
    g.linearRampToValueAtTime(target, t + seconds);
  }

  restoreAmbience(seconds = 1.8) {
    this.duckAmbience(1, seconds);
  }

  /* ---------------- motif ---------------- */

  /** Gentle generative piano-ish notes; ethereal and sparse. */
  startMotif(kind: "airy" | "warm") {
    if (!this.ctx || this.motifTimer) return;
    const scale =
      kind === "airy"
        ? [523.25, 587.33, 659.25, 783.99, 880.0]
        : [392.0, 440.0, 523.25, 587.33, 659.25];
    const tick = () => {
      if (!this.ctx) return;
      this.motifStep++;
      if (Math.random() < 0.75) {
        const f = scale[Math.floor(Math.random() * scale.length)];
        this.pluck(f, 0.028 + Math.random() * 0.014, 3.2);
        if (Math.random() < 0.3) this.pluck(f / 2, 0.02, 4);
      }
      this.motifTimer = setTimeout(tick, 1400 + Math.random() * 1800);
    };
    tick();
  }

  stopMotif() {
    if (this.motifTimer) clearTimeout(this.motifTimer);
    this.motifTimer = null;
  }

  private pluck(freq: number, level: number, decay: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.05;
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    osc.connect(lp).connect(g).connect(this.bus("motif"));
    osc.start(t);
    osc.stop(t + decay + 0.1);
  }

  /* ---------------- one-shots ---------------- */

  tone(freq: number, level = 0.05, dur = 0.5, bus: BusName = "motif", type: OscillatorType = "sine") {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.bus(bus));
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  sparkle() {
    [1046.5, 1318.5, 1568].forEach((f, i) => setTimeout(() => this.tone(f, 0.03, 0.9), i * 70));
  }

  starIgnite() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(1240, t + 1.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.045, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    osc.connect(g).connect(this.bus("motif"));
    osc.start(t);
    osc.stop(t + 2.4);
  }

  settle() {
    this.tone(196, 0.05, 1.4, "ambience", "sine");
    setTimeout(() => this.tone(392, 0.03, 1.6), 120);
  }

  blip() {
    this.tone(880, 0.026, 0.24);
  }

  softTick() {
    this.tone(660, 0.012, 0.1);
  }

  /* ---------------- intimacy: breath + heartbeat ---------------- */

  private intimacyNodes: AudioNode[] = [];
  private heartTimer: ReturnType<typeof setInterval> | null = null;

  /** The hand-holding soundscape: breath, heartbeat, almost nothing else. */
  startIntimacy() {
    if (!this.ctx || this.heartTimer) return;
    const ctx = this.ctx;

    // breath — noise through a soft bandpass, swelling ~4s per cycle
    const src = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 620;
    bp.Q.value = 0.7;
    const bg = ctx.createGain();
    bg.gain.value = 0.05;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.24;
    const lg = ctx.createGain();
    lg.gain.value = 0.045;
    lfo.connect(lg).connect(bg.gain);
    lfo.start();
    src.connect(bp).connect(bg).connect(this.bus("heart"));
    this.intimacyNodes.push(src, lfo);

    // heartbeat — two soft thumps, unhurried
    const beat = () => {
      this.tone(56, 0.075, 0.26, "heart", "sine");
      setTimeout(() => this.tone(48, 0.05, 0.3, "heart", "sine"), 210);
    };
    beat();
    this.heartTimer = setInterval(beat, 1180);
  }

  stopIntimacy(fade = 1.6) {
    if (this.heartTimer) {
      clearInterval(this.heartTimer);
      this.heartTimer = null;
    }
    if (!this.ctx || this.intimacyNodes.length === 0) return;
    const nodes = this.intimacyNodes;
    this.intimacyNodes = [];
    // let the breath trail off instead of cutting it
    setTimeout(() => {
      nodes.forEach((n) => {
        try {
          (n as OscillatorNode).stop();
        } catch {
          /* buffer sources stop too */
        }
      });
    }, fade * 1000);
  }

  /** Camera shutter — a small mechanical breath, not a phone click. */
  shutter() {
    if (!this.ctx) return;
    this.tone(2100, 0.02, 0.05, "motif", "square");
    setTimeout(() => this.tone(1500, 0.028, 0.09, "motif", "triangle"), 70);
    const ctx = this.ctx;
    const src = this.noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    src.connect(hp).connect(g).connect(this.bus("motif"));
    setTimeout(() => {
      try {
        src.stop();
      } catch { /* already stopped */ }
    }, 200);
  }

  /* ---------------- bed builders ---------------- */

  private makeWind(level: number, cutoff: number): Bed {
    const ctx = this.ctx!;
    const src = this.noiseSource();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.value = level;
    // slow breathing LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoG = ctx.createGain();
    lfoG.gain.value = level * 0.5;
    lfo.connect(lfoG).connect(g.gain);
    lfo.start();
    src.connect(lp).connect(g).connect(this.bus("ambience"));
    return {
      name: "wind",
      bus: "ambience",
      gain: g,
      nodes: [src, lfo],
      stop: () => {
        try { src.stop(); lfo.stop(); } catch { /* already stopped */ }
      },
    };
  }

  private makeEngine(): Bed {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 46;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 150;
    const noise = this.noiseSource();
    const nlp = ctx.createBiquadFilter();
    nlp.type = "lowpass";
    nlp.frequency.value = 240;
    const ng = ctx.createGain();
    ng.gain.value = 0.35;
    // slow judder
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 1.6;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 4;
    lfo.connect(lfoG).connect(osc.frequency);
    lfo.start();
    osc.connect(lp).connect(g);
    noise.connect(nlp).connect(ng).connect(g);
    g.connect(this.bus("ambience"));
    osc.start();
    return {
      name: "bus",
      bus: "ambience",
      gain: g,
      nodes: [osc, noise, lfo],
      stop: () => {
        try { osc.stop(); noise.stop(); lfo.stop(); } catch { /* stopped */ }
      },
    };
  }

  private makeCrowd(): Bed {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0.055;
    const stops: AudioNode[] = [];
    const mkVoice = (freq: number, pan: number) => {
      const src = this.noiseSource();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq;
      bp.Q.value = 2.2;
      const vg = ctx.createGain();
      vg.gain.value = 0.22;
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.5 + Math.random() * 1.3;
      const lg = ctx.createGain();
      lg.gain.value = 0.14;
      lfo.connect(lg).connect(vg.gain);
      lfo.start();
      src.connect(bp).connect(vg).connect(p).connect(g);
      stops.push(src, lfo);
    };
    mkVoice(420, -0.5);
    mkVoice(640, 0.35);
    mkVoice(900, 0);
    mkVoice(300, 0.6);
    g.connect(this.bus("ambience"));
    return {
      name: "crowd",
      bus: "ambience",
      gain: g,
      nodes: stops,
      stop: () => stops.forEach((n) => { try { (n as AudioBufferSourceNode).stop(); } catch { /* stopped */ } }),
    };
  }

  /** Distant, indistinct voices — attention, not menace. */
  private makeWhispers(): Bed {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    const stops: AudioNode[] = [];
    [[1500, -0.7], [2100, 0.65], [1150, 0.15], [2600, -0.3]].forEach(([f, pan]) => {
      const src = this.noiseSource();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = 5.5;
      const vg = ctx.createGain();
      vg.gain.value = 0.1;
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      // irregular breath-like swells: whispering, never words
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.16 + Math.random() * 0.4;
      const lg = ctx.createGain();
      lg.gain.value = 0.09;
      lfo.connect(lg).connect(vg.gain);
      lfo.start();
      src.connect(bp).connect(vg).connect(p).connect(g);
      stops.push(src, lfo);
    });
    g.connect(this.bus("ambience"));
    return {
      name: "whispers",
      bus: "ambience",
      gain: g,
      nodes: stops,
      stop: () => stops.forEach((n) => { try { (n as AudioBufferSourceNode).stop(); } catch { /* stopped */ } }),
    };
  }

  /** Spacious, wide, weightless — the vision world. */
  private makeVision(): Bed {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0.038;
    const stops: AudioNode[] = [];
    [130.81, 196.0, 261.63, 329.63].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const og = ctx.createGain();
      og.gain.value = 0.001;
      const p = ctx.createStereoPanner();
      p.pan.value = i % 2 === 0 ? -0.4 : 0.4;
      // very slow crossfading drones — a sky you can hear
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.03 + i * 0.017;
      const lg = ctx.createGain();
      lg.gain.value = 0.13;
      lfo.connect(lg).connect(og.gain);
      lfo.start();
      osc.connect(og).connect(p).connect(g);
      osc.start();
      stops.push(osc, lfo);
    });
    const air = this.noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 6400;
    const ag = ctx.createGain();
    ag.gain.value = 0.055;
    air.connect(hp).connect(ag).connect(g);
    stops.push(air);
    g.connect(this.bus("ambience"));
    return {
      name: "vision",
      bus: "ambience",
      gain: g,
      nodes: stops,
      stop: () => stops.forEach((n) => { try { (n as OscillatorNode).stop(); } catch { /* stopped */ } }),
    };
  }

  private makeLibrary(): Bed {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0.034;
    const stops: AudioNode[] = [];
    // warm pad — two detuned triangles, slow attack
    [196, 293.66, 392].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = f * (i === 1 ? 1.002 : 1);
      const og = ctx.createGain();
      og.gain.value = i === 0 ? 0.4 : 0.16;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 760;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lg = ctx.createGain();
      lg.gain.value = og.gain.value * 0.3;
      lfo.connect(lg).connect(og.gain);
      lfo.start();
      osc.connect(lp).connect(og).connect(g);
      osc.start();
      stops.push(osc, lfo);
    });
    // quiet air
    const air = this.noiseSource();
    const alp = ctx.createBiquadFilter();
    alp.type = "highpass";
    alp.frequency.value = 5200;
    const ag = ctx.createGain();
    ag.gain.value = 0.05;
    air.connect(alp).connect(ag).connect(g);
    stops.push(air);
    g.connect(this.bus("ambience"));
    return {
      name: "library",
      bus: "ambience",
      gain: g,
      nodes: stops,
      stop: () => stops.forEach((n) => { try { (n as OscillatorNode).stop(); } catch { /* stopped */ } }),
    };
  }
}
