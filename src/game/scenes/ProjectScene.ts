/* Memory 20 — HER PROJECT.
   She had a project. They worked on it together, on his computer, in a
   nearly empty library, free to talk. When it was finished she rested her
   head on his hand, and felt safe.

   The task is small and symbolic. The important instruction the scene gives
   the player afterwards is: stop. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";

interface Piece {
  id: string;
  label: string;
  img: Phaser.GameObjects.Image;
  slotX: number;
  slotY: number;
  placed: boolean;
}

const PIECES = [
  { id: "title", label: "a title", color: 0x7fc4ff },
  { id: "structure", label: "a structure", color: 0x9fe3c9 },
  { id: "sources", label: "the sources", color: 0xe0b36a },
  { id: "corrections", label: "last corrections", color: 0xf2b8c6 },
];

export default class ProjectScene extends BaseScene {
  private companion!: Companion;
  private pieces: Piece[] = [];
  private placed = 0;
  private tablePos!: Phaser.Math.Vector2;
  private done = false;
  private laptopGlow!: Phaser.GameObjects.Image;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.5);

    this.skyRect(0x101a3c, 0x1e2a54, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x141d44, 1);
    g.fillRect(0, 0, ww, h);
    g.fillStyle(0x0f1738, 1);
    g.fillRect(0, h * 0.62, ww, h * 0.38);
    // empty library: rows of shelves, most lights off
    for (let i = 0; i < 4; i++) {
      const sx = ww * 0.06 + i * ww * 0.16;
      g.fillStyle(0x1b2550, 1);
      g.fillRoundedRect(sx, h * 0.14, ww * 0.11, h * 0.38, 8);
      g.fillStyle(0x101a3e, 1);
      g.fillRect(sx + 8, h * 0.18, ww * 0.11 - 16, h * 0.12);
      g.fillRect(sx + 8, h * 0.34, ww * 0.11 - 16, h * 0.12);
      let bx = sx + 12;
      while (bx < sx + ww * 0.11 - 20) {
        g.fillStyle(0x2b3a70, 0.7);
        g.fillRect(bx, h * 0.3 - 22, 8, 22);
        bx += 14;
      }
      this.colliders.push(rect(sx + ww * 0.055, h * 0.33, ww * 0.11, h * 0.38));
    }
    // one warm lamp over their table — the room is nearly empty
    const lamp = this.add
      .image(ww * 0.62, h * 0.3, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf4e3c0)
      .setScale(50, 30)
      .setAlpha(0.2)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: lamp, alpha: 0.3, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.tablePos = new Phaser.Math.Vector2(ww * 0.62, h * 0.62);
    const t = this.tablePos;
    g.fillStyle(0x2a3870, 1);
    g.fillRoundedRect(t.x - 100, t.y - 24, 200, 48, 12);
    g.fillStyle(0x32428a, 1);
    g.fillRoundedRect(t.x - 100, t.y - 24, 200, 12, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.colliders.push(rect(t.x, t.y, 210, 56));

    // the laptop — the document assembling itself on screen
    g.fillStyle(0x1a2550, 1);
    g.fillRoundedRect(t.x - 46, t.y - 54, 92, 44, 6);
    g.fillStyle(0x2b3a70, 1);
    g.fillRoundedRect(t.x - 42, t.y - 50, 84, 36, 4);
    this.laptopGlow = this.add
      .image(t.x, t.y - 32, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(18, 14)
      .setAlpha(0.25)
      .setDepth(DEPTH.light);

    this.world.addDust(18, new Phaser.Geom.Rectangle(ww * 0.4, h * 0.15, ww * 0.5, h * 0.6), 0xf4e3c0, 0.26);

    this.companion = new Companion(this, t.x - 66, t.y + 40);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.4);

    this.player = new Player(this, ww * 0.12, h * 0.76);
    this.player.speed = 150;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.6, ww * 0.94, h * 0.28);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the four pieces, scattered where she left them
    PIECES.forEach((def, i) => {
      const x = ww * (0.2 + i * 0.09);
      const y = h * (0.72 + (i % 2) * 0.06);
      const img = this.add
        .image(x, y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(def.color)
        .setScale(2)
        .setDepth(DEPTH.fx);
      this.tweens.add({ targets: img, alpha: 0.5, scale: 2.6, duration: 1400 + i * 150, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const piece: Piece = {
        id: def.id,
        label: def.label,
        img,
        slotX: t.x - 60 + i * 40,
        slotY: t.y - 32,
        placed: false,
      };
      this.pieces.push(piece);
      this.interactables.push({
        id: `piece-${def.id}`,
        x,
        y,
        r: 68,
        label: def.label,
        once: true,
        when: () => !this.done,
        onUse: () => void this.place(piece, def.color),
      });
    });

    this.audio.playBed("library");
    this.audio.startMotif("warm");
    void this.open();
  }

  private async open() {
    await this.ui.say([
      { text: "She had a project, and it was not going to finish itself." },
      { text: "The library was nearly empty. They were free to talk.", kind: "whisper" },
    ]);
    this.ui.setHint("work on it together — four pieces");
  }

  private async place(piece: Piece, color: number) {
    piece.placed = true;
    this.placed++;
    this.audio.softTick();
    this.tweens.add({
      targets: piece.img,
      x: piece.slotX,
      y: piece.slotY,
      scale: 1.4,
      alpha: 0.9,
      duration: 800,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({ targets: this.laptopGlow, alpha: 0.25 + this.placed * 0.12, scale: 18 + this.placed * 2, duration: 700 });
    this.companion.soul.setIntensity(1.1 + this.placed * 0.08);

    if (this.placed >= PIECES.length) await this.complete();
    else this.ui.setHint(`${PIECES.length - this.placed} to go`);
    void color;
  }

  private async complete() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.audio.sparkle();

    await new Promise((r) => this.time.delayedCall(900, r));
    await this.ui.say([
      { text: "It was finished." },
      { text: "And then nothing needed to happen." },
    ]);

    /* ---------------- the head on his hand ---------------- */
    this.ui.letterbox(true);
    this.audio.duckBed("library", 0.01, 3);
    this.audio.stopMotif();

    const hx = this.companion.x;
    const hy = this.companion.y;
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: hx + 20,
        y: hy + 26,
        duration: 1400,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    this.rig.focusPull(hx + 14, hy + 4, 1.2, 2200);
    this.p.soul.setWarmth(0.7);
    this.p.soul.setIntensity(1.25);
    this.companion.soul.setWarmth(0.5);
    this.companion.soul.setIntensity(1.45);

    // she rests her head on his hand — slow, and then the game waits
    const rest = this.add
      .image(hx + 18, hy + 14, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.2)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: rest, alpha: 0.3, scale: 0.9, duration: 2600, ease: "Sine.easeOut" });
    for (let i = 0; i < 10; i++) {
      const m = this.add
        .image(hx + 18, hy + 10, "dust")
        .setTint(0xf4dca8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: m,
        y: hy - 40 - i * 6,
        x: hx + 18 + Phaser.Math.Between(-30, 30),
        alpha: 0.5,
        duration: 3000,
        delay: i * 220,
        ease: "Sine.easeOut",
        onComplete: () => m.destroy(),
      });
    }

    await new Promise((r) => this.time.delayedCall(5000, r));
    await this.ui.say([
      { text: "She rested her head on his hand." },
      { text: "She felt safe. She felt comfortable.", kind: "whisper" },
      { text: "She loved this one." },
    ]);

    this.saves.setAliveness(82);
    this.keepMemory(MEMORY_IDS.project);
    this.saves.checkpoint("NaturalBusScene");
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("NaturalBusScene");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
  }
}
