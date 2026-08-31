/* Backdrop — painted environment art. Supports two modes:
 *
 *  - "cover" (default): the painting fills the viewport (CSS-cover
 *    behavior), pinned to the camera, exactly like a scrolling sky.
 *    Used by scenes that still lay their gameplay out in viewport space.
 *
 *  - "world": the painting is placed at world (0,0) at native pixel size
 *    and the world IS the painting. Camera bounds are clamped to the
 *    floor so the viewport never reveals outside the art. Used by the
 *    fully-migrated scenes (library, bus, finale…).
 */
import Phaser from "phaser";

export interface BackdropMood {
  tint?: number;
  darken?: number;
  wash?: number;
  washTint?: number;
  drift?: number;
}

const BACKDROP_DEPTH = -1000;

export type Mode = "cover" | "world";

export class Backdrop {
  private img: Phaser.GameObjects.Image;
  private veil: Phaser.GameObjects.Rectangle;
  private wash: Phaser.GameObjects.Rectangle | null = null;
  private drift: number;
  private t = 0;
  private scene: Phaser.Scene;
  /** Native pixel size. */
  readonly width: number;
  readonly height: number;
  private baseZoom = 1.06;
  /** Which placement mode is active. */
  private mode_: Mode = "cover";
  get mode(): Mode { return this.mode_; }

  constructor(
    scene: Phaser.Scene,
    key: string,
    mood: BackdropMood = {},
    reduced = false
  ) {
    this.scene = scene;
    const { tint, darken = 0, wash = 0, washTint = 0x93dcbb, drift = 0, zoom = 1.06 } = mood;
    this.baseZoom = zoom;
    this.drift = reduced ? 0 : drift;

    const src = scene.textures.get(key).getSourceImage() as HTMLImageElement;
    this.width = src?.naturalWidth || src?.width || 1408;
    this.height = src?.naturalHeight || src?.height || 768;

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

    this.fitCover();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
    });
  }

  /** Switch the painting into world-anchored mode — it lives at world
   *  (0,0) at native pixel size so gameplay uses image coordinates. */
  useWorldSpace() {
    this.mode_ = "world";
    this.img
      .setPosition(0, 0)
      .setOrigin(0, 0)
      .setScrollFactor(1)
      .setScale(1);
    const w = this.width, h = this.height;
    this.veil
      .setPosition(0, 0)
      .setSize(w, h)
      .setOrigin(0, 0)
      .setScrollFactor(1);
    if (this.wash) {
      this.wash
        .setPosition(0, 0)
        .setSize(w, h)
        .setOrigin(0, 0)
        .setScrollFactor(1);
    }
  }

  private onResize() {
    if (this.mode === "cover") this.fitCover();
  }

  private fitCover() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const sw = this.width;
    const sh = this.height;
    const scale = Math.max(w / sw, h / sh) * this.baseZoom;
    this.img.setPosition(w / 2, h / 2).setScale(scale);
    this.veil.setPosition(w / 2, h / 2).setSize(w, h);
    this.wash?.setPosition(w / 2, h / 2).setSize(w, h);
  }

  update(dtSec: number, cam?: Phaser.Cameras.Scene2D.Camera) {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.t += dtSec;

    if (this.mode === "cover") {
      let ox = 0, oy = 0;
      if (this.drift > 0) {
        ox += Math.sin(this.t * 0.06) * this.drift;
        oy += Math.cos(this.t * 0.045) * this.drift * 0.4;
      }
      if (cam) {
        // camera-parallax against the backdrop (slight)
        const span = Math.max(1, cam.getBounds().width - w);
        const p = Phaser.Math.Clamp((cam.scrollX - cam.getBounds().x) / span, 0, 1);
        ox += (0.5 - p) * w * 0.04;
      }
      this.img.setPosition(w / 2 + ox, h / 2 + oy);
      this.veil.setPosition(w / 2, h / 2);
      this.wash?.setPosition(w / 2, h / 2);
    } else {
      // world-space: slow breath drift only
      if (this.drift > 0) {
        const ox = Math.sin(this.t * 0.06) * this.drift;
        const oy = Math.cos(this.t * 0.045) * this.drift * 0.4;
        this.img.setPosition(ox, oy);
        this.veil.setPosition(ox, oy);
        this.wash?.setPosition(ox, oy);
      }
    }
  }

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
