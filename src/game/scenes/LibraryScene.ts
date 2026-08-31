/* FIRST LIBRARY — S5, "The Library of First Words".
 *
 * She walks the library, finds a few quiet things, then sits with him at
 * the special table. Strangers slowly stopped feeling like strangers. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { SpriteChar, SpriteProp } from "../entities/SpriteChar";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";
import { addMotes } from "../art/environment";

const FRAGMENTS: Record<string, string> = {
  book: "Some pages stayed half-read that day. Talking was better.",
  table: "The end of classes became something to wait for.",
  chair: "Two chairs, pulled closer than the library arranged them.",
  window: "The light kept finding the same table first.",
  corner: "A quiet corner, learned by heart. Theirs, without ever being claimed.",
};

type TableLayout = {
  name: "special" | "A" | "B" | "C";
  x: number; y: number;
  /** Spawned props */
  tableImg: SpriteProp;
  farChair: SpriteProp;
  nearChair: SpriteProp;
  sheet: "table-1" | "table-2" | "table-3";
};

const CHAR_SCALE = 0.22;
const TABLE_SCALE = 0.14;
const CHAIR_SCALE = 0.16;

export default class LibraryScene extends BaseScene {
  private companion!: Companion;
  private found = new Set<string>();
  private sitting = false;
  private seated = false;
  private special!: TableLayout;
  private tables: TableLayout[] = [];
  private warmth!: Phaser.GameObjects.Image;
  private students: SpriteChar[] = [];

  private get p() { return this.player!; }

