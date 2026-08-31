/* SafeRadius — safety rendered as an engine value. Inside his radius the
   world softens: sound ducks, color warms, the aura stabilizes. Outside it
   the crowd rises and the grade cools. Reusable across bus/road scenes. */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { AudioDirector } from "../audio/AudioDirector";

export interface SafeRadiusOptions {
  radius: number;
  /** Ambient bed name to duck while inside. */
  bed?: string;
  insideBedLevel?: number;
  outsideBedLevel?: number;
}

export class SafeRadius {
  /** 0 = fully exposed, 1 = fully sheltered (smoothed). */
  shelter = 0;
  /** Seconds spent inside the radius — the journey's real progress. */
  secondsInside = 0;
  private warm: Phaser.GameObjects.Image;
  private cold: Phaser.GameObjects.Image;
  private ring: Phaser.GameObjects.Image;
  private lastBedLevel = -1;

  constructor(scene: Phaser.Scene, private opts: SafeRadiusOptions) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    // grade overlays, camera-locked
    this.warm = scene.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.2, h * 1.2)
      .setTint(0xe0b36a)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 2);
    this.cold = scene.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.35, h * 1.35)
      .setTint(0x2c4a8a)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 1);
    // the radius itself, barely visible — felt more than seen
    this.ring = scene.add
      .image(0, 0, "seat-glow")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.16)
      .setDepth(DEPTH.aura - 1)
      .setDisplaySize(opts.radius * 2.4, opts.radius * 2.4);
  }

  update(
    dtSec: number,
    playerPos: Phaser.Math.Vector2,
    anchor: { x: number; y: number },
    audio: AudioDirector
  ) {
    const d = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, anchor.x, anchor.y);
    const target = Phaser.Math.Clamp(1 - (d - this.opts.radius * 0.45) / this.opts.radius, 0, 1);
    this.shelter += (target - this.shelter) * Math.min(1, dtSec * 2.2);
    if (this.shelter > 0.55) this.secondsInside += dtSec;

    this.ring.setPosition(anchor.x, anchor.y);
    this.ring.setAlpha(0.1 + this.shelter * 0.16);
    this.warm.setAlpha(this.shelter * 0.3);
    this.cold.setAlpha((1 - this.shelter) * 0.42);

    if (this.opts.bed) {
      const lvl = Phaser.Math.Linear(
        this.opts.outsideBedLevel ?? 0.075,
        this.opts.insideBedLevel ?? 0.012,
        this.shelter
      );
      // only push to WebAudio when meaningfully changed (avoids param spam)
      if (Math.abs(lvl - this.lastBedLevel) > 0.004) {
        this.lastBedLevel = lvl;
        audio.duckBed(this.opts.bed, lvl, 0.45);
      }
    }
  }

  /** Camera nudge amount when exposed — discomfort without shake. */
  get unease() {
    return 1 - this.shelter;
  }

  destroy() {
    this.warm.destroy();
    this.cold.destroy();
    this.ring.destroy();
  }
}
