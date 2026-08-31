/* Memory 17 — THE FIRST TIME I ASKED FOR HER HAND.
   The bus was almost empty. He asked for her hand. She gave it. The sound of
   the bus went away, and for a little while nothing mattered except this.

   This is the first clear appearance of OUR COLOR and one of the quietest
   moments in the game. Permanently replayable. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { HandHoldController } from "../systems/hands/HandHoldController";
import { DEPTH, MEMORY_IDS } from "../config";
import { addBusBench, addStudentNpc } from "../art/NpcArt";

export default class HandHoldScene extends BaseScene {
  private companion!: Companion;
  private hands!: HandHoldController;
  private stars: Phaser.GameObjects.Image[] = [];
  private dark!: Phaser.GameObjects.Image;
  private streaks: Phaser.GameObjects.Image[] = [];
  private asked = false;
  private contacted = false;
  private done = false;
  private heldFor = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.3);

    // an almost-empty bus, late, quiet
    this.skyRect(0x0a0f24, 0x141c40, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x101838, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 4; i++) {
      const wx = ww * 0.09 + i * ww * 0.24;
      g.fillStyle(0x1d2a56, 1);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.28, 12);
      g.fillStyle(0x8ba7e0, 0.14);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.05, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0b1130, 1);
    g.fillRect(0, h * 0.4, ww, h * 0.6);
    addBusBench(this, ww * 0.2, h * 0.68, 190, 1);
    // almost empty, but not impossible: a couple of far passengers keep the bus real.
    addStudentNpc(this, "girl-1", ww * 0.62, h * 0.66, 58, 0.38, true);
    addStudentNpc(this, "boy-3", ww * 0.82, h * 0.68, 60, 0.34);

    for (let i = 0; i < 4; i++) {
      const s = this.add
        .image(-100 - i * 240, h * (0.14 + (i % 2) * 0.08), "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x9fb0d0)
        .setAlpha(0.14)
        .setScale(20, 4)
        .setDepth(DEPTH.back + 1);
      this.streaks.push(s);
      this.tweens.add({ targets: s, x: ww + 200, duration: 7000 + i * 800, repeat: -1, delay: i * 600 });
    }

    this.dark = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 1);

    this.companion = new Companion(this, ww * 0.2, h * 0.56);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.3);

    this.player = new Player(this, ww * 0.08, h * 0.72);
    this.player.speed = 158;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.05, h * 0.52, ww * 0.9, h * 0.32);
    this.player.setFrozen(true);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.hands = new HandHoldController(this, this.ui, this.audio, {
      contactDistance: 36,
      prompt: "give him your hand",
      // their actual arms do the reaching now
      her: this.player!.soul,
      him: this.companion.soul,
    });
    this.hands.onContact(() => void this.contact());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.hands.destroy());

    this.audio.playBed("bus-engine");
    this.audio.duckBed("bus-engine", 0.022, 0.1);
    void this.open();
  }

  private async open() {
    await this.ui.card("The bus was <em>almost empty</em>", "an ordinary ride home", 2800);
    await this.ui.say([
      { text: "The bus was almost empty that day." },
      // a known, historical phrase — used exactly
      { text: "Give me your hand.", kind: "canon", wait: 800 },
    ]);
    this.asked = true;
    this.p.setFrozen(false);
    this.hands.offer(this.p.pos, { x: this.companion.x, y: this.companion.y });
    this.ui.setHint("move toward his hand");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);

    if (!this.asked) return;

    this.hands.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, this.p.isMoving);

    // the world leans in as she reaches: ambience thins, light gathers
    if (!this.contacted) {
      const r = this.hands.reach;
      this.audio.duckAmbience(1 - r * 0.75, 0.4);
      this.p.soul.setIntensity(0.9 + r * 0.5);
      this.p.soul.setWarmth(r * 0.4);
      this.cameras.main.setZoom(this.settings.zoom * (1 + r * 0.06));
      for (const s of this.streaks) {
        this.tweens.getTweensOf(s).forEach((tw) => (tw.timeScale = 1 - r * 0.7));
      }
    }

    if (this.contacted && !this.done) {
      this.heldFor += dt;
      // the bus becomes a small private universe
      if (this.stars.length < 40 && Math.random() < 0.25) this.addStar();
    }
    void t;
  }

  private addStar() {
    const w = this.scale.width;
    const h = this.scale.height;
    const s = this.add
      .image(this.p.pos.x + Phaser.Math.Between(-w * 0.4, w * 0.4), h * Phaser.Math.FloatBetween(0.08, 0.5), "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.2)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.stars.push(s);
    this.tweens.add({ targets: s, alpha: 0.9, scale: Phaser.Math.FloatBetween(0.4, 0.9), duration: 900, ease: "Sine.easeOut" });
    this.tweens.add({
      targets: s,
      alpha: 0.35,
      duration: 1600,
      delay: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /** Contact: HUD gone, the bus gone, breathing and heartbeat, OUR COLOR. */
  private async contact() {
    this.contacted = true;
    this.uiLocked = true; // nothing on screen but the two of them
    this.p.setFrozen(true);

    // the world withdraws
    this.tweens.add({ targets: this.dark, alpha: 0.72, duration: 2600, ease: "Sine.easeIn" });
    for (const s of this.streaks) this.tweens.getTweensOf(s).forEach((tw) => (tw.timeScale = 0.15));
    this.audio.duckBed("bus-engine", 0.005, 3);
    this.audio.duckAmbience(0.12, 2.5);
    this.audio.stopMotif();
    this.audio.startIntimacy();

    // FIRST CLEAR OUR COLOR
    this.colors.setStage(6);
    this.saves.setColorStage(6);
    const mx = (this.p.pos.x + this.companion.x) / 2;
    const my = (this.p.pos.y + this.companion.y) / 2;
    const bloom = this.add
      .image(mx, my, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.2)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: bloom, alpha: 0.5, scale: 1.6, duration: 2600, ease: "Sine.easeOut" });
    this.tweens.add({ targets: bloom, alpha: 0.32, scale: 1.4, duration: 3000, delay: 2600, yoyo: true, repeat: -1 });

    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const m = this.add
        .image(mx, my, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(i % 2 ? 0x7fc4ff : 0xe0b36a)
        .setScale(1)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: m,
        x: mx + Math.cos(a) * 110,
        y: my + Math.sin(a) * 70,
        alpha: 0,
        scale: 2,
        duration: 2200,
        delay: i * 60,
        ease: "Sine.easeOut",
        onComplete: () => m.destroy(),
      });
    }

    // the camera moves closer gently — no shake, no dramatic push
    this.rig.focusPull(mx, my, 1.22, 3200);
    this.p.soul.setIntensity(1.5);
    this.p.soul.setWarmth(0.7);
    this.companion.soul.setIntensity(1.5);

    await new Promise((r) => this.time.delayedCall(4200, r));
    await this.ui.say([
      { text: "The sound of the bus went away." },
      { text: "He could hear her breathing." },
      { text: "The whole world kept moving." },
      { text: "But for a little while, nothing mattered except this hand." },
    ]);

    this.audio.stopIntimacy();
    this.saves.setAliveness(76);
    this.keepMemory(MEMORY_IDS.hand);
    this.saves.checkpoint("WaitingScene");
    this.done = true;
    this.hands.fadeOut(1200);
    this.uiLocked = false;
    await new Promise((r) => this.time.delayedCall(1200, r));
    this.transitionTo("WaitingScene");
  }
}
