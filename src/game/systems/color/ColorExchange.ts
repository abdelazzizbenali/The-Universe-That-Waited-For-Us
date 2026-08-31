/* ColorExchange — the Color Hunt (M24) and the ritual at its end.
   She chose BLUE for him; he chose GREEN for her. The colors are found in
   the world, carried, and then given. What comes back is neither of them:
   it is the third thing they had been making all along. */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { AudioDirector } from "../audio/AudioDirector";

export interface Fragment {
  id: string;
  x: number;
  y: number;
  tint: number;
  img: Phaser.GameObjects.Image;
  glow: Phaser.GameObjects.Image;
  taken: boolean;
}

export function spawnFragments(
  scene: Phaser.Scene,
  spots: { x: number; y: number }[],
  tint: number,
  prefix: string
): Fragment[] {
  return spots.map((s, i) => {
    const glow = scene.add
      .image(s.x, s.y, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(tint)
      .setScale(3.2)
      .setAlpha(0.22)
      .setDepth(DEPTH.world);
    const img = scene.add
      .image(s.x, s.y, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(tint)
      .setScale(1.5)
      .setDepth(DEPTH.world + 1);
    scene.tweens.add({
      targets: [img, glow],
      y: s.y - 8,
      duration: 1600 + i * 120,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return { id: `${prefix}-${i}`, x: s.x, y: s.y, tint, img, glow, taken: false };
  });
}

/** A fragment floats to its collector and is kept. */
export function collectFragment(scene: Phaser.Scene, f: Fragment, to: { x: number; y: number }) {
  f.taken = true;
  scene.tweens.add({ targets: f.glow, alpha: 0, scale: 6, duration: 600, onComplete: () => f.glow.destroy() });
  scene.tweens.add({
    targets: f.img,
    x: to.x,
    y: to.y,
    scale: 0.9,
    alpha: 0.85,
    duration: 700,
    ease: "Sine.easeInOut",
  });
}

/**
 * The exchange. Blue travels into Hazel; green travels into Blue; both
 * arrive and neither color is lost — a third one appears where they meet.
 */
export function exchangeCinematic(
  scene: Phaser.Scene,
  audio: AudioDirector,
  herPos: { x: number; y: number },
  hisPos: { x: number; y: number },
  blueCount: number,
  greenCount: number
): Promise<void> {
  const midX = (herPos.x + hisPos.x) / 2;
  const midY = (herPos.y + hisPos.y) / 2 - 10;

  const travel = (from: { x: number; y: number }, count: number, tint: number, flip: boolean) => {
    for (let i = 0; i < count; i++) {
      const m = scene.add
        .image(from.x, from.y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tint)
        .setScale(1.4)
        .setDepth(DEPTH.fx);
      const target = flip ? herPos : hisPos;
      scene.tweens.add({
        targets: m,
        x: target.x + Phaser.Math.Between(-8, 8),
        y: target.y + Phaser.Math.Between(-8, 8),
        duration: 1100,
        delay: i * 120,
        ease: "Sine.easeInOut",
        onComplete: () => {
          m.setTint(0x93dcbb);
          scene.tweens.add({
            targets: m,
            scale: 2.6,
            alpha: 0,
            duration: 900,
            onComplete: () => m.destroy(),
          });
        },
      });
    }
  };

  return new Promise((resolve) => {
    audio.sparkle();
    // she gives him her blue; he gives her his green
    travel(hisPos, greenCount, 0x9aab62, true);
    travel(herPos, blueCount, 0x7fc4ff, false);

    scene.time.delayedCall(900 + Math.max(blueCount, greenCount) * 120, () => {
      // the merge
      const bloom = scene.add
        .image(midX, midY, "aura-our")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.3)
        .setAlpha(0)
        .setDepth(DEPTH.fx);
      scene.tweens.add({ targets: bloom, alpha: 0.6, scale: 2.2, duration: 1800, ease: "Sine.easeOut" });
      scene.tweens.add({
        targets: bloom,
        alpha: 0.34,
        scale: 1.9,
        duration: 2600,
        delay: 1800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2;
        const m = scene.add
          .image(midX, midY, "mote")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(i % 3 === 0 ? 0x7fc4ff : i % 3 === 1 ? 0x9aab62 : 0x93dcbb)
          .setScale(1)
          .setDepth(DEPTH.fx);
        scene.tweens.add({
          targets: m,
          x: midX + Math.cos(a) * 130,
          y: midY + Math.sin(a) * 80,
          alpha: 0,
          scale: 2,
          duration: 2000 + i * 20,
          ease: "Sine.easeOut",
          onComplete: () => m.destroy(),
        });
      }
      audio.tone(523.25, 0.03, 2.4);
      scene.time.delayedCall(2200, () => resolve());
    });
  });
}
