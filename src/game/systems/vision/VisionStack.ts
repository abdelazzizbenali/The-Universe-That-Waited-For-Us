/* VisionStack — a controlled rendering of what his eyes carry.
   A haze layer erased into clarity around her presence, far-detail decay,
   and light sensitivity with a strain response. It is never "broken" or
   ugly: the world stays beautiful, just harder to hold onto.

   She does not cure it. She makes it steadier to stand in. */
import Phaser from "phaser";
import { DEPTH } from "../../config";

export interface VisionOptions {
  /** Base haze opacity 0..1. */
  haze?: number;
  /** Radius of clarity around her aura. */
  clarity?: number;
  /** Radius of the small clarity the player keeps on his own. */
  selfClarity?: number;
}

export class VisionStack {
  private rt: Phaser.GameObjects.RenderTexture;
  private brush: Phaser.GameObjects.Image;
  private glare: Phaser.GameObjects.Image;
  private strainImg: Phaser.GameObjects.Image;
  private w: number;
  private h: number;
  private opts: Required<VisionOptions>;

  /** 0..1 discomfort from looking into bright light. */
  strain = 0;
  /** 0..1 how much clarity she is currently providing. */
  steadiness = 0;

  constructor(private scene: Phaser.Scene, opts: VisionOptions = {}) {
    this.w = scene.scale.width;
    this.h = scene.scale.height;
    this.opts = {
      haze: opts.haze ?? 0.72,
      clarity: opts.clarity ?? 150,
      selfClarity: opts.selfClarity ?? 62,
    };

    this.rt = scene.add
      .renderTexture(0, 0, this.w, this.h)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay);

    // soft brush used to erase clarity into the haze (off display list)
    this.brush = new Phaser.GameObjects.Image(scene, 0, 0, "mote");
    this.brush.setScale(1);

    // uncomfortable light bloom
    this.glare = scene.add
      .image(this.w / 2, this.h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(this.w * 1.4, this.h * 1.4)
      .setTint(0xf4e3c0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0)
      .setDepth(DEPTH.overlay + 1);

    // strain wash — desaturating pressure at the edges
    this.strainImg = scene.add
      .image(this.w / 2, this.h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(this.w * 1.5, this.h * 1.5)
      .setTint(0x9fb0d0)
      .setAlpha(0)
      .setDepth(DEPTH.overlay + 2);
  }

  /** Rebuilds the haze surface only when the screen actually changes. */
  private refit() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.rt.setSize(w, h);
    this.glare.setPosition(w / 2, h / 2).setDisplaySize(w * 1.4, h * 1.4);
    this.strainImg.setPosition(w / 2, h / 2).setDisplaySize(w * 1.5, h * 1.5);
  }

  /**
   * @param playerScreen  his position in screen space
   * @param herScreen     her position in screen space (null when she is away)
   * @param glareAmount   0..1 how much painful light is on screen
   */
  update(
    dtSec: number,
    playerScreen: { x: number; y: number },
    herScreen: { x: number; y: number } | null,
    glareAmount: number
  ) {
    this.refit();
    // her steadying presence
    const targetSteady = herScreen ? 1 : 0;
    this.steadiness += (targetSteady - this.steadiness) * Math.min(1, dtSec * 1.6);

    // strain rises in bright light, recovers in shade
    const targetStrain = Phaser.Math.Clamp(glareAmount, 0, 1);
    const rate = targetStrain > this.strain ? 0.55 : 1.1;
    this.strain += (targetStrain - this.strain) * Math.min(1, dtSec * rate);

    // haze thickens with strain, thins with her nearness
    const haze = Phaser.Math.Clamp(
      this.opts.haze + this.strain * 0.18 - this.steadiness * 0.14,
      0.25,
      0.94
    );

    this.rt.clear();
    this.rt.fill(0x0a1024, haze);

    // the clarity he keeps on his own — small, wobbling, never quite still
    const wob = Math.sin(this.scene.time.now / 700) * 5;
    this.eraseAt(playerScreen.x, playerScreen.y, this.opts.selfClarity + wob, 0.85);

    // the clarity she brings — wider, calmer, overlapping his
    if (herScreen) {
      const r = this.opts.clarity * (0.7 + 0.3 * this.steadiness);
      this.eraseAt(herScreen.x, herScreen.y, r, 1);
      // the space between them clears too — that is the whole point
      this.eraseAt(
        (herScreen.x + playerScreen.x) / 2,
        (herScreen.y + playerScreen.y) / 2,
        r * 0.7,
        0.9
      );
    }

    this.glare.setAlpha(glareAmount * 0.5 * (1 - this.steadiness * 0.45));
    this.strainImg.setAlpha(this.strain * 0.5);
  }

  private eraseAt(x: number, y: number, radius: number, strength: number) {
    // the mote texture is a soft radial falloff — perfect as an eraser brush
    const scale = (radius * 2) / 32;
    this.brush.setScale(scale).setAlpha(strength);
    this.rt.erase(this.brush, x, y);
  }

  /** Visibility multiplier for distant detail (stars, far objects). */
  farVisibility() {
    return Phaser.Math.Clamp(0.12 + this.steadiness * 0.8 - this.strain * 0.25, 0, 1);
  }

  private destroyed = false;

  /** Fades the whole stack out — used before cinematic overlays. */
  fadeOut(ms = 1200): Promise<void> {
    return new Promise((resolve) => {
      if (this.destroyed) return resolve();
      this.scene.tweens.add({
        targets: [this.rt, this.glare, this.strainImg],
        alpha: 0,
        duration: ms,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.rt.destroy();
    this.brush.destroy();
    this.glare.destroy();
    this.strainImg.destroy();
  }
}
