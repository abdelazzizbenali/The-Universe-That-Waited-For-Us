/* Scene 4 — MISSING THE SCHOOL BUS. A packed passenger bus. He saved a
   seat and signals discreetly. MAKE ROOM: passengers are soft obstacles who
   yield when she's close and patient — no combat, just navigation. At the
   seat: the crowd sound fades, warmth returns, and a shyness becomes a
   phone with two words on it. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { circle, rect, type Collider } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";
import { addLightPool, addMotes, addVignette } from "../art/environment";

interface Yielder {
  c: Phaser.GameObjects.Container;
  col: Collider;
  hold: number;
  yielded: boolean;
  dir: number;
}

export default class CrowdedBusScene extends BaseScene {
  private companion!: Companion;
  private yielders: Yielder[] = [];
  private sat = false;
  private signalTimer = 0;
  private hintTimer = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.7);

    // dusk passenger bus
    this.skyRect(0x080d22, 0x0d1330, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x0e1636, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 6; i++) {
      const wx = ww * 0.05 + i * ww * 0.165;
      g.fillStyle(0x332a55, 1);
      g.fillRoundedRect(wx, h * 0.12, ww * 0.11, h * 0.28, 12);
      g.fillStyle(0xe0b36a, 0.14);
      g.fillRoundedRect(wx, h * 0.12, ww * 0.11, h * 0.05, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0a1028, 1);
    g.fillRect(0, h * 0.42, ww, h * 0.2);
    g.fillStyle(0x070c1e, 1);
    g.fillRect(0, h * 0.62, ww, h * 0.38);
    // seat rows top and bottom of the aisle
    for (let i = 0; i < 8; i++) {
      const sx = ww * 0.06 + i * ww * 0.12;
      g.fillStyle(0x141d42, 1);
      g.fillRoundedRect(sx, h * 0.42, 52, h * 0.13, 9);
      this.colliders.push(rect(sx + 26, h * 0.47, 56, h * 0.12));
    }

    // the crowd — soft obstacles, never hostile
    const spots: { fx: number; fy: number; yields: boolean }[] = [
      { fx: 0.18, fy: 0.6, yields: false },
      { fx: 0.24, fy: 0.76, yields: false },
      { fx: 0.31, fy: 0.66, yields: true },
      { fx: 0.38, fy: 0.58, yields: false },
      { fx: 0.45, fy: 0.78, yields: false },
      { fx: 0.5, fy: 0.64, yields: true },
      { fx: 0.57, fy: 0.76, yields: false },
      { fx: 0.63, fy: 0.6, yields: false },
      { fx: 0.69, fy: 0.72, yields: true },
      { fx: 0.74, fy: 0.58, yields: false },
      { fx: 0.8, fy: 0.78, yields: false },
    ];
    const shades = [0x1a2444, 0x1e2a4e, 0x16203e, 0x1c2748];
    spots.forEach((s, i) => {
      const x = ww * s.fx;
      const y = h * s.fy;
      const pg = this.add.graphics();
      const shade = shades[i % shades.length];
      pg.fillStyle(shade, 1);
      pg.fillEllipse(0, 0, 30, 44);
      pg.fillStyle(shade + 0x0a0a14, 1);
      pg.fillCircle(0, -26, 9);
      const c = this.add.container(x, y, [pg]).setDepth(DEPTH.world);
      const col = circle(x, y, 16);
      this.colliders.push(col);
      if (s.yields) {
        this.yielders.push({ c, col, hold: 0, yielded: false, dir: s.fy > 0.66 ? 1 : -1 });
      }
    });

    // interior depth: ceiling framing, floor planks, handrails, light pools
    const trim = this.add.graphics().setDepth(DEPTH.mid);
    trim.fillStyle(0x0a0f26, 1);
    trim.fillRect(0, 0, ww, h * 0.09);
    for (let i = 0; i < 20; i++) {
      trim.fillStyle(0x141d42, 1);
      trim.fillRect((ww / 20) * i, h * 0.07, 4, h * 0.05);
    }
    for (let i = 0; i < 20; i++) {
      trim.fillStyle(i % 2 ? 0x0a1028 : 0x080d22, 1);
      trim.fillRect(0, h * 0.62 + i * (h * 0.38) / 20, ww, (h * 0.38) / 20 - 1);
    }
    trim.fillStyle(0x1b2551, 1);
    trim.fillRect(0, h * 0.4, ww, 5);
    for (let i = 0; i < 10; i++) {
      trim.fillStyle(0x1b2551, 0.9);
      trim.fillRect(ww * (0.05 + i * 0.1), h * 0.4, 4, h * 0.14);
    }
    // dim interior lamps overhead — crowded buses are unevenly lit
    for (let i = 0; i < 5; i++) {
      addLightPool(this, ww * (0.12 + i * 0.19), h * 0.5, 170, 130, 0xd8c9a8, 0.07);
    }
    addMotes(this, new Phaser.Geom.Rectangle(0, h * 0.15, ww, h * 0.45), 12, 0x9fb0d0, 0.2);
    addVignette(this, 0x080d22, 0.34);

    this.world.addDust(16, new Phaser.Geom.Rectangle(0, h * 0.4, ww, h * 0.5), 0x8f9fc9, 0.14);

    // him — at the back, beside the place he kept for her
    const hisX = ww * 0.9;
    this.companion = new Companion(this, hisX, h * 0.52);
    this.companion.setState("seated");
    const glow = this.add
      .image(hisX + 46, h * 0.56, "seat-glow")
      .setAlpha(0.5)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH.world);
    this.tweens.add({ targets: glow, alpha: 0.85, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // her — squeezing in at the door
    this.player = new Player(this, ww * 0.04, h * 0.7);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.02, h * 0.55, ww * 0.96, h * 0.4);
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    const sitPoint = { x: hisX + 46, y: h * 0.68 };
    this.interactables.push({
      id: "sit",
      x: sitPoint.x,
      y: sitPoint.y,
      r: 62,
      label: "sit",
      once: true,
      when: () => !this.sat,
      onUse: () => void this.sitAndThank(sitPoint.x, sitPoint.y),
    });

    this.audio.playBed("crowd");
    this.ui.setHint("make your way to him");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    if (this.sat) return;

    // MAKE ROOM — pressure makes patient people step aside
    for (const yl of this.yielders) {
      if (yl.yielded) continue;
      const d = Phaser.Math.Distance.Between(this.p.pos.x, this.p.pos.y, yl.col.x, yl.col.y);
      if (d < 34 && this.p.isMoving) {
        yl.hold += dt;
        if (yl.hold > 0.4) {
          yl.yielded = true;
          const nx = yl.col.x + yl.dir * 14;
          const ny = yl.col.y + yl.dir * 20;
          this.tweens.add({ targets: yl.c, x: nx, y: ny, duration: 650, ease: "Sine.easeInOut" });
          yl.col.x = nx;
          yl.col.y = ny;
          this.audio.softTick();
        }
      } else {
        yl.hold = Math.max(0, yl.hold - dt * 0.6);
      }
    }

    // his discreet signal, so that people would not notice
    this.signalTimer += dt;
    if (this.signalTimer > 5.5) {
      this.signalTimer = 0;
      this.companion.signal();
      this.audio.softTick();
    }
    this.hintTimer += dt;
    if (this.hintTimer > 9) {
      this.hintTimer = -9999;
      this.ui.setHint("follow his signal — the lit seat");
    }
  }

  private async sitAndThank(x: number, y: number) {
    this.sat = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    await new Promise<void>((resolve) => {
      this.tweens.add({ targets: this.p.pos, x, y, duration: 800, ease: "Sine.easeInOut", onComplete: () => resolve() });
    });

    // the crowd is asked to hush — the world closes around two souls
    this.audio.duckBed("crowd", 0.006, 2.6);
    this.audio.settle();
    this.rig.focusPull((this.companion.x + this.p.pos.x) / 2, this.scale.height * 0.58, 1.16, 1200);
    this.p.soul.setWarmth(0.65);
    this.p.soul.setIntensity(1.3);
    this.companion.soul.setIntensity(1.4);
    this.companion.soul.setWarmth(0.4);

    await new Promise((r) => this.time.delayedCall(1500, r));
    await this.ui.say([{ text: "She was too shy to say it out loud.", kind: "whisper" }]);
    await new Promise((r) => this.time.delayedCall(420, r));
    this.audio.blip();
    await this.ui.phoneThankYou();

    this.keepMemory(MEMORY_IDS.thankyou);
    this.saves.checkpoint("TaxiScene");
    await new Promise((r) => this.time.delayedCall(600, r));
    this.audio.restoreAmbience(2);
    this.transitionTo("TaxiScene");
  }
}
