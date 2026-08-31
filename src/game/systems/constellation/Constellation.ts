/* Constellation — the sky map of everything kept. Each memory is a star;
   edges draw in story order. Unearned stars stay dark: the shape only
   becomes readable as the relationship does. */
import Phaser from "phaser";
import { DEPTH, MEMORY_IDS, MEMORY_LABELS } from "../../config";
import { runtime } from "../../runtime";

export interface StarNode {
  id: string;
  x: number; // normalized 0..1
  y: number;
  ink: "blue" | "hazel" | "our";
  /** A star that was earned but never closed — the word she couldn't say.
      Renders as an open, dashed ring. It completes only in the finale. */
  incomplete?: boolean;
}

/** Story order defines both the draw order and the edges between stars.
    Laid out as two long curves — hers and his — that keep crossing. */
export const STAR_MAP: StarNode[] = [
  { id: MEMORY_IDS.hill, x: 0.06, y: 0.72, ink: "hazel" },
  { id: MEMORY_IDS.look, x: 0.11, y: 0.5, ink: "hazel" },
  { id: MEMORY_IDS.seat, x: 0.17, y: 0.64, ink: "blue" },
  { id: MEMORY_IDS.thankyou, x: 0.21, y: 0.39, ink: "hazel" },
  { id: MEMORY_IDS.side, x: 0.27, y: 0.56, ink: "blue" },
  { id: MEMORY_IDS.library, x: 0.31, y: 0.3, ink: "our" },
  { id: MEMORY_IDS.conviction, x: 0.36, y: 0.63, ink: "blue" },
  { id: MEMORY_IDS.safety, x: 0.41, y: 0.79, ink: "hazel" },
  { id: MEMORY_IDS.morning, x: 0.46, y: 0.5, ink: "blue" },
  { id: MEMORY_IDS.goodbye, x: 0.51, y: 0.75, ink: "hazel" },
  { id: MEMORY_IDS.commitment, x: 0.56, y: 0.37, ink: "our" },
  { id: MEMORY_IDS.december, x: 0.63, y: 0.19, ink: "our" },
  { id: MEMORY_IDS.vision, x: 0.68, y: 0.52, ink: "blue" },
  { id: MEMORY_IDS.distance, x: 0.72, y: 0.7, ink: "hazel" },
  { id: MEMORY_IDS.video, x: 0.75, y: 0.42, ink: "blue" },
  { id: MEMORY_IDS.exams, x: 0.79, y: 0.63, ink: "our" },
  { id: MEMORY_IDS.busChanges, x: 0.81, y: 0.82, ink: "blue" },
  { id: MEMORY_IDS.hand, x: 0.84, y: 0.33, ink: "our" },
  { id: MEMORY_IDS.waiting, x: 0.86, y: 0.66, ink: "hazel" },
  { id: MEMORY_IDS.yellow, x: 0.88, y: 0.5, ink: "blue" },
  { id: MEMORY_IDS.project, x: 0.9, y: 0.79, ink: "our" },
  { id: MEMORY_IDS.naturalHand, x: 0.92, y: 0.4, ink: "blue" },
  { id: MEMORY_IDS.camera, x: 0.94, y: 0.6, ink: "our" },
  { id: MEMORY_IDS.mutualCare, x: 0.95, y: 0.27, ink: "hazel" },
  { id: MEMORY_IDS.colorHunt, x: 0.72, y: 0.08, ink: "our" },
  // phase 5 — the arc bends back across the sky toward the finale
  { id: MEMORY_IDS.bottle, x: 0.62, y: 0.9, ink: "hazel" },
  { id: MEMORY_IDS.escort, x: 0.5, y: 0.9, ink: "blue" },
  { id: MEMORY_IDS.report, x: 0.4, y: 0.14, ink: "blue" },
  { id: MEMORY_IDS.rescue, x: 0.28, y: 0.12, ink: "blue" },
  { id: MEMORY_IDS.bouquet, x: 0.17, y: 0.2, ink: "our" },
  { id: MEMORY_IDS.borrowed, x: 0.1, y: 0.35, ink: "our" },
  { id: MEMORY_IDS.lastDays, x: 0.06, y: 0.53, ink: "hazel" },
  { id: MEMORY_IDS.unfinished, x: 0.14, y: 0.66, ink: "hazel", incomplete: true },
  { id: MEMORY_IDS.call, x: 0.22, y: 0.84, ink: "our" },
  { id: MEMORY_IDS.holidays, x: 0.34, y: 0.95, ink: "our" },
];

const INK: Record<StarNode["ink"], number> = {
  blue: 0x7fc4ff,
  hazel: 0xe0b36a,
  our: 0x93dcbb,
};

export interface ConstellationOptions {
  /** Area to draw within (screen space). */
  rect: Phaser.Geom.Rectangle;
  /** Once the finale closes it, the open star is drawn whole. */
  starCompleted?: boolean;
  /** Show labels beneath earned stars. */
  labels?: boolean;
  /** Animate the edges drawing in. */
  animate?: boolean;
  depth?: number;
  /** Star to pulse as the newest addition. */
  highlight?: string;
}

