/* Memory 8 — THE MORNING BUS AND CHANGING SEATS.
   She sat alone. He sat elsewhere. At the next stop the bus filled, and
   someone was about to sit beside her — so he gave up his seat and crossed.

   This memory is played from HIS side. She spent the whole story being
   noticed; here she gets to feel what noticing was like. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";
import { addBusBench, addNpcLine, addStudentNpc } from "../art/NpcArt";

export default class MorningBusScene extends BaseScene {
  private her!: Companion;
  private stranger!: Phaser.GameObjects.Container;
  private strangerTween: Phaser.Tweens.Tween | null = null;
  private seatBesideHer = new Phaser.Math.Vector2();
  private stood = false;
  private arrived = false;
  private nudged = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.45);

    // early morning — pale, cold, honest light
    this.skyRect(0x0c1330, 0x1b2a55, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x101a3e, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 5; i++) {
      const wx = ww * 0.07 + i * ww * 0.19;
      g.fillStyle(0x3a5896, 1);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.28, 12);
      g.fillStyle(0xdce9ff, 0.3);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.06, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0b1230, 1);
    g.fillRect(0, h * 0.4, ww, h * 0.6);

    // seat pairs down the bus
    const seatY = h * 0.52;
    const seatXs = [0.14, 0.3, 0.46, 0.62, 0.78].map((f) => f * ww);
    for (const sx of seatXs) {
      g.fillStyle(0x1a2550, 1);
      g.fillRoundedRect(sx, seatY, 120, h * 0.14, 10);
      g.fillStyle(0x223066, 1);
      g.fillRoundedRect(sx, seatY + h * 0.12, 120, h * 0.04, 8);
      this.colliders.push(rect(sx + 60, seatY + h * 0.07, 128, h * 0.16));
    }

    seatXs.forEach((sx, i) => addBusBench(this, sx + 62, seatY + h * 0.17, 178, i === 3 ? 1 : 0.78));
    addNpcLine(
      this,
      [
        { x: seatXs[1] + 46, y: seatY + h * 0.16, height: 58, alpha: 0.72 },
        { x: seatXs[2] + 52, y: seatY + h * 0.17, height: 62, alpha: 0.72, flipX: true },
        { x: seatXs[4] + 54, y: seatY + h * 0.17, height: 60, alpha: 0.66 },
      ],
      3
    );

    // her — sitting alone, near the back
    const herSeat = seatXs[3];
    this.her = new Companion(this, herSeat + 34, seatY + h * 0.06, "hazel");
    this.her.setState("seated");
    this.seatBesideHer.set(herSeat + 88, seatY + h * 0.2);

    // him — the player, several rows ahead
    const hisSeat = seatXs[0];
    this.player = new Player(this, hisSeat + 40, seatY + h * 0.2, "blue");
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.06, seatY + h * 0.17, ww * 0.86, h * 0.24);
    this.player.setFrozen(true);
    this.rig.follow(this.player.soul.container, 0.08, 1.05);
    this.rig.setBounds(0, 0, ww, h);

    this.world.addDust(12, new Phaser.Geom.Rectangle(0, h * 0.15, ww, h * 0.4), 0xdce9ff, 0.16);
    this.audio.playBed("bus-engine");

    // the stranger who will take the seat if he does not
    const strangerArt = addStudentNpc(this, "boy-4", 0, 0, 72, 1, true);
    const sBody = this.add.graphics();
    if (!strangerArt) {
      sBody.fillStyle(0x1c2652, 1);
      sBody.fillEllipse(0, 0, 30, 48);
      sBody.fillCircle(0, -29, 10);
    }
    this.stranger = this.add.container(ww * 0.06, seatY + h * 0.26, strangerArt ? [strangerArt] : [sBody]).setDepth(DEPTH.world).setAlpha(0);

    void this.openBeat(herSeat, seatY, h);
  }

  private async openBeat(herSeat: number, seatY: number, h: number) {
    await this.ui.card("This one, <em>from his side</em>", "an ordinary morning, three rows apart", 2600);
    await this.ui.say([{ text: "She was sitting alone that morning.", kind: "whisper" }]);

    // the stop: the bus fills
    this.audio.softTick();
    this.tweens.add({ targets: this.stranger, alpha: 1, duration: 600 });
    await new Promise((r) => this.time.delayedCall(700, r));
    await this.ui.say([{ text: "At the next stop, a lot of people got on." }]);

    // someone begins moving toward the seat beside her
    this.strangerTween = this.tweens.add({
      targets: this.stranger,
      x: herSeat + 88,
      y: seatY + h * 0.26,
      duration: 11000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (!this.arrived) void this.tooSlow();
      },
    });

    this.p.setFrozen(false);
    this.ui.setHint("go to her");

    this.interactables.push({
      id: "sit-beside-her",
      x: this.seatBesideHer.x,
      y: this.seatBesideHer.y,
      r: 74,
      label: "sit beside her",
      once: true,
      when: () => !this.arrived,
      onUse: () => void this.sitBesideHer(),
    });
    this.stood = true;
  }

  /** No fail state: if the seat is taken, he simply waits and takes the next one. */
  private async tooSlow() {
    if (this.arrived) return;
    this.tweens.add({ targets: this.stranger, x: this.stranger.x + 90, duration: 2600, ease: "Sine.easeInOut" });
    await this.ui.say([{ text: "Someone else reached it first — so he waited, and took the next one.", kind: "whisper" }]);
    this.seatBesideHer.x += 4;
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);
    this.her.soul.lookAt(this.p.pos.x, this.p.pos.y);
    if (!this.stood || this.arrived) return;

    // she notices him coming before he arrives
    const d = Phaser.Math.Distance.Between(this.p.pos.x, this.p.pos.y, this.her.x, this.her.y);
    if (!this.nudged && d < 170) {
      this.nudged = true;
      this.her.soul.setIntensity(1.2);
    }
  }

  private async sitBesideHer() {
    this.arrived = true;
    this.strangerTween?.stop();
    this.tweens.add({ targets: this.stranger, x: this.stranger.x - 120, alpha: 0.7, duration: 2200, ease: "Sine.easeInOut" });
    this.p.setFrozen(true);
    this.ui.setHint(null);

    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.seatBesideHer.x,
        y: this.seatBesideHer.y,
        duration: 900,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    // her happiness is the whole reward — no text needed for it
    this.audio.duckBed("bus-engine", 0.016, 2.2);
    this.audio.sparkle();
    this.her.joyBurst();
    this.her.soul.setIntensity(1.55);
    this.her.soul.setWarmth(0.7);
    this.p.soul.setWarmth(0.4);
    this.rig.focusPull(this.her.x - 6, this.her.y + 6, 1.24, 1500);

    await new Promise((r) => this.time.delayedCall(2400, r));
    await this.ui.say([
      { text: "He gave up his seat without making anything of it." },
      { text: "She lit up like the morning had been waiting to do that all along." },
    ]);

    this.saves.setAliveness(38);
    this.keepMemory(MEMORY_IDS.morning);
    this.saves.checkpoint("GoodbyeScene");
    await new Promise((r) => this.time.delayedCall(900, r));
    this.transitionTo("GoodbyeScene");
  }
}
