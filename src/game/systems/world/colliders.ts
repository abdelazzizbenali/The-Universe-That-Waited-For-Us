/* Lightweight colliders + resolution. No physics engine — steering only. */
import type Phaser from "phaser";

export type Collider =
  | { kind: "circle"; x: number; y: number; r: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number }; // center-based

export function circle(x: number, y: number, r: number): Collider {
  return { kind: "circle", x, y, r };
}
export function rect(x: number, y: number, w: number, h: number): Collider {
  return { kind: "rect", x, y, w, h };
}

export function resolveColliders(
  p: Phaser.Math.Vector2,
  radius: number,
  cols: Collider[]
): void {
  for (const c of cols) {
    if (c.kind === "circle") {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const d = Math.hypot(dx, dy);
      const min = c.r + radius;
      if (d < min && d > 0.001) {
        p.x = c.x + (dx / d) * min;
        p.y = c.y + (dy / d) * min;
      } else if (d <= 0.001) {
        p.x = c.x + min;
      }
    } else {
      const hw = c.w / 2;
      const hh = c.h / 2;
      const nx = Math.max(c.x - hw, Math.min(p.x, c.x + hw));
      const ny = Math.max(c.y - hh, Math.min(p.y, c.y + hh));
      const dx = p.x - nx;
      const dy = p.y - ny;
      const d2 = dx * dx + dy * dy;
      if (d2 < radius * radius) {
        if (d2 > 0.0001) {
          const d = Math.sqrt(d2);
          p.x = nx + (dx / d) * radius;
          p.y = ny + (dy / d) * radius;
        } else {
          // inside the rect — push out along least penetration axis
          const left = Math.abs(p.x - (c.x - hw));
          const right = Math.abs(c.x + hw - p.x);
          const top = Math.abs(p.y - (c.y - hh));
          const bottom = Math.abs(c.y + hh - p.y);
          const m = Math.min(left, right, top, bottom);
          if (m === left) p.x = c.x - hw - radius;
          else if (m === right) p.x = c.x + hw + radius;
          else if (m === top) p.y = c.y - hh - radius;
          else p.y = c.y + hh + radius;
        }
      }
    }
  }
}
