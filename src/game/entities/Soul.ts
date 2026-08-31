/* Soul — a character rendered from painted sprite art. The public API is
 * preserved from the procedural-Soul version so every existing scene keeps
 * working without edits. Internally a SpriteChar (painted PNG, cropped of
 * padding, grounded by a soft shadow) is used; the old glow/aura system
 * becomes a simple light halo so warmth and intensity still register. */
import Phaser from "phaser";
import { DEPTH, type SoulKind } from "../config";
import type { ColorDirector } from "../systems/color/ColorDirector";
import { SpriteChar } from "./SpriteChar";

const ADD = Phaser.BlendModes.ADD;

export type SoulPose = "stand" | "sit" | "rest";

/** Which sprite sheet frame each soul uses. The art assets ship four
 *  variants of each boy/girl/teacher; we pick one for the player and
 *  companion and use others for NPCs (see NPC helpers further down). */
const PLAYER_SHEET = "girl-1";   // her — hazel-eyed
const COMPANION_SHEET = "boy-1"; // him — blue-eyed

// cache of random NPC sprites picked from the available variants
const NPC_BOY = ["boy-2", "boy-3", "boy-4"];
const NPC_GIRL = ["girl-2", "girl-3", "girl-4"];
const NPC_TEACHER = ["teacher-1", "teacher-2", "teacher-3"];
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function randomBoySheet() { return pick(NPC_BOY); }
export function randomGirlSheet() { return pick(NPC_GIRL); }
export function randomTeacherSheet() { return pick(NPC_TEACHER); }
export function playerSheet(_kind: SoulKind = "hazel") { return PLAYER_SHEET; }
export function companionSheet(_kind: SoulKind = "blue") { return COMPANION_SHEET; }

/** Scaling factor against the raw cropped sprite. The cropped character
 *  sprites are around ~250px tall; we size them to ~55 world units for a
 *  comfortable 2.2× zoom framing against a 1408-wide backdrop. */
const SOUL_SCALE = 0.22;

export class Soul {
  readonly kind: SoulKind;
  container: Phaser.GameObjects.Container;
  motionScale = 1;
  intensity = 1;

  private scene: Phaser.Scene;
  private base: Phaser.Math.Vector2;
  private char: SpriteChar;
  private halo: Phaser.GameObjects.Image;
  private rimLight: Phaser.GameObjects.Image | null = null;

  /* state */
  private intensityTarget = 1;
  private warmth = 0;
  private warmthTarget = 0;
  private facing: 1 | -1 = 1;
  private speed = 0;
  private prev = new Phaser.Math.Vector2();
  private pose: SoulPose = "stand";
  private reachAmt = 0;
  private reachTargetAmt = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    kind: SoulKind,
    opts: { scale?: number; bob?: number; sheet?: string } = {}
  ) {
    this.scene = scene;
    this.kind = kind;
    this.base = new Phaser.Math.Vector2(x, y);
    this.prev.set(x, y);

    const sheet = opts.sheet ?? (kind === "hazel" ? PLAYER_SHEET : COMPANION_SHEET);
    this.char = new SpriteChar(scene, x, y, sheet, { scale: (opts.scale ?? 1) * SOUL_SCALE });
    this.container = this.char.container;

    // aura halo
    const tint = kind === "hazel" ? 0xe0b36a : 0x7fc4ff;
    this.halo = scene.add
      .image(x, y, "halo")
      .setBlendMode(ADD)
      .setTint(tint)
      .setAlpha(0.18)
      .setScale(1.2, 0.6)
      .setDepth(DEPTH.aura);

    this.base.set(x, y);
    this.char.pos.set(x, y);
  }

  setPosition(x: number, y: number) {
    this.base.set(x, y);
    this.char.pos.set(x, y);
    this.halo.setPosition(x, y + 6);
  }
  get x() { return this.base.x; }
  get y() { return this.base.y; }
  lookAt(x: number, _y: number) {
    this.facing = x >= this.base.x ? 1 : -1;
    this.char.setFacing(this.facing === 1 ? "right" : "left");
  }
  setIntensity(v: number) { this.intensityTarget = v; }
  setWarmth(v: number) { this.warmthTarget = v; }
  distanceTo(other: Soul) {
    return Phaser.Math.Distance.Between(this.base.x, this.base.y, other.base.x, other.base.y);
  }
  setPose(pose: SoulPose) {
    this.pose = pose;
    if (pose === "stand") this.char.stand();
    else this.char.sit();
  }
  reachToward(x: number, _y: number, amount: number) {
    this.reachTargetAmt = Phaser.Math.Clamp(amount, 0, 1);
    this.facing = x >= this.base.x ? 1 : -1;
    this.char.setFacing(this.facing === 1 ? "right" : "left");
  }
  get handPosition() {
    return { x: this.base.x + this.facing * 14, y: this.base.y - 24 };
  }

  update(dtSec: number, tSec: number, colors: ColorDirector) {
    const lerp = Math.min(1, dtSec * 2.4);
    this.intensity += (this.intensityTarget - this.intensity) * lerp;
    this.warmth += (this.warmthTarget - this.warmth) * lerp;
    this.reachAmt += (this.reachTargetAmt - this.reachAmt) * Math.min(1, dtSec * 4);

    const moved = Phaser.Math.Distance.Between(this.prev.x, this.prev.y, this.base.x, this.base.y);
    const inst = dtSec > 0 ? moved / dtSec : 0;
    this.speed += (inst - this.speed) * Math.min(1, dtSec * 8);
    this.prev.set(this.base.x, this.base.y);
    const walking = this.speed > 14 && this.pose === "stand";
    this.char.setWalking(walking);
    this.char.update(dtSec);

    // aura
    this.halo.setAlpha(0.1 + 0.18 * this.intensity);
    this.halo.setScale(
      1.2 * (1 + 0.05 * Math.sin(tSec * 1.35)),
      0.6 * (1 + 0.05 * Math.sin(tSec * 1.35))
    );
    const warmR = 255;
    const warmG = Math.round(255 - 30 * this.warmth);
    const warmB = Math.round(255 - 70 * this.warmth);
    this.halo.setTint(Phaser.Display.Color.GetColor(warmR, warmG, warmB));

    // our-color rim on contact
    const seam = colors.params.seam;
    if (seam > 0.02) {
      if (!this.rimLight) {
        this.rimLight = this.scene.add
          .image(this.base.x, this.base.y - 2, "aura-our")
          .setBlendMode(ADD)
          .setScale(0.4)
          .setAlpha(0)
          .setDepth(DEPTH.aura + 1);
        this.container.add(this.rimLight);
      }
      this.rimLight.setPosition(0, -2);
      this.rimLight.setAlpha(seam * 0.22 * this.intensity);
    } else if (this.rimLight) {
      this.rimLight.setAlpha(0);
    }
  }

  destroy() {
    this.char.destroy();
    this.halo.destroy();
    this.rimLight?.destroy();
  }
}
