/* WorldDresser — the living-universe layer. Stars that twinkle, flowers
   that sway and open, drifting dust, hidden spirits, distant birds. Built
   per scene; scene-owned objects clean up automatically. */
import Phaser from "phaser";
import { DEPTH } from "../../config";

interface Twinkle {
  img: Phaser.GameObjects.Image;
  ph: number;
  sp: number;
  base: number;
}
interface Drift {
  img: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  area: Phaser.Geom.Rectangle;
}
interface Sway {
  img: Phaser.GameObjects.Image;
  ph: number;
  amp: number;
}

export class WorldDresser {
  private t = 0;
  private stars: Twinkle[] = [];
  private dust: Drift[] = [];
  private sways: Sway[] = [];
  private flowerImgs: Phaser.GameObjects.Image[] = [];
  private birdTimer: Phaser.Time.TimerEvent | null = null;

  constructor(private scene: Phaser.Scene) {}

  /**
   * A layered starfield. Three depth layers with their own size, brightness
   * and parallax speed, plus a wide soft halo behind the brightest ones, so
   * the sky reads as space rather than as scattered dots.
   */
  addStars(
    count: number,
    area: Phaser.Geom.Rectangle,
    depth = DEPTH.sky,
    opts: { parallax?: boolean } = {}
  ) {
    const parallax = opts.parallax ?? true;
    // far / mid / near proportions: lots of tiny ones, few bright ones
    const layers = [
      { share: 0.62, scale: [0.12, 0.3], alpha: [0.25, 0.55], scroll: 0.25, depth: DEPTH.skyFar, halo: false },
      { share: 0.3, scale: [0.3, 0.55], alpha: [0.45, 0.8], scroll: 0.55, depth: DEPTH.sky, halo: false },
      { share: 0.08, scale: [0.55, 0.95], alpha: [0.7, 1], scroll: 0.85, depth: DEPTH.skyNear, halo: true },
    ];

    for (const layer of layers) {
      const n = Math.max(1, Math.round(count * layer.share));
      for (let i = 0; i < n; i++) {
        const x = Phaser.Math.Between(area.x, area.x + area.width);
        const y = Phaser.Math.Between(area.y, area.y + area.height);
        if (layer.halo) {
          const halo = this.scene.add
            .image(x, y, "halo")
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(0x9fc8ff)
            .setAlpha(0.16)
            .setScale(Phaser.Math.FloatBetween(1.6, 3.2))
            .setDepth(layer.depth);
          if (parallax) halo.setScrollFactor(layer.scroll);
        }
        const img = this.scene.add
          .image(x, y, "star")
          .setScale(Phaser.Math.FloatBetween(layer.scale[0], layer.scale[1]))
          .setDepth(parallax ? layer.depth : depth)
          .setBlendMode(Phaser.BlendModes.ADD);
        if (parallax) img.setScrollFactor(layer.scroll);
        this.stars.push({
          img,
          ph: Math.random() * Math.PI * 2,
          sp: Phaser.Math.FloatBetween(0.3, 1.25),
          base: Phaser.Math.FloatBetween(layer.alpha[0], layer.alpha[1]),
        });
      }
    }
    return this.stars.map((s) => s.img);
  }

