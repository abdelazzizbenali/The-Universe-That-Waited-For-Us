/* InputAdapter — merges the DOM virtual stick + action button with keyboard
   into one axis / action pipeline. Scenes never touch raw events. */
import Phaser from "phaser";
import type { UIManager } from "../../ui/UIManager";

type KeyMap = Record<string, Phaser.Input.Keyboard.Key>;

export class InputAdapter {
  private keys: KeyMap | null = null;
  private ui: UIManager;
  private downPulse = false;
  private onDown = () => {
    this.downPulse = true;
  };

  constructor(scene: Phaser.Scene, ui: UIManager) {
    this.ui = ui;
    ui.onActionDown = this.onDown;
    const kb = scene.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ENTER,E") as KeyMap;
    }
  }

  axis(): { x: number; y: number } {
    const stick = this.ui.stickAxis;
    if (stick.x !== 0 || stick.y !== 0) return stick;
    if (!this.keys) return { x: 0, y: 0 };
    const k = this.keys;
    let x = 0;
    let y = 0;
    if (k.A.isDown || k.LEFT.isDown) x -= 1;
    if (k.D.isDown || k.RIGHT.isDown) x += 1;
    if (k.W.isDown || k.UP.isDown) y -= 1;
    if (k.S.isDown || k.DOWN.isDown) y += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.hypot(x, y);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }

  actionHeld(): boolean {
    if (this.ui.actionHeld) return true;
    if (!this.keys) return false;
    const k = this.keys;
    return k.SPACE.isDown || k.E.isDown || k.ENTER.isDown;
  }

  /** Tap-to-interact pulse from the DOM button (keyboard taps are handled by actionHeld edge detection in scenes). */
  consumeActionPulse(): boolean {
    const p = this.downPulse;
    this.downPulse = false;
    return p;
  }

  private prevHeld = false;
  /** Rising-edge detector for keyboard action (DOM button uses pulse). */
  keyboardTapped(): boolean {
    const held = this.actionHeld();
    const tapped = held && !this.prevHeld;
    this.prevHeld = held;
    return tapped;
  }

  destroy() {
    if (this.ui.onActionDown === this.onDown) {
      this.ui.onActionDown = null;
      this.ui.onActionUp = null;
    }
  }
}
