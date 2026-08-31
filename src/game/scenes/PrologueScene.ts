/* Scene 1 — PROLOGUE. The night hill. Walk to the top; a single star
 * wakes; the title arrives. A soft, quiet opening that teaches movement. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Soul } from "../entities/Soul";
import { DEPTH, MEMORY_IDS } from "../config";
import { addMotes } from "../art/environment";

export default class PrologueScene extends BaseScene {
  private blueFar!: Soul;
  private hilltop!: Phaser.Math.Vector2;
  private starBeat = false;

  private get p() {
    return this.player!;
  }

  build() {
    const geom = this.useWorldSpace();

    // anchors from world geom
    const floor = geom!.floor;
    const start = geom!.anchors!.start;
    this.hilltop = new Phaser.Math.Vector2(geom!.anchors!.hilltop.x, geom!.anchors!.hilltop.y);
    const bluePos = geom!.anchors!.blueLight;

    // Atmospheric dust across the sky band
    addMotes(
      this,
      new Phaser.Geom.Rectangle(0, 0, this.backdrop!.width, floor.y),
      26,
      0xbcd6ff,
      0.22
    );

    // stars (the ones already on the painting stay; we add a few pulsing
    // bright ones to signal the waking sky).
    this.world.addStars(60, new Phaser.Geom.Rectangle(0, 0, this.backdrop!.width, floor.y - 40));

    // moonlight spill on the hilltop
    const spill = this.add
      .image(this.hilltop.x, this.hilltop.y + 30, "halo")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xbcd6ff)
      .setAlpha(0.18)
      .setScale(3.3, 1.4)
      .setDepth(DEPTH.light);
    this.tweens.add({
      targets: spill,
      alpha: 0.3,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // waiting spot glow
    const spot = this.add
      .image(this.hilltop.x, this.hilltop.y, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fb0d0)
      .setScale(10)
      .setAlpha(0.18)
      .setDepth(DEPTH.ground + 1);
    this.tweens.add({
      targets: spot,
      alpha: 0.32,
      duration: 2100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // closed flowers along the slope
    const flowers = this.world.addFlowers([
      { x: floor.x + 250, y: floor.y + 180 },
      { x: floor.x + 480, y: floor.y + 120 },
      { x: floor.x + 720, y: floor.y + 160 },
      { x: floor.x + 980, y: floor.y + 90 },
      { x: floor.x + 1160, y: floor.y + 60 },
    ]);
    flowers.forEach((f, i) => {
      this.interactables.push({
        id: `flower-${i}`,
        x: f.x,
        y: f.y - 12,
        r: 56,
        label: "touch",
        once: true,
        onUse: () => {
          this.audio.softTick();
          void this.ui.say([{ text: "Not yet.", kind: "whisper" }]);
        },
      });
    });

    this.world.addSpirits([
      { x: 340, y: floor.y - 80 },
      { x: 820, y: floor.y - 140 },
      { x: 1360, y: floor.y - 40 },
    ]);

    // distant blue light — on the horizon, unreachable
    this.blueFar = new Soul(this, bluePos.x, bluePos.y, "blue", { scale: 0.5 });
    this.blueFar.setIntensity(0.6);

    // her (player)
    this.player = new Player(this, start.x, start.y);
    this.player.bounds = new Phaser.Geom.Rectangle(floor.x, floor.y, floor.w, floor.h);
    this.player.soul.setIntensity(0.9);
    this.rig.follow(this.player.soul.container, 0.08);

    this.audio.playBed("night-wind");
    const touch = this.sys.game.device.input.touch;
    this.ui.setHint(touch ? "hold anywhere on the left to walk" : "wasd or arrow keys to walk");
  }

  private moved = 0;
  private taught = false;

  protected tick(dt: number, t: number) {
    this.blueFar.update(dt, t, this.colors);

    if (!this.taught) {
      if (this.p.isMoving) this.moved += dt;
      if (this.moved > 1.1) {
        this.taught = true;
        this.ui.setHint("follow the hill");
      }
    }

    if (this.starBeat) return;
    const d = Phaser.Math.Distance.Between(this.p.pos.x, this.p.pos.y, this.hilltop.x, this.hilltop.y);
    if (d < 70) void this.wakeStar();
  }

  private async wakeStar() {
    this.starBeat = true;
    this.taught = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    const sx = this.hilltop.x;
    const sy = 180;
    const star = this.add
      .image(sx, sy, "star")
      .setScale(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH.fx);
    this.audio.starIgnite();
    this.audio.startMotif("airy");
    this.rig.focusPull(sx, this.hilltop.y, 1.2, 1500);

    this.tweens.add({ targets: star, scale: 2.6, duration: 1600, ease: "Back.easeOut" });
    this.tweens.add({
      targets: star,
      alpha: 0.6,
      scale: 2.2,
      duration: 2000,
      delay: 1700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    for (let i = 0; i < 12; i++) {
      const m = this.add.image(sx, sy + 30, "mote").setBlendMode(Phaser.BlendModes.ADD).setTint(0xd6eeff).setScale(0.9).setDepth(DEPTH.fx);
      const a = (i / 12) * Math.PI * 2;
      this.tweens.add({
        targets: m,
        x: sx + Math.cos(a) * 90,
        y: sy + 30 + Math.sin(a) * 50,
        alpha: 0,
        duration: 1400,
        delay: 200 + i * 40,
        onComplete: () => m.destroy(),
      });
    }

    this.saves.setAliveness(14);
    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.ui.say([
      { text: "Before there was an us, the sky was mostly quiet." },
      { text: "The stars were waiting too." },
    ]);
    this.keepMemory(MEMORY_IDS.hill);
    this.saves.checkpoint("LookScene");
    await this.ui.card(
      "The Universe <em>that Waited</em> for Us",
      "two souls · two colors · one universe created between them",
      3200
    );
    this.transitionTo("LookScene");
  }
}
