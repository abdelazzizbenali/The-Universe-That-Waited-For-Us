/* Memory 21 — ANOTHER CROWDED BUS, HOLDING HANDS NATURALLY.
   Another missed school bus, another crowded passenger bus, another seat
   found and kept. But this time nothing has to be asked for.

   The same mechanic as Memory 17 — and deliberately not the same moment.
   Then it was uncertain. Now it is simply what they do. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { HandHoldController } from "../systems/hands/HandHoldController";
import { circle, rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";

export default class NaturalBusScene extends BaseScene {
  private companion!: Companion;
  private hands!: HandHoldController;
  private seated = false;
  private reached = false;
  private done = false;
  private seatPos!: Phaser.Math.Vector2;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.6);

    this.skyRect(0x0b1026, 0x1a1f42, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x121a40, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 5; i++) {
      const wx = ww * 0.06 + i * ww * 0.2;
      g.fillStyle(0x2b2f5c, 1);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.28, 12);
      g.fillStyle(0x8ba7e0, 0.16);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.05, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0d1330, 1);
    g.fillRect(0, h * 0.4, ww, h * 0.6);
    for (let i = 0; i < 7; i++) {
      const sx = ww * 0.06 + i * ww * 0.13;
      g.fillStyle(0x18204a, 1);
      g.fillRoundedRect(sx, h * 0.42, 54, h * 0.13, 9);
      this.colliders.push(rect(sx + 27, h * 0.47, 58, h * 0.12));
    }
    // the seat he kept, further back
    this.seatPos = new Phaser.Math.Vector2(ww * 0.78 + 46, h * 0.68);
    g.fillStyle(0x1e2a58, 1);
    g.fillRoundedRect(ww * 0.78, h * 0.44, 60, h * 0.15, 10);
    const glow = this.add
      .image(this.seatPos.x, this.seatPos.y - 6, "seat-glow")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.5)
      .setDepth(DEPTH.world);
    this.tweens.add({ targets: glow, alpha: 0.85, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // a crowd of soft obstacles
    for (let i = 0; i < 13; i++) {
      const x = ww * 0.14 + Math.random() * ww * 0.58;
      const y = h * (0.62 + Math.random() * 0.24);
      const body = this.add.graphics();
      body.fillStyle([0x1c2650, 0x202c5c, 0x182044][i % 3], 1);
      body.fillEllipse(0, 0, 28, 46);
      body.fillCircle(0, -28, 10);
      this.add.container(x, y, [body]).setDepth(DEPTH.world);
      this.colliders.push(circle(x, y, 15));
    }

    this.world.addDust(14, new Phaser.Geom.Rectangle(0, h * 0.4, ww, h * 0.5), 0x8f9fc9, 0.12);

    this.companion = new Companion(this, ww * 0.78, h * 0.5);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.45);

    this.player = new Player(this, ww * 0.05, h * 0.7);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.58, ww * 0.94, h * 0.32);
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.interactables.push({
      id: "sit",
      x: this.seatPos.x,
      y: this.seatPos.y,
      r: 66,
      label: "sit beside him",
      once: true,
      when: () => !this.done,
      onUse: () => void this.sit(),
    });

    this.audio.playBed("crowd");
    this.ui.setHint("he kept the seat again");
  }

  private async sit() {
    this.seated = true;
    this.p.setFrozen(true);
    // the controller exists from the start — the tick loop may run before
    // the seat tween finishes, so it must never be undefined
    if (!this.hands) this.createHands();
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

    // the crowd hushes; this is a familiar quiet now
    this.audio.duckBed("crowd", 0.014, 2.4);
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 12, 1.14, 1400);
    this.p.soul.setWarmth(0.6);
    this.companion.soul.setIntensity(1.35);

    await new Promise((r) => this.time.delayedCall(1500, r));

    // no ceremony: he is already offering, and she already knows
    this.createHands();
    this.hands.beginReach();
    this.p.setFrozen(false);
    this.ui.setHint("take his hand");
  }

  private createHands() {
    if (this.hands) return;
    this.hands = new HandHoldController(this, this.ui, this.audio, {
      contactDistance: 34,
      prompt: "hold his hand",
    });
    this.hands.onContact(() => void this.contact());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.hands.destroy());
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    if (!this.seated || this.reached) return;

    this.hands.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, this.p.isMoving);
    // a gentle nudge, not the private universe — this one is everyday
    this.audio.duckAmbience(1 - this.hands.reach * 0.4, 0.5);
    void t;
  }

  private async contact() {
    this.reached = true;
    this.p.setFrozen(true);
    this.uiLocked = true;
    this.ui.setAction(null);

    // OUR COLOR, stable and natural — no bloom, just true
    const mx = (this.p.pos.x + this.companion.x) / 2;
    const my = (this.p.pos.y + this.companion.y) / 2;
    const seam = this.add
      .image(mx, my, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.3)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: seam, alpha: 0.34, scale: 1.1, duration: 2200, ease: "Sine.easeOut" });
    this.audio.settle();
    this.p.soul.setWarmth(0.7);
    this.companion.soul.setWarmth(0.5);

    await new Promise((r) => this.time.delayedCall(2600, r));
    await this.ui.say([
      { text: "What had once been a question had quietly become a habit." },
      { text: "She loved this one too." },
    ]);

    this.saves.setAliveness(84);
    this.keepMemory(MEMORY_IDS.naturalHand);
    this.saves.checkpoint("CameraScene");
    this.done = true;
    this.uiLocked = false;
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("CameraScene");
  }
}
