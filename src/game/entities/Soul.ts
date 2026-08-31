/* Soul — a stylized 2D humanoid soul character.

   Head, hair, torso, two arms with hands, two legs with feet, and two
   readable eyes. The glow is an EFFECT layered behind and around the body;
   it never replaces the silhouette.

   Animation is skeletal: limb images rotated about their joints, driven by
   measured movement speed, so walking, idling, reaching, sitting and
   looking all work without any scene needing to know about it.

   The public API is unchanged from the original glow-blob implementation
   so every existing scene keeps working. */
import Phaser from "phaser";
import { DEPTH, type SoulKind } from "../config";
import type { ColorDirector } from "../systems/color/ColorDirector";

const ADD = Phaser.BlendModes.ADD;

export type SoulPose = "stand" | "sit" | "rest";

/** Body metrics at scale 1, in local pixels. Body centre is the origin. */
const M = {
  headY: -27,
  headR: 11,
  neckY: -17,
  torsoY: -14,
  torsoH: 24,
  torsoW: 17,
  shoulderY: -13,
  shoulderX: 7.5,
  armSeg: 11,
  hipY: 8,
  hipX: 4.4,
  legSeg: 12,
  footY: 33,
  eyeY: -28,
  eyeX: 3.9,
};

export class Soul {
  readonly kind: SoulKind;
  container: Phaser.GameObjects.Container;
  motionScale = 1;
  intensity = 1;

  private scene: Phaser.Scene;
  private base: Phaser.Math.Vector2;
  private s: number;
  private bobAmp: number;
  private phase: number;

  /* body */
  private head!: Phaser.GameObjects.Image;
  private hair!: Phaser.GameObjects.Image;
  private torso!: Phaser.GameObjects.Image;
  private eyeL!: Phaser.GameObjects.Image;
  private eyeR!: Phaser.GameObjects.Image;
  private armBack!: Phaser.GameObjects.Container;
  private armFront!: Phaser.GameObjects.Container;
  private legBack!: Phaser.GameObjects.Container;
  private legFront!: Phaser.GameObjects.Container;
  private foreBack!: Phaser.GameObjects.Image;
  private foreFront!: Phaser.GameObjects.Image;
  private shinBack!: Phaser.GameObjects.Image;
  private shinFront!: Phaser.GameObjects.Image;
  private handFront!: Phaser.GameObjects.Image;

  /* effects */
  private aura!: Phaser.GameObjects.Image;
  private shadow!: Phaser.GameObjects.Image;
  private spill!: Phaser.GameObjects.Image;
  private rim: Phaser.GameObjects.Image | null = null;
  private motes: Phaser.GameObjects.Image[] = [];

