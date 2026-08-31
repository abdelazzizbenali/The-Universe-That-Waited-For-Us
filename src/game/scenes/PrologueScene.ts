/* Scene 1 — PROLOGUE. The world before it had a name: sparse stars, closed
   flowers, hidden spirits, a blue light too far away. Walk to the hilltop;
   one star wakes; the title arrives. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Soul } from "../entities/Soul";
import { DEPTH, MEMORY_IDS } from "../config";
import {
  addFog,
  addForeground,
  addLightPool,
  addRidges,
  addTerrain,
  addVignette,
} from "../art/environment";

export default class PrologueScene extends BaseScene {
  private blueFar!: Soul;
  private hilltop!: Phaser.Math.Vector2;
  private starBeat = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.hilltop = new Phaser.Math.Vector2(w * 0.78, h * 0.42);

    this.skyRect(0x070b1a, 0x0c1434, w, h);
    // layered sky: distant ridges, then the hill itself
    addRidges(this, w, h * 0.52);
    this.world.addStars(70, new Phaser.Geom.Rectangle(-w * 0.2, 0, w * 1.4, h * 0.62));
    addFog(this, w, h * 0.42, h * 0.62, 2, 0x8fa8d8);

    // ground — layered terrain rather than a flat fill
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0a1130, 1);
    g.fillEllipse(w * 0.08, h * 1.22, w * 0.9, h * 0.5);
    g.fillStyle(0x0c1434, 1);
    g.fillEllipse(w * 0.55, h * 1.3, w * 1.1, h * 0.62);
    addTerrain(this, w, h * 0.78, h * 0.16, 0.8);
    addForeground(this, w, h * 0.95, 0x04060f);
    addVignette(this, 0x070b1a, 0.28);

    // moonlight spill on the hilltop, where the first star will wake
    addLightPool(this, this.hilltop.x, this.hilltop.y + 6, 210, 90, 0xbcd6ff, 0.13);

    // the waiting spot on the hilltop
    const spot = this.add
      .image(this.hilltop.x, this.hilltop.y, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fb0d0)
      .setScale(9)
      .setAlpha(0.16)
      .setDepth(DEPTH.ground + 1);
    this.tweens.add({ targets: spot, alpha: 0.3, duration: 2100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // closed flowers along the way
    const flowers = this.world.addFlowers([
      { x: w * 0.3, y: h * 0.8 },
      { x: w * 0.44, y: h * 0.68 },
      { x: w * 0.56, y: h * 0.74 },
      { x: w * 0.66, y: h * 0.58 },
      { x: w * 0.71, y: h * 0.5 },
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
      { x: w * 0.2, y: h * 0.55 },
      { x: w * 0.5, y: h * 0.48 },
      { x: w * 0.84, y: h * 0.62 },
    ]);

    // the distant blue — present, mysterious, unreachable
    this.blueFar = new Soul(this, w * 0.88, h * 0.22, "blue", { scale: 0.45, bob: 2 });
    this.blueFar.setIntensity(0.55);

    // player
    this.player = new Player(this, w * 0.16, h * 0.74);
    this.player.bounds = new Phaser.Geom.Rectangle(w * 0.05, h * 0.36, w * 0.88, h * 0.54);
    this.player.soul.setIntensity(0.85);
    this.rig.follow(this.player.soul.container, 0.08, 1);

    this.audio.playBed("night-wind");
    // teach movement without a tutorial: the hint adapts to how she's playing
    // and gets out of the way the moment she starts walking
    const touch = this.sys.game.device.input.touch;
    this.ui.setHint(touch ? "hold anywhere on the left to walk" : "wasd or arrow keys to walk");
  }

  private moved = 0;
  private taught = false;

  protected tick(dt: number, t: number) {
    this.blueFar.update(dt, t, this.colors);

    // once she has walked a little, she has understood — swap to the goal
    if (!this.taught) {
      if (this.p.isMoving) this.moved += dt;
      if (this.moved > 1.1) {
        this.taught = true;
        this.ui.setHint("follow the hill");
      }
    }

    if (this.starBeat) return;
    const d = Phaser.Math.Distance.Between(this.p.pos.x, this.p.pos.y, this.hilltop.x, this.hilltop.y);
    if (d < 52) void this.wakeStar();
  }

  private async wakeStar() {
    this.starBeat = true;
    this.taught = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    const sx = this.hilltop.x;
    const sy = this.scale.height * 0.16;
    const star = this.add
      .image(sx, sy, "star")
      .setScale(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(DEPTH.fx);
    this.audio.starIgnite();
    this.audio.startMotif("airy");
    this.rig.focusPull(sx, this.hilltop.y, 1.1, 1500);

    this.tweens.add({ targets: star, scale: 2.4, duration: 1600, ease: "Back.easeOut" });
    this.tweens.add({ targets: star, alpha: 0.6, scale: 2.0, duration: 2000, delay: 1700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
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
