/* StressState — when she is frightened, the world shows it.
   Her aura destabilises, the colour drains a little, the sound gets tense.
   Presence and progress bring it back down. Shared by the report (M27) and
   the 07:30 rescue (M28). */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { AudioDirector } from "../audio/AudioDirector";
import type { Companion } from "../../entities/Companion";

export class StressState {
  /** 0 = calm, 1 = frightened. */
  value: number;
  private target: number;
  private tint: Phaser.GameObjects.Image;
  private lastDuck = -1;

  constructor(scene: Phaser.Scene, initial = 0.2) {
    this.value = initial;
    this.target = initial;
    const w = scene.scale.width;
    const h = scene.scale.height;
    this.tint = scene.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.4, h * 1.4)
      .setTint(0x4a5f9e)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 2);
  }

  /** Something went wrong. */
  raise(amount: number) {
    this.target = Phaser.Math.Clamp(this.target + amount, 0, 1);
  }

  /** Something got handled. */
  ease(amount: number) {
    this.target = Phaser.Math.Clamp(this.target - amount, 0, 1);
  }

  set(v: number) {
    this.target = Phaser.Math.Clamp(v, 0, 1);
  }

  update(dtSec: number, her: Companion | null, audio: AudioDirector) {
    this.value += (this.target - this.value) * Math.min(1, dtSec * 1.4);
    // muted colour while she is frightened
    this.tint.setAlpha(this.value * 0.34);
    if (her) {
      // her aura becomes unsteady, then settles as things get handled
      const flicker = 1 + Math.sin(Date.now() / 90) * 0.12 * this.value;
      her.soul.setIntensity((1.35 - this.value * 0.4) * flicker);
      her.soul.setWarmth(0.45 * (1 - this.value));
    }
    const duck = 1 - this.value * 0.4;
    if (Math.abs(duck - this.lastDuck) > 0.05) {
      this.lastDuck = duck;
      audio.duckAmbience(duck, 0.8);
    }
  }

  destroy() {
    this.tint.destroy();
  }
}
