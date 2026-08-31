/* Scene 3 — SAVING HER A SEAT. The school bus home. A seat beside him is
   softly lit — the space he made before either of them knew what it would
   become. She walks the aisle and chooses it. Sitting settles the world. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { circle, rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";
import { addLightPool, addMotes } from "../art/environment";
import { addBusBench, addNpcLine, addStudentNpc } from "../art/NpcArt";

export default class SchoolBusScene extends BaseScene {
  private companion!: Companion;
  private streaks: Phaser.GameObjects.Image[] = [];
  private sat = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.55);

    // bus shell
    this.skyRect(0x0b122c, 0x0e1738, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    // window band with soft late light
    g.fillStyle(0x101b40, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 5; i++) {
      const wx = ww * 0.08 + i * ww * 0.19;
      g.fillStyle(0x2a3f78, 1);
      g.fillRoundedRect(wx, h * 0.13, ww * 0.13, h * 0.3, 14);
      g.fillStyle(0x6f87c9, 0.35);
      g.fillRoundedRect(wx, h * 0.13, ww * 0.13, h * 0.07, { tl: 14, tr: 14, bl: 0, br: 0 });
    }
    g.fillStyle(0x0d1534, 1);
    g.fillRect(0, h * 0.45, ww, h * 0.17);
    g.fillStyle(0x0a1028, 1);
    g.fillRect(0, h * 0.62, ww, h * 0.38);
    g.fillStyle(0x101a3c, 1);
    g.fillRoundedRect(0, h * 0.6, ww, h * 0.22, 8);

    // seats along the window side
    const seatXs = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8].map((f) => f * ww);
    for (const sx of seatXs) {
      g.fillStyle(0x1a2650, 1);
      g.fillRoundedRect(sx, h * 0.42, 58, h * 0.16, 10);
      g.fillStyle(0x223264, 1);
      g.fillRoundedRect(sx, h * 0.55, 58, h * 0.05, 8);
      this.colliders.push(rect(sx + 29, h * 0.5, 62, h * 0.18));
    }

    // passing light — the bus is alive and moving
    for (let i = 0; i < 6; i++) {
      const s = this.add
        .image(-120 - i * 260, h * (0.16 + (i % 3) * 0.09), "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xbfd9ff)
        .setAlpha(0.16)
        .setScale(26, 5)
        .setDepth(DEPTH.back + 1);
      this.streaks.push(s);
      this.tweens.add({
        targets: s,
        x: ww + 200,
        duration: 7000 + i * 900,
        repeat: -1,
        delay: i * 600,
      });
    }

    // interior depth: handrail, ceiling line, floor variation, light pools
    const detail = this.add.graphics().setDepth(DEPTH.mid);
    detail.fillStyle(0x0e1636, 1);
    detail.fillRect(0, h * 0.6, ww, h * 0.4);
    for (let i = 0; i < 16; i++) {
      detail.fillStyle(i % 2 ? 0x111a3e : 0x0c1430, 1);
      detail.fillRect(0, h * 0.6 + i * (h * 0.4) / 16, ww, (h * 0.4) / 16 - 1);
    }
    detail.fillStyle(0x1b2551, 1);
    detail.fillRect(0, h * 0.435, ww, 6);
    for (let i = 0; i < 8; i++) {
      detail.fillStyle(0x1b2551, 1);
      detail.fillRect(ww * (0.06 + i * 0.12), h * 0.435, 5, h * 0.06);
    }
    addLightPool(this, seatXs[5] + 46, h * 0.62, 190, 110, 0xbfd9ff, 0.1);
    addMotes(this, new Phaser.Geom.Rectangle(0, h * 0.12, ww, h * 0.42), 10, 0xbfd9ff, 0.22);

    this.world.addDust(10, new Phaser.Geom.Rectangle(0, h * 0.1, ww, h * 0.5), 0x9fb0d0, 0.16);

    // Provided bench art marks the real seat where they sit. A few classmates
    // fill the bus but stay off the aisle and never block the saved place.
    seatXs.forEach((sx, i) => addBusBench(this, sx + 45, h * 0.61, i === 5 ? 174 : 132, i === 5 ? 1 : 0.72));
    addNpcLine(
      this,
      seatXs.slice(0, 5).map((sx, i) => ({ x: sx + 38, y: h * 0.59, height: 54 + (i % 2) * 4, alpha: 0.7 })),
      1
    );
    addStudentNpc(this, "girl-3", ww * 0.34, h * 0.78, 70, 0.76, true);
    addStudentNpc(this, "boy-2", ww * 0.48, h * 0.8, 70, 0.76);

    // him — already seated, the space beside him kept
    const hisSeat = seatXs[5];
    this.companion = new Companion(this, hisSeat + 12, h * 0.5);
    this.companion.setState("seated");

    // the saved seat — softly lit
    const glow = this.add
      .image(hisSeat + 46, h * 0.55, "seat-glow")
      .setAlpha(0.55)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH.world);
    this.tweens.add({ targets: glow, alpha: 0.9, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // her — boarding at the front
    this.player = new Player(this, ww * 0.05, h * 0.7);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.62, ww * 0.94, h * 0.32);
    this.colliders.push(circle(hisSeat + 12, h * 0.5, 24));
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    const sitPoint = { x: hisSeat + 44, y: h * 0.66 };
    this.interactables.push({
      id: "sit",
      x: sitPoint.x,
      y: sitPoint.y,
      r: 64,
      label: "sit beside him",
      once: true,
      when: () => !this.sat,
      onUse: () => void this.sitBeside(sitPoint.x, sitPoint.y),
    });

    this.audio.playBed("bus-engine");
    this.ui.setHint("the seat beside him is kept");
  }

  private async sitBeside(x: number, y: number) {
    this.sat = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    // she crosses the last little distance and settles in
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x,
        y,
        duration: 850,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    // the world settles: sound softens, camera rests, motion calms
    this.audio.duckBed("bus-engine", 0.02, 3);
    this.audio.settle();
    this.rig.focusPull((this.companion.x + this.p.pos.x) / 2, h2y(this.scale.height, 0.58), 1.14, 1200);
    for (const s of this.streaks) this.tweens.getTweensOf(s).forEach((tw) => (tw.timeScale = 0.3));
    this.p.soul.setWarmth(0.55);
    this.companion.soul.setIntensity(1.35);
    this.companion.soul.setWarmth(0.35);

    await new Promise((r) => this.time.delayedCall(1400, r));
    await this.ui.say([
      { text: "He was already making space for her." },
      { text: "Before either of them knew what that space would become." },
    ]);

    this.keepMemory(MEMORY_IDS.seat);
    this.saves.checkpoint("CrowdedBusScene");
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("CrowdedBusScene");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
  }
}

function h2y(h: number, f: number) {
  return h * f;
}
