/* Player — her soul, controlled by you. Accel-based movement, collision
   resolve, facing, delicate motion trail. */
import Phaser from "phaser";
import { Soul } from "./Soul";
import { resolveColliders, type Collider } from "../systems/world/colliders";
import type { ColorDirector } from "../systems/color/ColorDirector";

export class Player {
  soul: Soul;
  pos: Phaser.Math.Vector2;
  vel: Phaser.Math.Vector2;
  speed = 245;
  radius = 13;
  frozen = false;
  bounds: Phaser.Geom.Rectangle | null = null;
  private trailTimer = 0;

  readonly kind: "hazel" | "blue";

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    kind: "hazel" | "blue" = "hazel"
  ) {
    this.kind = kind;
    this.soul = new Soul(scene, x, y, kind, { scale: 1 });
    this.pos = new Phaser.Math.Vector2(x, y);
    this.vel = new Phaser.Math.Vector2(0, 0);
  }

  get isMoving() {
    return this.vel.lengthSq() > 500;
  }

  setFrozen(v: boolean) {
    this.frozen = v;
    if (v) this.vel.set(0, 0);
  }

  /** Sit / stand / rest — used by seat, project and shoulder moments. */
  setPose(pose: "stand" | "sit" | "rest") {
    this.soul.setPose(pose);
  }

  update(
    dtSec: number,
    tSec: number,
    axis: { x: number; y: number },
    colliders: Collider[],
    colors: ColorDirector
  ) {
    const ax = this.frozen ? 0 : axis.x;
    const ay = this.frozen ? 0 : axis.y;
    const accel = 2600;

    this.vel.x += ax * accel * dtSec;
    this.vel.y += ay * accel * dtSec;

    const max = this.speed * Math.min(1, Math.hypot(ax, ay) || (this.vel.length() / this.speed ? 1 : 0));
    if (ax === 0 && ay === 0) {
      const f = Math.max(0, 1 - 12 * dtSec);
      this.vel.scale(f);
      if (this.vel.lengthSq() < 18) this.vel.set(0, 0);
    } else if (this.vel.length() > max) {
      this.vel.setLength(max);
    }

    this.pos.x += this.vel.x * dtSec;
    this.pos.y += this.vel.y * dtSec;

    resolveColliders(this.pos, this.radius, colliders);

    if (this.bounds) {
      this.pos.x = Phaser.Math.Clamp(this.pos.x, this.bounds.x, this.bounds.x + this.bounds.width);
      this.pos.y = Phaser.Math.Clamp(this.pos.y, this.bounds.y, this.bounds.y + this.bounds.height);
    }

    this.soul.setPosition(this.pos.x, this.pos.y);
    if (this.vel.lengthSq() > 300) {
      this.soul.lookAt(this.pos.x + this.vel.x, this.pos.y + this.vel.y);
    }

    // delicate trail
    this.trailTimer -= dtSec;
    if (this.isMoving && this.trailTimer <= 0) {
      this.trailTimer = 0.15;
      const m = this.scene.add
        .image(this.pos.x, this.pos.y + 4, "dust")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(this.kind === "hazel" ? 0xf4dca8 : 0xd6eeff)
        .setAlpha(0.4)
        .setScale(0.9)
        .setDepth(5);
      this.scene.tweens.add({
        targets: m,
        alpha: 0,
        scale: 2.2,
        y: m.y + 8,
        duration: 700,
        ease: "Sine.easeOut",
        onComplete: () => m.destroy(),
      });
    }

    this.soul.update(dtSec, tSec, colors);
  }
}
