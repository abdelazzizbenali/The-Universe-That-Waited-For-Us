import Phaser from "phaser";

// Student/teacher/prop art loaded for scene dressing only. The main boy and
// main girl stay on the existing Soul implementation and must not use these
// boy-*/girl-* NPC files.
export const ART_ASSETS: Record<string, string> = {
  "boy-1": "art/assets/boy-1.png",
  "boy-2": "art/assets/boy-2.png",
  "boy-3": "art/assets/boy-3.png",
  "boy-4": "art/assets/boy-4.png",
  "girl-1": "art/assets/girl-1.png",
  "girl-2": "art/assets/girl-2.png",
  "girl-3": "art/assets/girl-3.png",
  "girl-4": "art/assets/girl-4.png",
  "teacher-1": "art/assets/teacher-1.png",
  "teacher-2": "art/assets/teacher-2.png",
  "teacher-3": "art/assets/teacher-3.png",
  "chair-front": "art/assets/chair-front.png",
  "chair-back": "art/assets/chair-back.png",
  "table-1": "art/assets/table-1.png",
  "table-2": "art/assets/table-2.png",
  "table-3": "art/assets/table-3.png",
  bench: "art/assets/bench.png",
};

export interface TrimInfo {
  key: string;
  sourceKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TRIM_PREFIX = "trim-";

/**
 * The provided prop/character PNGs are full scene-sized transparent canvases.
 * Phaser image origins and display sizes would be unusable if we rendered those
 * files directly, so boot creates tight, transparent textures with reliable
 * bottom/center anchoring for actors and props.
 */
export function createTrimmedArtTextures(scene: Phaser.Scene): Record<string, TrimInfo> {
  const out: Record<string, TrimInfo> = {};
  for (const key of Object.keys(ART_ASSETS)) {
    if (!scene.textures.exists(key)) continue;
    const tex = scene.textures.get(key);
    const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const w = src.width;
    const h = src.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(src, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > 8) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX || maxY < minY) continue;
    const pad = 3;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);
    const tw = maxX - minX + 1;
    const th = maxY - minY + 1;
    const tight = document.createElement("canvas");
    tight.width = tw;
    tight.height = th;
    tight.getContext("2d")!.drawImage(src, minX, minY, tw, th, 0, 0, tw, th);
    const trimKey = TRIM_PREFIX + key;
    if (scene.textures.exists(trimKey)) scene.textures.remove(trimKey);
    scene.textures.addCanvas(trimKey, tight);
    out[key] = { key: trimKey, sourceKey: key, x: minX, y: minY, width: tw, height: th };
  }
  return out;
}
