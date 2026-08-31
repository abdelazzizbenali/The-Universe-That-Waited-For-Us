/* Awakening — the universe realising she has arrived.
   A deliberately slow, ordered chain: one bird, then another, a flower, a
   second flower, a tree, a spirit, another, animals, then the stars.

   Nothing here is loud. Almost all of it is visual — only a handful of lines
   are ever spoken, and they are spaced far apart. */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { AudioDirector } from "../audio/AudioDirector";

export interface AwakeningContext {
  scene: Phaser.Scene;
  audio: AudioDirector;
  /** Where she is standing — everything reacts relative to her. */
  focus: () => { x: number; y: number };
  worldW: number;
  worldH: number;
  /** Closed flowers placed by the scene, opened one by one. */
  flowers: Phaser.GameObjects.Image[];
  /** Trees that can sway toward her. */
  trees: Phaser.GameObjects.Image[];
  say: (line: string) => Promise<void>;
}

export class Awakening {
  private step = 0;
  private timer: Phaser.Time.TimerEvent | null = null;
  private spawned: Phaser.GameObjects.GameObject[] = [];

  constructor(private ctx: AwakeningContext) {}

  /** Runs the whole cascade. Resolves when the world is fully awake. */
  run(): Promise<void> {
    const steps: (() => void | Promise<void>)[] = [
      () => this.firstBird(),
      () => this.secondBird(),
      () => this.openFlower(0),
      () => this.line("She's here."),
      () => this.openFlower(1),
      () => this.treeMoves(),
      () => this.spirit(0),
      () => this.line("She's finally here."),
      () => this.spirit(1),
      () => this.animal(0),
      () => this.animal(1),
      () => this.line("We've been waiting."),
      () => this.firstStar(),
      () => this.starCascade(),
      () => this.line("Not for one soul."),
      () => this.fullLife(),
      () => this.line("For both."),
    ];

    return new Promise((resolve) => {
      const next = async () => {
        if (this.step >= steps.length) {
          resolve();
          return;
        }
        const fn = steps[this.step++];
        await fn();
        // the pauses are the point — the world thinks before it reacts
        const gap = 1500 + Math.random() * 900;
        this.timer = this.ctx.scene.time.delayedCall(gap, () => void next());
      };
      void next();
    });
  }

  private line(text: string) {
    return this.ctx.say(text);
  }

  /* ---------------- steps ---------------- */

  private firstBird() {
    const { scene, worldH, worldW } = this.ctx;
    const f = this.ctx.focus();
    // a far bird, small and distant — the world reacting at a distance,
    // not something spawning on top of her
    const bird = scene.add
      .image(Math.min(worldW - 60, f.x + worldW * 0.42), worldH * 0.3, "bird")
      .setAlpha(0)
      .setScale(0.42)
      .setDepth(DEPTH.midHills);
    this.spawned.push(bird);
    // it lands, and it looks at her
    scene.tweens.add({ targets: bird, alpha: 0.9, duration: 1400 });
    scene.time.delayedCall(1600, () => {
      scene.tweens.add({ targets: bird, scaleX: -0.7, duration: 400 });
      this.ctx.audio.softTick();
    });
    // then it goes to tell the rest of the world
    scene.time.delayedCall(2800, () => {
      scene.tweens.add({ targets: bird, scaleY: 0.26, duration: 260, yoyo: true, repeat: -1 });
      scene.tweens.add({
        targets: bird,
        x: Math.min(worldW, bird.x + worldW * 0.3),
        y: worldH * 0.14,
        alpha: 0.45,
        duration: 5200,
        ease: "Sine.easeIn",
      });
    });
  }

  private secondBird() {
    const { scene, worldH } = this.ctx;
    const f = this.ctx.focus();
    const bird = scene.add
      .image(f.x - 320, worldH * 0.34, "bird")
      .setAlpha(0.7)
      .setScale(0.6)
      .setDepth(DEPTH.world);
    this.spawned.push(bird);
    scene.tweens.add({ targets: bird, scaleY: 0.35, duration: 280, yoyo: true, repeat: -1 });
    scene.tweens.add({
      targets: bird,
      x: bird.x + 900,
      y: worldH * 0.2,
      duration: 5200,
      ease: "Sine.easeInOut",
    });
    this.ctx.audio.softTick();
  }

