/* UIManager — owns every DOM overlay above the canvas: virtual joystick,
   contextual action button, dialogue ribbon, title cards, toasts, phone UI,
   letterbox. All touch input lives here; scenes consume clean APIs. */

export type DLine = { text: string; kind?: "narr" | "canon" | "whisper"; wait?: number };

const $ = (id: string) => document.getElementById(id)!;

export class UIManager {
  private root: HTMLElement;
  private stickPointer: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private stickVec = { x: 0, y: 0 };
  private actionHeldFlag = false;
  private dlgResolve: (() => void) | null = null;
  private typeTimer: ReturnType<typeof setInterval> | null = null;
  private typingFull = "";
  private typing = false;
  private advanceLockUntil = 0;
  private lines: DLine[] = [];
  private lineIdx = 0;
  private phoneResolve: (() => void) | null = null;

  onActionDown: (() => void) | null = null;
  onActionUp: (() => void) | null = null;

  private keyHandler = (e: KeyboardEvent) => {
    if (!this.dialogueActive) return;
    if (["Space", "Enter", "KeyE"].includes(e.code)) {
      e.preventDefault();
      this.advance();
    }
  };

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.innerHTML = this.template();
    this.bindStick();
    this.bindAction();
    this.bindDialogue();
    $("phone").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.closePhone();
    });
  }

  destroy() {
    window.removeEventListener("keydown", this.keyHandler);
    this.root.innerHTML = "";
  }

  /* ---------------- immersion & feedback ---------------- */

  private fullscreenTried = false;

  /**
   * Asks for fullscreen on a real user gesture. Silently does nothing where
   * it is unsupported (iOS Safari on iPhone refuses) — the layout already
   * handles browser chrome, so this is a bonus, never a requirement.
   */
  tryFullscreen() {
    if (this.fullscreenTried) return;
    this.fullscreenTried = true;
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (document.fullscreenElement) return;
      const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
      // the promise is swallowed on purpose: a refusal is not an error here
      void req?.().catch(() => undefined);
    } catch {
      /* not available — the game is designed to be fine without it */
    }
  }

  /**
   * A short, soft vibration for moments of contact. Never required: every
   * beat that uses it also has a visual and an audible response.
   */
  haptic(kind: "touch" | "found" | "contact" = "touch") {
    try {
      const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
      if (typeof nav.vibrate !== "function") return;
      const pattern = kind === "contact" ? [14, 60, 22] : kind === "found" ? [10] : [6];
      nav.vibrate(pattern);
    } catch {
      /* ignored — haptics are decoration, not mechanics */
    }
  }

  private template() {
    return `
      <div id="ui-noise"></div>
      <div id="letter-top" class="letter"></div>
      <div id="letter-bottom" class="letter"></div>
      <div id="js-zone"><div id="js-base"></div><div id="js-nub"></div></div>
      <div id="action"><div id="action-inner"><span id="action-label"></span></div></div>
      <div id="hint"></div>
      <div id="dialogue"><div id="dlg-box"><div id="dlg-text"></div><div id="dlg-more">tap to continue</div></div></div>
      <div id="card"><div id="card-title"></div><div id="card-sub"></div></div>
      <div id="toast"></div>
      <div id="phone">
        <div id="phone-notch"></div>
        <div id="phone-bubble">Thank you.</div>
        <div id="phone-hint">tap to keep</div>
      </div>
      <button id="gear" type="button" aria-label="settings">⚙</button>
      <div id="settings">
        <div id="settings-card" role="dialog" aria-label="settings">
          <p class="set-title">quiet adjustments</p>
          <label class="set-row"><span>master</span>
            <input id="set-master" type="range" min="0" max="100" step="1" /></label>
          <label class="set-row"><span>music</span>
            <input id="set-music" type="range" min="0" max="100" step="1" /></label>
          <label class="set-row"><span>effects</span>
            <input id="set-fx" type="range" min="0" max="100" step="1" /></label>
          <label class="set-toggle"><input id="set-mute" type="checkbox" /><span>mute everything</span></label>
          <label class="set-toggle"><input id="set-motion" type="checkbox" /><span>reduced motion</span></label>
          <p class="set-note">Reduced motion calms the camera and thins the particles. Nothing in the story is lost.</p>
          <button id="set-close" type="button">close</button>
        </div>
      </div>
      <div id="wish">
        <div id="wish-star"></div>
        <div id="wish-inner">
          <p id="wish-line1">You spent this journey discovering what was.</p>
          <p id="wish-line2">Now leave something for what comes next.</p>
          <div id="wish-field">
            <textarea id="wish-text" maxlength="600" rows="3" spellcheck="false"
              placeholder="write into the starlight…"></textarea>
          </div>
          <button id="wish-send" type="button">hide my wish among the stars</button>
        </div>
      </div>
      <div id="orient">
        <div class="orient-souls"><span class="os h"></span><span class="os b"></span></div>
        <p>The universe opens wider in landscape.</p>
        <small>rotate to continue</small>
      </div>
      <div id="veil"><span>gathering stars</span></div>
    `;
  }

  /* ---------------- lifecycle ---------------- */

  reset() {
    // clear any mid-line state so a scene change never leaves text behind
    if (this.dlgResolve) {
      this.dlgResolve = null;
      this.stopTyping();
    }
    this.setHint(null);
    this.setAction(null);
    this.hideDialogue();
    this.letterbox(false);
    this.hideCardInstant();
    this.stickVec = { x: 0, y: 0 };
    this.stickPointer = null;
    $("js-base").classList.remove("on");
    $("js-nub").classList.remove("on");
    this.phoneHide();
    $("wish").classList.remove("on", "sending", "rising");
    this.setTouchGameplay(true);
    this.showGear(true);
  }

  /** Enables/disables the full-screen touch gameplay zones (joystick).
      Title screen disables them so Phaser-side text can receive taps. */
  setTouchGameplay(on: boolean) {
    // the settings gear follows the controls: present while exploring,
    // gone whenever the story has the screen
    this.showGear(on);
    $("js-zone").style.pointerEvents = on ? "auto" : "none";
    if (!on) {
      this.stickVec = { x: 0, y: 0 };
      $("js-base").classList.remove("on");
      $("js-nub").classList.remove("on");
    }
  }

  veilGone() {
    $("veil").classList.add("gone");
  }

  /* ---------------- joystick ---------------- */

  private bindStick() {
    const zone = $("js-zone");
    const base = $("js-base");
    const nub = $("js-nub");
    const R = 56;

    const place = (x: number, y: number) => {
      base.style.left = `${this.stickOrigin.x}px`;
      base.style.top = `${this.stickOrigin.y}px`;
      nub.style.left = `${this.stickOrigin.x + x}px`;
      nub.style.top = `${this.stickOrigin.y + y}px`;
    };

    zone.addEventListener("pointerdown", (e) => {
      if (this.stickPointer !== null) return;
      e.preventDefault();
      this.stickPointer = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      const rect = zone.getBoundingClientRect();
      this.stickOrigin = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      this.stickVec = { x: 0, y: 0 };
      base.classList.add("on");
      nub.classList.add("on");
      place(0, 0);
    });

    zone.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.stickPointer) return;
      e.preventDefault();
      const rect = zone.getBoundingClientRect();
      let dx = e.clientX - rect.left - this.stickOrigin.x;
      let dy = e.clientY - rect.top - this.stickOrigin.y;
      const d = Math.hypot(dx, dy);
      if (d > R) {
        dx = (dx / d) * R;
        dy = (dy / d) * R;
      }
      const dead = 7;
      const m = Math.hypot(dx, dy);
      if (m < dead) this.stickVec = { x: 0, y: 0 };
      else this.stickVec = { x: dx / R, y: dy / R };
      place(dx, dy);
    });

    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.stickPointer) return;
      this.stickPointer = null;
      this.stickVec = { x: 0, y: 0 };
      base.classList.remove("on");
      nub.classList.remove("on");
    };
    zone.addEventListener("pointerup", end);
    zone.addEventListener("pointercancel", end);
  }

  get stickAxis() {
    return this.stickVec;
  }

  /* ---------------- action button ---------------- */

  private bindAction() {
    const el = $("action");
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      this.actionHeldFlag = true;
      this.onActionDown?.();
    });
    const up = (e: PointerEvent) => {
      e.preventDefault();
      if (!this.actionHeldFlag) return;
      this.actionHeldFlag = false;
      this.onActionUp?.();
    };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  get actionHeld() {
    return this.actionHeldFlag;
  }

  setAction(label: string | null) {
    const el = $("action");
    if (label === null) {
      el.classList.remove("on");
      this.setActionProgress(0);
      return;
    }
    $("action-label").textContent = label;
    el.classList.add("on");
  }

  setActionProgress(p: number) {
    $("action").style.setProperty("--p", String(Math.round(p * 100)));
  }

  /* ---------------- hint ---------------- */

  setHint(text: string | null) {
    const el = $("hint");
    if (!text) {
      el.classList.remove("on");
      return;
    }
    el.textContent = text;
    el.classList.add("on");
  }

  /* ---------------- dialogue ---------------- */

  get dialogueActive() {
    return this.dlgResolve !== null;
  }

  private bindDialogue() {
    $("dialogue").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.advance();
    });
    window.addEventListener("keydown", this.keyHandler);
  }

  play(lines: DLine[]): Promise<void> {
    this.lines = lines;
    this.lineIdx = 0;
    $("dialogue").classList.add("on");
    // cinematic bars pull back while she is reading
    this.root.classList.add("dialogue-open");
    return new Promise((resolve) => {
      this.dlgResolve = resolve;
      this.showLine();
    });
  }

  private showLine() {
    const line = this.lines[this.lineIdx];
    const text = $("dlg-text");
    text.className = line.kind === "canon" ? "canon" : line.kind === "whisper" ? "whisper" : "";
    this.typingFull = line.text;
    text.textContent = "";
    this.typing = true;
    this.advanceLockUntil = performance.now() + 220;
    let i = 0;
    if (this.typeTimer) clearInterval(this.typeTimer);
    this.typeTimer = setInterval(() => {
      i++;
      text.textContent = this.typingFull.slice(0, i);
      if (i >= this.typingFull.length) {
        this.stopTyping();
        const wait = this.lines[this.lineIdx].wait ?? 0;
        if (wait > 0) this.advanceLockUntil = performance.now() + wait;
      }
    }, 24);
  }

  private stopTyping() {
    if (this.typeTimer) clearInterval(this.typeTimer);
    this.typeTimer = null;
    this.typing = false;
  }

  private advance() {
    if (!this.dlgResolve) return;
    if (performance.now() < this.advanceLockUntil) return;
    if (this.typing) {
      this.stopTyping();
      $("dlg-text").textContent = this.typingFull;
      return;
    }
    this.lineIdx++;
    if (this.lineIdx >= this.lines.length) {
      this.hideDialogue();
      const r = this.dlgResolve;
      this.dlgResolve = null;
      r();
      return;
    }
    this.showLine();
  }

  hideDialogue() {
    this.stopTyping();
    $("dialogue").classList.remove("on");
    this.root.classList.remove("dialogue-open");
  }

  async say(lines: DLine[]) {
    await this.play(lines);
  }

  /* ---------------- cards ---------------- */

  card(titleHtml: string, sub = "", holdMs = 2800): Promise<void> {
    $("card-title").innerHTML = titleHtml;
    $("card-sub").textContent = sub;
    $("card").classList.add("on");
    return new Promise((resolve) => {
      setTimeout(() => {
        $("card").classList.remove("on");
        setTimeout(resolve, 1100);
      }, holdMs);
    });
  }

  private hideCardInstant() {
    $("card").classList.remove("on");
  }

  letterbox(on: boolean) {
    this.root.classList.toggle("letterbox-on", on);
  }

  /* ---------------- toast ---------------- */

  memoryKept(label: string) {
    const el = $("toast");
    el.textContent = `✦ memory kept — ${label}`;
    el.classList.add("on");
    this.haptic("found");
    setTimeout(() => el.classList.remove("on"), 3400);
  }

  toast(text: string, ms = 2600) {
    const el = $("toast");
    el.textContent = text;
    el.classList.add("on");
    setTimeout(() => el.classList.remove("on"), ms);
  }

  /* ---------------- settings ---------------- */

  private settingsOpen = false;

  /** Wires the panel to the live Settings object. Called once at boot. */
  bindSettings(settings: {
    state: { master: number; music: number; effects: number; muted: boolean; reducedMotion: boolean };
    patch: (p: Partial<{ master: number; music: number; effects: number; muted: boolean; reducedMotion: boolean }>) => void;
  }) {
    const gear = $("gear");
    const panel = $("settings");
    const master = $("set-master") as HTMLInputElement;
    const music = $("set-music") as HTMLInputElement;
    const fx = $("set-fx") as HTMLInputElement;
    const mute = $("set-mute") as HTMLInputElement;
    const motion = $("set-motion") as HTMLInputElement;

    const sync = () => {
      master.value = String(Math.round(settings.state.master * 100));
      music.value = String(Math.round(settings.state.music * 100));
      fx.value = String(Math.round(settings.state.effects * 100));
      mute.checked = settings.state.muted;
      motion.checked = settings.state.reducedMotion;
    };
    sync();

    const open = () => {
      this.settingsOpen = true;
      sync();
      panel.classList.add("on");
    };
    const close = () => {
      this.settingsOpen = false;
      panel.classList.remove("on");
    };

    gear.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.settingsOpen ? close() : open();
    });
    $("set-close").addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      close();
    });
    panel.addEventListener("pointerdown", (e) => {
      if (e.target === panel) close();
    });

    master.addEventListener("input", () => settings.patch({ master: Number(master.value) / 100 }));
    music.addEventListener("input", () => settings.patch({ music: Number(music.value) / 100 }));
    fx.addEventListener("input", () => settings.patch({ effects: Number(fx.value) / 100 }));
    mute.addEventListener("change", () => settings.patch({ muted: mute.checked }));
    motion.addEventListener("change", () => settings.patch({ reducedMotion: motion.checked }));
  }

  /** Hidden during cinematics so nothing sits on top of the story. */
  showGear(on: boolean) {
    $("gear").classList.toggle("on", on);
    if (!on) $("settings").classList.remove("on");
  }

  /* ---------------- the wish ---------------- */

  /**
   * Opens the writing ritual. Resolves with her words once she chooses to
   * hide them — the caller seals them; this class never stores them.
   */
  composeWish(prefill = ""): Promise<string> {
    const wrap = $("wish");
    const ta = $("wish-text") as HTMLTextAreaElement;
    const send = $("wish-send") as HTMLButtonElement;
    // on a retry her words come back with her — they are never thrown away
    ta.value = prefill;
    wrap.classList.add("on");
    send.disabled = prefill.trim().length === 0;

    return new Promise((resolve) => {
      const check = () => {
        send.disabled = ta.value.trim().length === 0;
      };
      const submit = () => {
        const text = ta.value.trim();
        if (!text) return;
        ta.removeEventListener("input", check);
        send.removeEventListener("click", submit);
        ta.blur();
        // the words leave the screen before anything else happens
        wrap.classList.add("sending");
        setTimeout(() => {
          wrap.classList.remove("on");
          wrap.classList.remove("sending");
          ta.value = "";
          resolve(text);
        }, 900);
      };
      ta.addEventListener("input", check);
      send.addEventListener("click", submit);
      setTimeout(() => ta.focus(), 400);
    });
  }

  /** Particles rising out of the writing surface as it empties. */
  wishRising(): void {
    const wrap = $("wish");
    wrap.classList.add("rising");
    setTimeout(() => wrap.classList.remove("rising"), 2200);
  }

  /* ---------------- phone ---------------- */

  phoneThankYou(): Promise<void> {
    $("phone").classList.add("on");
    return new Promise((resolve) => {
      this.phoneResolve = resolve;
    });
  }

  private closePhone() {
    if (!this.phoneResolve) return;
    const r = this.phoneResolve;
    this.phoneResolve = null;
    r();
  }

  private phoneHide() {
    $("phone").classList.remove("on");
    this.closePhone();
  }
}