  /* state */
  private intensityTarget = 1;
  private warmth = 0;
  private warmthTarget = 0;
  private gazeX = 0;
  private gazeY = 0;
  private walkPhase = 0;
  private speed = 0;
  private prev = new Phaser.Math.Vector2();
  private pose: SoulPose = "stand";
  private reachAmt = 0;
  private reachTargetAmt = 0;
  private reachDir = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    kind: SoulKind,
    opts: { scale?: number; bob?: number } = {}
  ) {
    this.scene = scene;
    this.kind = kind;
    this.s = opts.scale ?? 1;
    this.bobAmp = (opts.bob ?? 3) * 0.5;
    this.phase = Math.random() * Math.PI * 2;
    this.base = new Phaser.Math.Vector2(x, y);
    this.prev.set(x, y);
    this.gazeX = x;
    this.gazeY = y;

    const id = kind;
    const s = this.s;
    const mk = (key: string, ox: number, oy: number, originY = 0.5) =>
      scene.add.image(ox, oy, key).setOrigin(0.5, originY);

    /* ---- effects behind the body ---- */
    this.shadow = scene.add
      .image(0, M.footY * s + 2, "shadow")
      .setAlpha(0.45)
      .setScale(0.5 * s, 0.42 * s);
    this.spill = scene.add
      .image(0, M.footY * s, "halo")
      .setBlendMode(ADD)
      .setTint(kind === "hazel" ? 0xe0b36a : 0x7fc4ff)
      .setAlpha(0.2)
      .setScale(1.1 * s, 0.5 * s);
    // the aura surrounds the body — soft, and deliberately not opaque
    this.aura = scene.add
      .image(0, -2 * s, "aura-" + (kind === "hazel" ? "hazel" : "blue"))
      .setBlendMode(ADD)
      .setAlpha(0.34)
      .setScale(0.44 * s);

    /* ---- limbs (built as joint containers so they rotate properly) ---- */
    const limbKey = `b-limb-${id}`;
    const handKey = `b-hand-${id}`;

    const makeArm = (dir: number) => {
      const upper = mk(limbKey, 0, 0, 0);
      upper.setDisplaySize(6.4 * s, M.armSeg * s);
      const fore = mk(limbKey, 0, M.armSeg * s, 0);
      fore.setDisplaySize(5.6 * s, M.armSeg * s);
      const hand = mk(handKey, 0, M.armSeg * 2 * s);
      hand.setDisplaySize(6.6 * s, 7 * s);
      const c = scene.add.container(M.shoulderX * dir * s, M.shoulderY * s, [upper, fore, hand]);
      return { c, fore, hand };
    };
    const makeLeg = (dir: number) => {
      const thigh = mk(limbKey, 0, 0, 0);
      thigh.setDisplaySize(7 * s, M.legSeg * s);
      const shin = mk(limbKey, 0, M.legSeg * s, 0);
      shin.setDisplaySize(6 * s, M.legSeg * s);
      const foot = mk(handKey, 0, M.legSeg * 2 * s);
      foot.setDisplaySize(7 * s, 5 * s);
      const c = scene.add.container(M.hipX * dir * s, M.hipY * s, [thigh, shin, foot]);
      return { c, shin };
    };

    const aB = makeArm(-1);
    const aF = makeArm(1);
    const lB = makeLeg(-1);
    const lF = makeLeg(1);
    this.armBack = aB.c;
    this.foreBack = aB.fore;
    this.armFront = aF.c;
    this.foreFront = aF.fore;
    this.handFront = aF.hand;
    this.legBack = lB.c;
    this.shinBack = lB.shin;
    this.legFront = lF.c;
    this.shinFront = lF.shin;
    // back limbs sit deeper in shade so the silhouette reads
    this.armBack.setAlpha(0.72);
    this.legBack.setAlpha(0.72);

    /* ---- torso, head, hair, eyes ---- */
    this.torso = mk(`b-torso-${id}`, 0, M.torsoY * s, 0);
    this.torso.setDisplaySize(M.torsoW * s, M.torsoH * s);
    this.head = mk(`b-head-${id}`, 0, M.headY * s);
    this.head.setDisplaySize(M.headR * 2 * s, M.headR * 2.2 * s);
    this.hair = mk(`b-hair-${id}`, 0, M.headY * s);
    this.hair.setDisplaySize(M.headR * 2.3 * s, M.headR * 2.4 * s);
    this.eyeL = mk(`b-eye-${id}`, -M.eyeX * s, M.eyeY * s);
    this.eyeL.setDisplaySize(5.4 * s, 5.4 * s);
    this.eyeR = mk(`b-eye-${id}`, M.eyeX * s, M.eyeY * s);
    this.eyeR.setDisplaySize(5.4 * s, 5.4 * s);

    const moteTint = kind === "hazel" ? 0x7fc4ff : 0xe0b36a;
    for (let i = 0; i < 3; i++) {
      this.motes.push(
        scene.add.image(0, 0, "mote").setBlendMode(ADD).setTint(moteTint).setScale(0.55 * s).setAlpha(0)
      );
    }

    // draw order: ground fx → aura → back limbs → torso → front limbs → head
    this.container = scene.add.container(x, y, [
      this.shadow,
      this.spill,
      this.aura,
      this.armBack,
      this.legBack,
      this.torso,
      this.legFront,
      this.armFront,
      this.head,
      this.hair,
      this.eyeL,
      this.eyeR,
      ...this.motes,
    ]);
    this.container.setDepth(DEPTH.soul);
  }

  /* ---------------- public API (unchanged) ---------------- */

  setPosition(x: number, y: number) {
    this.base.set(x, y);
  }
  get x() {
    return this.base.x;
  }
  get y() {
    return this.base.y;
  }
  lookAt(x: number, y: number) {
    this.gazeX = x;
    this.gazeY = y;
  }
  setIntensity(v: number) {
    this.intensityTarget = v;
  }
  setWarmth(v: number) {
    this.warmthTarget = v;
  }
  distanceTo(other: Soul) {
    return Phaser.Math.Distance.Between(this.base.x, this.base.y, other.base.x, other.base.y);
  }

  /* ---------------- new expressive API (all optional) ---------------- */

  /** Sitting folds the legs; resting leans the head. Defaults to standing. */
  setPose(pose: SoulPose) {
    this.pose = pose;
  }

  /** Raise the near arm toward a point. amount 0..1. */
  reachToward(x: number, _y: number, amount: number) {
    this.reachTargetAmt = Phaser.Math.Clamp(amount, 0, 1);
    this.reachDir = x >= this.base.x ? 1 : -1;
  }

  /** World position of the reaching hand — for hand-holding alignment. */
  get handPosition() {
    const m = this.container.getWorldTransformMatrix();
    return { x: m.tx + this.armFront.x + this.handFront.x, y: m.ty + this.armFront.y };
  }

  /* ---------------- per-frame ---------------- */

  update(dtSec: number, tSec: number, colors: ColorDirector) {
    const s = this.s;
    const lerp = Math.min(1, dtSec * 2.4);
    this.intensity += (this.intensityTarget - this.intensity) * lerp;
    this.warmth += (this.warmthTarget - this.warmth) * lerp;
    this.reachAmt += (this.reachTargetAmt - this.reachAmt) * Math.min(1, dtSec * 4);

    // measured speed drives the walk, so scenes need no extra wiring
    const moved = Phaser.Math.Distance.Between(this.prev.x, this.prev.y, this.base.x, this.base.y);
    const inst = dtSec > 0 ? moved / dtSec : 0;
    this.speed += (inst - this.speed) * Math.min(1, dtSec * 8);
    this.prev.set(this.base.x, this.base.y);
    const walking = this.speed > 18 && this.pose === "stand";

    // gait cycle advances with distance covered, not with time
    if (walking) this.walkPhase += (this.speed / (26 * s)) * dtSec * Math.PI;
    else this.walkPhase += dtSec * 0.9; // idle breathing rhythm

    const w = this.walkPhase;
    const m = this.motionScale;
    const swing = walking ? 0.62 * m : 0.06 * m;

    /* ---- legs ---- */
    if (this.pose === "stand") {
      this.legFront.setRotation(Math.sin(w) * swing);
      this.legBack.setRotation(Math.sin(w + Math.PI) * swing);
      this.shinFront.setRotation(Math.max(0, -Math.sin(w)) * 0.5 * (walking ? 1 : 0));
      this.shinBack.setRotation(Math.max(0, -Math.sin(w + Math.PI)) * 0.5 * (walking ? 1 : 0));
      this.legFront.setVisible(true);
      this.legBack.setVisible(true);
    } else {
      // seated: thighs forward, shins down
      this.legFront.setRotation(-1.15);
      this.legBack.setRotation(-1.05);
      this.shinFront.setRotation(1.2);
      this.shinBack.setRotation(1.15);
    }

    /* ---- arms (counter-swing, or reaching) ---- */
    const reach = this.reachAmt;
    const armSwing = Math.sin(w + Math.PI) * swing * 0.8;
    const armSwingB = Math.sin(w) * swing * 0.8;
    this.armFront.setRotation(Phaser.Math.Linear(armSwing, -1.15 * this.reachDir, reach));
    this.foreFront.setRotation(Phaser.Math.Linear(0.12, -0.35, reach));
    this.armBack.setRotation(armSwingB);
    this.foreBack.setRotation(0.12);

    /* ---- body bob and lean ---- */
    const bob = walking
      ? Math.abs(Math.sin(w)) * 1.6 * s * m
      : Math.sin(tSec * 1.15 + this.phase) * this.bobAmp * s * m;
    const lean = walking ? Phaser.Math.Clamp(this.speed / 900, 0, 0.06) * m : 0;
    this.container.setPosition(this.base.x, this.base.y + bob);
    this.torso.setRotation(lean);
    this.torso.setScale(
      (M.torsoW * s) / 40,
      ((M.torsoH * s) / 56) * (1 + Math.sin(tSec * 1.4 + this.phase) * 0.02)
    );

    /* ---- head and gaze ---- */
    const dx = this.gazeX - this.base.x;
    const dy = this.gazeY - this.base.y;
    const gx = Phaser.Math.Clamp(dx / 220, -1, 1);
    const gy = Phaser.Math.Clamp(dy / 260, -0.6, 0.6);
    const headTilt = this.pose === "rest" ? 0.34 : gx * 0.14;
    const hx = gx * 1.7 * s;
    const hy = (M.headY + (this.pose === "rest" ? 1.5 : 0)) * s + bob * 0.12;
    this.head.setPosition(hx, hy).setRotation(headTilt);
    this.hair.setPosition(hx, hy).setRotation(headTilt);
    // eyes track independently — they always stay readable
    this.eyeL.setPosition(hx - M.eyeX * s + gx * 1.1 * s, M.eyeY * s + gy * 1.1 * s + bob * 0.12);
    this.eyeR.setPosition(hx + M.eyeX * s + gx * 1.1 * s, M.eyeY * s + gy * 1.1 * s + bob * 0.12);
    const blink = Math.sin(tSec * 0.7 + this.phase * 3) > 0.985 ? 0.15 : 1;
    this.eyeL.setScale((5.4 * s) / 28, ((5.4 * s) / 28) * blink);
    this.eyeR.setScale((5.4 * s) / 28, ((5.4 * s) / 28) * blink);

    /* ---- aura, warmth, grounding ---- */
    this.aura
      .setScale(0.44 * s * (1 + 0.05 * Math.sin(tSec * 1.35 + this.phase)))
      .setAlpha(0.2 + 0.22 * this.intensity);
    const wm = this.warmth;
    this.aura.setTint(
      Phaser.Display.Color.GetColor(255, Math.round(255 - 30 * wm), Math.round(255 - 70 * wm))
    );
    this.shadow.setAlpha(0.34 + 0.14 * this.intensity);
    this.spill.setAlpha(0.14 + this.intensity * 0.12);

    /* ---- OUR COLOR: a rim around the body, never a repaint ---- */
    const seam = colors.params.seam;
    if (seam > 0.02) {
      if (!this.rim) {
        this.rim = this.scene.add
          .image(0, -2 * s, "aura-our")
          .setBlendMode(ADD)
          .setScale(0.5 * s)
          .setAlpha(0);
        this.container.addAt(this.rim, 3);
      }
      this.rim.setAlpha(seam * 0.26 * this.intensity);
      this.rim.setScale(0.5 * s * (1.02 + 0.05 * Math.sin(tSec * 1.1 + this.phase)));
    } else if (this.rim) {
      this.rim.setAlpha(0);
    }

    /* ---- orbiting reflections of the other soul's colour ---- */
    const vis = colors.params.reflect * this.intensity;
    for (let i = 0; i < this.motes.length; i++) {
      const a = tSec * (0.55 + i * 0.18) + this.phase + (i * Math.PI * 2) / 3;
      this.motes[i].setPosition(Math.cos(a) * 26 * s, Math.sin(a * 1.35) * 20 * s - 6 * s);
      this.motes[i].setAlpha(vis * (0.5 + 0.5 * Math.sin(tSec * 1.6 + i * 2.1)));
    }
  }

  destroy() {
    this.container.destroy();
  }
}
