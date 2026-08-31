/* FIRST LIBRARY — S5, "The Library of First Words".
 *
 * She walks the library, finds a few quiet things, then sits with him at
 * the special table. Strangers slowly stopped feeling like strangers.
 *
 * Furniture is placed against the painted library: four low reading
 * tables with two chairs each sit in a neat two-by-two grid on the
 * polished orange tile floor, leaving an aisle to walk between them and
 * the bookshelves along the back wall.
 */
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
  tableImg: SpriteProp;
  farChair: SpriteProp;
  nearChair: SpriteProp;
  sheet: "table-1" | "table-2" | "table-3";
};

/* One scale for every sprite (characters, tables, chairs). The assets
 * were painted in a single style and their cropped proportions are
 * preserved exactly; the collision/placement offsets below are scaled
 * with them. */
const SCALE = 0.24;

/* Measured from the cropped source sprites at scale 1 (in source px):
 *   chair-front seat ≈ 70 px from ground → sits at pos.y - 70*SCALE
 *   table-1 tabletop ≈ 79 px from ground → sits at pos.y - 79*SCALE
 * The chair seat is slightly LOWER than the tabletop, which matches the
 * chabudai-style low reading tables. */
const CHAIR_SURFACE_SRC = 70; // seat height in SOURCE pixels
const TABLE_SURFACE_SRC = 80; // tabletop height in SOURCE pixels
/* Distance (world px) from table centre to chair centre — enough gap
 * that the chair legs clear the table's apron visually. */
const CHAIR_OFFSET = 46;

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

    // warm dust in the window light
    addMotes(
      this,
      new Phaser.Geom.Rectangle(floor.x, floor.y, floor.w, floor.h),
      44,
      0xf4e3c0,
      0.28
    );

    /* Four tables arranged as a neat 2×2 cluster in the middle of the
     * room, with an aisle between them that the player can walk. The
     * "special" table sits in the sunbeam under the right window (as the
     * fragment says — "the light kept finding the same table first"). */
    const plans: Array<{
      name: TableLayout["name"];
      x: number; y: number;
      sheet: TableLayout["sheet"];
      student?: { sheet: string; side: "far" | "near" };
    }> = [
      { name: "A",       x: 370,  y: 520, sheet: "table-2", student: { sheet: "boy-2",  side: "far" } },
      { name: "special", x: 980,  y: 520, sheet: "table-1", /* him sits far; her seat is near */ },
      { name: "B",       x: 370,  y: 660, sheet: "table-3", student: { sheet: "girl-2", side: "far" } },
      { name: "C",       x: 980,  y: 660, sheet: "table-2" },
    ];
    for (const plan of plans) {
      const tableImg = new SpriteProp(this, plan.x, plan.y, plan.sheet, {
        scale: SCALE,
        surfaceFromGround: TABLE_SURFACE_SRC,
      });
      // far chair (back of chair visible, above table in world-y) and near
      // chair (front of chair visible, below table).
      const farChair = new SpriteProp(this, plan.x, plan.y - CHAIR_OFFSET, "chair-back", {
        scale: SCALE,
        surfaceFromGround: CHAIR_SURFACE_SRC,
        // far chair is further from the viewer so sort it BEHIND the table
        depth: DEPTH.props - 1.2,
      });
      const nearChair = new SpriteProp(this, plan.x, plan.y + CHAIR_OFFSET, "chair-front", {
        scale: SCALE,
        surfaceFromGround: CHAIR_SURFACE_SRC,
        // near chair is closer to the viewer so sort it IN FRONT of the table
        depth: DEPTH.props + 1.2,
      });
      const layout: TableLayout = {
        name: plan.name, x: plan.x, y: plan.y, tableImg, farChair, nearChair, sheet: plan.sheet,
      };
      this.tables.push(layout);

      // Collision: a tight box around each tabletop so you can't walk
      // through it, plus both chairs. Width/height use the measured
      // scaled dimensions.
      const tW = tableImg.displayWidth * 0.86; // slight inset from outer legs
      this.colliders.push(rect(plan.x, plan.y, tW, 16));
      const cW = nearChair.displayWidth * 0.7;
      this.colliders.push(rect(plan.x, plan.y - CHAIR_OFFSET, cW, 14));
      this.colliders.push(rect(plan.x, plan.y + CHAIR_OFFSET, cW, 14));

      if (plan.student) {
        const sx = plan.x;
        const sy = plan.y + (plan.student.side === "far" ? -CHAIR_OFFSET : CHAIR_OFFSET);
        const student = new SpriteChar(this, sx, sy, plan.student.sheet, { scale: SCALE });
        student.sit(CHAIR_SURFACE_SRC); // raise hips onto the seat
        student.update(0);
        this.students.push(student);
      }
    }
    this.special = this.tables.find((t) => t.name === "special")!;

    // him — starts near the entrance, walks to the FAR chair of the
    // special table and sits down to wait.
    this.companion = new Companion(this, 180, 720);
    this.companion.setState("distant");
    this.companion.moveTo(this.special.x, this.special.y - CHAIR_OFFSET + 4);
    // once he arrives, place him into a seated pose
    this.time.delayedCall(600, () => {
      // Companion's "seated" state handles pose; set in tick() when close.
    });

    // her — enters from the left side of the room (near the pillar)
    this.player = new Player(this, 120, 700);
    this.player.bounds = new Phaser.Geom.Rectangle(floor.x + 20, floor.y + 10, floor.w - 40, floor.h - 30);
    this.rig.follow(this.player.soul.container, 0.08);

    // discoverables — scattered across the room where the paintings
    // suggest them.
    const spots: { id: string; x: number; y: number; label: string }[] = [
      { id: "book",   x: 370, y: 520 - 4, label: "a book" },            // on table A
      { id: "table",  x: this.special.x - 36, y: this.special.y, label: "the table" },
      { id: "chair",  x: this.special.x + 6,  y: this.special.y + CHAIR_OFFSET + 10, label: "a chair" },
      { id: "window", x: 1020, y: 460, label: "the window" },           // right window sunbeam
      { id: "corner", x: 100,  y: 680, label: "the quiet corner" },     // bottom-left corner
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

    // "sit with him" interaction — anchored to the near chair of the
    // special table.
    this.interactables.push({
      id: "sit-together",
      x: this.special.x,
      y: this.special.y + CHAIR_OFFSET + 2,
      r: 70,
      label: "sit with him",
      once: true,
      when: () => this.found.size >= 3 && !this.sitting,
      onUse: () => void this.sitTogether(this.special.x, this.special.y + CHAIR_OFFSET - 2),
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
    // When he reaches his seat across the special table, drop him into
    // the seated pose.
    if (!this.seated && this.companion.distanceToPlayer(new Phaser.Math.Vector2(this.special.x, this.special.y - CHAIR_OFFSET + 4)) < 14) {
      this.seated = true;
      this.companion.setState("seated");
    }
    if (this.seated && !this.sitting) {
      this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    }
    // depth-sort props and students each frame (chairs/table are already
    // at offset depths; SpriteChar's depthSort handles y-ordering).
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