  build() {
    const geom = this.useWorldSpace()!;
    const floor = geom.floor;
    const anchors = geom.anchors!;

    // warm dust in the window light
    addMotes(
      this,
      new Phaser.Geom.Rectangle(floor.x, floor.y - 80, floor.w, floor.h),
      36,
      0xf4e3c0,
      0.28
    );

    // four tables — exactly four. The special table is anchored from the
    // blueprint as "where it happened"; three others fill the room so she
    // can walk between them.
    const plans: Array<{ name: TableLayout["name"]; x: number; y: number; sheet: TableLayout["sheet"]; hasStudents?: boolean; studentSheet?: string }> = [
      { name: "special", x: anchors.specialTable.x, y: anchors.specialTable.y, sheet: "table-1" },
      { name: "A", x: anchors.tableA.x, y: anchors.tableA.y, sheet: "table-2", hasStudents: true, studentSheet: "boy-2" },
      { name: "B", x: anchors.tableB.x, y: anchors.tableB.y, sheet: "table-3", hasStudents: true, studentSheet: "girl-2" },
      { name: "C", x: anchors.tableC.x, y: anchors.tableC.y, sheet: "table-2" },
    ];
    for (const plan of plans) {
      const tableImg = new SpriteProp(this, plan.x, plan.y, plan.sheet, { scale: TABLE_SCALE });
      const farChair = new SpriteProp(this, plan.x - 2, plan.y - 30, "chair-back", { scale: CHAIR_SCALE });
      const nearChair = new SpriteProp(this, plan.x - 2, plan.y + 30, "chair-front", { scale: CHAIR_SCALE });
      const layout: TableLayout = {
        name: plan.name, x: plan.x, y: plan.y, tableImg, farChair, nearChair, sheet: plan.sheet,
      };
      this.tables.push(layout);
      // table collision — a tight box around the tabletop
      this.colliders.push(rect(plan.x, plan.y, 70, 22));
      // chair collision (only the far chair when someone sits there is solid;
      // near chair is "her" seat and starts free; both chairs get gentle
      // collision so she can't simply walk through them).
      this.colliders.push(rect(plan.x - 2, plan.y - 30, 28, 22));
      if (plan.hasStudents) {
        const student = new SpriteChar(this, plan.x - 2, plan.y - 30, plan.studentSheet ?? "boy-3", { scale: CHAR_SCALE });
        student.sit();
        student.update(0);
        this.students.push(student);
        // keep the near chair free but occupied by a bag/book visually —
        // (we leave it as chair-front; players cannot sit there since the
        // interaction only exists on the special table.)
      }
    }
    this.special = this.tables.find((t) => t.name === "special")!;

    // him — starts near the entrance, walks to his seat on the far side of
    // the special table, then sits and waits.
    this.companion = new Companion(this, anchors.entrance.x, anchors.entrance.y);
    this.companion.setState("distant");
    this.companion.moveTo(this.special.x + 2, this.special.y - 28);

    // her
    this.player = new Player(this, anchors.entrance.x + 40, anchors.entrance.y);
    this.player.bounds = new Phaser.Geom.Rectangle(floor.x, floor.y, floor.w, floor.h);
    this.rig.follow(this.player.soul.container, 0.08);

    // discoverables
    const spots: { id: string; x: number; y: number; label: string }[] = [
      { id: "book",   x: 720,  y: 470, label: "a book" },
      { id: "table",  x: this.special.x - 42, y: this.special.y + 4, label: "the table" },
      { id: "chair",  x: this.special.x + 8,  y: this.special.y + 56, label: "a chair" },
      { id: "window", x: 1020, y: 420, label: "the window" },
      { id: "corner", x: 200,  y: 620, label: "the quiet corner" },
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
        x: s.x, y: s.y, r: 62,
        label: s.label,
        once: true,
        when: () => !this.found.has(s.id),
        onUse: () => {
          this.found.add(s.id);
          marker.destroy();
          this.audio.softTick();
          this.warmTo(this.found.size / spots.length);
          void this.ui.say([{ text: FRAGMENTS[s.id], kind: "whisper" }]).then(() => {
            if (this.found.size === 3) this.ui.setHint("sit with him — at the table");
          });
        },
      });
    }

    this.interactables.push({
      id: "sit-together",
      x: this.special.x + 2,
      y: this.special.y + 50,
      r: 64,
      label: "sit with him",
      once: true,
      when: () => this.found.size >= 3 && !this.sitting,
      onUse: () => void this.sitTogether(this.special.x + 2, this.special.y + 40),
    });

    // warm vignette that grows as she notices things
    const w = this.scale.width, h = this.scale.height;
    this.warmth = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.3, h * 1.3)
      .setTint(0xe0b36a)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.05)
      .setDepth(DEPTH.overlay - 2);

    this.audio.playBed("library");
    this.audio.stopMotif();
    this.audio.startMotif("warm");
    this.ui.setHint(
      this.saves.state.memories.includes(MEMORY_IDS.library)
        ? "the library remembers"
        : "explore — three small things, then the table"
    );
  }

  private warmTo(f: number) {
    this.tweens.add({
      targets: this.warmth,
      alpha: 0.05 + f * 0.18,
      duration: 2600,
      ease: "Sine.easeInOut",
    });
  }

  protected tick(dt: number, tSec: number) {
    this.companion.update(dt, tSec, this.p.pos, this.colors);
    if (!this.seated && this.companion.distanceToPlayer(new Phaser.Math.Vector2(this.special.x + 2, this.special.y - 28)) < 12) {
      this.seated = true;
      this.companion.setState("seated");
    }
    if (this.seated && !this.sitting) {
      this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    }
    // depth-sort props and students each frame
    for (const s of this.students) s.update(dt);
    for (const t of this.tables) {
      t.tableImg.depthSort();
      t.farChair.depthSort();
      t.nearChair.depthSort();
    }
  }

  private async sitTogether(x: number, y: number) {
    this.sitting = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x, y,
        duration: 900,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });
    this.p.setPose("sit");

    this.ui.letterbox(true);
    this.audio.duckBed("library", 0.014, 3);
    this.audio.settle();
    this.rig.focusPull(this.special.x, this.special.y, 1.3, 1400);
    this.p.soul.setWarmth(0.6);
    this.companion.soul.setIntensity(1.45);
    this.companion.soul.setWarmth(0.5);

    this.colors.setStage(2);
    this.saves.setColorStage(2);
    const seam = this.add
      .image(this.special.x, this.special.y - 4, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.6)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: seam, alpha: 0.18, duration: 2600, ease: "Sine.easeInOut" });

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
