/* CameraRig — smooth follow and emotional focus. The gameplay zoom is kept
   close to 1:1 so the provided backgrounds, furniture, and playable areas read
   at their intended proportions instead of feeling oversized. */
import Phaser from "phaser";
import { runtime } from "../../runtime";

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private followTarget: Phaser.GameObjects.Container | null = null;
  private lerp = 0.11;
  private baseZoom = 1;

  constructor(private scene: Phaser.Scene) {
    this.cam = scene.cameras.main;
  }

  private gameplayZoom() {
    return runtime.settings?.zoom ?? 1.08;
  }

  private z(relativeZoom: number) {
    const target = this.gameplayZoom() * relativeZoom;
    const rm = runtime.settings?.reducedMotion;
    return rm ? this.gameplayZoom() + (target - this.gameplayZoom()) * 0.35 : target;
  }

  private d(ms: number) {
    return runtime.settings ? runtime.settings.duration(ms) : ms;
  }

  follow(target: Phaser.GameObjects.Container, lerp = 0.11, zoom = 1) {
    this.followTarget = target;
    this.lerp = lerp;
    this.baseZoom = zoom;
    this.cam.startFollow(target, false, lerp, lerp);
    this.cam.setZoom(this.z(zoom));
  }

  stopFollow() {
    this.cam.stopFollow();
  }

  setBounds(x: number, y: number, w: number, h: number) {
    const backdrop = (this.scene as Phaser.Scene & { backdrop?: { width: number; height: number } }).backdrop;
    const bw = backdrop?.width ?? w;
    const bh = backdrop?.height ?? h;
    this.cam.setBounds(x, y, Math.max(1, Math.min(w, bw)), Math.max(1, Math.min(h, bh)), true);
  }

  focusPull(x: number, y: number, zoom = 1.14, dur = 1000) {
    const d = this.d(dur);
    this.cam.stopFollow();
    this.cam.pan(x, y, d, "Sine.easeInOut");
    this.cam.zoomTo(this.z(zoom), d, "Sine.easeInOut");
  }

  release(zoom = this.baseZoom, dur = 1000) {
    const d = this.d(dur);
    this.cam.zoomTo(this.z(zoom), d, "Sine.easeInOut");
    if (this.followTarget) {
      this.cam.pan(this.followTarget.x, this.followTarget.y, d, "Sine.easeInOut");
      this.scene.time.delayedCall(d + 30, () => {
        if (this.followTarget && this.followTarget.active) this.cam.startFollow(this.followTarget, false, this.lerp, this.lerp);
      });
    }
  }

  widen(zoom = 0.92, dur = 1400) {
    this.cam.zoomTo(this.z(zoom), this.d(dur), "Sine.easeInOut");
  }
}
