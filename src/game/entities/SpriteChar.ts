/* SpriteChar — a character rendered from a single painted sprite sheet
 * frame (all the supplied character PNGs are single poses facing screen-
 * right). Mirrors horizontally for left-facing movement and applies a tiny
 * bob for grounded walking. A drop shadow keeps the figure planted on the
 * floor.
 *
 * All the provided sprites are framed with a lot of transparent padding
 * (1408x768 canvas with the character occupying a small central area). We
 * crop the character out of its transparent halo on boot so that scaling
 * and centering actually make sense.
 */
import Phaser from "phaser";
import { DEPTH } from "../config";

export type Dir = "left" | "right";

export interface SpriteCharOptions {
  scale?: number;
  /** Where the character's feet are relative to the image (0..1 of the
   *  visible cropped bounds). Measured by eye against the art: feet sit
   *  near the bottom edge of the cropped region. */
  originY?: number;
  /** Depth sort layer — default DEPTH.soul. */
  depth?: number;
  /** Tint applied at creation (for mood / lighting). */
  tint?: number;
}

/** Crops a single character/prop texture on first use so we don't carry
 *  around a 1408x768 mostly-empty canvas at runtime. */
const cropCache = new Map<string, { key: string; baseHeight: number; baseWidth: number }>();

function ensureCrop(scene: Phaser.Scene, srcKey: string): { key: string; baseHeight: number; baseWidth: number } {
  if (cropCache.has(srcKey)) return cropCache.get(srcKey)!;
  const tex = scene.textures.get(srcKey);
  const img = tex.getSourceImage() as HTMLImageElement;
  const tw = tex.get().width as number;
  const th = tex.get().height as number;

  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  let data: ImageData | null = null;
  try {
    data = ctx.getImageData(0, 0, tw, th);
  } catch {
    const fallback = { key: srcKey, baseHeight: th * 0.5, baseWidth: tw * 0.3 };
    cropCache.set(srcKey, fallback);
    return fallback;
  }
  const px = data.data;
  let minX = tw, minY = th, maxX = 0, maxY = 0;
  for (let y = 0; y < th; y += 2) {
    for (let x = 0; x < tw; x += 2) {
      const a = px[(y * tw + x) * 4 + 3];
      if (a > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) {
    const fallback = { key: srcKey, baseHeight: th * 0.5, baseWidth: tw * 0.3 };
    cropCache.set(srcKey, fallback);
    return fallback;
  }
  // Pad a few pixels to avoid edge cut-off.
  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(tw - 1, maxX + pad);
  maxY = Math.min(th - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const octx = out.getContext("2d")!;
  octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  const croppedKey = `crop:${srcKey}`;
  scene.textures.addCanvas(croppedKey, out);
  // After the crop the feet / ground-contact of the sprite sit at the
  // bottom edge of the image (we padded only 6 px below maxY and the
  // art has negligible shadow/ground gap), so setting origin=(0.5,1)
  // and sprite.y=0 places the figure's feet exactly at container y=0.
  const info = { key: croppedKey, baseHeight: ch, baseWidth: cw };
  cropCache.set(srcKey, info);
  return info;
}

export class SpriteChar {
  readonly container: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Ellipse;
  private sprite: Phaser.GameObjects.Image;
  private baseScale: number;
  private baseHeight: number;
  private baseWidth: number;
  pos: Phaser.Math.Vector2;
  private bobT = Math.random() * Math.PI * 2;
  private walking = false;
  /** How many SOURCE pixels to lift the sprite upward from the ground
   *  line (0 = feet planted on ground; positive = figure sits/stands
   *  higher — e.g. on a chair seat). */
  private liftPx = 0;
  private scaleMul = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, srcKey: string, opts: SpriteCharOptions = {}) {
    const info = ensureCrop(scene, srcKey);
    this.baseScale = opts.scale ?? 1;
    this.baseHeight = info.baseHeight;
    this.baseWidth = info.baseWidth;

    this.shadow = scene.add.ellipse(0, 2, this.baseWidth * 0.45, this.baseHeight * 0.09, 0x000000, 0.35);
    this.shadow.setDepth(DEPTH.groundShadow);

    // Origin (0.5, 1) → bottom-center of image is the anchor point.
    // sprite.y=0 places that anchor at container y=0 (the ground), so
    // feet are exactly on the floor.
    this.sprite = scene.add.image(0, 0, info.key);
    this.sprite.setOrigin(0.5, 1);
    if (opts.tint !== undefined) this.sprite.setTint(opts.tint);

    this.container = scene.add.container(x, y, [this.shadow, this.sprite]);
    this.container.setDepth(opts.depth ?? DEPTH.soul);
    this.pos = new Phaser.Math.Vector2(x, y);
    this.setScale(this.baseScale);
  }

  setScale(s: number) {
    this.scaleMul = s;
    this.sprite.setScale(s, s);
    this.shadow.setScale(s, s);
  }

  setFacing(dir: Dir) {
    this.sprite.setFlipX(dir === "left");
  }

  setTint(tint: number) {
    this.sprite.setTint(tint);
  }
  clearTint() {
    this.sprite.clearTint();
  }

  /** Sit on a chair — lift the figure so the hips land at seat height
   *  (in SOURCE pixels, measured from the ground up). For our low
   *  library chairs seatFromGround ≈ 70 src-px; passing that value
   *  raises the figure exactly onto the chair. */
  sit(seatFromGround: number = 70) {
    this.liftPx = seatFromGround;
  }
  stand() {
    this.liftPx = 0;
  }

  setWalking(v: boolean) {
    this.walking = v;
    if (!v) this.bobT = 0;
  }

  /** World-Y sort: objects with higher y (closer to viewer) draw on top.
   *  Kept at the soul layer so props can sit a hair behind and auras/effects
   *  above. */
  depthSort() {
    // world y can be up to ~1600, so shift down.
    this.container.setDepth(DEPTH.soul + Math.max(0, this.pos.y) * 0.005);
  }

  update(dtSec: number) {
    if (this.walking) {
      this.bobT += dtSec * 9;
      const bob = Math.abs(Math.sin(this.bobT)) * 2.2;
      // bob goes up (negative y = up in Phaser)
      this.sprite.y = -(this.liftPx + bob);
    } else {
      this.bobT += dtSec * 1.6;
      const bob = Math.sin(this.bobT) * 0.6;
      this.sprite.y = -(this.liftPx + bob);
    }
    this.shadow.setPosition(0, 2);
    this.container.setPosition(this.pos.x, this.pos.y);
    this.depthSort();
  }

  get width() { return this.baseWidth * this.scaleMul; }
  get height() { return this.baseHeight * this.scaleMul; }

  destroy() {
    this.container.destroy();
  }
}

/** Simple furniture sprite (table/chair/bench) — placed in world, sorted
 *  by y for correct overlap with characters. Origin is set so (x,y) is the
 *  ground-contact point at the center of the object. */
export class SpriteProp {
  readonly container: Phaser.GameObjects.Container;
  private sprite: Phaser.GameObjects.Image;
  private shadow: Phaser.GameObjects.Ellipse;
  pos: Phaser.Math.Vector2;
  baseHeight: number;
  baseWidth: number;
  /** Height from ground to the top surface (tabletop / chair seat) in
   *  source pixels. Used to place things on top, and to sit characters at
   *  the correct height. */
  surfaceFromGround: number;
  private scaleMul = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, srcKey: string, opts: { scale?: number; depth?: number; surfaceFromGround?: number } = {}) {
    const info = ensureCrop(scene, srcKey);
    this.baseHeight = info.baseHeight;
    this.baseWidth = info.baseWidth;
    this.scaleMul = opts.scale ?? 1;
    // Default: assume the top opaque row is the prop's top surface. This is
    // correct for tables and chairs where the visible top sits near the
    // bottom of the crop (because feetOffsetY = ch-2 places the ground at
    // the bottom). The caller can override for odd props.
    this.surfaceFromGround = opts.surfaceFromGround ?? info.baseHeight - 8;
    this.shadow = scene.add.ellipse(0, 2, info.baseWidth * 0.45, info.baseHeight * 0.08, 0x000000, 0.3);
    this.shadow.setDepth(DEPTH.groundShadow);
    this.sprite = scene.add.image(0, 0, info.key).setOrigin(0.5, 1);
    this.sprite.setScale(this.scaleMul);
    this.shadow.setScale(this.scaleMul);
    this.container = scene.add.container(x, y, [this.shadow, this.sprite]);
    this.container.setDepth(opts.depth ?? DEPTH.props);
    this.pos = new Phaser.Math.Vector2(x, y);
  }

  setScale(s: number) {
    this.scaleMul = s;
    this.sprite.setScale(s);
    this.shadow.setScale(s);
  }

  setTint(t: number) { this.sprite.setTint(t); }

  /** World-space y of the top surface (scaled). */
  get surfaceY() { return this.pos.y - this.surfaceFromGround * this.scaleMul; }
  /** World-space width of the prop. */
  get displayWidth() { return this.baseWidth * this.scaleMul; }

  depthSort() {
    this.container.setDepth(DEPTH.props + Math.max(0, this.pos.y) * 0.005 - 0.5);
  }

  destroy() { this.container.destroy(); }
}
