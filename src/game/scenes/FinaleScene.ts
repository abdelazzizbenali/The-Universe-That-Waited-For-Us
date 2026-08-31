/* THE FINALE — the universe that waited.

   She enters a quiet, unfinished place alone. The world slowly notices her.
   Then it wakes, in order, and begins to celebrate. Far away, a small blue
   light is standing still. The only instruction she is ever given is:

       WALK TO HIM.

   The walk is long on purpose, and passes the whole story on the way. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { Awakening } from "../systems/world/Awakening";
import { HandHoldController } from "../systems/hands/HandHoldController";
import { DEPTH, MEMORY_IDS } from "../config";
import { addFog, addRidges, addTerrain } from "../art/environment";
import { FINALE_AWAKE_MOOD } from "../art/SceneArt";

interface Echo {
  x: number;
  label: string;
  build: (x: number, y: number) => Phaser.GameObjects.GameObject[];
  fired: boolean;
  objs: Phaser.GameObjects.GameObject[];
}

export default class FinaleScene extends BaseScene {
  private him!: Companion;
  private awakening!: Awakening;
  private hands: HandHoldController | null = null;
  private flowers: Phaser.GameObjects.Image[] = [];
  private trees: Phaser.GameObjects.Image[] = [];
  private echoes: Echo[] = [];
  private voices: { at: number; text: string; said: boolean }[] = [];
  private ww = 0;
  private hh = 0;
  private phase: "quiet" | "waking" | "walk" | "meeting" | "held" = "quiet";
  private hisX = 0;
  private lastGrade = 0;
  private cold!: Phaser.GameObjects.Image;
  private warm!: Phaser.GameObjects.Image;
  private startX = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);
    const ww = (this.ww = Math.floor(w * 6.2)); // the longest world in the game
    this.hisX = ww * 0.94;
    this.startX = ww * 0.05;

    // dim, sparse, slightly cold — a place that is not finished yet
    this.skyRect(0x05070f, 0x0a1024, ww, h);
    // layered sky so the world has depth to wake into
    addRidges(this, ww, h * 0.56);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x070c1c, 1);
    g.fillEllipse(ww * 0.5, h * 1.3, ww * 1.2, h * 0.86);
    g.fillStyle(0x0a1128, 1);
    g.fillRoundedRect(0, h * 0.72, ww, h * 0.12, 24);
    addTerrain(this, ww, h * 0.76, h * 0.14, 0.7);

    // a few distant stars. very few.
    this.world.addStars(26, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.45));
    addFog(this, ww, h * 0.5, h * 0.72, 3, 0x6f86b8);

    // trees along the way — still for now
    for (let i = 0; i < 9; i++) {
      const tx = ww * (0.1 + i * 0.095);
      const tg = this.add.graphics();
      tg.fillStyle(0x0c1530, 1);
      tg.fillRect(-4, 0, 8, h * 0.16);
      tg.fillStyle(0x101c3a, 1);
      tg.fillEllipse(0, -h * 0.03, 90, 60);
      const tex = `finale-tree-${i}`;
      tg.generateTexture(tex, 120, h * 0.24);
      tg.destroy();
      const tree = this.add
        .image(tx, h * 0.66, tex)
        .setOrigin(0.5, 0.72)
        .setDepth(DEPTH.world - 1);
      this.trees.push(tree);
    }

    // closed flowers, waiting
    const pts: { x: number; y: number; mint?: boolean }[] = [];
    for (let i = 0; i < 34; i++) {
      pts.push({ x: ww * (0.06 + i * 0.027), y: h * (0.82 + (i % 3) * 0.05), mint: i % 3 === 0 });
    }
    this.flowers = this.world.addFlowers(pts);

    // grade overlays: cold now, warm later
    this.cold = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setTint(0x1b2a52)
      .setAlpha(0.55)
      .setDepth(DEPTH.overlay - 3);
    this.warm = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.4, h * 1.4)
      .setTint(0x93dcbb)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 2);

    // him — far away, small, still, waiting
    this.him = new Companion(this, this.hisX, h * 0.7);
    this.him.setState("seated");
    this.him.soul.setIntensity(0.55);
    this.him.soul.container.setVisible(false);

    this.player = new Player(this, this.startX, h * 0.76);
    this.player.speed = 176;
    // she can wander while the world wakes, but the road only opens when the
    // universe has finished noticing her — otherwise the walk gets skipped
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.68, ww * 0.14, h * 0.2);
    this.player.setFrozen(true);
    this.rig.follow(this.player.soul.container, 0.06, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.buildEchoes();

    this.voices = [
      { at: 0.2, text: "They looked.", said: false },
      { at: 0.36, text: "They waited.", said: false },
      { at: 0.52, text: "They stayed.", said: false },
      { at: 0.68, text: "They cared.", said: false },
      { at: 0.84, text: "They found each other.", said: false },
    ];

    this.audio.playBed("vision-space");
    this.audio.duckAmbience(0.25, 1);
    // the last stretch has no interactables at all — only walking
    this.uiLocked = true;
    void this.open();
  }

  /* ---------------- the story, standing along the road ---------------- */

  private buildEchoes() {
    const ww = this.ww;
    const mk = (
      x: number,
      label: string,
      build: (x: number, y: number) => Phaser.GameObjects.GameObject[]
    ) => this.echoes.push({ x: ww * x, label, build, fired: false, objs: [] });

    const softShape = (x: number, y: number, w: number, hgt: number, tint: number, round = 8) => {
      const g = this.add.graphics().setDepth(DEPTH.back + 1).setAlpha(0);
      g.fillStyle(tint, 0.28);
      g.fillRoundedRect(x - w / 2, y - hgt, w, hgt, round);
      return g;
    };
    const glow = (x: number, y: number, tint: number, sx = 3, sy = 3) =>
      this.add
        .image(x, y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tint)
        .setScale(sx, sy)
        .setAlpha(0)
        .setDepth(DEPTH.light);

    // a bus, shaped out of light
    mk(0.14, "bus", (x, y) => [softShape(x, y, 210, 90, 0x2b3a70, 14), glow(x + 70, y - 60, 0xbfd9ff, 4, 2)]);
    // a small lit seat
    mk(0.22, "seat", (x, y) => [softShape(x, y, 70, 46, 0x3a5896, 8), glow(x, y - 30, 0x7fc4ff, 3, 3)]);
    // the library
    mk(0.32, "library", (x, y) => [
      softShape(x, y, 300, 190, 0x243a6e, 10),
      glow(x - 70, y - 110, 0xf4e3c0, 4, 5),
      glow(x + 70, y - 110, 0xf4e3c0, 4, 5),
    ]);
    // a bottle
    mk(0.4, "bottle", (x, y) => [softShape(x, y, 16, 42, 0x9fe3c9, 6), glow(x, y - 24, 0x9fe3c9, 2, 3)]);
    // the camera
    mk(0.47, "camera", (x, y) => [softShape(x, y, 74, 50, 0x2b3a70, 8), glow(x, y - 26, 0xeaf2ff, 2.4, 2.4)]);
    // blue and green fragments
    mk(0.55, "colors", (x, y) => [glow(x - 30, y - 40, 0x7fc4ff, 3, 3), glow(x + 30, y - 30, 0x9aab62, 3, 3)]);
    // the bouquet
    mk(0.63, "bouquet", (x, y) => [glow(x, y - 34, 0xf2b8c6, 4, 4), glow(x - 18, y - 22, 0xf4dca8, 2.4, 2.4)]);
    // the quiet road
    mk(0.71, "road", (x, y) => [softShape(x, y, 260, 8, 0x3a4f8f, 4), glow(x, y - 40, 0xe0b36a, 5, 3)]);
    // a fragment of the constellation, hanging low
    mk(0.79, "stars", (x, y) => {
      const objs: Phaser.GameObjects.GameObject[] = [];
      for (let i = 0; i < 5; i++) {
        const s = this.add
          .image(x + (i - 2) * 34, y - 120 + Math.sin(i) * 26, "star")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(0.5)
          .setAlpha(0)
          .setDepth(DEPTH.light);
        objs.push(s);
      }
      return objs;
    });
    // the hill where it all started
    mk(0.87, "hill", (x, y) => [softShape(x, y, 420, 130, 0x101c3a, 60), glow(x, y - 150, 0xd6eeff, 3, 3)]);
  }

  /* ---------------- opening ---------------- */

  private async open() {
    this.ui.setHint(null);

    // Coming back later: the world is already awake and has no reason to
    // introduce itself again. She just walks in, and he is already there.
    if (this.isReplay) {
      await this.wakeWorldInstantly();
      await new Promise((r) => this.time.delayedCall(1200, r));
      await this.ui.say([{ text: "It kept everything exactly where she left it.", kind: "whisper" }]);
      this.p.bounds = new Phaser.Geom.Rectangle(
        this.ww * 0.03,
        this.hh * 0.68,
        this.ww * 0.94,
        this.hh * 0.2
      );
      this.him.soul.container.setVisible(true);
      this.phase = "walk";
      this.p.setFrozen(false);
      this.ui.setHint("he's still there");
      return;
    }

    await new Promise((r) => this.time.delayedCall(2600, r));
    await this.ui.say([
      { text: "She had never been here before.", kind: "whisper" },
      { text: "It was quiet in the way a room is quiet before anyone speaks." },
    ]);

    this.p.setFrozen(false);
    this.ui.setHint("look around");
    this.phase = "waking";

    // the world begins to notice her
    this.awakening = new Awakening({
      scene: this,
      audio: this.audio,
      focus: () => ({ x: this.p.pos.x, y: this.p.pos.y }),
      worldW: this.ww,
      worldH: this.hh,
      flowers: this.flowers,
      trees: this.trees,
      say: async (text) => {
        await this.ui.say([{ text, kind: "whisper" }]);
      },
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.awakening.destroy());

    await this.awakening.run();
    await this.revealHim();
  }

  /** For return visits: the universe is simply already alive. */
  private async wakeWorldInstantly() {
    for (const f of this.flowers) this.world.openFlower(f);
    this.world.addStars(
      this.settings.particles(70),
      new Phaser.Geom.Rectangle(0, 0, this.ww, this.hh * 0.5)
    );
    if (!this.settings.reducedMotion) this.world.startBirds(7000);
    this.world.addSpirits([
      { x: this.ww * 0.25, y: this.hh * 0.6 },
      { x: this.ww * 0.55, y: this.hh * 0.56 },
      { x: this.ww * 0.8, y: this.hh * 0.62 },
    ]);
    this.tweens.add({ targets: this.cold, alpha: 0.1, duration: 2000 });
    this.tweens.add({ targets: this.warm, alpha: 0.18, duration: 2000 });
    this.colors.setStage(7);
    this.audio.startMotif("warm");
    await new Promise((r) => this.time.delayedCall(600, r));
  }

  /** He appears, very small, very far, perfectly still. */
  private async revealHim() {
    this.audio.startMotif("airy");
    // the painted world itself wakes: the cold veil lifts and OUR COLOR
    // begins to live in the light rather than only in the two of them
    this.backdrop?.grade(FINALE_AWAKE_MOOD, 6000);
    this.him.soul.container.setVisible(true);
    this.him.soul.setIntensity(0.4);

    // the camera notices him before she does
    this.rig.focusPull(this.hisX - 60, this.hh * 0.68, 1, 2600);
    await new Promise((r) => this.time.delayedCall(3000, r));
    this.rig.release(1, 2200);
    await new Promise((r) => this.time.delayedCall(2400, r));

    this.phase = "walk";
    // the whole world opens up now
    this.p.bounds = new Phaser.Geom.Rectangle(
      this.ww * 0.03,
      this.hh * 0.68,
      this.ww * 0.94,
      this.hh * 0.2
    );
    await this.ui.card("Walk to <em>him</em>", "", 2600);
    this.ui.setHint(null);
  }

  /* ---------------- the walk ---------------- */

  protected tick(dt: number, t: number) {
    this.him.update(dt, t, this.p.pos, this.colors);
    if (this.phase === "walk" || this.phase === "meeting") {
      this.him.soul.lookAt(this.p.pos.x, this.p.pos.y);
      this.p.soul.lookAt(this.him.x, this.him.y);
    }

    if (this.phase !== "walk") {
      if (this.phase === "meeting" && this.hands) {
        this.hands.update(dt, this.p.pos, { x: this.him.x, y: this.him.y }, this.p.isMoving);
      }
      return;
    }

    const progress = Phaser.Math.Clamp(
      (this.p.pos.x - this.startX) / (this.hisX - this.startX),
      0,
      1
    );

    // the world warms as she goes — and so does the painting behind it
    this.cold.setAlpha(0.55 - progress * 0.45);
    this.warm.setAlpha(progress * 0.16);
    if (progress - this.lastGrade > 0.2) {
      this.lastGrade = progress;
      this.backdrop?.grade(
        { darken: 0.14 - progress * 0.08, wash: 0.08 + progress * 0.1 },
        2400
      );
    }
    this.him.soul.setIntensity(0.4 + progress * 1.1);
    this.p.soul.setIntensity(1 + progress * 0.35);
    this.p.soul.setWarmth(progress * 0.5);

    // their colours start reaching for each other from a distance
    this.colors.setStage(progress > 0.75 ? 7 : 6);

    // memories standing along the road, lighting as she passes
    for (const e of this.echoes) {
      if (e.fired) continue;
      if (Math.abs(this.p.pos.x - e.x) < this.scale.width * 0.55) {
        e.fired = true;
        e.objs = e.build(e.x, this.hh * 0.68);
        for (const o of e.objs) {
          this.tweens.add({
            targets: o,
            alpha: o instanceof Phaser.GameObjects.Image ? 0.55 : 1,
            duration: 2400,
            ease: "Sine.easeOut",
          });
        }
      }
    }

    // five lines, very far apart
    for (const v of this.voices) {
      if (!v.said && progress >= v.at) {
        v.said = true;
        void this.ui.say([{ text: v.text, kind: "whisper" }]);
      }
    }

    // as she gets close, the music takes layers away instead of adding them
    if (progress > 0.8) {
      this.audio.duckAmbience(Math.max(0.12, 1 - (progress - 0.8) * 4), 1.2);
      if (progress > 0.9) this.audio.stopMotif();
    }

    if (progress > 0.965 && this.phase === "walk") void this.meeting();
  }

  /* ---------------- the meeting ---------------- */

  private async meeting() {
    this.phase = "meeting";
    this.ui.setHint(null);
    this.audio.stopMotif();
    this.audio.duckAmbience(0.1, 2.4);

    this.rig.focusPull((this.p.pos.x + this.him.x) / 2, this.hh * 0.66, 1.18, 3000);
    this.him.soul.setIntensity(1.5);
    this.p.soul.setIntensity(1.45);

    await new Promise((r) => this.time.delayedCall(2600, r));

    // no prompt this time. she already knows what to do.
    this.hands = new HandHoldController(this, this.ui, this.audio, {
      contactDistance: 40,
      hideHud: true,
      her: this.p.soul,
      him: this.him.soul,
    });
    this.hands.onContact(() => void this.contact());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.hands?.destroy());
    this.hands.beginReach();
    this.p.setFrozen(false);
  }

  /** Hands meet. The universe stops. */
  private async contact() {
    this.phase = "held";
    this.p.setFrozen(true);
    this.uiLocked = true;
    this.ui.setAction(null);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    // everything goes quiet
    this.audio.stopAllBeds(3);
    this.audio.startIntimacy();
    // the world slows — birds, particles, drifting light — without slowing
    // the scene's own pacing timers
    this.tweens.timeScale = 0.55;
    this.tweens.add({ targets: this.cold, alpha: 0.05, duration: 3000 });
    this.tweens.add({ targets: this.warm, alpha: 0.3, duration: 3000 });

    const mx = (this.p.pos.x + this.him.x) / 2;
    const my = (this.p.pos.y + this.him.y) / 2;
    this.rig.focusPull(mx, my - 6, 1.34, 3600);

    // OUR COLOR, fully
    this.colors.setStage(7);
    this.saves.setColorStage(7);
    const bloom = this.add
      .image(mx, my, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.2)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: bloom, alpha: 0.55, scale: 2, duration: 3400, ease: "Sine.easeOut" });

    // the stars come down to gather around them
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const r = 190 + Math.random() * 120;
      const s = this.add
        .image(mx + Math.cos(a) * r, my + Math.sin(a) * r * 0.6, "star")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.4)
        .setAlpha(0)
        .setDepth(DEPTH.fx);
      this.tweens.add({ targets: s, alpha: 0.9, duration: 1400, delay: i * 70 });
      this.tweens.add({
        targets: s,
        x: mx + Math.cos(a) * (r * 0.45),
        y: my + Math.sin(a) * (r * 0.28),
        duration: 4200,
        delay: i * 70,
        ease: "Sine.easeInOut",
      });
    }

    await new Promise((r) => this.time.delayedCall(5200, r));
    await this.ui.say([
      { text: "Neither of them said anything for a while." },
      { text: "There was nothing that needed saying yet.", kind: "whisper" },
    ]);

    this.saves.patch({ reunited: true });
    this.keepMemory(MEMORY_IDS.reunion);
    this.saves.checkpoint("RevealScene");

    // and then it starts moving again
    this.tweens.timeScale = 1;
    this.audio.stopIntimacy();
    await new Promise((r) => this.time.delayedCall(1200, r));
    this.transitionTo("RevealScene", { fadeMs: 2200 });
  }
}
