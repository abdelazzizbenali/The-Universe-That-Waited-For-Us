/* Memory 18 — MISSING THE 16:00 BUS.
   They missed the 16:00 and had to wait for the 17:30. It took a long time.
   She got scared. He stayed, and kept reassuring her.

   The point is not that the bus was late. It is that the waiting was easier
   because they were doing it together. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

const CLOCKS = ["16:10", "16:30", "17:00", "17:20", "17:30"];
/** Seconds of real time each clock step takes. */
const STEP_SECONDS = 15;

export default class WaitingScene extends BaseScene {
  private companion!: Companion;
  private clockIdx = 0;
  private clockT = 0;
  /** 0 = calm, 1 = frightened. Rises over time, falls when she is not alone. */
  private worry = 0.15;
  private clockText!: Phaser.GameObjects.Text;
  private clockSub!: Phaser.GameObjects.Text;
  private done = false;
  private comforted = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;

    // a quiet stop at the end of the day
    this.skyRect(0x101a3e, 0x2e2a4e, w, h);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0d1533, 1);
    g.fillRect(0, h * 0.62, w, h * 0.38);
    g.fillStyle(0x131c40, 1);
    g.fillRect(0, h * 0.6, w, h * 0.03);
    // shelter + bench
    g.fillStyle(0x1a2550, 1);
    g.fillRect(w * 0.06, h * 0.3, 8, h * 0.32);
    g.fillRect(w * 0.34, h * 0.3, 8, h * 0.32);
    g.fillStyle(0x223066, 1);
    g.fillRoundedRect(w * 0.05, h * 0.24, w * 0.3, h * 0.06, 6);
    g.fillStyle(0x1e2a58, 1);
    g.fillRoundedRect(w * 0.12, h * 0.74, w * 0.18, h * 0.05, 6);
    g.fillRoundedRect(w * 0.12, h * 0.79, w * 0.18, h * 0.04, 6);

    this.world.addStars(20, new Phaser.Geom.Rectangle(0, 0, w, h * 0.4));
    this.world.addFlowers([
      { x: w * 0.52, y: h * 0.82 },
      { x: w * 0.6, y: h * 0.88, mint: true },
      { x: w * 0.72, y: h * 0.8, open: true },
    ]);
    this.world.addDust(12, new Phaser.Geom.Rectangle(0, h * 0.4, w, h * 0.4), 0x9fb0d0, 0.12);

    // the clock — the only thing in a hurry
    this.clockText = this.add
      .text(w / 2, 26, CLOCKS[0], {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "20px",
        color: "#eaf2ff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0.85)
      .setDepth(50);
    this.clockSub = this.add
      .text(w / 2, 50, "waiting for the 17:30", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
        color: "#5c6c8f",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    this.companion = new Companion(this, w * 0.42, h * 0.7);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.35);

    this.player = new Player(this, w * 0.34, h * 0.74);
    this.player.speed = 150;
    this.player.bounds = new Phaser.Geom.Rectangle(w * 0.06, h * 0.62, w * 0.86, h * 0.28);
    this.cameras.main.setBounds(0, 0, w, h);
    this.cameras.main.centerOn(w / 2, h * 0.62);

    /* optional small things — not a fetch quest, just a place to be */
    const small: { id: string; x: number; y: number; label: string; line: string }[] = [
      { id: "flower", x: w * 0.52, y: h * 0.8, label: "a small flower", line: "She bent down to look at it properly." },
      { id: "leaf", x: w * 0.63, y: h * 0.84, label: "a leaf", line: "It turned over twice in the same gust." },
      { id: "bird", x: w * 0.74, y: h * 0.76, label: "a bird", line: "It watched them from the shelter roof for a long moment." },
      { id: "star", x: w * 0.2, y: h * 0.36, label: "an early star", line: "One star had decided not to wait for full dark." },
      { id: "bench", x: w * 0.2, y: h * 0.74, label: "the bench", line: "They sat. The waiting got shorter when they did." },
    ];
    for (const s of small) {
      this.interactables.push({
        id: `wait-${s.id}`,
        x: s.x,
        y: s.y,
        r: 66,
        label: s.label,
        once: true,
        when: () => !this.done,
        onUse: () => {
          this.audio.softTick();
          this.worry = Math.max(0, this.worry - 0.18);
          this.comforted++;
          this.p.soul.setWarmth(Math.min(0.6, 0.2 + this.comforted * 0.1));
          void this.ui.say([{ text: s.line, kind: "whisper" }]);
        },
      });
    }

    // staying near him is the real mechanic
    this.interactables.push({
      id: "stay",
      x: this.companion.x,
      y: this.companion.y,
      r: 120,
      label: "stay with her",
      when: () => !this.done && this.worry > 0.35,
      onUse: () => {
        this.worry = Math.max(0, this.worry - 0.3);
        this.companion.soul.setIntensity(1.35);
        this.audio.tone(392, 0.025, 1.4);
        void this.ui.say([{ text: "He said something ordinary and certain, and she believed it.", kind: "whisper" }]);
      },
    });

    this.audio.playBed("night-wind");
    void this.open();
  }

  private async open() {
    await this.ui.say([
      { text: "They missed the sixteen o'clock." },
      { text: "The next one was at half past five." },
    ]);
    this.ui.setHint("wait with her");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    if (this.done) return;

    // time passes. slowly. that is the point.
    this.clockT += dt;
    if (this.clockT >= STEP_SECONDS && this.clockIdx < CLOCKS.length - 1) {
      this.clockT = 0;
      this.clockIdx++;
      this.clockText.setText(CLOCKS[this.clockIdx]);
      this.audio.softTick();
      // the last stretch before the bus is the hardest
      if (this.clockIdx === 3) {
        this.worry = Math.min(1, this.worry + 0.4);
        void this.ui.say([{ text: "The bus was taking a long time.", kind: "whisper" }]);
      }
    }

    // worry creeps, presence pushes it back
    const near = this.companion.distanceToPlayer(this.p.pos) < 110;
    this.worry += (near ? -0.06 : 0.05) * dt;
    this.worry = Phaser.Math.Clamp(this.worry, 0, 1);

    // the world reads her state: her aura thins as the worry rises
    this.p.soul.setIntensity(1 - this.worry * 0.35);
    this.p.soul.setWarmth((1 - this.worry) * 0.4);
    // the ambience tightens a little with the waiting
    this.audio.duckAmbience(1 - this.worry * 0.35, 1.2);

    if (this.clockIdx >= CLOCKS.length - 1 && this.clockT > 4) void this.arrive();
    void t;
  }

  private async arrive() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    this.clockText.setText("17:30");
    this.clockSub.setText("here it comes");
    this.audio.settle();
    const light = this.add
      .image(this.scale.width * 0.9, this.scale.height * 0.55, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe0b36a)
      .setScale(6)
      .setAlpha(0)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: light, alpha: 0.8, scale: 22, duration: 2200, ease: "Sine.easeOut" });

    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 16, 1.14, 1600);
    await new Promise((r) => this.time.delayedCall(2000, r));
    await this.ui.say([
      { text: "Anxiety became easier because they were waiting together." },
      { text: "It was never really about the bus." },
    ]);

    this.saves.setAliveness(78);
    this.keepMemory(MEMORY_IDS.waiting);
    this.saves.checkpoint("YellowLightScene");
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("YellowLightScene");
  }
}