  private openFlower(i: number) {
    const f = this.ctx.focus();
    // nearest closed flower first
    const closed = this.ctx.flowers
      .filter((fl) => !fl.getData("open"))
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(a.x, a.y, f.x, f.y) -
          Phaser.Math.Distance.Between(b.x, b.y, f.x, f.y)
      );
    const target = closed[0];
    if (!target) return;
    target.setData("open", true);
    target.setTexture(target.getData("mint") ? "flower-open-mint" : "flower-open");
    this.ctx.scene.tweens.add({
      targets: target,
      scale: { from: 0.5, to: 0.95 },
      duration: 1400,
      ease: "Back.easeOut",
    });
    this.ctx.audio.tone(660 + i * 110, 0.02, 1.4);
  }

  private treeMoves() {
    const f = this.ctx.focus();
    const tree = this.ctx.trees
      .slice()
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(a.x, a.y, f.x, f.y) -
          Phaser.Math.Distance.Between(b.x, b.y, f.x, f.y)
      )[0];
    if (!tree) return;
    this.ctx.scene.tweens.add({
      targets: tree,
      angle: { from: 0, to: f.x > tree.x ? 2.4 : -2.4 },
      duration: 2200,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
    this.ctx.audio.tone(220, 0.02, 2);
  }

  private spirit(i: number) {
    const { scene, worldH } = this.ctx;
    const f = this.ctx.focus();
    const x = f.x + (i === 0 ? -170 : 210);
    const y = worldH * (i === 0 ? 0.6 : 0.55);
    const s = scene.add
      .image(x, y, "spirit")
      .setAlpha(0)
      .setScale(0.5)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH.world + 1);
    this.spawned.push(s);
    scene.tweens.add({ targets: s, alpha: 0.75, scale: 0.9, duration: 1600, ease: "Sine.easeOut" });
    scene.tweens.add({
      targets: s,
      y: y - 14,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.ctx.audio.tone(880 + i * 120, 0.016, 1.6);
  }

  private animal(i: number) {
    const { scene, worldH } = this.ctx;
    const f = this.ctx.focus();
    const x = f.x + (i === 0 ? 300 : -280);
    const y = worldH * 0.78;
    // a small curious shape — deliberately simple, more presence than detail
    const g = scene.add.graphics();
    g.fillStyle(0x1c2a4e, 1);
    g.fillEllipse(0, 0, 34, 22);
    g.fillCircle(i === 0 ? 16 : -16, -12, 9);
    g.fillStyle(0x9fe3c9, 0.85);
    g.fillCircle(i === 0 ? 19 : -19, -13, 2);
    const c = scene.add.container(x, y, [g]).setDepth(DEPTH.world).setAlpha(0);
    this.spawned.push(c);
    scene.tweens.add({ targets: c, alpha: 1, duration: 1400 });
    scene.tweens.add({
      targets: c,
      x: x + (i === 0 ? -90 : 80),
      duration: 4200,
      ease: "Sine.easeInOut",
    });
    this.ctx.audio.softTick();
  }

  private firstStar() {
    const { scene, worldW, worldH } = this.ctx;
    const s = scene.add
      .image(worldW * 0.5, worldH * 0.14, "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0)
      .setDepth(DEPTH.sky + 1);
    this.spawned.push(s);
    scene.tweens.add({ targets: s, scale: 1.4, duration: 1800, ease: "Back.easeOut" });
    scene.tweens.add({
      targets: s,
      alpha: 0.5,
      duration: 2200,
      delay: 1800,
      yoyo: true,
      repeat: -1,
    });
    this.ctx.audio.starIgnite();
  }

  private starCascade() {
    const { scene, worldW, worldH, audio } = this.ctx;
    for (let i = 0; i < 46; i++) {
      scene.time.delayedCall(i * 120, () => {
        const s = scene.add
          .image(Math.random() * worldW, Math.random() * worldH * 0.5, "star")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(0)
          .setDepth(DEPTH.sky + 1);
        this.spawned.push(s);
        scene.tweens.add({
          targets: s,
          scale: Phaser.Math.FloatBetween(0.3, 0.85),
          alpha: Phaser.Math.FloatBetween(0.5, 1),
          duration: 900,
          ease: "Back.easeOut",
        });
        scene.tweens.add({
          targets: s,
          alpha: 0.3,
          duration: 1800 + i * 30,
          delay: 900,
          yoyo: true,
          repeat: -1,
        });
        if (i % 9 === 0) audio.starIgnite();
      });
    }
  }

  private fullLife() {
    const { scene, worldW, worldH } = this.ctx;
    // everything still closed now opens
    for (const fl of this.ctx.flowers) {
      if (fl.getData("open")) continue;
      const delay = Phaser.Math.Between(0, 2600);
      scene.time.delayedCall(delay, () => {
        fl.setData("open", true);
        fl.setTexture(fl.getData("mint") ? "flower-open-mint" : "flower-open");
        scene.tweens.add({ targets: fl, scale: { from: 0.55, to: 0.95 }, duration: 1100, ease: "Back.easeOut" });
      });
    }
    // the air fills with drifting light
    for (let i = 0; i < 30; i++) {
      scene.time.delayedCall(i * 130, () => {
        const m = scene.add
          .image(Math.random() * worldW, worldH * Phaser.Math.FloatBetween(0.5, 0.95), "mote")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint([0x93dcbb, 0xf4dca8, 0x9fe3c9][i % 3])
          .setScale(Phaser.Math.FloatBetween(0.6, 1.3))
          .setAlpha(0)
          .setDepth(DEPTH.fx);
        this.spawned.push(m);
        scene.tweens.add({ targets: m, alpha: 0.6, duration: 1400 });
        scene.tweens.add({
          targets: m,
          y: m.y - Phaser.Math.Between(160, 320),
          duration: Phaser.Math.Between(9000, 15000),
          repeat: -1,
        });
      });
    }
  }

  destroy() {
    this.timer?.remove();
    this.timer = null;
    this.spawned = [];
  }
}
