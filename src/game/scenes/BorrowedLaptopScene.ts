/* Memory 30 — BORROWING THE COMPUTER AND HOLDING HANDS.
   She borrowed his computer. On the way to university they sat together and
   held hands. That is all — and it is meant to be all.

   A short echo. The same hand system, at its most ordinary. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { HandHoldController } from "../systems/hands/HandHoldController";
import { DEPTH, MEMORY_IDS } from "../config";
import { addBusBench, addNpcLine } from "../art/NpcArt";

export default class BorrowedLaptopScene extends BaseScene {
  private companion!: Companion;
  private hands!: HandHoldController;
  private screenGlow!: Phaser.GameObjects.Image;
  private seated = false;
  private done = false;
  private seatPos!: Phaser.Math.Vector2;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.25);

    this.skyRect(0x0d1330, 0x22305a, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x131d44, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 4; i++) {
      const wx = ww * 0.08 + i * ww * 0.24;
      g.fillStyle(0x35509a, 1);
      g.fillRoundedRect(wx, h * 0.11, ww * 0.15, h * 0.28, 12);
      g.fillStyle(0xdce9ff, 0.28);
      g.fillRoundedRect(wx, h * 0.11, ww * 0.15, h * 0.06, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0e1638, 1);
    g.fillRect(0, h * 0.42, ww, h * 0.58);
    addBusBench(this, ww * 0.64, h * 0.67, 198, 1);
    addNpcLine(
      this,
      [
        { x: ww * 0.2, y: h * 0.68, height: 58, alpha: 0.48 },
        { x: ww * 0.38, y: h * 0.67, height: 60, alpha: 0.44, flipX: true },
      ],
      2
    );

    this.world.addDust(12, new Phaser.Geom.Rectangle(0, h * 0.1, ww, h * 0.45), 0xdce9ff, 0.16);

    this.seatPos = new Phaser.Math.Vector2(ww * 0.68, h * 0.68);
    this.companion = new Companion(this, ww * 0.6, h * 0.56);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.45);

    // the laptop, open across both their knees
    this.screenGlow = this.add
      .image(ww * 0.64, h * 0.62, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(14, 10)
      .setAlpha(0.3)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: this.screenGlow, alpha: 0.45, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.player = new Player(this, ww * 0.14, h * 0.72);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.06, h * 0.6, ww * 0.86, h * 0.26);
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.hands = new HandHoldController(this, this.ui, this.audio, { contactDistance: 34 });
    this.hands.onContact(() => void this.contact());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.hands.destroy());

    this.interactables.push({
      id: "sit",
      x: this.seatPos.x,
      y: this.seatPos.y,
      r: 70,
      label: "sit with him",
      once: true,
      when: () => !this.done,
      onUse: () => void this.sit(),
    });

    this.audio.playBed("bus-engine");
    this.ui.setHint("she borrowed his computer for the day");
  }

  private async sit() {
    this.seated = true;
    this.p.setFrozen(true);
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.seatPos.x,
        y: this.seatPos.y,
        duration: 850,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });
    this.audio.duckBed("bus-engine", 0.018, 2);
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 10, 1.14, 1200);
    this.p.soul.setWarmth(0.55);

    await new Promise((r) => this.time.delayedCall(1200, r));
    this.hands.beginReach();
    this.p.setFrozen(false);
    this.ui.setHint("his hand is right there");
  }

  private async contact() {
    this.done = true;
    this.p.setFrozen(true);
    this.uiLocked = true;
    this.ui.setAction(null);
    this.ui.setHint(null);

    // stable OUR COLOR — no bloom, nothing dramatic. it is just theirs now.
    const mx = (this.p.pos.x + this.companion.x) / 2;
    const my = (this.p.pos.y + this.companion.y) / 2;
    const seam = this.add
      .image(mx, my, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.3)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: seam, alpha: 0.32, scale: 1.05, duration: 2000, ease: "Sine.easeOut" });
    this.audio.settle();
    this.companion.soul.setWarmth(0.5);

    await new Promise((r) => this.time.delayedCall(2400, r));
    await this.ui.say([
      { text: "His computer on her knees, his hand in hers, the university still forty minutes away." },
      { text: "Neither of them thought of it as a moment. That is rather the point.", kind: "whisper" },
    ]);

    this.keepMemory(MEMORY_IDS.borrowed);
    this.saves.checkpoint("LastThreeDaysScene");
    this.uiLocked = false;
    this.hands.fadeOut(900);
    await new Promise((r) => this.time.delayedCall(900, r));
    this.transitionTo("LastThreeDaysScene");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    if (this.seated && !this.done) {
      this.hands.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, this.p.isMoving);
    }
  }
}
