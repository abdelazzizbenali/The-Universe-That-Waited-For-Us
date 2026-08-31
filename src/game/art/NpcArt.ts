import Phaser from "phaser";
import { DEPTH } from "../config";

export type NpcArtKey =
  | "boy-1"
  | "boy-2"
  | "boy-3"
  | "boy-4"
  | "girl-1"
  | "girl-2"
  | "girl-3"
  | "girl-4"
  | "teacher-1"
  | "teacher-2"
  | "teacher-3";

export interface AddTrimmedArtOptions {
  height?: number;
  width?: number;
  alpha?: number;
  depth?: number;
  originY?: number;
  flipX?: boolean;
  tint?: number;
}

export function addTrimmedArt(
  scene: Phaser.Scene,
  sourceKey: string,
  x: number,
  y: number,
  opts: AddTrimmedArtOptions = {}
): Phaser.GameObjects.Image | null {
  const key = sourceKey.startsWith("trim-") ? sourceKey : `trim-${sourceKey}`;
  if (!scene.textures.exists(key)) return null;
  const src = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const img = scene.add.image(x, y, key).setOrigin(0.5, opts.originY ?? 1);
  if (opts.width !== undefined) {
    const ratio = src.height > 0 ? src.height / src.width : 0.5;
    img.setDisplaySize(opts.width, opts.width * ratio);
  } else {
    const height = opts.height ?? 76;
    const ratio = src.height > 0 ? src.width / src.height : 0.42;
    img.setDisplaySize(height * ratio, height);
  }
  img.setAlpha(opts.alpha ?? 1);
  img.setDepth(opts.depth ?? DEPTH.soul + y / 1000);
  if (opts.flipX) img.setFlipX(true);
  if (opts.tint !== undefined) img.setTint(opts.tint);
  return img;
}

export function addStudentNpc(
  scene: Phaser.Scene,
  key: NpcArtKey,
  x: number,
  y: number,
  height = 74,
  alpha = 0.9,
  flipX = false
) {
  return addTrimmedArt(scene, key, x, y, { height, alpha, flipX, depth: DEPTH.soul + y / 1000 });
}

export function addBusBench(scene: Phaser.Scene, x: number, y: number, width = 180, alpha = 0.98) {
  return addTrimmedArt(scene, "bench", x, y, {
    width,
    alpha,
    depth: DEPTH.props + y / 1000,
  });
}

const NPC_ROTATION: NpcArtKey[] = ["boy-1", "girl-1", "boy-2", "girl-2", "boy-3", "girl-3", "boy-4", "girl-4"];

export function addNpcLine(
  scene: Phaser.Scene,
  points: { x: number; y: number; height?: number; alpha?: number; flipX?: boolean }[],
  offset = 0
) {
  return points.map((p, i) => addStudentNpc(scene, NPC_ROTATION[(i + offset) % NPC_ROTATION.length], p.x, p.y, p.height ?? 70, p.alpha ?? 0.82, p.flipX ?? i % 2 === 0));
}
