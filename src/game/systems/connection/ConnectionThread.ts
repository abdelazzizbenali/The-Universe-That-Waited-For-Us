/* ConnectionThread — the Constantine thread.
   Not a rope, not a tether: a symbolic emotional link between two souls
   that stays visible across any distance, pulses, and carries OUR COLOR.
   Movements at one end arrive at the other a moment later. */
import Phaser from "phaser";
import { DEPTH } from "../../config";

export interface ThreadOptions {
  /** 0..1 — how much of OUR COLOR the thread carries. */
  strength?: number;
  /** Number of motes travelling along the thread. */
  motes?: number;
  depth?: number;
}

export class ConnectionThread {
  private g: Phaser.GameObjects.Graphics;
  private motes: { img: Phaser.GameObjects.Image; t: number; speed: number }[] = [];
  private pulse = 0;
  private strength: number;
  private depth: number;

  constructor(private scene: Phaser.Scene, opts: ThreadOptions = {}) {
    this.strength = opts.strength ?? 0.5;
    this.depth = opts.depth ?? DEPTH.fx - 1;
    this.g = scene.add.graphics().setDepth(this.depth);

    const count = opts.motes ?? 5;
    for (let i = 0; i < count; i++) {
      const img = scene.add
        .image(0, 0, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x93dcbb)
        .setScale(0.85)
        .setDepth(this.depth + 1)
        .setAlpha(0);
      this.motes.push({ img, t: i / count, speed: 0.06 + Math.random() * 0.05 });
    }
  }

  /** 0..1 — raise it as the two of them grow emotionally closer. */
  setStrength(v: number) {
    this.strength = Phaser.Math.Clamp(v, 0, 1);
  }

  /**
   * @param a  her position (world space)
   * @param b  his position (world space)
   * @param sag how much the thread droops between them
   */
  update(dtSec: number, a: { x: number; y: number }, b: { x: number; y: number }, sag = 60) {
    this.pulse += dtSec;
    const mx = (a.x + b.x) / 2;
    const wave = Math.sin(this.pulse * 0.9) * 10;
    const my = (a.y + b.y) / 2 + sag + wave;

    // the thread never fully disappears — even at full distance it is a hairline
    const alpha = 0.28 + this.strength * 0.5;
    const width = 0.8 + this.strength * 1.6;

    this.g.clear();
    // hazel half
    this.g.lineStyle(width, 0xe0b36a, alpha * 0.85);
    this.beginCurve(a, { x: mx, y: my }, b);
    // blue half, slightly offset so both colors stay readable
    this.g.lineStyle(width, 0x7fc4ff, alpha * 0.85);
    this.beginCurve(a, { x: mx, y: my + 2 }, b);
    // OUR COLOR core — grows as the connection deepens
    if (this.strength > 0.02) {
      this.g.lineStyle(width * 1.6, 0x93dcbb, this.strength * 0.4);
      this.beginCurve(a, { x: mx, y: my + 1 }, b);
    }

    // motes travelling both ways — small things crossing the distance
    for (const m of this.motes) {
      m.t += m.speed * dtSec;
      if (m.t > 1) m.t -= 1;
      const t = m.t;
      const x = Phaser.Math.Linear(
        Phaser.Math.Linear(a.x, mx, t),
        Phaser.Math.Linear(mx, b.x, t),
        t
      );
      const y = Phaser.Math.Linear(
        Phaser.Math.Linear(a.y, my, t),
        Phaser.Math.Linear(my, b.y, t),
        t
      );
      m.img.setPosition(x, y);
      m.img.setAlpha((0.25 + this.strength * 0.6) * (0.5 + 0.5 * Math.sin(this.pulse * 2 + m.t * 6)));
    }
  }

  private beginCurve(
    a: { x: number; y: number },
    m: { x: number; y: number },
    b: { x: number; y: number }
  ) {
    this.g.beginPath();
    this.g.moveTo(a.x, a.y);
    this.g.lineTo(m.x, m.y);
    this.g.lineTo(b.x, b.y);
    this.g.strokePath();
  }

  /** A mote leaving her side and arriving at his — used for shared moments. */
  sendMote(
    from: { x: number; y: number },
    to: { x: number; y: number },
    onArrive?: () => void
  ) {
    const img = this.scene.add
      .image(from.x, from.y, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x93dcbb)
      .setScale(1.3)
      .setDepth(this.depth + 2);
    this.scene.tweens.add({
      targets: img,
      x: to.x,
      y: to.y,
      duration: 1500,
      ease: "Sine.easeInOut",
      onComplete: () => {
        img.destroy();
        onArrive?.();
      },
    });
  }

  destroy() {
    this.g.destroy();
    for (const m of this.motes) m.img.destroy();
    this.motes = [];
  }
}
