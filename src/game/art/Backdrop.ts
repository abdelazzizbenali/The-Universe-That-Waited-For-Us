/* Backdrop — painted environment art as the base layer of every scene.

   These are real painted backgrounds, not procedural fills. Each one is
   fitted to the viewport with "cover" maths (never stretched out of ratio,
   never letterboxed), pinned to the camera, and graded per scene so a single
   painting can carry several emotional states — the same library can be
   cold on the first visit and warm on the fourth.

   Scene geometry, props and characters draw on top; the painting supplies
   the depth, light and place that primitives cannot. */
import Phaser from "phaser";

export interface BackdropMood {
  /** Multiply tint — cools or warms the painting. */
  tint?: number;
  /** 0..1 darkening veil over the art. */
  darken?: number;
  /** 0..1 additive colour wash (used for OUR COLOR late game). */
  wash?: number;
  washTint?: number;
  /** Slow drift, in pixels, for a sense of breath. Ignored in reduced motion. */
  drift?: number;
  /** Extra zoom past cover fit, for a touch of parallax headroom. */
  zoom?: number;
}

const BACKDROP_DEPTH = -1000;

export class Backdrop {
  private img: Phaser.GameObjects.Image;
  private veil: Phaser.GameObjects.Rectangle;
  private wash: Phaser.GameObjects.Rectangle | null = null;
  private baseZoom: number;
  private drift: number;
  private t = 0;

  constructor(
    private scene: Phaser.Scene,
    key: string,
    mood: BackdropMood = {},
    reduced = false
  ) {
    const { tint, darken = 0, wash = 0, washTint = 0x93dcbb, drift = 0, zoom = 1.06 } = mood;
    this.baseZoom = zoom;
    this.drift = reduced ? 0 : drift;

    this.img = scene.add
      .image(0, 0, key)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(BACKDROP_DEPTH);
    if (tint !== undefined) this.img.setTint(tint);

    this.veil = scene.add
      .rectangle(0, 0, 10, 10, 0x05070f, darken)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(BACKDROP_DEPTH + 1);

    if (wash > 0) {
      this.wash = scene.add
        .rectangle(0, 0, 10, 10, washTint, wash)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(BACKDROP_DEPTH + 2)
        .setBlendMode(Phaser.BlendModes.ADD);
    }

    this.fit();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.fit, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.fit, this);
    });
  }

  /** Cover-fit: fills the viewport on both axes, preserving aspect ratio. */
  private fit() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const src = this.scene.textures.get(this.img.texture.key).getSourceImage();
    const sw = (src as HTMLImageElement).width || 1536;
    const sh = (src as HTMLImageElement).height || 1024;
    const scale = Math.max(w / sw, h / sh) * this.baseZoom;

    this.img.setPosition(w / 2, h / 2).setScale(scale);
    this.veil.setPosition(w / 2, h / 2).setSize(w, h);
    this.wash?.setPosition(w / 2, h / 2).setSize(w, h);
  }

  /** Slow living drift, plus a gentle response to camera movement. */
  update(dtSec: number, cam?: Phaser.Cameras.Scene2D.Camera) {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    let ox = 0;
    let oy = 0;

    if (this.drift > 0) {
      this.t += dtSec;
      ox += Math.sin(this.t * 0.06) * this.drift;
      oy += Math.cos(this.t * 0.045) * this.drift * 0.4;
    }
    // the painting shifts a little as the camera travels: cheap parallax
    // that never reveals an edge because the image over-covers the frame
    if (cam) {
      const span = Math.max(1, cam.getBounds().width - w);
      const p = Phaser.Math.Clamp((cam.scrollX - cam.getBounds().x) / span, 0, 1);
      ox += (0.5 - p) * w * 0.06;
    }
    this.img.setPosition(w / 2 + ox, h / 2 + oy);
  }

  /** Re-grade the painting live (used when a scene warms or wakes). */
  grade(mood: BackdropMood, ms = 2000) {
    if (mood.tint !== undefined) this.img.setTint(mood.tint);
    if (mood.darken !== undefined) {
      this.scene.tweens.add({ targets: this.veil, fillAlpha: mood.darken, duration: ms });
    }
    if (mood.wash !== undefined && this.wash) {
      this.scene.tweens.add({ targets: this.wash, fillAlpha: mood.wash, duration: ms });
    }
  }

  destroy() {
    this.img.destroy();
    this.veil.destroy();
    this.wash?.destroy();
  }
}
