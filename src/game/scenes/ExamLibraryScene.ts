/* Memory 15 — THE LIBRARY DURING EXAMS.
   Exam weeks. They studied, they rested, and sometimes they simply watched
   each other and were happy. There is no conflict here on purpose.

   This is the same room as the first library — and it is not the same room.
   It is warmer now, because they are. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";

const FRAGMENTS: Record<string, string> = {
  "open-book": "The same paragraph, read four times. Neither of them minded.",
  "sit-table": "They sat close enough that studying became an excuse.",
  "window-dusk": "Outside, the light went amber and nobody turned a lamp on.",
  "look-at-him": "Sometimes they were simply watching each other, and happy.",
  chair: "Her chair ended up nearer his than the library had placed it.",
};

export default class ExamLibraryScene extends BaseScene {
  private companion!: Companion;
  private found = new Set<string>();
  private warmth!: Phaser.GameObjects.Image;
  private seam: Phaser.GameObjects.Image | null = null;
  private resting = false;
  private done = false;
  private tablePos!: Phaser.Math.Vector2;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.6);

    // the same architecture as the first library — warmer lighting now
    this.skyRect(0x121a3c, 0x22305e, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x16204a, 1);
    g.fillRect(0, 0, ww, h);
    g.fillStyle(0x101838, 1);
    g.fillRect(0, h * 0.62, ww, h * 0.38);

    // windows, amber dusk
    for (let i = 0; i < 2; i++) {
      const wx = ww * 0.66 + i * ww * 0.16;
      g.fillStyle(0x4a6bb0, 1);
      g.fillRoundedRect(wx, h * 0.12, ww * 0.11, h * 0.34, 10);
      g.fillStyle(0xf0c98a, 0.85);
      g.fillRoundedRect(wx + 6, h * 0.12 + 6, ww * 0.11 - 12, h * 0.34 - 12, 8);
      const shaft = this.add
        .image(wx + ww * 0.04, h * 0.42, "shaft")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.26)
        .setRotation(0.3)
        .setScale(1.1, 1.2)
        .setDepth(DEPTH.light);
      this.tweens.add({ targets: shaft, alpha: 0.36, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    // shelves, softly lit
    const shelfXs = [0.05, 0.2, 0.35].map((f) => f * ww);
    for (const sx of shelfXs) {
      g.fillStyle(0x223066, 1);
      g.fillRoundedRect(sx, hh0(h, 0.14), ww * 0.12, h * 0.4, 8);
      g.fillStyle(0x101a3e, 1);
      g.fillRect(sx + 8, h * 0.18, ww * 0.12 - 16, h * 0.13);
      g.fillRect(sx + 8, h * 0.35, ww * 0.12 - 16, h * 0.13);
      let bx = sx + 12;
      while (bx < sx + ww * 0.12 - 20) {
        const bw = Phaser.Math.Between(6, 12);
        const bh = Phaser.Math.Between(18, 30);
        const cols = [0x7fc4ff, 0xe0b36a, 0x9aab62, 0xf2b8c6, 0x9fe3c9];
        g.fillStyle(cols[Phaser.Math.Between(0, cols.length - 1)], 0.75);
        g.fillRect(bx, h * 0.31 - bh, bw, bh);
        g.fillRect(bx, h * 0.48 - bh * 0.9, bw, bh * 0.9);
        bx += bw + Phaser.Math.Between(2, 6);
      }
      this.colliders.push(rect(sx + ww * 0.06, h * 0.34, ww * 0.12, h * 0.4));
    }

    // their table
    this.tablePos = new Phaser.Math.Vector2(ww * 0.58, h * 0.6);
    const t = this.tablePos;
    g.fillStyle(0x2e3c78, 1);
    g.fillRoundedRect(t.x - 92, t.y - 26, 184, 52, 12);
    g.fillStyle(0x37478a, 1);
    g.fillRoundedRect(t.x - 92, t.y - 26, 184, 14, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.colliders.push(rect(t.x, t.y, 194, 60));
    g.fillStyle(0x223066, 1);
    g.fillRoundedRect(t.x + 26, t.y - 66, 34, 30, 8);
    g.fillRoundedRect(t.x + 26, t.y + 38, 34, 30, 8);

    // warm air, dust in the light
    this.warmth = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.3, h * 1.3)
      .setTint(0xe0b36a)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.22)
      .setDepth(DEPTH.overlay - 2);
    this.world.addDust(28, new Phaser.Geom.Rectangle(ww * 0.5, h * 0.12, ww * 0.45, h * 0.6), 0xf4e3c0, 0.34);
    this.world.addDust(12, new Phaser.Geom.Rectangle(0, h * 0.1, ww * 0.5, h * 0.6), 0xbfd9ff, 0.12);
    this.world.addFlowers([{ x: ww * 0.44, y: h * 0.86, open: true, mint: true }]);

    // him — already there, waiting, as he always is
    this.companion = new Companion(this, t.x + 43, t.y - 42);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.4);

    this.player = new Player(this, ww * 0.08, h * 0.76);
    this.player.speed = 150;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.56, ww * 0.94, h * 0.36);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    const spots: { id: string; x: number; y: number; label: string }[] = [
      { id: "open-book", x: t.x - 60, y: t.y + 6, label: "open a book" },
      { id: "sit-table", x: t.x + 43, y: t.y + 56, label: "sit at the table" },
      { id: "window-dusk", x: ww * 0.71, y: h * 0.52, label: "look out the window" },
      { id: "chair", x: t.x + 100, y: t.y + 60, label: "move a chair" },
      { id: "look-at-him", x: t.x + 43, y: t.y - 42, label: "look at him" },
    ];
    for (const s of spots) {
      const marker = this.add
        .image(s.x, s.y - 18, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xf4dca8)
        .setScale(1.5)
        .setAlpha(0.55)
        .setDepth(DEPTH.fx);
      this.tweens.add({ targets: marker, y: s.y - 26, alpha: 0.2, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.interactables.push({
        id: `exam-${s.id}`,
        x: s.x,
        y: s.y,
        r: 66,
        label: s.label,
        once: true,
        when: () => !this.done,
        onUse: () => {
          this.found.add(s.id);
          marker.destroy();
          this.audio.softTick();
          this.tweens.add({ targets: this.warmth, alpha: Math.min(0.34, 0.22 + this.found.size * 0.03), duration: 1600 });
          void this.ui.say([{ text: FRAGMENTS[s.id], kind: "whisper" }]).then(() => {
            if (this.found.size >= 3 && !this.resting && !this.done) {
              this.ui.setHint("stay a while — or rest here");
            }
          });
        },
      });
    }

    // staying is the whole point of this chapter
    this.interactables.push({
      id: "rest-here",
      x: t.x + 43,
      y: t.y + 54,
      r: 70,
      label: "rest here with him",
      once: true,
      when: () => this.found.size >= 3 && !this.done,
      onUse: () => void this.rest(),
    });

    this.audio.playBed("library");
    this.audio.startMotif("warm");
    this.ui.setHint("exam weeks — nothing here is in a hurry");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);

    // OUR COLOR, comfortably present whenever they are near each other
    const near = this.companion.distanceToPlayer(this.p.pos) < 150;
    if (near && !this.seam) {
      this.seam = this.add
        .image((this.p.pos.x + this.companion.x) / 2, (this.p.pos.y + this.companion.y) / 2, "aura-our")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.4)
        .setAlpha(0)
        .setDepth(DEPTH.fx);
      this.tweens.add({ targets: this.seam, alpha: 0.2, scale: 0.9, duration: 1800, ease: "Sine.easeOut" });
    } else if (!near && this.seam) {
      const s = this.seam;
      this.seam = null;
      this.tweens.add({ targets: s, alpha: 0, duration: 900, onComplete: () => s.destroy() });
    } else if (near && this.seam) {
      this.seam.setPosition((this.p.pos.x + this.companion.x) / 2, (this.p.pos.y + this.companion.y) / 2);
    }
  }

  private async rest() {
    this.resting = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.tablePos.x + 43,
        y: this.tablePos.y + 50,
        duration: 900,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2 - 10, this.p.pos.y - 20, 1.16, 1800);
    this.audio.duckBed("library", 0.012, 3);
    this.p.soul.setWarmth(0.6);
    this.companion.soul.setIntensity(1.4);

    await new Promise((r) => this.time.delayedCall(2200, r));
    await this.ui.say([
      { text: "Exam weeks were supposed to be the hard part." },
      { text: "Mostly, they were just happy to be in the same room.", kind: "whisper" },
      { text: "The room had not become warmer. They had." },
    ]);

    this.saves.setAliveness(70);
    this.keepMemory(MEMORY_IDS.exams);
    this.saves.checkpoint("BusChangesScene");
    this.audio.stopMotif();
    await new Promise((r) => this.time.delayedCall(900, r));
    this.ui.letterbox(false);
    this.transitionTo("BusChangesScene");
  }
}

function hh0(h: number, f: number) {
  return h * f;
}
