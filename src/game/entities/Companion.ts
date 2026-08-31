/* Companion — his soul. An FSM whose states encode the relationship:
   DISTANT → AWARE → FOLLOW → BESIDE (the taxi upgrade) → SEATED.
   Steering is arrive-based and gentle; he waits, never pulls. */
import Phaser from "phaser";
import { Soul } from "./Soul";
import type { ColorDirector } from "../systems/color/ColorDirector";

export type CompanionState = "distant" | "aware" | "follow" | "beside" | "seated";

export class Companion {
  soul: Soul;
  pos: Phaser.Math.Vector2;
  vel: Phaser.Math.Vector2;
  state: CompanionState = "distant";
  maxSpeed = 174;
  private followOffset = new Phaser.Math.Vector2(-52, 12);
  private besideOffset = new Phaser.Math.Vector2(-6, -32);
  private offsetT = 0; // 0 = follow, 1 = beside (taxi upgrade visual)
  private offsetTarget = 0;
  private scriptTarget: Phaser.Math.Vector2 | null = null;

  readonly kind: "hazel" | "blue";

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    kind: "hazel" | "blue" = "blue"
  ) {
    this.kind = kind;
    this.soul = new Soul(scene, x, y, kind, { scale: 1.02 });
    this.pos = new Phaser.Math.Vector2(x, y);
    this.vel = new Phaser.Math.Vector2(0, 0);
  }

  setState(s: CompanionState) {
    this.state = s;
    if (s === "beside") this.offsetTarget = 1;
    // the body reads the FSM: seated states fold the legs, everywhere
    this.soul.setPose(s === "seated" ? "sit" : "stand");
  }

  /** The taxi journey: he drifts from walking behind to walking beside. */
  beginBesideUpgrade() {
    this.offsetTarget = 1;
  }

  moveTo(x: number, y: number) {
    this.scriptTarget = new Phaser.Math.Vector2(x, y);
  }

  get x() {
    return this.pos.x;
  }
  get y() {
    return this.pos.y;
  }

  distanceToPlayer(p: Phaser.Math.Vector2) {
    return Phaser.Math.Distance.Between(this.pos.x, this.pos.y, p.x, p.y);
  }

  /** A discreet blue glint — the crowded-bus signal. */
  signal() {
    this.ringBurst(0xd6eeff, 7, 34, 900);
  }

  joyBurst() {
    this.ringBurst(0xf4dca8, 10, 44, 1100);
  }

  private ringBurst(tint: number, n: number, radius: number, dur: number) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const m = this.scene.add
        .image(this.pos.x, this.pos.y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tint)
        .setScale(0.8)
        .setDepth(55);
      this.scene.tweens.add({
        targets: m,
        x: this.pos.x + Math.cos(a) * radius,
        y: this.pos.y + Math.sin(a) * radius * 0.8 - 6,
        alpha: 0,
        scale: 1.6,
        duration: dur,
        ease: "Sine.easeOut",
        onComplete: () => m.destroy(),
      });
    }
  }

  update(dtSec: number, tSec: number, playerPos: Phaser.Math.Vector2, colors: ColorDirector) {
    // offset blend (follow → beside), slow by design — around 30 seconds
    this.offsetT += (this.offsetTarget - this.offsetT) * Math.min(1, dtSec * 0.055);
    const ox = Phaser.Math.Linear(this.followOffset.x, this.besideOffset.x, this.offsetT);
    const oy = Phaser.Math.Linear(this.followOffset.y, this.besideOffset.y, this.offsetT);

    let target: Phaser.Math.Vector2 | null = null;
    if (this.state === "follow" || this.state === "beside") {
      target = new Phaser.Math.Vector2(playerPos.x + ox, playerPos.y + oy);
    } else if (this.scriptTarget) {
      target = this.scriptTarget;
    }

    if (target) {
      const dx = target.x - this.pos.x;
      const dy = target.y - this.pos.y;
      const d = Math.hypot(dx, dy);
      if (this.scriptTarget && d < 6) this.scriptTarget = null;
      if (d > 3) {
        const slow = Phaser.Math.Clamp(d / 70, 0.18, 1);
        const boost = d > 150 ? 1.45 : 1;
        const sp = this.maxSpeed * slow * boost;
        this.vel.x = (dx / d) * sp;
        this.vel.y = (dy / d) * sp;
      } else {
        this.vel.scale(Math.max(0, 1 - 8 * dtSec));
      }
    } else {
      this.vel.scale(Math.max(0, 1 - 6 * dtSec));
    }

    this.pos.x += this.vel.x * dtSec;
    this.pos.y += this.vel.y * dtSec;
    this.soul.setPosition(this.pos.x, this.pos.y);

    // where his attention points
    if (this.state === "aware" || this.state === "seated" || this.state === "beside") {
      this.soul.lookAt(playerPos.x, playerPos.y);
    } else if (this.vel.lengthSq() > 200) {
      this.soul.lookAt(this.pos.x + this.vel.x, this.pos.y + this.vel.y);
    }

    this.soul.update(dtSec, tSec, colors);
  }
}