  /** A single narrative star: brighter, haloed, gently pulsing. */
  addMemoryStar(
    x: number,
    y: number,
    tint = 0x93dcbb,
    scale = 0.9,
    scrollFactor = 1
  ): Phaser.GameObjects.Image {
    const halo = this.scene.add
      .image(x, y, "halo")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(tint)
      .setAlpha(0.3)
      .setScale(scale * 3)
      .setDepth(DEPTH.skyNear);
    halo.setScrollFactor(scrollFactor);
    const img = this.scene.add
      .image(x, y, "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(tint)
      .setScale(scale)
      .setDepth(DEPTH.skyNear);
    img.setScrollFactor(scrollFactor);
    this.scene.tweens.add({
      targets: [img, halo],
      alpha: { from: 0.75, to: 1 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return img;
  }

  addFlowers(points: { x: number; y: number; open?: boolean; mint?: boolean }[]) {
    const imgs: Phaser.GameObjects.Image[] = [];
    for (const p of points) {
      const glow = this.scene.add
        .image(p.x, p.y - 14, "mote")
        .setTint(p.mint ? 0x9fe3c9 : 0xf2b8c6)
        .setAlpha(0.14)
        .setScale(3.4)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH.ground + 1);
      this.sways.push({ img: glow, ph: Math.random() * 6, amp: 0.05 });
      // four species instead of two, with size variation, so clusters
      // never read as repeated stamps
      const species = p.mint
        ? "mint"
        : (["pink", "blue", "gold"] as const)[Math.floor(Math.random() * 3)];
      const openKey =
        species === "mint"
          ? "flower-open-mint"
          : species === "blue"
            ? "flower-open-blue"
            : species === "gold"
              ? "flower-open-gold"
              : "flower-open";
      const scale = Phaser.Math.FloatBetween(0.62, 1.08);
      const img = this.scene.add
        .image(p.x, p.y, p.open ? openKey : "flower-closed")
        .setScale(scale)
        .setDepth(DEPTH.ground + 2);
      img.setData("open", !!p.open);
      img.setData("mint", !!p.mint);
      img.setData("openKey", openKey);
      img.setData("baseScale", scale);
      this.sways.push({ img, ph: Math.random() * 6, amp: 0.045 });
      this.flowerImgs.push(img);
      imgs.push(img);
    }
    return imgs;
  }

  openFlower(img: Phaser.GameObjects.Image) {
    if (img.getData("open")) return;
    img.setData("open", true);
    const base = (img.getData("baseScale") as number) ?? 0.9;
    img.setTexture(
      (img.getData("openKey") as string) ??
        (img.getData("mint") ? "flower-open-mint" : "flower-open")
    );
    this.scene.tweens.add({
      targets: img,
      scale: { from: base * 0.6, to: base },
      duration: 900,
      ease: "Back.easeOut",
    });
    // a small breath of pollen as it opens
    for (let i = 0; i < 4; i++) {
      const m = this.scene.add
        .image(img.x, img.y - 14, "dust")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xfff0d6)
        .setAlpha(0.7)
        .setScale(0.8)
        .setDepth(DEPTH.fx);
      this.scene.tweens.add({
        targets: m,
        y: m.y - Phaser.Math.Between(18, 40),
        x: m.x + Phaser.Math.Between(-14, 14),
        alpha: 0,
        duration: 1600 + i * 200,
        ease: "Sine.easeOut",
        onComplete: () => m.destroy(),
      });
    }
  }

  addDust(count: number, area: Phaser.Geom.Rectangle, tint = 0xeaf2ff, alpha = 0.35) {
    for (let i = 0; i < count; i++) {
      const img = this.scene.add
        .image(Phaser.Math.Between(area.x, area.x + area.width), Phaser.Math.Between(area.y, area.y + area.height), "dust")
        .setTint(tint)
        .setAlpha(alpha * Phaser.Math.FloatBetween(0.4, 1))
        .setScale(Phaser.Math.FloatBetween(0.6, 1.6))
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH.world);
      this.dust.push({
        img,
        vx: Phaser.Math.FloatBetween(-4, 6),
        vy: Phaser.Math.FloatBetween(-3, 2),
        area,
      });
    }
  }

  /** Hidden little spirits — pairs of eyes that watch and vanish. */
  addSpirits(points: { x: number; y: number }[]) {
    for (const p of points) {
      const s = this.scene.add
        .image(p.x, p.y, "spirit")
        .setAlpha(0)
        .setScale(0.8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(DEPTH.back + 1);
      this.scene.tweens.add({
        targets: s,
        alpha: { from: 0, to: 0.5 },
        duration: 2600,
        delay: Math.random() * 5000,
        yoyo: true,
        repeat: -1,
        repeatDelay: 3000 + Math.random() * 4000,
        ease: "Sine.easeInOut",
      });
      this.sways.push({ img: s, ph: Math.random() * 6, amp: 0.03 });
    }
  }

  startBirds(intervalMs = 9000) {
    const spawn = () => {
      const w = this.scene.scale.width;
      const y = Phaser.Math.Between(50, Math.max(70, this.scene.scale.height * 0.28));
      const b = this.scene.add
        .image(-50, y, "bird")
        .setAlpha(0.55)
        .setScale(Phaser.Math.FloatBetween(0.5, 0.85))
        .setDepth(DEPTH.back);
      this.scene.tweens.add({ targets: b, scaleY: b.scaleY * 0.55, duration: 290, yoyo: true, repeat: -1 });
      this.scene.tweens.add({
        targets: b,
        x: w + 60,
        y: y + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(12000, 17000),
        onComplete: () => b.destroy(),
      });
    };
    this.birdTimer = this.scene.time.addEvent({ delay: intervalMs, loop: true, callback: spawn });
  }

  stopBirds() {
    this.birdTimer?.remove();
    this.birdTimer = null;
  }

  update(dtSec: number) {
    this.t += dtSec;
    const t = this.t;
    for (const s of this.stars) {
      if (!s.img.active) continue;
      s.img.setAlpha(s.base * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph)));
    }
    for (const d of this.dust) {
      if (!d.img.active) continue;
      d.img.x += d.vx * dtSec;
      d.img.y += d.vy * dtSec;
      if (d.img.x < d.area.x) d.img.x = d.area.x + d.area.width;
      if (d.img.x > d.area.x + d.area.width) d.img.x = d.area.x;
      if (d.img.y < d.area.y) d.img.y = d.area.y + d.area.height;
      if (d.img.y > d.area.y + d.area.height) d.img.y = d.area.y;
    }
    for (const sw of this.sways) {
      if (!sw.img.active) continue;
      sw.img.setRotation(Math.sin(t * 0.85 + sw.ph) * sw.amp);
    }
  }
}
