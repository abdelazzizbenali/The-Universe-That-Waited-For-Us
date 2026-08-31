/* Memory 25 — THE BOTTLE OF WATER.
   One day on the bus she brought a bottle of water, specifically for him.
   That is the whole memory, and it is kept at exactly that size.

   No quest. No cinematic. One small thing on a seat, and what it meant. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";

export default class BottleScene extends BaseScene {
  private companion!: Companion;
  private bottle!: Phaser.GameObjects.Container;
  private bottleGlow!: Phaser.GameObjects.Image;
  private done = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.25);

    // an ordinary bus, an ordinary afternoon
    this.skyRect(0x0d1330, 0x1a2448, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x121c42, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 4; i++) {
      const wx = ww * 0.08 + i * ww * 0.24;
      g.fillStyle(0x2e4380, 1);
      g.fillRoundedRect(wx, h * 0.11, ww * 0.15, h * 0.28, 12);
      g.fillStyle(0xbfd9ff, 0.22);
      g.fillRoundedRect(wx, h * 0.11, ww * 0.15, h * 0.06, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0d1533, 1);
    g.fillRect(0, h * 0.42, ww, h * 0.58);
    // their seats
    g.fillStyle(0x1b2550, 1);
    g.fillRoundedRect(ww * 0.52, h * 0.46, 150, h * 0.16, 12);
    g.fillStyle(0x223066, 1);
    g.fillRoundedRect(ww * 0.52, h * 0.59, 150, h * 0.05, 8);
    this.colliders.push(rect(ww * 0.595, h * 0.53, 156, h * 0.18));

    this.world.addDust(10, new Phaser.Geom.Rectangle(0, h * 0.1, ww, h * 0.45), 0xbfd9ff, 0.14);

    this.companion = new Companion(this, ww * 0.56, h * 0.7, "hazel");
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.45);

    // his side: he is the one being thought of here
    this.player = new Player(this, ww * 0.14, h * 0.72, "blue");
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.06, h * 0.64, ww * 0.86, h * 0.24);
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the bottle, waiting on the seat beside her
    const bx = ww * 0.68;
    const by = h * 0.66;
    const body = this.add.graphics();
    body.fillStyle(0x9fe3c9, 0.5);
    body.fillRoundedRect(-6, -16, 12, 30, 4);
    body.fillStyle(0xd6eeff, 0.75);
    body.fillRoundedRect(-4, -14, 4, 24, 2);
    body.fillStyle(0x7fc4ff, 0.9);
    body.fillRoundedRect(-4, -21, 8, 6, 2);
    this.bottleGlow = this.add
      .image(bx, by, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(3)
      .setAlpha(0.3)
      .setDepth(DEPTH.world);
    this.bottle = this.add.container(bx, by, [body]).setDepth(DEPTH.world + 1);
    this.tweens.add({
      targets: this.bottleGlow,
      alpha: 0.55,
      scale: 3.8,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.interactables.push({
      id: "bottle",
      x: bx,
      y: by,
      r: 62,
      label: "a bottle of water",
      once: true,
      when: () => !this.done,
      onUse: () => void this.take(bx, by),
    });

    this.audio.playBed("bus-engine");
    this.ui.setHint("she brought something with her today");
  }

  private async take(bx: number, by: number) {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    // the camera leans in a little; the bus goes quiet for a second
    this.audio.duckBed("bus-engine", 0.014, 1.6);
    this.rig.focusPull(bx - 10, by - 14, 1.2, 1200);
    this.tweens.add({ targets: this.bottleGlow, alpha: 0.9, scale: 5, duration: 1200 });
    this.tweens.add({ targets: this.bottle, y: by - 10, duration: 900, ease: "Sine.easeOut" });
    this.audio.softTick();

    this.companion.soul.setIntensity(1.3);
    this.p.soul.setIntensity(1.25);
    this.p.soul.setWarmth(0.35);

    await new Promise((r) => this.time.delayedCall(1500, r));
    await this.ui.say([
      { text: "She had brought it for him. Not for herself, not for anyone else.", kind: "whisper" },
      { text: "It was small." },
      { text: "The thought wasn't." },
    ]);

    this.saves.addCollectible("bottle-of-water");
    this.saves.setAliveness(95);
    this.keepMemory(MEMORY_IDS.bottle);
    this.saves.checkpoint("EveningWalkScene");
    this.audio.restoreAmbience(1.5);
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("EveningWalkScene");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
  }
}
