/* Scene 2 — THE FIRST LOOK. A quiet courtyard morning. Hold the "look"
   action toward the distant blue soul: ambience ducks, the background
   softens into fog, the camera focuses, her aura brightens, a blue
   reflection appears — then he looks back. Recognition, not confession. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

export default class LookScene extends BaseScene {
  private companion!: Companion;
  private looked = false;
  private focusing = false;
  private duckLevel = 1;
  private exitReady = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;

    // morning courtyard — indigo dawn with a warmer horizon
    this.skyRect(0x0a1030, 0x1a2a52, w, h);
    const horizon = this.add
      .image(w * 0.5, h * 0.34, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe0b36a)
      .setScale(90, 26)
      .setAlpha(0.12)
      .setDepth(DEPTH.back);
    horizon.setDepth(DEPTH.back);

    // distant school silhouette
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x0d1638, 1);
    g.fillRect(0, h * 0.18, w, h * 0.17);
    for (let i = 0; i < 14; i++) {
      g.fillStyle(0x24406e, 0.85);
      g.fillRect(w * 0.05 + i * (w * 0.067), h * 0.22, w * 0.02, h * 0.045);
    }
    // courtyard field
    g.fillStyle(0x0e1738, 1);
    g.fillRect(0, h * 0.35, w, h * 0.65);
    // path
    g.fillStyle(0x111c42, 1);
    g.fillEllipse(w * 0.5, h * 0.68, w * 1.1, h * 0.34);

    this.world.addStars(7, new Phaser.Geom.Rectangle(0, 0, w, h * 0.22));
    this.world.addFlowers([
      { x: w * 0.16, y: h * 0.82 },
      { x: w * 0.3, y: h * 0.88 },
      { x: w * 0.68, y: h * 0.85 },
    ]);
    this.world.addDust(14, new Phaser.Geom.Rectangle(0, h * 0.3, w, h * 0.7), 0xbfd9ff, 0.22);
    this.world.startBirds(12000);

    // A few campus people give the university entrance scale without blocking
    // the first-look line. They are scene dressing only and disappear after this beat.
    for (const npc of [
      { key: "trim-teacher-1", x: w * 0.52, y: h * 0.48, hgt: 72 },
      { key: "trim-girl-2", x: w * 0.38, y: h * 0.62, hgt: 66 },
      { key: "trim-boy-2", x: w * 0.62, y: h * 0.64, hgt: 66 },
    ]) {
      if (this.textures.exists(npc.key)) {
        const src = this.textures.get(npc.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        this.add.image(npc.x, npc.y, npc.key).setOrigin(0.5, 1).setDisplaySize((src.width / src.height) * npc.hgt, npc.hgt).setDepth(DEPTH.soul + npc.y / 1000).setAlpha(0.82);
      }
    }

    // him — across the courtyard
    this.companion = new Companion(this, w * 0.8, h * 0.46);
    this.companion.setState("distant");
    this.companion.soul.setIntensity(0.95);

    // her
    this.player = new Player(this, w * 0.2, h * 0.72);
    this.player.bounds = new Phaser.Geom.Rectangle(w * 0.05, h * 0.4, w * 0.9, h * 0.54);
    this.rig.follow(this.player.soul.container, 0.08, 1);

    // THE LOOK — hold ~1.3s while facing him inside the cone of attention
    this.interactables.push({
      id: "the-look",
      x: this.companion.x,
      y: this.companion.y,
      r: 360,
      label: "look",
      holdMs: 1300,
      once: true,
      when: () => !this.looked,
      onUse: () => void this.completeLook(),
    });

    this.audio.playBed("road-dusk");
    this.ui.setHint(this.saves.state.looked ? "walk to the gate" : "cross the courtyard — when he is near, look");

    // the exit gate — opens after the look
    const gateShaft = this.add
      .image(w * 0.955, h * 0.6, "shaft")
      .setAlpha(0.0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.5, 0.8)
      .setDepth(DEPTH.back + 2);
    this.tweens.add({ targets: gateShaft, alpha: 0.35, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.interactables.push({
      id: "gate",
      x: w * 0.94,
      y: h * 0.62,
      r: 70,
      label: "continue",
      when: () => this.exitReady,
      onUse: () => {
        this.saves.checkpoint("SchoolBusScene");
        this.transitionTo("SchoolBusScene");
      },
    });

    if (this.saves.state.looked) {
      // resumed mid-scene after completing the look previously
      this.looked = true;
      this.exitReady = true;
      this.companion.setState("aware");
    }
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);

    // live hold effects — the world narrows around the two of them
    const holding = !this.looked && this.activeCandidate?.id === "the-look" ? this.holdProgress : 0;
    if (holding > 0.02 && !this.focusing) {
      this.focusing = true;
      const mx = (this.p.pos.x + this.companion.x) / 2;
      const my = (this.p.pos.y + this.companion.y) / 2;
      this.rig.focusPull(mx, my, 1.12, 1300);
      this.p.setFrozen(true);
      this.p.soul.lookAt(this.companion.x, this.companion.y);
    }
    if (this.focusing && !this.looked) {
      this.p.soul.setIntensity(1 + holding * 0.65);
      this.p.soul.setWarmth(holding * 0.3);
      const duck = 1 - holding * 0.62;
      if (Math.abs(duck - this.duckLevel) > 0.06) {
        this.duckLevel = duck;
        this.audio.duckAmbience(duck, 0.4);
      }
      if (holding < 0.02) {
        // released early — gently release the world
        this.focusing = false;
        this.p.setFrozen(false);
        this.p.soul.setIntensity(1);
        this.p.soul.setWarmth(0);
        this.duckLevel = 1;
        this.audio.restoreAmbience(1.4);
        this.rig.release(1, 900);
      }
    }
  }

  private async completeLook() {
    this.looked = true;
    this.p.setFrozen(true);
    this.p.soul.lookAt(this.companion.x, this.companion.y);

    // he notices — and looks back
    await new Promise((r) => this.time.delayedCall(650, r));
    this.companion.setState("aware");
    this.companion.soul.setIntensity(1.35);
    this.audio.sparkle();

    // the first tiny reflection — color stage 1, permanently
    this.colors.setStage(1);
    this.saves.setColorStage(1);
    this.saves.patch({ looked: true });

    await new Promise((r) => this.time.delayedCall(1400, r));
    await this.ui.say([
      { text: "First, there were only looks." },
      { text: "Enough to make two ordinary days feel less ordinary." },
    ]);

    this.keepMemory(MEMORY_IDS.look);
    this.audio.restoreAmbience(2.2);
    this.rig.release(1, 1200);
    this.p.setFrozen(false);
    this.p.soul.setIntensity(1);
    this.p.soul.setWarmth(0);
    this.exitReady = true;
    this.ui.setHint("walk to the gate");
  }
}
