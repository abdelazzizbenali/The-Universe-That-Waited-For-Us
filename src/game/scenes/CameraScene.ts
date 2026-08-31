/* Memory 22 — THE CAMERA.
   He told her he wanted to buy a camera. She encouraged him, searched with
   him, offered to help pay, and — when he refused — asked only to cover the
   delivery. He let her. It made him proud of her thoughtfulness.

   No brands. No amounts. Just: I wanted a camera to remember the world, and
   she wanted to help me keep seeing it.

   Reward: the Memory Camera becomes a permanent tool. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { MemoryCamera, type CameraTarget } from "../systems/memory/MemoryCamera";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";

export default class CameraScene extends BaseScene {
  private companion!: Companion;
  private cam!: MemoryCamera;
  private captured = 0;
  private storyDone = false;
  private done = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.8);

    this.skyRect(0x0d1738, 0x243a6e, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x101c44, 1);
    g.fillRect(0, 0, ww, h);
    // an evening street of small shops
    for (let i = 0; i < 9; i++) {
      const bx = i * (ww / 9);
      const bh = h * Phaser.Math.FloatBetween(0.2, 0.36);
      g.fillStyle(0x132049, 1);
      g.fillRect(bx + 8, h * 0.36 - bh, ww / 9 - 16, bh);
      g.fillStyle(0x2b4074, 0.9);
      g.fillRect(bx + 20, h * 0.36 - bh + 14, ww / 9 - 56, bh * 0.3);
      for (let wy = 0; wy < 2; wy++) {
        if (Math.random() > 0.55) {
          g.fillStyle(0xf4e3c0, 0.5);
          g.fillRect(bx + 24, h * 0.36 - bh + 24 + wy * 22, 10, 12);
        }
      }
    }
    g.fillStyle(0x0c1330, 1);
    g.fillRect(0, h * 0.36, ww, h * 0.64);
    g.fillStyle(0x111c42, 1);
    g.fillRoundedRect(0, h * 0.56, ww, h * 0.24, 10);
    this.colliders.push(rect(ww * 0.5, h * 0.3, ww, h * 0.08));

    this.world.addStars(26, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.3));
    this.world.addDust(16, new Phaser.Geom.Rectangle(0, h * 0.3, ww, h * 0.5), 0xe0b36a, 0.16);
    this.world.addFlowers([
      { x: ww * 0.2, y: h * 0.86, open: true, mint: true },
      { x: ww * 0.55, y: h * 0.88 },
      { x: ww * 0.82, y: h * 0.85, open: true },
    ]);

    this.companion = new Companion(this, ww * 0.48, h * 0.66);
    this.companion.setState("beside");
    this.companion.soul.setWarmth(0.4);

    this.player = new Player(this, ww * 0.42, h * 0.7);
    this.player.speed = 150;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.02, h * 0.6, ww * 0.96, h * 0.28);
    this.player.setFrozen(true);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.audio.playBed("road-dusk");
    void this.story();
  }

  private async story() {
    await this.ui.say([
      { text: "He told her he wanted to buy a camera." },
      { text: "She did not hesitate. She looked things up with him." },
      { text: "She offered to help pay. He said no." },
      { text: "She asked again, smaller: let me at least cover the delivery." },
      { text: "He let her. And he was proud of her for thinking of it at all.", kind: "whisper" },
    ]);
    this.storyDone = true;
    this.saves.patch({ cameraUnlocked: true });
    this.ui.toast("◈ the memory camera is yours");

    await this.ui.say([
      { text: "He wanted a camera to remember the world." },
      { text: "She wanted to help him keep seeing it." },
      { text: "Some things are only visible through it.", kind: "whisper" },
    ]);

    /* the camera becomes a tool: look for what the world hides */
    const targets: CameraTarget[] = [
      { id: "hidden-star", x: this.scale.width * 1.2, y: this.scale.height * 0.2, label: "a star only the camera found" },
      { id: "window-sky", x: this.scale.width * 0.6, y: this.scale.height * 0.22, label: "the sky in a shop window" },
      { id: "lamp-road", x: this.scale.width * 1.6, y: this.scale.height * 0.34, label: "a lamp on the road home" },
    ];
    this.cam = new MemoryCamera(this, this.ui, this.audio, {
      onCapture: (t) => void this.onCapture(t),
      onToggle: (active) => {
        this.uiLocked = active;
        if (!active) this.ui.setHint("press the camera button to look again");
      },
    });
    this.cam.addTargets(targets);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cam.destroy());

    this.player!.setFrozen(false);
    this.ui.setHint("press the camera button — then capture three things");
    // the camera button lives in the world: walking to it toggles the viewfinder
    this.interactables.push({
      id: "camera-toggle",
      x: this.companion.x,
      y: this.companion.y,
      r: 900,
      label: "camera",
      when: () => this.storyDone && !this.done,
      onUse: () => this.cam.toggle(),
    });
  }

  private async onCapture(t: CameraTarget) {
    this.captured++;
    const frameId = `frame-${t.id}`;
    this.saves.addFrame(frameId);
    this.saves.addCollectible(t.id);
    this.ui.toast(`◈ captured — ${t.label}`);
    this.audio.softTick();
    if (this.captured >= 3 && !this.done) await this.finish();
    else this.ui.setHint(`${3 - this.captured} more to find`);
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    if (!this.cam) return;
    // camera mode: the viewfinder owns the action button
    if (this.cam.active) {
      this.cam.update(dt, this.cameras.main, this.input2.consumeActionPulse(), this.input2.actionHeld());
    }
  }

  private async finish() {
    this.done = true;
    if (this.cam.active) this.cam.toggle(false);
    this.uiLocked = false;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 18, 1.14, 1600);
    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.ui.say([
      { text: "Three small things the world had been keeping to itself." },
      { text: "From now on, the camera goes with her.", kind: "whisper" },
    ]);

    this.saves.setAliveness(86);
    this.keepMemory(MEMORY_IDS.camera);
    this.saves.checkpoint("MutualCareScene");
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("MutualCareScene");
  }
}
