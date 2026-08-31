/* Session — transient, per-run state that must never touch the save file.

   Its main job is REPLAY CONTAINMENT: when a memory is revisited from the
   archive, the scene must not chain forward into the rest of the story. The
   scene itself does not need to know it is being replayed — BaseScene checks
   here before advancing, and returns her to where she came from instead. */

export type ReturnTarget = "TitleScene" | "FreeExploreScene";

class SessionState {
  /** True while the player is revisiting a finished memory. */
  replaying = false;
  /** Which memory is being revisited (for the returning card). */
  replayId: string | null = null;
  /** Where to send her when the replay finishes. */
  returnTo: ReturnTarget = "TitleScene";

  beginReplay(memoryId: string, returnTo: ReturnTarget) {
    this.replaying = true;
    this.replayId = memoryId;
    this.returnTo = returnTo;
  }

  endReplay() {
    this.replaying = false;
    this.replayId = null;
  }
}

export const session = new SessionState();
