/* MemoryCamera — the camera she helped him reach (M22).
   A permanent tool, not a phone app: a viewfinder that reveals things the
   naked world is too shy to show — hidden stars, small symbols, fragments.
   Captures become Memory Frames in the archive. */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { UIManager } from "../../ui/UIManager";
import type { AudioDirector } from "../audio/AudioDirector";

export interface CameraTarget {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface MemoryCameraOptions {
  /** Half-size of the capture frame in screen pixels. */
  frameW?: number;
  frameH?: number;
  onCapture?: (target: CameraTarget) => void;
  onMiss?: () => void;
  onToggle?: (active: boolean) => void;
}

export class MemoryCamera {
  active = false;
  private g: Phaser.GameObjects.Graphics;
  private focus: Phaser.GameObjects.Image;
  private grain: Phaser.GameObjects.Image;
  private edge: Phaser.GameObjects.Image;
  private targets: CameraTarget[] = [];
  private captured = new Set<string>();
  private opts: Required<Omit<MemoryCameraOptions, "onCapture" | "onMiss" | "onToggle">> & {
    onCapture?: (t: CameraTarget) => void;
    onMiss?: () => void;
    onToggle?: (active: boolean) => void;
  };
  private lastPulse = false;
  private w = 0;
  private h = 0;

  constructor(
    private scene: Phaser.Scene,
    private ui: UIManager,
    private audio: AudioDirector,
    opts: MemoryCameraOptions = {}
  ) {
    this.w = scene.scale.width;
    this.h = scene.scale.height;
    this.opts = {
      frameW: opts.frameW ?? Math.min(150, this.w * 0.16),
      frameH: opts.frameH ?? Math.min(112, this.h * 0.22),
      onCapture: opts.onCapture,
      onMiss: opts.onMiss,
      onToggle: opts.onToggle,
    };

    // viewfinder: corner brackets + focus box, all screen-locked
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.overlay + 4).setVisible(false);
    this.focus = scene.add
      .image(this.w / 2, this.h / 2, "mote")
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(2.4)
      .setAlpha(0)
      .setDepth(DEPTH.overlay + 5);
    this.edge = scene.add
      .image(this.w / 2, this.h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(this.w * 1.2, this.h * 1.2)
      .setAlpha(0)
      .setDepth(DEPTH.overlay + 3);
    // faint recording grain — a memory tool, not a social feed
    this.grain = scene.add
      .image(this.w / 2, this.h / 2, "dust")
      .setScrollFactor(0)
      .setTint(0xbfd9ff)
      .setAlpha(0)
      .setScale(200)
      .setDepth(DEPTH.overlay + 2);
  }

  addTargets(targets: CameraTarget[]) {
    this.targets.push(...targets);
  }

  /** Draws the little symbols only the camera can see. */
  private revealed: Phaser.GameObjects.Image[] = [];

  toggle(force?: boolean) {
    this.active = force ?? !this.active;
    this.g.setVisible(this.active);
    this.opts.onToggle?.(this.active);
    if (this.active) {
      this.audio.softTick();
      this.ui.setAction("capture");
      this.ui.setHint("frame something · capture");
      // hidden things become visible through the viewfinder
      for (const t of this.targets) {
        if (this.captured.has(t.id)) continue;
        const img = this.scene.add
          .image(t.x, t.y, "star")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(0x9fe3c9)
          .setScale(1.2)
          .setAlpha(0)
          .setDepth(DEPTH.fx);
        this.revealed.push(img);
        this.scene.tweens.add({ targets: img, alpha: 0.9, scale: 1.6, duration: 600 });
      }
    } else {
      this.ui.setAction(null);
      this.ui.setHint(null);
      for (const img of this.revealed) {
        this.scene.tweens.add({ targets: img, alpha: 0, duration: 300, onComplete: () => img.destroy() });
      }
      this.revealed = [];
    }
  }

  /** Screen size can change mid-scene (iOS browser chrome). Stay centred. */
  private refit() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.opts.frameW = Math.min(150, w * 0.16);
    this.opts.frameH = Math.min(112, h * 0.22);
    this.focus.setPosition(w / 2, h / 2);
    this.edge.setPosition(w / 2, h / 2).setDisplaySize(w * 1.2, h * 1.2);
    this.grain.setPosition(w / 2, h / 2);
  }

