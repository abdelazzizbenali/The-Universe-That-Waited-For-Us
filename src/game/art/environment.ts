/* Environment kit — reusable world-building painters.
   Every scene should read as a place: sky, distant layers, midground,
   ground, props, atmosphere, foreground. Kept lightweight for mobile. */
import Phaser from "phaser";
import { DEPTH } from "../config";
import type { WorldPalette } from "./ArtBible";

/** Set once at boot from the player's reduced-motion preference. */
let reduced = false;
export function setEnvironmentReduced(v: boolean) {
  reduced = v;
}
const amount = (n: number) => (reduced ? Math.max(2, Math.round(n * 0.4)) : n);

export interface LayerSet {
  far: Phaser.GameObjects.Image[];
  mid: Phaser.GameObjects.Image[];
  near: Phaser.GameObjects.Image[];
}

/**
 * Distant silhouette ridges with parallax scroll factors.
 * Gives the camera something to travel past.
 */
export function addRidges(scene: Phaser.Scene, worldW: number, horizonY: number): LayerSet {
  const set: LayerSet = { far: [], mid: [], near: [] };
  const bands = [
    { key: "far" as const, y: horizonY - 8, h: 120, tint: 0x16244a, alpha: 0.55, scroll: 0.2, color: 0x16244a },
    { key: "mid" as const, y: horizonY + 14, h: 90, tint: 0x111c3c, alpha: 0.75, scroll: 0.45, color: 0x111c3c },
    { key: "near" as const, y: horizonY + 40, h: 60, tint: 0x0c1430, alpha: 0.9, scroll: 0.7, color: 0x0c1430 },
  ];

  for (const b of bands) {
    const g = scene.add.graphics();
    g.fillStyle(b.color, 1);
    // a soft undulating ridge built from overlapping arcs
    g.beginPath();
    g.moveTo(0, b.h);
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const x = (worldW / steps) * i;
      const bump = Math.sin(i * 1.4 + (b.key === "mid" ? 1.7 : 0)) * (b.h * 0.42);
      g.lineTo(x, b.h - bump - b.h * 0.3);
    }
    g.lineTo(worldW, b.h);
    g.closePath();
    g.fillPath();
    const tex = `ridge-${b.key}-${scene.time.now}-${Math.random()}`;
    g.generateTexture(tex, worldW, b.h);
    g.destroy();

    const img = scene.add
      .image(worldW / 2, b.y, tex)
      .setOrigin(0.5, 1)
      .setTint(b.tint)
      .setAlpha(b.alpha)
      .setDepth(b.key === "far" ? DEPTH.farHills : DEPTH.midHills)
      .setScrollFactor(b.scroll);
    set[b.key].push(img);
  }
  return set;
}

/** Ground band with a subtle top highlight so the floor reads as a surface. */
export function addGround(
  scene: Phaser.Scene,
  worldW: number,
  y: number,
  h: number,
  color: number,
  edge = 0x38
): Phaser.GameObjects.Image {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(0, 0, worldW, h);
  // faint horizontal variation — not flat fill
  for (let i = 0; i < 26; i++) {
    g.fillStyle((color + edge * i) as number, 0.05);
    g.fillRect(0, (h / 26) * i + Math.random() * 6, worldW, Phaser.Math.Between(2, 7));
  }
  const tex = `ground-${Math.random()}`;
  g.generateTexture(tex, worldW, h);
  g.destroy();
  return scene.add.image(worldW / 2, y + h / 2, tex).setDepth(DEPTH.ground);
}

/** Scatters grass tufts, rocks and bushes across a band. */
export function addTerrain(
  scene: Phaser.Scene,
  worldW: number,
  bandY: number,
  bandH: number,
  density = 1
): Phaser.GameObjects.Image[] {
  const out: Phaser.GameObjects.Image[] = [];
  const count = Math.round((worldW / 90) * density);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * worldW;
    const y = bandY + Math.random() * bandH;
    const roll = Math.random();
    const key = roll < 0.6 ? "grass" : roll < 0.85 ? "rock" : "bush";
    const img = scene.add
      .image(x, y, key)
      .setAlpha(key === "grass" ? 0.5 : 0.8)
      .setScale(Phaser.Math.FloatBetween(0.6, 1.5))
      .setDepth(DEPTH.groundDecor);
    if (roll >= 0.85) img.setDepth(DEPTH.props);
    out.push(img);
  }
  return out;
}

/** A soft pool of light on the floor — the main warmth tool. */
export function addLightPool(
  scene: Phaser.Scene,
  x: number,
  y: number,
  rx: number,
  ry: number,
  tint = 0xf4e3c0,
  alpha = 0.18
): Phaser.GameObjects.Image {
  return scene.add
    .image(x, y, "halo")
    .setBlendMode(Phaser.BlendModes.ADD)
    .setTint(tint)
    .setAlpha(alpha)
    .setScale(rx / 64, ry / 64)
    .setDepth(DEPTH.light);
}

