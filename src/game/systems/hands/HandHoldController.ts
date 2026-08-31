/* HandHoldController — the signature mechanic.
   OFFER → REACH (the player physically drives the last centimeters) →
   CONTACT → HOLD → RELEASE.

   Three eras share one language: uncertain (M17), comfortable (M21),
   inevitable (finale). The difference is only in how much prompting the
   player needs — the gesture itself is always hers to complete. */
import Phaser from "phaser";
import { DEPTH } from "../../config";
import type { AudioDirector } from "../audio/AudioDirector";
import type { UIManager } from "../../ui/UIManager";

export type HandPhase = "idle" | "offer" | "reach" | "contact" | "hold";

export interface HandOptions {
  /** The two bodies, so their actual arms reach for each other. */
  her?: { reachToward: (x: number, y: number, a: number) => void };
  him?: { reachToward: (x: number, y: number, a: number) => void };
  /** Pixel distance at which contact happens. */
  contactDistance?: number;
  /** Prompt text shown on the action button (empty for no UI at all). */
  prompt?: string;
  /** Seconds of holding before the scene is considered complete. */
  holdSeconds?: number;
  /** Whether the HUD should disappear on contact. */
  hideHud?: boolean;
}

export class HandHoldController {
  phase: HandPhase = "idle";
  /** 0..1 progress of the reach — drives audio and color intensity. */
  reach = 0;
  holdTime = 0;
  private handA!: Phaser.GameObjects.Image;
  private handB!: Phaser.GameObjects.Image;
  private reachMark!: Phaser.GameObjects.Image;
  private sparkles: Phaser.GameObjects.Image[] = [];
  private opts: Required<Omit<HandOptions, "her" | "him">> & Pick<HandOptions, "her" | "him">;
  private onContactCb: (() => void) | null = null;
  private onHoldCompleteCb: (() => void) | null = null;
  private elapsed = 0;

  constructor(
    private scene: Phaser.Scene,
    private ui: UIManager,
    private audio: AudioDirector,
    opts: HandOptions = {}
  ) {
    this.opts = {
      her: opts.her,
      him: opts.him,
      contactDistance: opts.contactDistance ?? 34,
      prompt: opts.prompt ?? "reach",
      holdSeconds: opts.holdSeconds ?? 0,
      hideHud: opts.hideHud ?? true,
    };

    this.reachMark = scene.add
      .image(0, 0, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(2)
      .setAlpha(0)
      .setDepth(DEPTH.aura - 1);

    this.handA = scene.add
      .image(0, 0, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf4dca8)
      .setScale(1.5)
      .setAlpha(0)
      .setDepth(DEPTH.soul - 1);
    this.handB = scene.add
      .image(0, 0, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xd6eeff)
      .setScale(1.5)
      .setAlpha(0)
      .setDepth(DEPTH.soul - 1);
  }

  /** He offers his hand. From here the player must close the distance. */
  offer(herPos: { x: number; y: number }, hisPos: { x: number; y: number }) {
    if (this.phase !== "idle") return;
    this.phase = "offer";
    // scene-owned timer: cleaned up automatically with the scene
    this.scene.time.delayedCall(900, () => {
      if (this.phase === "offer") this.phase = "reach";
    });
    void herPos;
    void hisPos;
  }

  /** Skip the offer animation (used when holding hands is already natural). */
  beginReach() {
    this.phase = "reach";
  }

  onContact(cb: () => void) {
    this.onContactCb = cb;
  }
  onHoldComplete(cb: () => void) {
    this.onHoldCompleteCb = cb;
  }

  update(
    dtSec: number,
    herPos: { x: number; y: number },
    hisPos: { x: number; y: number },
    playerMoving: boolean
  ) {
    if (this.phase === "idle") return;

    // the offered hand waits a little in front of him, palm up
    const dx = herPos.x - hisPos.x;
    const dy = herPos.y - hisPos.y;
    const d = Math.hypot(dx, dy) || 1;
    const hx = hisPos.x + (dx / d) * 26;
    const hy = hisPos.y + (dy / d) * 26 + 4;

    this.handB.setPosition(hx, hy);
    this.handA.setPosition(herPos.x + (dx / d) * -6, herPos.y + 6);

    if (this.phase === "offer") {
      this.handB.setAlpha(0.5);
      this.handA.setAlpha(0);
      return;
    }

    this.handB.setAlpha(0.85);
    this.handA.setAlpha(Math.min(1, 0.25 + this.reach * 0.7));

    // the bodies do the reaching — the motes are only the light on the hands
    this.opts.him?.reachToward(herPos.x, herPos.y, this.phase === "hold" ? 1 : 0.9);
    this.opts.her?.reachToward(hisPos.x, hisPos.y, this.phase === "hold" ? 1 : this.reach);

    if (this.phase === "reach") {
      const dist = Phaser.Math.Distance.Between(herPos.x, herPos.y, hx, hy);
      const span = 260;
      this.reach = Phaser.Math.Clamp(1 - (dist - this.opts.contactDistance) / span, 0, 1);

      // the closer she gets, the more the world leans in
      this.reachMark.setPosition(hx, hy);
      this.reachMark.setAlpha(this.reach * 0.35);
      this.reachMark.setScale(2 + this.reach * 2);

      if (dist <= this.opts.contactDistance) {
        this.contact(hx, hy);
      }
      return;
    }

    if (this.phase === "hold") {
      this.holdTime += dtSec;
      this.elapsed += dtSec;
      // joined hands breathe together
      const b = Math.sin(this.elapsed * 1.1) * 1.5;
      this.handA.setPosition(hx - 10, hy + b);
      this.handB.setPosition(hx + 10, hy + b);
      this.reachMark.setPosition(hx, hy);
      this.reachMark.setAlpha(0.18 + 0.1 * Math.sin(this.elapsed * 1.1));
      // she is still choosing to stay — the hold continues on presence
      void playerMoving;
      if (this.opts.holdSeconds > 0 && this.holdTime >= this.opts.holdSeconds && this.onHoldCompleteCb) {
        const cb = this.onHoldCompleteCb;
        this.onHoldCompleteCb = null;
        cb();
      }
    }
  }

  private contact(hx: number, hy: number) {
    this.phase = "contact";
    this.reach = 1;
    if (this.opts.hideHud) {
      this.ui.setAction(null);
      this.ui.setHint(null);
    }
    // the smallest sound in the game: a hand finding another hand
    this.audio.tone(330, 0.022, 1.4, "heart", "sine");
    this.ui.haptic("contact");
    // a small ring where the hands meet, then everything goes quiet
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const m = this.scene.add
        .image(hx, hy, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x93dcbb)
        .setScale(1)
        .setDepth(DEPTH.fx);
      this.sparkles.push(m);
      this.scene.tweens.add({
        targets: m,
        x: hx + Math.cos(a) * 60,
        y: hy + Math.sin(a) * 40,
        alpha: 0,
        scale: 2,
        duration: 1400,
        ease: "Sine.easeOut",
        onComplete: () => m.destroy(),
      });
    }
    this.sparkles = [];
    this.scene.time.delayedCall(500, () => {
      this.phase = "hold";
      this.holdTime = 0;
      this.onContactCb?.();
    });
  }

  /** Fade the hands out (scene end) without abrupt pops. */
  fadeOut(ms = 800) {
    this.scene.tweens.add({ targets: [this.handA, this.handB, this.reachMark], alpha: 0, duration: ms });
  }

  destroy() {
    this.handA.destroy();
    this.handB.destroy();
    this.reachMark.destroy();
  }
}