  update(dtSec: number, cam: Phaser.Cameras.Scene2D.Camera, actionPulse: boolean, actionHeld: boolean) {
    this.refit();
    // grain shimmer while aiming
    this.grain.setAlpha(this.active ? 0.05 + 0.03 * Math.sin(this.scene.time.now / 120) : 0);
    this.edge.setAlpha(this.active ? 0.45 : 0);
    this.focus.setAlpha(this.active ? 0.5 + 0.2 * Math.sin(this.scene.time.now / 300) : 0);
    if (!this.active) {
      this.lastPulse = actionHeld;
      return;
    }

    // draw the viewfinder brackets
    const cx = this.w / 2;
    const cy = this.h / 2;
    const fw = this.opts.frameW;
    const fh = this.opts.frameH;
    this.g.clear();
    this.g.lineStyle(1.5, 0xeaf2ff, 0.75);
    const arm = 18;
    const corners: [number, number, number, number][] = [
      [cx - fw, cy - fh, 1, 1],
      [cx + fw, cy - fh, -1, 1],
      [cx - fw, cy + fh, 1, -1],
      [cx + fw, cy + fh, -1, -1],
    ];
    for (const [x, y, sx, sy] of corners) {
      this.g.beginPath();
      this.g.moveTo(x + arm * sx, y);
      this.g.lineTo(x, y);
      this.g.lineTo(x, y + arm * sy);
      this.g.strokePath();
    }
    // highlight brackets turn OUR-colored when something is framed
    const target = this.framedTarget(cam);
    if (target) {
      this.g.lineStyle(1.5, 0x93dcbb, 0.95);
      for (const [x, y, sx, sy] of corners) {
        this.g.beginPath();
        this.g.moveTo(x + arm * sx, y);
        this.g.lineTo(x, y);
        this.g.lineTo(x, y + arm * sy);
        this.g.strokePath();
      }
    }

    const tapped = actionPulse || (actionHeld && !this.lastPulse);
    this.lastPulse = actionHeld;
    if (tapped) this.capture(target);
    void dtSec;
  }

  /** Which target sits inside the frame right now, in screen space. */
  private framedTarget(cam: Phaser.Cameras.Scene2D.Camera): CameraTarget | null {
    let best: CameraTarget | null = null;
    let bestD = Infinity;
    for (const t of this.targets) {
      if (this.captured.has(t.id)) continue;
      const sx = (t.x - cam.worldView.x) * cam.zoom;
      const sy = (t.y - cam.worldView.y) * cam.zoom;
      const dx = Math.abs(sx - this.w / 2);
      const dy = Math.abs(sy - this.h / 2);
      if (dx <= this.opts.frameW && dy <= this.opts.frameH) {
        const d = dx + dy;
        if (d < bestD) {
          bestD = d;
          best = t;
        }
      }
    }
    return best;
  }

  private capture(target: CameraTarget | null) {
    this.audio.shutter();
    // shutter blink
    const flash = this.scene.add
      .rectangle(this.w / 2, this.h / 2, this.w, this.h, 0xeaf2ff, 0.55)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 8);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 220, onComplete: () => flash.destroy() });

    if (!target) {
      this.opts.onMiss?.();
      return;
    }
    this.captured.add(target.id);
    // the fragment is taken into the frame
    const img = this.revealed.find((i) => Math.abs(i.x - target.x) < 2 && Math.abs(i.y - target.y) < 2);
    if (img) {
      this.scene.tweens.add({
        targets: img,
        scale: 4,
        alpha: 0,
        duration: 500,
        onComplete: () => img.destroy(),
      });
      this.revealed = this.revealed.filter((i) => i !== img);
    }
    this.opts.onCapture?.(target);
  }

  get capturedIds() {
    return [...this.captured];
  }

  destroy() {
    this.g.destroy();
    this.focus.destroy();
    this.grain.destroy();
    this.edge.destroy();
    this.revealed.forEach((i) => i.destroy());
    this.revealed = [];
  }
}