/** Drifting horizontal mist bands for depth between midground and play. */
export function addFog(
  scene: Phaser.Scene,
  worldW: number,
  top: number,
  bottom: number,
  count = 3,
  tint = 0x9fb8e8
): Phaser.GameObjects.Image[] {
  const out: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < amount(count); i++) {
    const y = Phaser.Math.Linear(top, bottom, i / Math.max(1, count - 1));
    const img = scene.add
      .image(worldW / 2, y, "fog")
      .setTint(tint)
      .setAlpha(0.1)
      .setScale(worldW / 200, Phaser.Math.FloatBetween(0.8, 1.6))
      .setDepth(DEPTH.fog)
      .setScrollFactor(0.6);
    if (!reduced) {
      scene.tweens.add({
        targets: img,
        x: img.x + Phaser.Math.Between(-60, 60),
        alpha: 0.16,
        duration: Phaser.Math.Between(7000, 12000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    out.push(img);
  }
  return out;
}

/** Dark foreground silhouettes that the camera slides behind. */
export function addForeground(
  scene: Phaser.Scene,
  worldW: number,
  groundY: number,
  tint = 0x05080f
): Phaser.GameObjects.Image[] {
  const out: Phaser.GameObjects.Image[] = [];
  const count = Math.max(3, Math.round(worldW / 620));
  for (let i = 0; i < count; i++) {
    const x = (worldW / count) * (i + 0.5) + Phaser.Math.Between(-120, 120);
    const img = scene.add
      .image(x, groundY + Phaser.Math.Between(30, 90), "bush")
      .setTint(tint)
      .setAlpha(0.85)
      .setScale(Phaser.Math.FloatBetween(2.4, 4.6))
      .setDepth(DEPTH.foreground)
      .setScrollFactor(1.12);
    out.push(img);
  }
  return out;
}

/** Atmospheric vignette that never covers UI (world space only). */
export function addVignette(
  scene: Phaser.Scene,
  tint = 0x0a1024,
  alpha = 0.35
): Phaser.GameObjects.Image {
  const w = scene.scale.width;
  const h = scene.scale.height;
  return scene.add
    .image(w / 2, h / 2, "vignette")
    .setScrollFactor(0)
    .setDisplaySize(w * 1.5, h * 1.5)
    .setTint(tint)
    .setAlpha(alpha)
    .setDepth(DEPTH.vignette);
}

/**
 * Builds a complete layered environment from an Art Bible palette in one
 * call: sky gradient → parallax ridges → ground → terrain → fog →
 * foreground silhouettes → vignette → ambient motes.
 *
 * Scenes keep their own props and characters; this supplies the world
 * around them so nothing sits on a flat fill.
 */
export function dressScene(
  scene: Phaser.Scene,
  palette: WorldPalette,
  opts: {
    worldW: number;
    worldH: number;
    /** Y of the horizon line, in world units. */
    horizonY: number;
    /** Top of the walkable ground band. */
    groundY: number;
    ridges?: boolean;
    terrain?: number;
    fog?: number;
    foreground?: boolean;
    vignette?: number;
    motes?: number;
    /** Interiors skip ridges/terrain but still want depth and light. */
    interior?: boolean;
  }
): void {
  const {
    worldW,
    worldH,
    horizonY,
    groundY,
    ridges = true,
    terrain = 0.8,
    fog = 2,
    foreground = true,
    vignette = 0.26,
    motes = 14,
    interior = false,
  } = opts;

  // sky gradient
  const sky = scene.add.graphics().setDepth(DEPTH.skyFar - 1);
  sky.fillGradientStyle(
    palette.skyTop,
    palette.skyTop,
    palette.skyBottom,
    palette.skyBottom,
    1
  );
  sky.fillRect(0, 0, worldW, worldH);

  if (ridges && !interior) addRidges(scene, worldW, horizonY);

  // ground band with surface variation
  addGround(scene, worldW, groundY, worldH - groundY, palette.ground);

  if (!interior && terrain > 0) {
    addTerrain(scene, worldW, groundY + (worldH - groundY) * 0.15, (worldH - groundY) * 0.4, terrain);
  }

  if (fog > 0) addFog(scene, worldW, horizonY, groundY, fog, palette.fog);
  if (foreground && !interior) addForeground(scene, worldW, worldH * 0.96);
  if (vignette > 0) addVignette(scene, palette.skyTop, vignette);
  if (motes > 0) {
    addMotes(
      scene,
      new Phaser.Geom.Rectangle(0, horizonY, worldW, groundY - horizonY + 80),
      motes,
      palette.motes,
      0.28
    );
  }
}

/** A suspended dust/particle field confined to a band. */
export function addMotes(
  scene: Phaser.Scene,
  area: Phaser.Geom.Rectangle,
  count: number,
  tint: number,
  alpha = 0.35
): Phaser.GameObjects.Image[] {
  const out: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < amount(count); i++) {
    const img = scene.add
      .image(Phaser.Math.Between(area.x, area.x + area.width), Phaser.Math.Between(area.y, area.y + area.height), "dust")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(tint)
      .setAlpha(alpha * Phaser.Math.FloatBetween(0.4, 1))
      .setScale(Phaser.Math.FloatBetween(0.5, 1.4))
      .setDepth(DEPTH.fx);
    if (!reduced) {
      scene.tweens.add({
        targets: img,
        y: img.y - Phaser.Math.Between(20, 60),
        x: img.x + Phaser.Math.Between(-18, 18),
        alpha: 0,
        duration: Phaser.Math.Between(5000, 11000),
        repeat: -1,
        delay: Math.random() * 4000,
        ease: "Sine.easeInOut",
      });
    }
    out.push(img);
  }
  return out;
}
