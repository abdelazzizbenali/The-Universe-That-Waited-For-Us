/* Memory 14 — THE FIRST VIDEO TOGETHER.
   One evening, coming home on the bus, they sat close and he filmed a few
   seconds of the two of them. Eight seconds that could be kept.

   Mechanic: MEMORY RECORDING — hold the frame, hold still, and the moment
   becomes the first Memory Frame in the archive. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, FRAME_LABELS, MEMORY_IDS } from "../config";

const REC_SECONDS = 8;

export default class VideoBusScene extends BaseScene {
  private companion!: Companion;
  private recG: Phaser.GameObjects.Graphics | null = null;
  private recDot: Phaser.GameObjects.Image | null = null;
  private recText: Phaser.GameObjects.Text | null = null;
  private recording = false;
  private recT = 0;
  private done = false;
  private streaks: Phaser.GameObjects.Image[] = [];

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.3);

    // warm evening bus
    this.skyRect(0x141026, 0x241a3a, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x1a1434, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 4; i++) {
      const wx = ww * 0.08 + i * ww * 0.24;
      g.fillStyle(0x3a2a52, 1);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.15, h * 0.3, 12);
      g.fillStyle(0xe0b36a, 0.3);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.15, h * 0.08, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x120e28, 1);
    g.fillRect(0, h * 0.42, ww, h * 0.58);
    // their seat, near the back
    g.fillStyle(0x241c46, 1);
    g.fillRoundedRect(ww * 0.6, h * 0.5, 150, h * 0.16, 12);
    g.fillStyle(0x2c2352, 1);
    g.fillRoundedRect(ww * 0.6, h * 0.62, 150, h * 0.05, 8);

    // window light moving past — the bus is going home
    for (let i = 0; i < 5; i++) {
      const s = this.add
        .image(-100 - i * 200, h * (0.14 + (i % 3) * 0.08), "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xe0b36a)
        .setAlpha(0.16)
        .setScale(18, 4)
        .setDepth(DEPTH.back + 1);
      this.streaks.push(s);
      this.tweens.add({ targets: s, x: ww + 200, duration: 5200 + i * 600, repeat: -1, delay: i * 400 });
    }

    this.world.addDust(12, new Phaser.Geom.Rectangle(0, h * 0.1, ww, h * 0.4), 0xe0b36a, 0.18);

    this.companion = new Companion(this, ww * 0.66, h * 0.54);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.35);

    this.player = new Player(this, ww * 0.2, h * 0.66);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.05, h * 0.56, ww * 0.9, h * 0.3);
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.interactables.push({
      id: "sit-close",
      x: ww * 0.72,
      y: h * 0.66,
      r: 78,
      label: "sit close",
      once: true,
      when: () => !this.done,
      onUse: () => void this.sitClose(),
    });

    this.audio.playBed("bus-engine");
    this.ui.setHint("the seat beside him, near the back");
  }

  private async sitClose() {
    this.p.setFrozen(true);
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.companion.x + 44,
        y: this.companion.y + 16,
        duration: 900,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    // close together — blue and hazel clearly mixing, without the full bloom
    this.audio.duckBed("bus-engine", 0.02, 2);
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 6, 1.14, 1200);
    this.p.soul.setWarmth(0.5);
    this.companion.soul.setIntensity(1.35);

    await new Promise((r) => this.time.delayedCall(1200, r));
    await this.ui.say([
      { text: "The bus was going home, and neither of them wanted the ride to end." },
      { text: "He held up his phone and pressed record.", kind: "whisper" },
    ]);
    this.beginRec();
  }

  /* ---------------- the recording ---------------- */

  private beginRec() {
    this.recording = true;
    this.recT = 0;
    this.uiLocked = true; // the camera/recording owns the action button now
    this.ui.setAction("hold to record");

    const w = this.scale.width;
    const h = this.scale.height;
    this.recG = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.overlay + 3);
    this.recDot = this.add
      .image(28, 26, "dot-blue")
      .setScrollFactor(0)
      .setTint(0xff6b6b)
      .setScale(1.6)
      .setDepth(DEPTH.overlay + 5);
    this.recText = this.add
      .text(44, 20, "REC  0:08", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "11px",
        color: "#eaf2ff",
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 5);

    // framing brackets — a viewfinder, not a social app
    const fw = Math.min(190, w * 0.24);
    const fh = Math.min(140, h * 0.34);
    const cx = w / 2;
    const cy = h / 2;
    const arm = 20;
    this.recG.lineStyle(1.5, 0xeaf2ff, 0.5);
    for (const [x, y, sx, sy] of [
      [cx - fw, cy - fh, 1, 1],
      [cx + fw, cy - fh, -1, 1],
      [cx - fw, cy + fh, 1, -1],
      [cx + fw, cy + fh, -1, -1],
    ] as [number, number, number, number][]) {
      this.recG.beginPath();
      this.recG.moveTo(x + arm * sx, y);
      this.recG.lineTo(x, y);
      this.recG.lineTo(x, y + arm * sy);
      this.recG.strokePath();
    }

    // a personal recording: warm grain, gentle breathing zoom
    this.cameras.main.zoomTo(this.settings.zoom * 1.08, 2400, "Sine.easeInOut");
    this.audio.tone(880, 0.02, 0.2);
  }

  private endRec() {
    this.recording = false;
    this.uiLocked = false;
    this.ui.setAction(null);
    this.recG?.destroy();
    this.recG = null;
    this.recDot?.destroy();
    this.recDot = null;
    this.recText?.destroy();
    this.recText = null;
    this.cameras.main.zoomTo(this.settings.zoom, 1200, "Sine.easeInOut");
    this.audio.shutter();
    void this.finish();
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);

    if (!this.recording) return;
    // holding the button keeps the camera rolling
    if (this.input2.actionHeld()) {
      this.recT += dt;
      const left = Math.max(0, REC_SECONDS - this.recT);
      if (this.recText) {
        this.recText.setText(`REC  0:${String(Math.ceil(left)).padStart(2, "0")}`);
      }
      if (this.recDot) this.recDot.setAlpha(0.4 + 0.6 * Math.abs(Math.sin(t * 6)));
      // the two of them lean a little closer as the seconds pass
      this.p.soul.setWarmth(Math.min(0.8, 0.5 + this.recT * 0.03));
      this.companion.soul.setIntensity(Math.min(1.6, 1.35 + this.recT * 0.03));
      if (this.recT >= REC_SECONDS) this.endRec();
    } else if (this.recText) {
      this.recText.setText("REC  · hold ·");
    }
  }

  private async finish() {
    this.done = true;
    for (const s of this.streaks) this.tweens.getTweensOf(s).forEach((tw) => (tw.timeScale = 0.6));

    // the first Memory Frame — something of them that could be kept
    this.saves.addFrame("frame-first-video");
    this.ui.toast(`◈ memory frame — ${FRAME_LABELS["frame-first-video"]}`);

    await new Promise((r) => this.time.delayedCall(1400, r));
    await this.ui.say([
      { text: "Eight seconds. Moving bus. Both of them in the same small frame." },
      { text: "It was the first little piece of them that could be kept.", kind: "whisper" },
    ]);

    this.saves.setAliveness(68);
    this.keepMemory(MEMORY_IDS.video);
    this.saves.checkpoint("ExamLibraryScene");
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("ExamLibraryScene");
  }
}
