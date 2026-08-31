/* CameraRig — smooth follow, focus-pulls for emotional beats, gentle
   settles. No screenshake: this world never hits her.

   Every movement respects reduced motion: pulls become gentler and zooms
   shallower, but nothing is ever skipped or hidden. */
import Phaser from "phaser";
import { runtime } from "../../runtime";

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private followTarget: Phaser.GameObjects.Container | null = null;
  private lerp = 0.085;

  constructor(private scene: Phaser.Scene) {
    this.cam = scene.cameras.main;
  }

  /** Softens a zoom target toward 1 when reduced motion is on. */
  private z(zoom: number) {
    const rm = runtime.settings?.reducedMotion;
    return rm ? 1 + (zoom - 1) * 0.35 : zoom;
  }

  private d(ms: number) {
    return runtime.settings ? runtime.settings.duration(ms) : ms;
  }

  follow(target: Phaser.GameObjects.Container, lerp = 0.085, zoom = 1) {
    this.followTarget = target;
    this.lerp = lerp;
    this.cam.startFollow(target, false, lerp, lerp);
    this.cam.setZoom(this.z(zoom));
  }

  stopFollow() {
    this.cam.stopFollow();
  }

  setBounds(x: number, y: number, w: number, h: number) {
    this.cam.setBounds(x, y, w, h);
  }

  /** Emotional focus: drift to a point and breathe in. */
  focusPull(x: number, y: number, zoom = 1.14, dur = 1000) {
    const d = this.d(dur);
    this.cam.stopFollow();
    this.cam.pan(x, y, d, "Sine.easeInOut");
    this.cam.zoomTo(this.z(zoom), d, "Sine.easeInOut");
  }

  /** Return to the player, softly. */
  release(zoom = 1, dur = 1000) {
    const d = this.d(dur);
    this.cam.zoomTo(this.z(zoom), d, "Sine.easeInOut");
    if (this.followTarget) {
      this.cam.pan(this.followTarget.x, this.followTarget.y, d, "Sine.easeInOut");
      this.scene.time.delayedCall(d + 30, () => {
        if (this.followTarget && this.followTarget.active) {
          this.cam.startFollow(this.followTarget, false, this.lerp, this.lerp);
        }
      });
    }
  }

  widen(zoom = 0.92, dur = 1400) {
    this.cam.zoomTo(this.z(zoom), this.d(dur), "Sine.easeInOut");
  }
}
