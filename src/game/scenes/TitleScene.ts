/* TitleScene — the held breath before the hill. Save-aware: continue where
   she left off, revisit a kept memory, look at the sky, or begin again. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Soul } from "../entities/Soul";
import { buildConstellation } from "../systems/constellation/Constellation";
import { session } from "../systems/session/Session";
import { MEMORY_SCENE, SCENE_ORDER, type SceneKey } from "../config";

type Option = { label: string; accent?: boolean; cb: () => void };

export default class TitleScene extends BaseScene {
  private soulH!: Soul;
  private soulB!: Soul;
  private cx = 0;
  private cy = 0;
  private menu: Phaser.GameObjects.Text[] = [];
  private panel: Phaser.GameObjects.Container | null = null;

  build() {
    this.ui.setTouchGameplay(false);
    const w = this.scale.width;
    const h = this.scale.height;
    this.cx = w / 2;
    this.cy = h * 0.6;

    this.skyRect(0x070b1a, 0x0c1434, w, h);
    const s = this.saves.state;
    // the sky at the title reflects how much of the story has been lived
    this.world.addStars(40 + Math.round(s.aliveness * 1.4), new Phaser.Geom.Rectangle(0, 0, w, h * 0.82));

    this.soulH = new Soul(this, this.cx - 24, this.cy, "hazel", { scale: 0.6 });
    this.soulB = new Soul(this, this.cx + 24, this.cy, "blue", { scale: 0.6 });

    // the first touch does the three things a browser only allows on gesture
    this.input.once("pointerdown", () => {
      this.audio.unlock();
      this.audio.playBed("night-wind", 3);
      this.ui.tryFullscreen();
    });

    const titleSize = Math.round(Math.min(w / 15, h * 0.08));
    const title = this.add
      .text(this.cx, h * 0.26, "The Universe that Waited for Us", {
        fontFamily: "Fraunces, Georgia, serif",
        fontSize: `${titleSize}px`,
        color: "#eaf2ff",
        align: "center",
        wordWrap: { width: w * 0.9 },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(60);
    const sub = this.add
      .text(this.cx, h * 0.26 + titleSize * 0.95, "two souls · two colors · one universe created between them", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "10px",
        color: "#9fb0d0",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(60);
    this.tweens.add({ targets: title, alpha: 1, y: title.y + 8, duration: 1700, ease: "Sine.easeOut" });
    this.tweens.add({ targets: sub, alpha: 0.9, duration: 1700, delay: 400 });

    this.buildMenu(this.mainOptions());

    if (s.memories.length > 0) {
      const bits = [
        `✦ ${s.memories.length} kept`,
        `color stage ${s.colorStage} / 7`,
        `world ${s.aliveness}%`,
      ];
      if (s.frames.length > 0) bits.push(`${s.frames.length} frames`);
      if (s.cameraUnlocked) bits.push("camera");
      if (s.blueForHim && s.greenForHer) bits.push("blue for him · green for her");
      if (s.unfinishedStarOpen) bits.push("one star still open");
      this.add
        .text(this.cx, h - 20, bits.join("  ·  "), {
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "9px",
          color: "#5c6c8f",
        })
        .setOrigin(0.5)
        .setDepth(60);
    }
  }

  private mainOptions(): Option[] {
    const s = this.saves.state;
    const opts: Option[] = [];
    if (!this.saves.hasRun()) {
      opts.push({ label: "touch to begin", accent: true, cb: () => this.go("PrologueScene") });
      return opts;
    }
    const label = s.freeExplore
      ? "return to the universe"
      : s.storyComplete
        ? "the universe is waiting"
        : s.finishedPhase4
          ? "continue the story"
          : s.finishedArc
            ? "keep walking"
            : "continue";
    opts.push({
      label,
      accent: true,
      cb: () => {
        session.endReplay();
        this.go(s.freeExplore ? "FreeExploreScene" : s.scene);
      },
    });
    if (s.memories.length > 0) {
      opts.push({ label: "revisit a memory", cb: () => this.buildMenu(this.memoryOptions()) });
      opts.push({ label: "look at the sky", cb: () => this.showSky() });
    }
    opts.push({ label: "begin again", cb: () => this.beginAgain() });
    return opts;
  }

  /** Paginated: the archive is long now, and the list must never collapse. */
  private memoryOptions(page = 0): Option[] {
    const s = this.saves.state;
    const all: Option[] = [];
    for (const id of s.memories) {
      const scene = MEMORY_SCENE[id];
      if (!scene) continue; // the unfinished star is not a place she can go
      all.push({ label: this.saves.memoryLabel(id).toLowerCase(), cb: () => this.replay(scene, id) });
    }
    const perPage = 6;
    const pages = Math.max(1, Math.ceil(all.length / perPage));
    const p = Phaser.Math.Clamp(page, 0, pages - 1);
    const opts = all.slice(p * perPage, p * perPage + perPage);
    if (pages > 1) {
      opts.push({
        label: `more  (${p + 1}/${pages})`,
        cb: () => this.buildMenu(this.memoryOptions((p + 1) % pages)),
      });
    }
    opts.push({ label: "← back", cb: () => this.buildMenu(this.mainOptions()) });
    return opts;
  }

  private buildMenu(options: Option[]) {
    this.menu.forEach((t) => t.destroy());
    this.menu = [];
    const h = this.scale.height;
    // compact list that always fits the viewport, even in landscape phones
    const rows = options.length;
    const gap = Math.min(26, (h * 0.26) / Math.max(rows, 1));
    const startY = h * 0.74 - ((rows - 1) * gap) / 2;

    options.forEach((o, i) => {
      const t = this.add
        .text(this.cx, startY + i * gap, o.label, {
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          color: o.accent ? "#93dcbb" : "#9fb0d0",
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(60)
        .setInteractive({ useHandCursor: true });
      t.on("pointerover", () => t.setColor("#eaf2ff"));
      t.on("pointerout", () => t.setColor(o.accent ? "#93dcbb" : "#9fb0d0"));
      t.on("pointerdown", (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        this.audio.unlock();
        this.audio.blip();
        o.cb();
      });
      this.tweens.add({ targets: t, alpha: 1, duration: 700, delay: 200 + i * 90 });
      this.menu.push(t);
    });
  }

  /** The constellation so far — every memory that has been lived. */
  private showSky() {
    if (this.panel) return;
    const w = this.scale.width;
    const h = this.scale.height;
    const bg = this.add
      .rectangle(w / 2, h / 2, w, h, 0x070b1a, 0.92)
      .setDepth(80)
      .setInteractive();
    const c = buildConstellation(this, this.saves.state.memories, {
      rect: new Phaser.Geom.Rectangle(w * 0.07, h * 0.16, w * 0.86, h * 0.52),
      // once the sky is full the names crowd each other out; let it be a sky
      labels: this.saves.state.memories.length <= 16,
      animate: true,
      starCompleted: this.saves.state.starCompleted,
      depth: 82,
    });
    const close = this.add
      .text(w / 2, h * 0.88, "close", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "11px",
        color: "#93dcbb",
      })
      .setOrigin(0.5)
      .setDepth(83)
      .setInteractive({ useHandCursor: true });

    const panel = this.add.container(0, 0, [bg, c, close]).setDepth(80);
    this.panel = panel;
    const dismiss = () => {
      panel.destroy(true);
      this.panel = null;
    };
    close.on("pointerdown", (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.audio.blip();
      dismiss();
    });
    bg.on("pointerdown", (p: Phaser.Input.Pointer) => p.event.stopPropagation());
  }

  private replay(scene: SceneKey, memoryId: string) {
    // replaying never rewinds the story, and never chains forward into the
    // rest of it: the session brings her back here when the memory ends
    session.beginReplay(memoryId, this.saves.state.freeExplore ? "FreeExploreScene" : "TitleScene");
    this.go(scene, false);
  }

  private beginAgain() {
    session.endReplay(); // a fresh run is never a replay
    this.saves.resetRun();
    this.colors.setStage(0);
    this.go("PrologueScene");
  }

  private go(scene: string, advanceCheckpoint = true) {
    if (advanceCheckpoint) {
      const s = this.saves.state.scene;
      // guard against a stale checkpoint from an older save version
      if (!SCENE_ORDER.includes(s)) this.saves.checkpoint("PrologueScene");
    }
    this.audio.stopMotif();
    this.cameras.main.fadeOut(700, 7, 11, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(scene);
    });
  }

  protected tick(dt: number, t: number) {
    const driftX = Math.cos(t * 0.4) * 9;
    const driftY = Math.sin(t * 0.62) * 5;
    this.soulH.setPosition(this.cx - 24 + driftX, this.cy + driftY);
    this.soulB.setPosition(this.cx + 24 - driftX, this.cy - driftY * 0.8);
    this.soulH.lookAt(this.cx + 24, this.cy);
    this.soulB.lookAt(this.cx - 24, this.cy);
    this.soulH.update(dt, t, this.colors);
    this.soulB.update(dt, t, this.colors);
  }
}
