/* CameraRig — smooth follow, focus-pulls, adjustable zoom, and bounds that
 * never reveal outside the painting. */
import Phaser from "phaser";
import { runtime } from "../../runtime";

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private followTarget: Phaser.GameObjects.Container | null = null;
  private lerp = 0.085;
  private scene: Phaser.Scene;
  private b = { x: 0, y: 0, w: 2000, h: 1000 };
  /** Zoom mode: "world" scenes use the user's zoom slider; "cover" scenes
   *  stay at legacy 1.0 so their viewport-space layout still works. */
  private mode: "world" | "cover" = "cover";

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cam = scene.cameras.main;
    this.cam.roundPixels = true;
    this.cam.setZoom(1);
    runtime.ui.onZoom(() => this.recomputeBounds());
    scene.scale.on(Phaser.Scale.Events.RESIZE, () => this.recomputeBounds(), this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.recomputeBounds, this);
    });
  }

  private base() {
    return this.mode === "world" ? runtime.settings.zoom : 1;
  }
  private z(zoom: number) {
    const rm = runtime.settings?.reducedMotion;
    const base = this.base();
    // If callers pass zoom=1 they mean "default for this scene"
    const resolved = zoom <= 1.05 ? base : zoom;
    return rm ? 1 + (resolved - 1) * 0.55 : resolved;
  }
  private d(ms: number) {
    return runtime.settings ? runtime.settings.duration(ms) : ms;
  }

  follow(target: Phaser.GameObjects.Container, lerp = 0.085, zoom = 1) {
    this.followTarget = target;
    this.lerp = lerp;
    this.cam.startFollow(target, false, lerp, lerp);
    this.cam.setZoom(this.z(zoom));
    this.recomputeBounds();
  }
  stopFollow() { this.cam.stopFollow(); }

  /** Mark this rig as driving a world-space (painted) scene. Call this
   *  BEFORE setBounds so the zoom picks up the user's preferred zoom. */
  useWorldZoom(v = true) {
    this.mode = v ? "world" : "cover";
    this.cam.setZoom(this.z(1));
  }

  setBounds(x: number, y: number, w: number, h: number) {
    this.b = { x, y, w, h };
    this.recomputeBounds();
  }

  private recomputeBounds() {
    if (this.mode !== "world") {
      this.cam.setBounds(0, 0, this.b.w, this.b.h);
      return;
    }
    const cam = this.cam;
    const vw = this.scene.scale.width;
    const vh = this.scene.scale.height;
    const z = cam.zoom;
    const viewW = vw / z;
    const viewH = vh / z;
    let bx = this.b.x, by = this.b.y, bw = this.b.w, bh = this.b.h;
    if (viewW >= bw) {
      const cx = this.b.x + bw / 2;
      bx = cx - viewW / 2;
      bw = viewW;
    }
    if (viewH >= bh) {
      const cy = this.b.y + bh / 2;
      by = cy - viewH / 2;
      bh = viewH;
    }
    cam.setBounds(bx, by, bw, bh);
  }

  focusPull(x: number, y: number, zoom?: number, dur = 1000) {
    const d = this.d(dur);
    const targetZ = zoom ? this.z(zoom) : this.base() * 1.18;
    this.cam.stopFollow();
    this.cam.pan(x, y, d, "Sine.easeInOut");
    this.cam.zoomTo(targetZ, d, "Sine.easeInOut");
    this.scene.time.delayedCall(d, () => this.recomputeBounds());
  }
  release(zoom = 1, dur = 1000) {
    const d = this.d(dur);
    this.cam.zoomTo(this.z(zoom), d, "Sine.easeInOut");
    if (this.followTarget && this.followTarget.active) {
      this.cam.pan(this.followTarget.x, this.followTarget.y, d, "Sine.easeInOut");
      this.scene.time.delayedCall(d + 30, () => {
        if (this.followTarget && this.followTarget.active) {
          this.cam.startFollow(this.followTarget, false, this.lerp, this.lerp);
        }
        this.recomputeBounds();
      });
    } else {
      this.scene.time.delayedCall(d, () => this.recomputeBounds());
    }
  }
  widen(zoom?: number, dur = 1400) {
    const targetZ = zoom ? this.z(zoom) : this.base() * 0.9;
    this.cam.zoomTo(targetZ, this.d(dur), "Sine.easeInOut");
    this.scene.time.delayedCall(this.d(dur), () => this.recomputeBounds());
  }
  get worldView(): Phaser.Geom.Rectangle { return this.cam.worldView; }
}
