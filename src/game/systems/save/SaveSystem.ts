/* SaveSystem — owns ProgressState. LocalStorage writes immediately;
   Supabase sync is optional, debounced, and fire-and-forget. Replays can
   never move progress backward (monotonic fields). */
import { DEFAULT_PROGRESS, MEMORY_LABELS, SAVE_KEY, SCENE_ORDER, type ProgressState } from "../../config";
import { ensureAnonymousSession, supabase } from "../../supabase/client";

export class SaveSystem {
  state: ProgressState;
  private userId: string | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionTried = false;

  constructor() {
    this.state = this.readLocal();
  }

  private readLocal(): ProgressState {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_PROGRESS };
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      if (parsed.version !== DEFAULT_PROGRESS.version) return { ...DEFAULT_PROGRESS };
      return { ...DEFAULT_PROGRESS, ...parsed };
    } catch {
      return { ...DEFAULT_PROGRESS };
    }
  }

  patch(partial: Partial<ProgressState>) {
    this.state = { ...this.state, ...partial, updatedAt: Date.now() };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch {
      /* storage may be unavailable in private mode — game continues in memory */
    }
    this.queueCloudSync();
  }

  addMemory(id: string) {
    if (this.state.memories.includes(id)) return;
    this.patch({ memories: [...this.state.memories, id] });
  }

  /** Memory Frames — captured moments, kept in the archive. */
  addFrame(id: string) {
    if (this.state.frames.includes(id)) return;
    this.patch({ frames: [...this.state.frames, id] });
  }

  hasFrame(id: string) {
    return this.state.frames.includes(id);
  }

  addCollectible(id: string) {
    if (this.state.collectibles.includes(id)) return;
    this.patch({ collectibles: [...this.state.collectibles, id] });
  }

  setColorStage(stage: number) {
    // monotonic — color progression never regresses
    if (stage > this.state.colorStage) this.patch({ colorStage: stage });
  }

  setAliveness(value: number) {
    if (value > this.state.aliveness) this.patch({ aliveness: value });
  }

  /** Monotonic: replaying an earlier memory can never rewind the story. */
  checkpoint(scene: ProgressState["scene"]) {
    const next = SCENE_ORDER.indexOf(scene);
    const current = SCENE_ORDER.indexOf(this.state.scene);
    if (next === -1) return;
    if (current !== -1 && next < current) return;
    this.patch({ scene });
  }

  resetRun() {
    const fresh = { ...DEFAULT_PROGRESS, updatedAt: Date.now() };
    this.state = fresh;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
    } catch { /* ignore */ }
    this.queueCloudSync();
  }

  hasRun() {
    return this.state.memories.length > 0 || this.state.scene !== "PrologueScene";
  }

  memoryLabel(id: string) {
    return MEMORY_LABELS[id] ?? id;
  }

  private queueCloudSync() {
    if (!supabase) return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => void this.syncCloud(), 1500);
  }

  private async syncCloud() {
    if (!supabase) return;
    try {
      if (!this.userId) {
        if (this.sessionTried) return; // don't spam failed auth attempts
        this.sessionTried = true;
        this.userId = await ensureAnonymousSession();
        if (!this.userId) return;
      }
      const s = this.state;
      await supabase.from("game_progress").upsert({
        player_id: this.userId,
        chapter: 0,
        segment: 0,
        checkpoint: { scene: s.scene },
        color_stage: s.colorStage,
        aliveness: s.aliveness,
        flags: {
          memories: s.memories,
          frames: s.frames,
          collectibles: s.collectibles,
          looked: s.looked,
          companionBeside: s.companionBeside,
          cameraUnlocked: s.cameraUnlocked,
          blueForHim: s.blueForHim,
          greenForHer: s.greenForHer,
          finishedSlice: s.finishedSlice,
          finishedArc: s.finishedArc,
          finishedPhase4: s.finishedPhase4,
          bloomed: s.bloomed,
          unfinishedStarOpen: s.unfinishedStarOpen,
          storyComplete: s.storyComplete,
          reunited: s.reunited,
          starCompleted: s.starCompleted,
          birthdayShown: s.birthdayShown,
          // note: only whether a wish exists, never the wish itself
          wishSealed: s.wishSealed,
          wishYear: s.wishYear,
          freeExplore: s.freeExplore,
          playSeconds: s.playSeconds,
        },
      });
    } catch {
      /* offline or RLS pending — local save remains source of truth */
    }
  }
}
