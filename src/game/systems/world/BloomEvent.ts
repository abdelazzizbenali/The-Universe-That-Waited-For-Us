/* BloomEvent — the universe answering.
   Flowers open, stars wake, particles rise and OUR COLOR spreads farther
   than it has before. Used first by the bouquet (M29) as a foreshadowing of
   the finale — never at full strength here. */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { WorldDresser } from "./WorldDresser";
import type { AudioDirector } from "../audio/AudioDirector";

export interface BloomOptions {
  /** 0..1 — how far the universe is allowed to go. Finale reserves 1. */
  intensity?: number;
  /** World-space origin of the bloom. */
  x: number;
  y: number;
  /** Area in which new stars may wake. */
  starArea: Phaser.Geom.Rectangle;
  flowers?: Phaser.GameObjects.Image[];
}

/** Runs the cascade and resolves when it has finished spreading. */
export function runBloom(
  scene: Phaser.Scene,
  world: WorldDresser,
  audio: AudioDirector,
  opts: BloomOptions
): Promise<void> {
  const intensity = Phaser.Math.Clamp(opts.intensity ?? 0.6, 0, 1);
  const { x, y, starArea, flowers = [] } = opts;

  // 1. OUR COLOR spreads outward from the two of them
  const wave = scene.add
    .image(x, y, "aura-our")
    .setBlendMode(Phaser.BlendModes.ADD)
    .setScale(0.2)
    .setAlpha(0)
    .setDepth(DEPTH.fx);
  scene.tweens.add({
    targets: wave,
    alpha: 0.42 * intensity,
    scale: 2.2 + intensity * 1.6,
    duration: 3000,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: wave,
    alpha: 0.24 * intensity,
    scale: 2 + intensity * 1.4,
    duration: 3200,
    delay: 3000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  // 2. flowers open, one at a time, nearest first
  const ordered = [...flowers].sort(
    (a, b) =>
      Phaser.Math.Distance.Between(a.x, a.y, x, y) - Phaser.Math.Distance.Between(b.x, b.y, x, y)
  );
  ordered.forEach((f, i) => {
    scene.time.delayedCall(500 + i * 260, () => {
      world.openFlower(f);
      audio.softTick();
    });
  });

  // 3. stars wake in the sky above
  const starCount = Math.round(14 + intensity * 26);
  for (let i = 0; i < starCount; i++) {
    scene.time.delayedCall(900 + i * 90, () => {
      const sx = Phaser.Math.Between(starArea.x, starArea.x + starArea.width);
      const sy = Phaser.Math.Between(starArea.y, starArea.y + starArea.height);
      const s = scene.add
        .image(sx, sy, "star")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0)
        .setAlpha(0)
        .setDepth(DEPTH.sky + 1);
      scene.tweens.add({
        targets: s,
        scale: Phaser.Math.FloatBetween(0.3, 0.8),
        alpha: Phaser.Math.FloatBetween(0.5, 0.95),
        duration: 900,
        ease: "Back.easeOut",
      });
      scene.tweens.add({
        targets: s,
        alpha: 0.35,
        duration: 1800 + i * 40,
        delay: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      if (i % 6 === 0) audio.starIgnite();
    });
  }

  // 4. small things rising — the air itself reacting
  for (let i = 0; i < Math.round(18 * intensity) + 10; i++) {
    scene.time.delayedCall(600 + i * 110, () => {
      const m = scene.add
        .image(x + Phaser.Math.Between(-140, 140), y + Phaser.Math.Between(-10, 40), "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint([0x93dcbb, 0xf2b8c6, 0xf4dca8, 0x9fe3c9][i % 4])
        .setScale(Phaser.Math.FloatBetween(0.7, 1.4))
        .setAlpha(0)
        .setDepth(DEPTH.fx);
      scene.tweens.add({
        targets: m,
        y: m.y - Phaser.Math.Between(90, 190),
        x: m.x + Phaser.Math.Between(-40, 40),
        alpha: 0.75,
        duration: 2600,
        ease: "Sine.easeOut",
        onComplete: () => {
          scene.tweens.add({
            targets: m,
            alpha: 0,
            duration: 900,
            onComplete: () => m.destroy(),
          });
        },
      });
    });
  }

  return new Promise((resolve) => {
    scene.time.delayedCall(3400 + ordered.length * 260, () => resolve());
  });
}
