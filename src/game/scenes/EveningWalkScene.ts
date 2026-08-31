/* Memory 26 — GOING WITH HER TO UNIVERSITY.
   Sometimes she had to go in the evening. He went with her so she would not
   be alone, and he liked doing it — he knew she had someone beside her.

   No enemies. No danger. The road simply lights up because they are walking
   it together. The mechanic is choosing to be there. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";
import { addFog, addRidges, addTerrain } from "../art/environment";

interface Lamp {
  x: number;
  glow: Phaser.GameObjects.Image;
  head: Phaser.GameObjects.Image;
  lit: boolean;
}

export default class EveningWalkScene extends BaseScene {
  private her!: Companion;
  private lamps: Lamp[] = [];
  private dark!: Phaser.GameObjects.Image;
  private litCount = 0;
  private done = false;
  private spokeAt = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 2.5);

    this.skyRect(0x070b1a, 0x0e1430, ww, h);
    // city skyline, then the pavement she walks on
    addRidges(this, ww, h * 0.5);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x090e24, 1);
    g.fillRect(0, h * 0.5, ww, h * 0.5);
    g.fillStyle(0x0c1330, 1);
    g.fillRoundedRect(0, h * 0.66, ww, h * 0.18, 14);
    // kerb and paving joints
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0x101a3a, 0.5);
      g.fillRect((ww / 40) * i, h * 0.68, 2, h * 0.14);
    }
    g.fillStyle(0x152046, 1);
    g.fillRect(0, h * 0.82, ww, 4);
    addTerrain(this, ww, h * 0.84, h * 0.1, 0.5);
    addFog(this, ww, h * 0.5, h * 0.7, 2, 0x6f86b8);
    // low buildings along the way
    let bx = 0;
    while (bx < ww) {
      const bw = Phaser.Math.Between(120, 240);
      const bh = h * Phaser.Math.FloatBetween(0.1, 0.2);
      g.fillStyle(0x0b1128, 1);
      g.fillRect(bx, h * 0.5 - bh, bw, bh);
      bx += bw + Phaser.Math.Between(40, 100);
    }

    this.world.addStars(30, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.42));
    this.world.addFlowers([
      { x: ww * 0.18, y: h * 0.9 },
      { x: ww * 0.46, y: h * 0.92 },
      { x: ww * 0.72, y: h * 0.89 },
    ]);
    this.world.addSpirits([{ x: ww * 0.3, y: h * 0.58 }, { x: ww * 0.66, y: h * 0.6 }]);

    // it starts dark; the darkness recedes as they go
    this.dark = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setTint(0x0a1024)
      .setAlpha(0.66)
      .setDepth(DEPTH.overlay - 2);

    for (let i = 1; i <= 9; i++) {
      const lx = (ww / 10) * i;
      const post = this.add.graphics().setDepth(DEPTH.world);
      post.fillStyle(0x151d3e, 1);
      post.fillRect(lx - 2, h * 0.48, 4, h * 0.22);
      const head = this.add
        .image(lx, h * 0.47, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xe0b36a)
        .setScale(2)
        .setAlpha(0.1)
        .setDepth(DEPTH.light);
      const glow = this.add
        .image(lx, h * 0.62, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xe0b36a)
        .setScale(30, 26)
        .setAlpha(0.03)
        .setDepth(DEPTH.light);
      this.lamps.push({ x: lx, glow, head, lit: false });
    }

    // her — beside him the whole way, never trailing
    this.her = new Companion(this, ww * 0.02, h * 0.79, "hazel");
    this.her.setState("beside");
    this.her.maxSpeed = 200;

    this.player = new Player(this, ww * 0.05, h * 0.76, "blue");
    this.player.speed = 168;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.68, ww * 0.94, h * 0.2);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the gate of the university, at the far end
    const gate = this.add
      .image(ww * 0.96, h * 0.6, "shaft")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.22)
      .setScale(0.9, 1)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: gate, alpha: 0.42, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.interactables.push({
      id: "gate",
      x: ww * 0.95,
      y: h * 0.76,
      r: 96,
      label: "you're here",
      once: true,
      when: () => !this.done,
      onUse: () => void this.arrive(),
    });

    this.audio.playBed("night-wind");
    void this.open();
  }

  private async open() {
    await this.ui.say([
      { text: "She had to be at the university that evening." },
      { text: "Nobody asked him to come.", kind: "whisper" },
    ]);
    this.ui.setHint("walk her there");
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);
    if (this.done) return;

    const together = this.her.distanceToPlayer(this.p.pos) < 130;

    // the road lights where they pass — but only when they pass it together
    for (const l of this.lamps) {
      const d = Math.abs(this.p.pos.x - l.x);
      if (!l.lit && d < 150 && together) {
        l.lit = true;
        this.litCount++;
        this.audio.softTick();
        this.tweens.add({ targets: l.head, alpha: 0.85, scale: 3.4, duration: 900, ease: "Sine.easeOut" });
        this.tweens.add({ targets: l.glow, alpha: 0.24, scale: 42, duration: 1400, ease: "Sine.easeOut" });
        // the dark gives way, a little at a time
        this.tweens.add({
          targets: this.dark,
          alpha: Math.max(0.16, 0.66 - this.litCount * 0.06),
          duration: 1400,
          ease: "Sine.easeInOut",
        });
        this.her.soul.setIntensity(1.05 + this.litCount * 0.04);
        this.her.soul.setWarmth(0.3 + this.litCount * 0.035);
      }
    }

    if (this.litCount >= 4 && this.spokeAt === 0) {
      this.spokeAt = t;
      void this.ui.say([{ text: "He liked knowing she did not have to do this part alone.", kind: "whisper" }]);
    }
    this.ui.setHint(together ? null : "stay beside her");
  }

  private async arrive() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    this.her.setState("seated");
    this.her.moveTo(this.p.pos.x - 42, this.p.pos.y + 4);
    this.rig.focusPull(this.p.pos.x - 20, this.p.pos.y - 16, 1.16, 1800);
    this.tweens.add({ targets: this.dark, alpha: 0.12, duration: 2400 });

    await new Promise((r) => this.time.delayedCall(2000, r));
    await this.ui.say([
      { text: "He did not have to go." },
      { text: "He wanted to." },
    ]);

    this.saves.setAliveness(96);
    this.keepMemory(MEMORY_IDS.escort);
    this.saves.checkpoint("ReportScene");
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("ReportScene");
  }
}
