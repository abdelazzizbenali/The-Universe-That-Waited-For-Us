/* ColorDirector — owns the Blue / Hazel / OUR progression.
   Slice uses stages 0 → 2 only (tiny reflections, subtle aura interaction).
   Base hues are immutable; reflections are additive. */

export interface ColorStageParams {
  stage: number;
  reflect: number; // 0..1 intensity of other-color motes in each aura
  seam: number; // 0..1 overlap shimmer when souls are near
  warmth: number; // 0..1 warm grade nudge
}

const STAGES: ColorStageParams[] = [
  { stage: 0, reflect: 0, seam: 0, warmth: 0 },
  { stage: 1, reflect: 0.14, seam: 0.06, warmth: 0.04 },
  { stage: 2, reflect: 0.26, seam: 0.14, warmth: 0.1 },
  { stage: 3, reflect: 0.38, seam: 0.24, warmth: 0.16 },
  { stage: 4, reflect: 0.52, seam: 0.36, warmth: 0.22 },
  { stage: 5, reflect: 0.66, seam: 0.52, warmth: 0.3 },
  { stage: 6, reflect: 0.78, seam: 0.68, warmth: 0.4 },
  { stage: 7, reflect: 0.9, seam: 0.86, warmth: 0.55 },
];

export class ColorDirector {
  /** Smoothed live params souls read every frame. */
  params: ColorStageParams;
  private target: ColorStageParams;

  constructor(stage = 0) {
    this.params = { ...STAGES[Math.max(0, Math.min(7, stage))] };
    this.target = { ...this.params };
  }

  setStage(stage: number) {
    const s = STAGES[Math.max(0, Math.min(7, stage))];
    this.target = { ...s };
  }

  /** Called once per frame from the active scene. */
  update(dtMs: number) {
    const k = Math.min(1, dtMs / 1400); // ~1.4s ease toward target
    this.params.reflect += (this.target.reflect - this.params.reflect) * k;
    this.params.seam += (this.target.seam - this.params.seam) * k;
    this.params.warmth += (this.target.warmth - this.params.warmth) * k;
    this.params.stage = this.target.stage;
  }
}