/** Builds a constellation view; caller owns the returned container. */
export function buildConstellation(
  scene: Phaser.Scene,
  unlocked: string[],
  opts: ConstellationOptions
): Phaser.GameObjects.Container {
  const {
    rect,
    labels = false,
    animate = true,
    depth = DEPTH.overlay,
    highlight,
    // defaults from save state so every view is correct without being told
    starCompleted = runtime.saves?.state.starCompleted ?? false,
  } = opts;
  const container = scene.add.container(0, 0).setDepth(depth).setScrollFactor(0);
  const has = (id: string) => unlocked.includes(id);
  const px = (n: StarNode) => rect.x + n.x * rect.width;
  const py = (n: StarNode) => rect.y + n.y * rect.height;

  // edges between consecutive earned stars
  const lines = scene.add.graphics().setScrollFactor(0);
  container.add(lines);
  const earned = STAR_MAP.filter((n) => has(n.id));
  if (earned.length > 1) {
    if (animate) {
      let i = 0;
      const step = () => {
        if (i >= earned.length - 1) return;
        const a = earned[i];
        const b = earned[i + 1];
        const seg = { t: 0 };
        scene.tweens.add({
          targets: seg,
          t: 1,
          duration: 320,
          ease: "Sine.easeInOut",
          onUpdate: () => {
            lines.lineStyle(1, 0x93dcbb, 0.4);
            lines.beginPath();
            lines.moveTo(px(a), py(a));
            lines.lineTo(
              Phaser.Math.Linear(px(a), px(b), seg.t),
              Phaser.Math.Linear(py(a), py(b), seg.t)
            );
            lines.strokePath();
          },
          onComplete: () => {
            i++;
            step();
          },
        });
      };
      step();
    } else {
      lines.lineStyle(1, 0x93dcbb, 0.4);
      lines.beginPath();
      lines.moveTo(px(earned[0]), py(earned[0]));
      for (let i = 1; i < earned.length; i++) lines.lineTo(px(earned[i]), py(earned[i]));
      lines.strokePath();
    }
  }

  // stars
  STAR_MAP.forEach((n, idx) => {
    const on = has(n.id);
    const x = px(n);
    const y = py(n);
    // after the reunion it is simply a star like any other
    const open = on && n.incomplete === true && !starCompleted;
    const img = scene.add
      .image(x, y, "star")
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(on ? INK[n.ink] : 0x2b3d6b)
      .setScale(on ? (open ? 0.4 : 0.55) : 0.22)
      .setAlpha(on ? 0 : 0.35);
    container.add(img);

    // the unfinished star: an open ring that never quite closes
    if (open) {
      const ring = scene.add.graphics().setScrollFactor(0);
      ring.lineStyle(1, 0xf2b8c6, 0.75);
      // deliberately drawn with a gap — the sentence that stopped short
      ring.beginPath();
      ring.arc(x, y, 11, Phaser.Math.DegToRad(35), Phaser.Math.DegToRad(310), false);
      ring.strokePath();
      container.add(ring);
      scene.tweens.add({
        targets: ring,
        alpha: { from: 0.45, to: 1 },
        duration: 2100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    if (on) {
      scene.tweens.add({
        targets: img,
        alpha: 1,
        duration: 520,
        delay: 160 + idx * 90,
        ease: "Sine.easeOut",
      });
      scene.tweens.add({
        targets: img,
        scale: n.id === highlight ? 0.95 : 0.7,
        duration: 1900 + idx * 90,
        delay: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      if (n.id === highlight) {
        const halo = scene.add
          .image(x, y, "mote")
          .setScrollFactor(0)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(INK[n.ink])
          .setScale(1.4)
          .setAlpha(0.7);
        container.add(halo);
        scene.tweens.add({
          targets: halo,
          scale: 4.4,
          alpha: 0,
          duration: 2100,
          repeat: -1,
          ease: "Sine.easeOut",
        });
      }
      if (labels) {
        const t = scene.add
          .text(x, y + 16, MEMORY_LABELS[n.id] ?? n.id, {
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "8px",
            color: "#9fb0d0",
          })
          .setOrigin(0.5, 0)
          .setScrollFactor(0)
          .setAlpha(0);
        container.add(t);
        scene.tweens.add({ targets: t, alpha: 0.85, duration: 600, delay: 400 + idx * 90 });
      }
    }
  });

  return container;
}

/** A brief, cinematic constellation reveal used after milestones. */
export function flashConstellation(
  scene: Phaser.Scene,
  unlocked: string[],
  highlight: string,
  holdMs = 3600
): Promise<void> {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const c = buildConstellation(scene, unlocked, {
    rect: new Phaser.Geom.Rectangle(w * 0.08, h * 0.14, w * 0.84, h * 0.5),
    animate: true,
    highlight,
  });
  c.setAlpha(0);
  scene.tweens.add({ targets: c, alpha: 1, duration: 900, ease: "Sine.easeOut" });
  return new Promise((resolve) => {
    scene.time.delayedCall(holdMs, () => {
      scene.tweens.add({
        targets: c,
        alpha: 0,
        duration: 900,
        onComplete: () => {
          c.destroy(true);
          resolve();
        },
      });
    });
  });
}
