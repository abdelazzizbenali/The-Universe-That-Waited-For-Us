/* BaseScene — shared plumbing for every chapter scene: runtime access,
   interactable scanning (tap + hold), colliders, dialogue movement-lock,
   memory-keeping, cinematic fades. */
import Phaser from "phaser";
import { runtime } from "../runtime";
import { session } from "../systems/session/Session";
import { DEPTH } from "../config";
import { Backdrop } from "../art/Backdrop";
import { SCENE_ART } from "../art/SceneArt";
import { InputAdapter } from "../systems/input/InputAdapter";
import { CameraRig } from "../systems/camera/CameraRig";
import { WorldDresser } from "../systems/world/WorldDresser";
import { addNpcLine, addStudentNpc } from "../art/NpcArt";
import type { Collider } from "../systems/world/colliders";
import type { Player } from "../entities/Player";

export interface Interactable {
  id: string;
  /** World position — the single source of truth for the prompt anchor. */
  x: number;
  y: number;
  r: number;
  label: string;
  holdMs?: number;
  /** Vertical offset for the floating prompt, in world units. */
  promptY?: number;
  when?: () => boolean;
  once?: boolean;
  used?: boolean;
  onUse: () => void;
}

/** A world-anchored interaction indicator: a small ring, a soft glow and a
    label, positioned by converting the object's world position to screen
    space every frame. Never in an arbitrary corner. */
class PromptIndicator {
  private ring: Phaser.GameObjects.Arc;
  private glow: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.Text;
  private container: Phaser.GameObjects.Container;
  private bob = 0;

  constructor(private scene: Phaser.Scene) {
    this.glow = scene.add
      .image(0, 0, "halo")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x93dcbb)
      .setScale(1.6)
      .setAlpha(0.3);
    this.ring = scene.add.circle(0, 0, 13).setStrokeStyle(1.5, 0x93dcbb, 0.9).setFillStyle();
    this.text = scene.add
      .text(0, -26, "", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
        color: "#93dcbb",
      })
      .setOrigin(0.5, 1)
      .setAlpha(0.9);
    this.container = scene.add
      .container(0, 0, [this.glow, this.ring, this.text])
      .setDepth(DEPTH.prompt)
      .setVisible(false);
    // positioned in screen pixels after world→screen conversion; do not let
    // the camera scroll it a second time.
    this.container.setScrollFactor(0);
  }

  update(
    dtSec: number,
    target: Interactable | null,
    cam: Phaser.Cameras.Scene2D.Camera,
    holdProgress: number,
    visible: boolean
  ) {
    if (!target || !visible) {
      this.container.setVisible(false);
      return;
    }
    // world → screen so the prompt stays glued to the actual object
    const sx = (target.x - cam.worldView.x) * cam.zoom;
    const sy = (target.y - (target.promptY ?? 0) - cam.worldView.y) * cam.zoom;

    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    // off-screen: hide rather than float somewhere unrelated
    if (sx < 20 || sx > w - 20 || sy < 20 || sy > h - 20) {
      this.container.setVisible(false);
      return;
    }

    this.bob += dtSec;
    this.container.setVisible(true);
    this.container.setPosition(sx, sy + Math.sin(this.bob * 2.2) * 3);
    this.ring.setRadius(13 + holdProgress * 4);
    this.glow.setAlpha(0.24 + holdProgress * 0.5);
    this.ring.setStrokeStyle(1.5 + holdProgress * 2, holdProgress > 0 ? 0xcdffe5 : 0x93dcbb, 0.9);
    if (this.text.text !== target.label) this.text.setText(target.label);
    // keep the label inside the frame
    this.text.setX(Phaser.Math.Clamp(0, -w * 0.4, w * 0.4));
  }

  destroy() {
    this.container.destroy();
  }
}

export abstract class BaseScene extends Phaser.Scene {
  protected colliders: Collider[] = [];
  protected interactables: Interactable[] = [];
  protected player: Player | null = null;
  protected rig!: CameraRig;
  protected world!: WorldDresser;
  protected input2!: InputAdapter;
  /** When a system owns the action button (camera mode, hand reach), the
      automatic interactable scanner steps aside instead of fighting it. */
  protected uiLocked = false;
  private holdT = 0;
  private cand: Interactable | null = null;
  private prevHeld = false;
  private prompt!: PromptIndicator;
  /** The painted environment behind this scene, if one is mapped. */
  protected backdrop: Backdrop | null = null;

  protected get ui() {
    return runtime.ui;
  }
  protected get audio() {
    return runtime.audio;
  }
  protected get saves() {
    return runtime.saves;
  }
  protected get colors() {
    return runtime.colors;
  }
  protected get settings() {
    return runtime.settings;
  }

  abstract build(): void;
  protected tick(_dt: number, _t: number): void {}

