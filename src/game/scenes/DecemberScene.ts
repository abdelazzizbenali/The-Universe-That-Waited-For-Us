/* Memory 11 — DECEMBER 15, 2025.
   The first time they both said it. This is the hinge of the whole story:
   the world stops, the two souls face each other, and OUR COLOR appears for
   the first time — made of blue and of hazel's brown, green and gold, and
   identical to neither.

   "I love you." is a known, historical phrase. It is used exactly. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { flashConstellation } from "../systems/constellation/Constellation";
import { DEPTH, MEMORY_IDS } from "../config";

export default class DecemberScene extends BaseScene {
  private companion!: Companion;
  private ring!: Phaser.GameObjects.Image;
  private snow: Phaser.GameObjects.Image[] = [];
  private started = false;
  private crossed = false;
  private hh = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);

    this.skyRect(0x080d24, 0x16224a, w, h);
    this.world.addStars(46, new Phaser.Geom.Rectangle(0, 0, w, h * 0.55));

    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0b1230, 1);
    g.fillEllipse(w * 0.5, h * 1.22, w * 1.5, h * 0.66);
    g.fillStyle(0x101a3e, 0.9);
    g.fillEllipse(w * 0.5, h * 0.82, w * 0.7, h * 0.14);

    this.world.addFlowers([
      { x: w * 0.22, y: h * 0.88, open: true, mint: true },
      { x: w * 0.78, y: h * 0.88, open: true },
    ]);

    // winter air
    for (let i = 0; i < 40; i++) {
      const s = this.add
        .image(Math.random() * w, Math.random() * h, "dust")
        .setTint(0xdce9ff)
        .setAlpha(Phaser.Math.FloatBetween(0.15, 0.5))
        .setScale(Phaser.Math.FloatBetween(0.5, 1.3))
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH.world);
      this.snow.push(s);
    }

    this.companion = new Companion(this, w * 0.72, h * 0.6);
    this.companion.setState("seated"); // he waits, facing her
    this.companion.soul.setIntensity(1.1);

    this.player = new Player(this, w * 0.2, h * 0.72);
    this.player.speed = 150;
    this.player.bounds = new Phaser.Geom.Rectangle(w * 0.08, h * 0.5, w * 0.84, h * 0.36);
    this.player.setFrozen(true);
    this.rig.follow(this.player.soul.container, 0.07, 1.02);

    // the threshold — cross it and the world stops
    this.ring = this.add
      .image(this.companion.x, this.companion.y, "seat-glow")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDisplaySize(300, 300)
      .setAlpha(0.16)
      .setDepth(DEPTH.aura - 1);
    this.tweens.add({ targets: this.ring, alpha: 0.3, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.audio.playBed("night-wind");
    void this.open();
  }

  private async open() {
    await this.ui.card("15.12.2025", "", 3400);
    this.started = true;
    this.p.setFrozen(false);
    this.ui.setHint("go to him");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    this.p.soul.lookAt(this.companion.x, this.companion.y);

    for (let i = 0; i < this.snow.length; i++) {
      const s = this.snow[i];
      s.y += (6 + (i % 5) * 2) * dt;
      s.x += Math.sin(t * 0.4 + i) * 4 * dt;
      if (s.y > this.hh) s.y = -8;
    }

    if (!this.started || this.crossed) return;
    if (this.companion.distanceToPlayer(this.p.pos) < 96) void this.theMoment();
  }

  private async theMoment() {
    this.crossed = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    // everything stops
    this.audio.duckAmbience(0.05, 2.4);
    this.audio.stopMotif();
    this.tweens.add({ targets: this.ring, alpha: 0.5, displayWidth: 420, displayHeight: 420, duration: 2400 });
    for (const s of this.snow) this.tweens.add({ targets: s, alpha: 0.08, duration: 2000 });
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, (this.p.pos.y + this.companion.y) / 2 - 6, 1.3, 2200);

    // they face each other
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.companion.x - 62,
        y: this.companion.y + 4,
        duration: 1800,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    this.p.soul.setIntensity(1.5);
    this.companion.soul.setIntensity(1.5);
    await new Promise((r) => this.time.delayedCall(1500, r));

    // the known words — used exactly as they were said
    await this.ui.say([{ text: "I love you.", kind: "canon", wait: 900 }]);
    this.audio.tone(392, 0.035, 2.2);
    await new Promise((r) => this.time.delayedCall(500, r));
    await this.ui.say([{ text: "I love you.", kind: "canon", wait: 900 }]);
    this.audio.tone(523.25, 0.035, 2.6);

    await this.ourColorBloom();

    this.colors.setStage(5);
    this.saves.setColorStage(5);
    this.saves.setAliveness(58);
    this.keepMemory(MEMORY_IDS.december);

    await new Promise((r) => this.time.delayedCall(1200, r));
    await this.ui.say([
      { text: "Two colors that had been circling each other for months." },
      { text: "Neither of them changed. Something new appeared between them.", kind: "whisper" },
    ]);

    // the sky records it — zoom returns to 1 so the map reads true to scale
    this.ui.letterbox(false);
    this.cameras.main.zoomTo(this.settings.zoom, 1100, "Sine.easeInOut");
    await new Promise((r) => this.time.delayedCall(1200, r));
    await flashConstellation(this, this.saves.state.memories, MEMORY_IDS.december, 4200);

    this.saves.checkpoint("VisionScene");
    this.transitionTo("VisionScene");
  }

  /** OUR COLOR — born from blue and hazel, identical to neither. */
  private async ourColorBloom() {
    const mx = (this.p.pos.x + this.companion.x) / 2;
    const my = (this.p.pos.y + this.companion.y) / 2;

    const bloom = this.add
      .image(mx, my, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.2)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: bloom, alpha: 0.55, scale: 1.5, duration: 2600, ease: "Sine.easeOut" });
    this.tweens.add({ targets: bloom, alpha: 0.3, scale: 1.3, duration: 3000, delay: 2600, yoyo: true, repeat: -1 });

    // motes of each color meeting in the middle and becoming a third
    for (let i = 0; i < 18; i++) {
      const fromHer = i % 2 === 0;
      const src = fromHer ? this.p.pos : { x: this.companion.x, y: this.companion.y };
      const m = this.add
        .image(src.x, src.y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(fromHer ? 0xe0b36a : 0x7fc4ff)
        .setScale(0.8)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: m,
        x: mx + Phaser.Math.Between(-24, 24),
        y: my + Phaser.Math.Between(-18, 18),
        duration: 1500,
        delay: i * 70,
        ease: "Sine.easeInOut",
        onComplete: () => {
          m.setTint(0x93dcbb);
          this.tweens.add({
            targets: m,
            scale: 2.4,
            alpha: 0,
            duration: 1600,
            onComplete: () => m.destroy(),
          });
        },
      });
    }

    this.audio.sparkle();
    // the world answers: more stars wake up
    this.world.addStars(26, new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.hh * 0.5));
    this.world.startBirds(14000);

    await new Promise((r) => this.time.delayedCall(3000, r));
  }
}
