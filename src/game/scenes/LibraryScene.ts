/* Scene 6 — FIRST LIBRARY. The library of first words: bookshelves, tables,
   chairs, windows with soft sunlight and dust. Four small fragments to
   discover, then she sits with him — where strangers slowly stopped feeling
   like strangers. The vertical slice resolves here. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";
import { addLightPool, addMotes } from "../art/environment";

const FRAGMENTS: Record<string, string> = {
  book: "Some pages stayed half-read that day. Talking was better.",
  table: "The end of classes became something to wait for.",
  chair: "Two chairs, pulled closer than the library arranged them.",
  window: "The light kept finding the same table first.",
  corner: "A quiet corner, learned by heart. Theirs, without ever being claimed.",
};

export default class LibraryScene extends BaseScene {
  private companion!: Companion;
  private found = new Set<string>();
  private sitting = false;
  private seated = false;
  private tablePos!: Phaser.Math.Vector2;
  private warmth!: Phaser.GameObjects.Image;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.7);
    const hh = h;

    // warm interior
    this.skyRect(0x0d1330, 0x14204a, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x111b3e, 1);
    g.fillRect(0, 0, ww, hh);
    // back wall panelling and a hint of a ceiling
    g.fillStyle(0x0f1738, 1);
    g.fillRect(0, 0, ww, hh * 0.1);
    g.fillStyle(0x131e46, 1);
    for (let i = 0; i < 18; i++) g.fillRect((ww / 18) * i, hh * 0.08, 3, hh * 0.06);
    // floor with plank variation instead of a flat band
    g.fillStyle(0x0d1533, 1);
    g.fillRect(0, hh * 0.62, ww, hh * 0.38);
    for (let i = 0; i < 22; i++) {
      g.fillStyle(i % 2 ? 0x101a3c : 0x0c1430, 1);
      g.fillRect(0, hh * 0.62 + i * (hh * 0.38) / 22, ww, (hh * 0.38) / 22 - 1);
    }
    // the table's own pool of light (table is defined just below)
    addLightPool(this, ww * 0.62, hh * 0.6 + 30, 300, 150, 0xf4e3c0, 0.12);
    addMotes(
      this,
      new Phaser.Geom.Rectangle(ww * 0.5, hh * 0.12, ww * 0.45, hh * 0.6),
      16,
      0xf4e3c0,
      0.3
    );

    // windows with soft sunlight (right side)
    for (let i = 0; i < 2; i++) {
      const wx = ww * 0.66 + i * ww * 0.17;
      g.fillStyle(0x35579e, 1);
      g.fillRoundedRect(wx, hh * 0.12, ww * 0.12, hh * 0.34, 10);
      g.fillStyle(0xf4e3c0, 0.5);
      g.fillRoundedRect(wx + 6, hh * 0.12 + 6, ww * 0.12 - 12, hh * 0.34 - 12, 8);
      const shaft = this.add
        .image(wx + ww * 0.04, hh * 0.42, "shaft")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.16)
        .setRotation(0.32)
        .setScale(1, 1.1)
        .setDepth(DEPTH.light);
      this.tweens.add({ targets: shaft, alpha: 0.24, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    // bookshelves (left + center)
    const shelfXs = [0.05, 0.22, 0.39].map((f) => f * ww);
    for (const sx of shelfXs) {
      g.fillStyle(0x1a2550, 1);
      g.fillRoundedRect(sx, hh * 0.14, ww * 0.13, hh * 0.4, 8);
      g.fillStyle(0x0e1738, 1);
      g.fillRect(sx + 8, hh * 0.18, ww * 0.13 - 16, hh * 0.13);
      g.fillRect(sx + 8, hh * 0.35, ww * 0.13 - 16, hh * 0.13);
      // book spines
      let bx = sx + 12;
      while (bx < sx + ww * 0.13 - 20) {
        const bw = Phaser.Math.Between(6, 12);
        const bh = Phaser.Math.Between(18, 30);
        const cols = [0x7fc4ff, 0xe0b36a, 0x9aab62, 0xf2b8c6, 0x9fe3c9];
        g.fillStyle(cols[Phaser.Math.Between(0, cols.length - 1)], 0.55);
        g.fillRect(bx, hh * 0.31 - bh, bw, bh);
        g.fillRect(bx, hh * 0.48 - bh * 0.9, bw, bh * 0.9);
        bx += bw + Phaser.Math.Between(2, 6);
      }
      this.colliders.push(rect(sx + ww * 0.065, hh * 0.34, ww * 0.13, hh * 0.4));
    }

    // Exactly four small physical tables. The special story table is center-right
    // with HER SEAT on the near side, adjacent to him but not against an edge.
    this.tablePos = new Phaser.Math.Vector2(ww * 0.62, hh * 0.6);
    const t = this.tablePos;
    const tables = [
      { key: "trim-table-1", x: t.x, y: t.y, w: 132, h: 61, special: true },
      { key: "trim-table-2", x: ww * 0.30, y: hh * 0.66, w: 118, h: 56 },
      { key: "trim-table-3", x: ww * 0.48, y: hh * 0.78, w: 118, h: 52 },
      { key: "trim-table-1", x: ww * 0.80, y: hh * 0.76, w: 112, h: 52 },
    ];
    for (const table of tables) {
      if (this.textures.exists(table.key)) {
        const img = this.add.image(table.x, table.y, table.key).setOrigin(0.5).setDisplaySize(table.w, table.h).setDepth(DEPTH.props + table.y / 1000);
        this.add.image(table.x, table.y + table.h * 0.35, "shadow").setScale(table.w / 128, 0.18).setAlpha(0.22).setDepth(DEPTH.groundShadow);
        void img;
      } else {
        g.fillStyle(0x243064, 1);
        g.fillRoundedRect(table.x - table.w / 2, table.y - table.h / 2, table.w, table.h, 10);
      }
      this.colliders.push(rect(table.x, table.y, table.w * 0.9, table.h * 0.72));
    }
    const chair = (key: string, x: number, y: number, hgt = 44) => {
      if (this.textures.exists(key)) {
        const src = this.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        this.add.image(x, y, key).setOrigin(0.5, 1).setDisplaySize((src.width / src.height) * hgt, hgt).setDepth(DEPTH.props + y / 1000);
      } else {
        g.fillStyle(0x1a2550, 1);
        g.fillRoundedRect(x - 17, y - hgt, 34, 30, 8);
      }
    };
    chair("trim-chair-back", t.x + 47, t.y - 28, 42); // his chair / far side
    chair("trim-chair-front", t.x + 47, t.y + 76, 46); // HER SEAT / near side
    chair("trim-chair-front", ww * 0.30, hh * 0.73, 42);
    chair("trim-chair-back", ww * 0.48, hh * 0.72, 42);
    chair("trim-chair-front", ww * 0.80, hh * 0.83, 42);

    // dust in the sunlight
    this.world.addDust(26, new Phaser.Geom.Rectangle(ww * 0.55, hh * 0.12, ww * 0.42, hh * 0.6), 0xf4e3c0, 0.3);
    this.world.addDust(14, new Phaser.Geom.Rectangle(0, hh * 0.1, ww * 0.5, hh * 0.6), 0x9fb0d0, 0.14);

    // quiet students are present but not in the important path.
    for (const s of [
      { key: "trim-girl-4", x: ww * 0.29, y: hh * 0.73 },
      { key: "trim-boy-4", x: ww * 0.80, y: hh * 0.83 },
    ]) {
      if (this.textures.exists(s.key)) {
        const img = this.add.image(s.x, s.y, s.key).setOrigin(0.5, 1).setDisplaySize(36, 78).setDepth(DEPTH.soul + s.y / 1000).setAlpha(0.86);
        void img;
      }
    }

    // him — he finds the table and waits
    this.companion = new Companion(this, ww * 0.55, hh * 0.8);
    this.companion.setState("distant");
    this.companion.moveTo(t.x + 47, t.y - 42);

    // her
    this.player = new Player(this, ww * 0.08, hh * 0.78);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, hh * 0.56, ww * 0.94, hh * 0.38);
    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, hh);

    // discoverables — each a small warm marker until found
    const spots: { id: string; x: number; y: number; label: string }[] = [
      { id: "book", x: shelfXs[1] + ww * 0.065, y: hh * 0.58, label: "a book" },
      { id: "table", x: t.x - 110, y: t.y + 8, label: "the table" },
      { id: "chair", x: t.x + 47, y: t.y + 62, label: "a chair" },
      { id: "window", x: ww * 0.72, y: hh * 0.52, label: "the window" },
      { id: "corner", x: ww * 0.11, y: hh * 0.7, label: "the quiet corner" },
    ];
    for (const s of spots) {
      const marker = this.add
        .image(s.x, s.y - 18, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xf4dca8)
        .setScale(1.6)
        .setAlpha(0.7)
        .setDepth(DEPTH.fx);
      this.tweens.add({ targets: marker, y: s.y - 26, alpha: 0.25, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.interactables.push({
        id: `frag-${s.id}`,
        x: s.x,
        y: s.y,
        r: 62,
        label: s.label,
        once: true,
        when: () => !this.found.has(s.id),
        onUse: () => {
          this.found.add(s.id);
          marker.destroy();
          this.audio.softTick();
          // the room warms a little with every thing they learn about it
          this.warmTo(this.found.size / spots.length);
          void this.ui.say([{ text: FRAGMENTS[s.id], kind: "whisper" }]).then(() => {
            if (this.found.size === 3) this.ui.setHint("sit with him — at the table");
          });
        },
      });
    }

    // sitting with him — unlocked by discovery
    this.interactables.push({
      id: "sit-together",
      x: t.x + 47,
      y: t.y + 56,
      r: 58,
      label: "sit with him",
      once: true,
      when: () => this.found.size >= 3 && !this.sitting,
      onUse: () => void this.sitTogether(t.x + 47, t.y + 50),
    });

    // cool, peaceful, slightly distant — warmth arrives with discovery
    this.warmth = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.3, h * 1.3)
      .setTint(0xe0b36a)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.06)
      .setDepth(DEPTH.overlay - 2);

    this.audio.playBed("library");
    this.audio.stopMotif();
    this.audio.startMotif("warm");
    this.ui.setHint(this.saves.state.memories.includes(MEMORY_IDS.library) ? "the library remembers" : "explore — three small things, then the table");
  }

  /** Early library is cool and blue-white; warmth is earned, never given. */
  private warmTo(f: number) {
    if (!this.warmth) return;
    this.tweens.add({
      targets: this.warmth,
      alpha: 0.06 + f * 0.2,
      duration: 2600,
      ease: "Sine.easeInOut",
    });
  }

  protected tick(dt: number, tSec: number) {
    this.companion.update(dt, tSec, this.p.pos, this.colors);
    if (!this.seated && this.companion.distanceToPlayer(new Phaser.Math.Vector2(this.tablePos.x + 47, this.tablePos.y - 42)) < 9) {
      this.seated = true;
      this.companion.setState("seated");
    }
    if (this.seated && !this.sitting) {
      this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    }
  }

  private async sitTogether(x: number, y: number) {
    this.sitting = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    await new Promise<void>((resolve) => {
      this.tweens.add({ targets: this.p.pos, x, y, duration: 800, ease: "Sine.easeInOut", onComplete: () => resolve() });
    });

    this.ui.letterbox(true);
    this.audio.duckBed("library", 0.014, 3);
    this.audio.settle();
    this.rig.focusPull(this.tablePos.x + 40, this.tablePos.y - 4, 1.16, 1400);
    this.p.soul.setWarmth(0.6);
    this.companion.soul.setIntensity(1.45);
    this.companion.soul.setWarmth(0.5);

    // stage 2 — the first subtle seam of blended light between them
    this.colors.setStage(2);
    this.saves.setColorStage(2);
    const seam = this.add
      .image(this.tablePos.x + 47, this.tablePos.y - 2, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.5)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: seam, alpha: 0.16, duration: 2600, ease: "Sine.easeInOut" });

    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "This was where strangers slowly stopped feeling like strangers." },
      { text: "After that, the end of classes became something to wait for." },
      { text: "And in each other's eyes, quiet signs had already begun to shine.", kind: "whisper" },
    ]);

    this.keepMemory(MEMORY_IDS.library);
    this.saves.setAliveness(22);
    this.saves.patch({ finishedSlice: true });

    await new Promise((r) => this.time.delayedCall(700, r));
    await this.ui.say([
      { text: "After that, the library stopped being a building." },
      { text: "It became a time of day they both waited for.", kind: "whisper" },
    ]);

    this.audio.stopMotif();
    this.ui.letterbox(false);
    this.saves.checkpoint("WatchingScene");
    this.transitionTo("WatchingScene");
  }
}