  create() {
    this.ui.reset();
    this.world = new WorldDresser(this);
    this.rig = new CameraRig(this);
    this.input2 = new InputAdapter(this, this.ui);
    this.prompt = new PromptIndicator(this);

    // the painted world goes down first, before any scene geometry
    const art = SCENE_ART[this.scene.key];
    if (art && this.textures.exists(art.key)) {
      this.backdrop = new Backdrop(this, art.key, art.mood, this.settings.reducedMotion);
    }
    // one place to guarantee nothing survives a scene change
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input2.destroy();
      this.prompt.destroy();
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.tweens.timeScale = 1;
      this.ui.setActionProgress(0);
    });
    this.cameras.main.fadeIn(760, 7, 11, 26);
    this.build();
    this.addAmbientNpcs();
    if (this.backdrop) {
      this.cameras.main.setBounds(0, 0, this.backdrop.width, this.backdrop.height, true);
      if (this.player?.bounds) {
        const b = this.player.bounds;
        b.x = Math.min(Math.max(0, b.x), Math.max(0, this.backdrop.width - 2));
        b.y = Math.min(Math.max(0, b.y), Math.max(0, this.backdrop.height - 2));
        const maxW = Math.max(1, this.backdrop.width - b.x);
        const maxH = Math.max(1, this.backdrop.height - b.y);
        b.width = Math.min(b.width, maxW);
        b.height = Math.min(b.height, maxH);
      }
    }

    /* Scenes were authored before the paintings existed: they fill their
       skies and floors with flat blocks. Where a painting is present those
       blocks would bury it, so background-layer Graphics are softened into
       translucent grading passes. They still read as ground and still carry
       each scene's colour, but the painted world shows through them.
       Props, characters and anything above the ground layer are untouched. */
    if (this.backdrop) {
      for (const obj of this.children.list) {
        if (!(obj instanceof Phaser.GameObjects.Graphics)) continue;
        const d = obj.depth;
        if (d > DEPTH.groundDecor) continue;
        // painted furniture and floors now carry the room; the old blocks
        // stay only as faint depth masses so they never ghost over the art
        obj.setAlpha(d <= DEPTH.skyFar ? 0.08 : 0.26);
      }
    }
    // souls created during build() inherit the motion preference
    if (this.settings.reducedMotion && this.player) this.player.soul.motionScale = 0.3;
  }

  /**
   * Extra life in the scenes, drawn from the provided boy/girl/teacher NPC art.
   * They are visual-only so they never break reachability, collisions, or story
   * triggers. Placement is deliberately at edges/background bands.
   */
  private addAmbientNpcs() {
    const key = this.scene.key;
    if (key === "TitleScene" || key === "PrologueScene") return;
    const ww = this.player?.bounds ? this.player.bounds.x + this.player.bounds.width : this.backdrop?.width ?? this.scale.width;
    const h = this.scale.height;

    const campus = ["LookScene", "WatchingScene", "EveningWalkScene", "WaitingScene", "MutualCareScene", "CameraScene"];
    const library = ["LibraryScene", "ExamLibraryScene", "ProjectScene", "ReportScene", "RescueScene"];
    const cosmic = ["CommitmentScene", "DecemberScene", "VisionScene", "ConstantineScene", "ColorHuntScene", "HolidayHubScene", "FinaleScene", "RevealScene", "WishScene", "FreeExploreScene"];

    if (campus.includes(key)) {
      addNpcLine(
        this,
        [
          { x: ww * 0.18, y: h * 0.64, height: 62, alpha: 0.56 },
          { x: ww * 0.32, y: h * 0.7, height: 68, alpha: 0.62, flipX: true },
          { x: ww * 0.48, y: h * 0.62, height: 58, alpha: 0.45 },
          { x: ww * 0.66, y: h * 0.74, height: 68, alpha: 0.58, flipX: true },
          { x: ww * 0.84, y: h * 0.68, height: 62, alpha: 0.5 },
        ],
        key.length % 8
      );
      if (key === "LookScene" || key === "WatchingScene") {
        addStudentNpc(this, "teacher-2", ww * 0.56, h * 0.58, 76, 0.58, true);
      }
    } else if (library.includes(key)) {
      addNpcLine(
        this,
        [
          { x: ww * 0.16, y: h * 0.86, height: 56, alpha: 0.36 },
          { x: ww * 0.34, y: h * 0.9, height: 58, alpha: 0.34, flipX: true },
          { x: ww * 0.72, y: h * 0.87, height: 56, alpha: 0.34 },
          { x: ww * 0.9, y: h * 0.82, height: 58, alpha: 0.32, flipX: true },
        ],
        2
      );
      addStudentNpc(this, "teacher-1", ww * 0.52, h * 0.55, 72, 0.28);
    } else if (cosmic.includes(key)) {
      addNpcLine(
        this,
        [
          { x: ww * 0.2, y: h * 0.72, height: 54, alpha: 0.22 },
          { x: ww * 0.45, y: h * 0.66, height: 58, alpha: 0.2, flipX: true },
          { x: ww * 0.72, y: h * 0.74, height: 54, alpha: 0.2 },
        ],
        5
      ).forEach((npc) => npc?.setTint(0x9fb0d0));
    }
  }

  update(time: number, delta: number) {
    const dtSec = Math.min(delta, 60) / 1000;
    const tSec = time / 1000;
    this.colors.update(delta);
    this.backdrop?.update(dtSec, this.cameras.main);
    this.world.update(dtSec);
    const blocked = this.ui.dialogueActive;
    const axis = blocked ? { x: 0, y: 0 } : this.input2.axis();
    if (this.player) this.player.update(dtSec, tSec, axis, this.colliders, this.colors);
    if (this.uiLocked) {
      this.prevHeld = this.input2.actionHeld();
      this.ui.setActionProgress(0);
      this.prompt.update(dtSec, null, this.cameras.main, 0, false);
    } else {
      this.scanInteract(dtSec, blocked);
      this.prompt.update(
        dtSec,
        this.cand,
        this.cameras.main,
        this.cand?.holdMs ? Math.min(1, this.holdT / this.cand.holdMs) : 0,
        !blocked
      );
    }
    this.tick(dtSec, tSec);
  }

  private scanInteract(dtSec: number, blocked: boolean) {
    let best: Interactable | null = null;
    let bestD = Infinity;
    if (this.player && !blocked) {
      for (const it of this.interactables) {
        if (it.used && it.once) continue;
        if (it.when && !it.when()) continue;
        const d = Phaser.Math.Distance.Between(this.player.pos.x, this.player.pos.y, it.x, it.y);
        if (d <= it.r && d < bestD) {
          best = it;
          bestD = d;
        }
      }
    }
    if (best !== this.cand) {
      this.cand = best;
      this.holdT = 0;
      this.ui.setAction(best ? best.label : null);
    }
    if (!best) {
      this.ui.setActionProgress(0);
      this.prevHeld = this.input2.actionHeld();
      return;
    }

    const held = this.input2.actionHeld();
    const tapped = this.input2.consumeActionPulse() || (held && !this.prevHeld);
    if (best.holdMs) {
      if (held) {
        this.holdT += dtSec * 1000;
        const p = Math.min(1, this.holdT / best.holdMs);
        this.ui.setActionProgress(p);
        if (p >= 1) {
          this.holdT = 0;
          this.useIt(best);
        }
      } else {
        this.holdT = Math.max(0, this.holdT - dtSec * 2600);
        this.ui.setActionProgress(best.holdMs ? this.holdT / best.holdMs : 0);
      }
    } else if (tapped) {
      this.useIt(best);
    }
    this.prevHeld = held;
  }

  private useIt(it: Interactable) {
    if (it.once) it.used = true;
    this.ui.setAction(null);
    this.ui.setActionProgress(0);
    it.onUse();
  }

  protected keepMemory(id: string) {
    this.saves.addMemory(id);
    this.ui.memoryKept(this.saves.memoryLabel(id));
  }

  /** Live 0..1 progress while the player holds a hold-type action (used by THE LOOK). */
  protected get holdProgress(): number {
    if (!this.cand || !this.cand.holdMs) return 0;
    return Math.min(1, this.holdT / this.cand.holdMs);
  }

  protected get activeCandidate(): Interactable | null {
    return this.cand;
  }

  /**
   * Advances the story — unless this is a replay, in which case the memory
   * ends here and she is returned to where she came from. Without this,
   * revisiting an early memory would drag her through the whole game again.
   */
  protected transitionTo(sceneKey: string, opts: { delayMs?: number; fadeMs?: number } = {}) {
    const { delayMs = 0, fadeMs = 780 } = opts;
    const replaying = session.replaying;
    const target = replaying ? session.returnTo : sceneKey;

    this.time.delayedCall(delayMs, () => {
      const finish = () => {
        this.cameras.main.fadeOut(fadeMs, 7, 11, 26);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          if (replaying) session.endReplay();
          this.scene.start(target);
        });
      };
      if (replaying) {
        // a soft landing out of the memory, rather than a hard cut
        void this.ui.card("", "the memory folds itself away", 1900).then(finish);
      } else {
        finish();
      }
    });
  }

  /** True while this scene is being revisited from the archive. */
  protected get isReplay() {
    return session.replaying;
  }

  /**
   * Sky fill. When a painted backdrop is present it stays almost entirely
   * transparent — the painting is the sky now — but it is still drawn very
   * faintly so each scene keeps its own colour signature, and so scenes
   * still look correct if a painting failed to load.
   */
  protected skyRect(topColor: number, bottomColor: number, w: number, h: number) {
    const g = this.add.graphics().setDepth(DEPTH.skyFar - 2);
    g.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    g.fillRect(0, 0, w, h);
    if (this.backdrop) g.setAlpha(0.12);
    return g;
  }
}
