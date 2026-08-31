/* Memory 23 — WHEN SHE NOTICES.
   When he is not well, or simply tired, she is the one who catches it. She
   asks. She thinks about him. She stays.

   Played from his side: the world drains, movement slows, and she closes the
   distance on her own. This is not healing. It is care. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

export default class MutualCareScene extends BaseScene {
  private her!: Companion;
  /** 0 = drained, 1 = steady. Slowly recovers while she stays. */
  private vitality = 0.28;
  private drain!: Phaser.GameObjects.Image;
  private noticed = false;
  private stayT = 0;
  private done = false;
  private asked = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.6);

    this.skyRect(0x0a1028, 0x16203e, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0b122c, 1);
    g.fillEllipse(ww * 0.5, h * 1.3, ww * 1.4, h * 0.7);
    g.fillStyle(0x101a3c, 1);
    g.fillRoundedRect(0, h * 0.66, ww, h * 0.14, 18);

    this.world.addStars(18, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.4));
    this.world.addFlowers([
      { x: ww * 0.24, y: h * 0.86 },
      { x: ww * 0.62, y: h * 0.88 },
      { x: ww * 0.86, y: h * 0.84, open: true, mint: true },
    ]);
    this.world.addDust(12, new Phaser.Geom.Rectangle(0, h * 0.4, ww, h * 0.4), 0x9fb0d0, 0.1);

    this.drain = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.4, h * 1.4)
      .setTint(0x2c4a8a)
      .setAlpha(0.5)
      .setDepth(DEPTH.overlay - 2);

    // him, walking home tired
    this.player = new Player(this, ww * 0.5, h * 0.76, "blue");
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.06, h * 0.68, ww * 0.88, h * 0.18);
    this.player.soul.setIntensity(0.62);

    // her — she notices on her own, without being told
    this.her = new Companion(this, ww * 0.36, h * 0.78, "hazel");
    this.her.setState("beside");
    this.her.maxSpeed = 185;

    this.rig.follow(this.player.soul.container, 0.06, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.audio.playBed("night-wind");
    this.audio.duckAmbience(0.55, 2);
    void this.open();
  }

  private async open() {
    await this.ui.say([
      { text: "Some days he was simply not well, and did not say so." },
      { text: "He walked a little slower, and thought nobody would notice.", kind: "whisper" },
    ]);
    this.ui.setHint("keep walking — she is watching");
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);
    if (this.done) return;

    // the world drains while he is low
    this.drain.setAlpha(0.2 + (1 - this.vitality) * 0.4);
    this.p.soul.setIntensity(0.5 + this.vitality * 0.5);
    this.p.soul.setWarmth(this.vitality * 0.25);
    // tiredness is in the controls, not a debuff icon
    (this.player as Player).speed = 110 + this.vitality * 90;

    const d = this.her.distanceToPlayer(this.p.pos);

    // she notices: she closes the distance without being asked
    if (!this.noticed && d < 260) {
      this.noticed = true;
      this.audio.softTick();
      this.her.soul.setIntensity(1.2);
      void this.ui.say([{ text: "She noticed.", kind: "whisper" }]);
    }

    if (this.noticed && !this.asked && d < 90) {
      this.asked = true;
      void this.ui.say([
        { text: "She asked what was wrong, and did not accept nothing as an answer." },
        { text: "Then she stayed.", kind: "whisper" },
      ]);
    }

    // her staying is the mechanic
    if (this.noticed && d < 120) {
      this.stayT += dt;
      this.vitality = Math.min(1, this.vitality + dt * 0.075);
      this.her.soul.setWarmth(0.35 + this.vitality * 0.4);
      this.audio.duckAmbience(0.55 + this.vitality * 0.45, 1.2);
      if (this.stayT > 16 && !this.done) void this.finish();
    } else if (this.noticed) {
      this.vitality = Math.max(0.24, this.vitality - dt * 0.02);
    }

    if (this.noticed && !this.done) {
      this.ui.setHint(d < 120 ? "let her stay" : "she is trying to reach you");
    }
    void t;
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    this.her.setState("seated");
    this.her.moveTo(this.p.pos.x - 40, this.p.pos.y + 4);
    this.rig.focusPull((this.p.pos.x + this.her.x) / 2, this.p.pos.y - 16, 1.16, 2000);

    // color returns slowly, and not because anything was fixed
    this.tweens.add({ targets: this.drain, alpha: 0.14, duration: 3600, ease: "Sine.easeInOut" });
    this.tweens.add({
      targets: this,
      vitality: 1,
      duration: 3600,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        this.p.soul.setIntensity(0.5 + this.vitality * 0.5);
        this.p.soul.setWarmth(this.vitality * 0.3);
      },
    });
    this.audio.restoreAmbience(3);
    this.audio.startMotif("warm");

    await new Promise((r) => this.time.delayedCall(2600, r));
    await this.ui.say([
      { text: "Nothing was cured. Nothing was solved." },
      { text: "She stayed, and the world became bearable again." },
      { text: "She is often the one who catches it first.", kind: "whisper" },
    ]);

    this.saves.setAliveness(88);
    this.keepMemory(MEMORY_IDS.mutualCare);
    this.saves.checkpoint("ColorHuntScene");
    this.audio.stopMotif();
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("ColorHuntScene");
  }
}
