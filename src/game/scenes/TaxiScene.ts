/* Scene 5 — TAXI / JOURNEY. No driving game: a quiet cinematic of window
   light, then a dusk road to the library. During the walk, his offset drifts
   from behind her to beside her — following becomes walking together. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

export default class TaxiScene extends BaseScene {
  private companion!: Companion;
  private phase: "a" | "b" = "a";
  private lamps: { x: number; glow: Phaser.GameObjects.Image }[] = [];
  private upgradeStarted = false;
  private narrated = false;
  private worldW = 0;
  private hh = 0;
  private streakTimer: Phaser.Time.TimerEvent | null = null;
  private phaseAObjects: Phaser.GameObjects.GameObject[] = [];

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);
    const ww = (this.worldW = Math.floor(w * 2.2));
    const inX = -1500; // interior cinematic anchor, off to the west of the road

    /* ---------------- phase A — the taxi ---------------- */
    const bg = this.add.graphics().setDepth(DEPTH.back);
    bg.fillStyle(0x080d20, 1);
    bg.fillRect(inX - 900, -200, 1800, h + 400);
    bg.fillStyle(0x101a38, 1);
    bg.fillRoundedRect(inX - w * 0.42, h * 0.14, w * 0.84, h * 0.3, 18);
    bg.fillStyle(0x24386e, 0.9);
    bg.fillRoundedRect(inX - w * 0.38, h * 0.17, w * 0.76, h * 0.24, 12);
    this.phaseAObjects.push(bg);

    // passing town lights
    this.streakTimer = this.time.addEvent({
      delay: 240,
      loop: true,
      callback: () => {
        if (this.phase !== "a") return;
        const s = this.add
          .image(inX + w * 0.5, h * Phaser.Math.FloatBetween(0.18, 0.38), "mote")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(Math.random() > 0.5 ? 0xd6eeff : 0xe0b36a)
          .setAlpha(0.5)
          .setScale(Phaser.Math.FloatBetween(10, 26), 4)
          .setDepth(DEPTH.back + 1);
        this.phaseAObjects.push(s);
        this.tweens.add({
          targets: s,
          x: inX - w * 0.6,
          alpha: 0,
          duration: Phaser.Math.Between(900, 1500),
          onComplete: () => s.destroy(),
        });
      },
    });

    // seated together in the dim
    this.player = new Player(this, inX - 26, h * 0.68);
    this.player.setFrozen(true);
    this.companion = new Companion(this, inX + 30, h * 0.68);
    this.companion.setState("seated");

    this.cameras.main.centerOn(inX, h * 0.55);
    this.ui.letterbox(true);
    this.audio.playBed("road-dusk");

    this.time.delayedCall(2600, () => {
      void this.ui.say([{ text: "He asked her to come. She came.", kind: "whisper" }]);
    });
    this.time.delayedCall(7400, () => this.beginWalk());

    /* ---------------- phase B — the road ----------------- */
    this.skyRect(0x0a1030, 0x1c2b56, ww + 0, h).setX(0);
    // warm horizon glow behind the city line
    const horizon = this.add
      .image(ww * 0.5, h * 0.42, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe0b36a)
      .setScale(ww / 9, 30)
      .setAlpha(0.1)
      .setDepth(DEPTH.back);
    horizon.setDepth(DEPTH.back);

    // city silhouettes
    const city = this.add.graphics().setDepth(DEPTH.back);
    city.fillStyle(0x0d1738, 1);
    let cx = 0;
    while (cx < ww) {
      const bw = Phaser.Math.Between(90, 220);
      const bh = h * Phaser.Math.FloatBetween(0.1, 0.22);
      city.fillRect(cx, h * 0.42 - bh, bw, bh);
      for (let wy = 0; wy < 3; wy++) {
        if (Math.random() > 0.6) {
          city.fillStyle(0x3d5f9e, 0.8);
          city.fillRect(cx + Phaser.Math.Between(10, bw - 16), h * 0.42 - bh + 8 + wy * 16, 6, 8);
          city.fillStyle(0x0d1738, 1);
        }
      }
      cx += bw + Phaser.Math.Between(30, 90);
    }
    // ground road
    const road = this.add.graphics().setDepth(DEPTH.ground);
    road.fillStyle(0x0c1330, 1);
    road.fillRect(0, h * 0.42, ww, h * 0.58);
    road.fillStyle(0x111c40, 1);
    road.fillRoundedRect(0, h * 0.62, ww, h * 0.2, 16);

    // pathway lamps — the road lights around them
    for (let i = 1; i <= 7; i++) {
      const lx = (ww / 8.4) * i;
      const lam = this.add.graphics().setDepth(DEPTH.world);
      lam.fillStyle(0x1a2444, 1);
      lam.fillRect(lx - 2, h * 0.44, 4, h * 0.3);
      lam.fillStyle(0x2c3c6e, 1);
      lam.fillRoundedRect(lx - 8, h * 0.42, 16, 8, 4);
      const glow = this.add
        .image(lx, h * 0.46, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xe0b36a)
        .setScale(52, 26)
        .setAlpha(0.08)
        .setDepth(DEPTH.light);
      this.lamps.push({ x: lx, glow });
    }

    // the library — a lit door at the end of the road
    const lib = this.add.graphics().setDepth(DEPTH.world);
    const lx = ww - 330;
    lib.fillStyle(0x0f1a3e, 1);
    lib.fillRect(lx, h * 0.2, 260, h * 0.52);
    lib.fillStyle(0x2c4a8a, 0.9);
    lib.fillRect(lx + 30, h * 0.3, 30, 44);
    lib.fillRect(lx + 76, h * 0.3, 30, 44);
    lib.fillStyle(0x17305f, 1);
    lib.fillRect(lx + 160, h * 0.5, 56, h * 0.22);
    const doorGlow = this.add
      .image(lx + 188, h * 0.6, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf4dca8)
      .setScale(34, 30)
      .setAlpha(0.35)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: doorGlow, alpha: 0.6, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const shaft = this.add
      .image(lx + 188, h * 0.55, "shaft")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.3)
      .setScale(0.8, 0.9)
      .setDepth(DEPTH.light);

    this.world.addStars(12, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.3));
    this.world.addFlowers([
      { x: ww * 0.2, y: h * 0.86, open: true, mint: true },
      { x: ww * 0.52, y: h * 0.88 },
      { x: ww * 0.83, y: h * 0.85, open: true },
    ]);

    this.interactables.push({
      id: "library-door",
      x: lx + 188,
      y: h * 0.68,
      r: 95,
      label: "enter the library",
      when: () => this.phase === "b",
      once: true,
      onUse: () => void this.arrive(),
    });
    void shaft;
  }

  private beginWalk() {
    if (this.phase === "b") return;
    this.phase = "b";
    this.streakTimer?.remove();
    this.cameras.main.fadeOut(650, 7, 11, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      for (const o of this.phaseAObjects) {
        const go = o as Phaser.GameObjects.Image;
        if (go && go.active) go.setAlpha(0);
      }
      const h = this.hh;
      this.p.setFrozen(false);
      this.p.pos.set(90, h * 0.72);
      this.companion.pos.set(40, h * 0.75);
      this.companion.setState("follow");
      this.ui.letterbox(false);
      this.rig.follow(this.p.soul.container, 0.08, 1);
      this.rig.setBounds(0, 0, this.worldW, h);
      this.p.bounds = new Phaser.Geom.Rectangle(40, h * 0.6, this.worldW - 90, h * 0.32);
      this.cameras.main.fadeIn(650, 7, 11, 26);
      this.ui.setHint("walk toward the light");
    });
  }

  protected tick(dt: number, t: number) {
    // lamps breathe awake as she comes near
    for (const l of this.lamps) {
      const d = Math.abs(this.p.pos.x - l.x);
      const target = Phaser.Math.Clamp(0.65 - d / (this.scale.width * 0.55), 0.08, 0.6);
      l.glow.setAlpha(Phaser.Math.Linear(l.glow.alpha, target, Math.min(1, dt * 3)));
    }

    if (this.phase !== "b") {
      this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
      this.companion.update(dt, t, this.p.pos, this.colors);
      return;
    }

    // the journey changes how they walk
    if (!this.upgradeStarted && this.p.pos.x > this.worldW * 0.42) {
      this.upgradeStarted = true;
      this.companion.beginBesideUpgrade();
    }
    if (!this.narrated && this.p.pos.x > this.worldW * 0.7) {
      this.narrated = true;
      void this.ui.say([
        { text: "From that day on, they did not walk one behind the other." },
        { text: "They walked beside." },
      ]);
    }
    this.companion.update(dt, t, this.p.pos, this.colors);
  }

  private async arrive() {
    this.p.setFrozen(true);
    this.companion.setState("beside");
    this.saves.patch({ companionBeside: true });
    this.keepMemory(MEMORY_IDS.side);
    await new Promise((r) => this.time.delayedCall(900, r));
    this.saves.checkpoint("LibraryScene");
    this.transitionTo("LibraryScene");
  }
}
