/* Memory 29 — THE FIRST BOUQUET.
   The first time he brought her flowers. They were alone. He held both of
   her hands, told her he loved her, gave her the bouquet, held her hand and
   kissed it. It was the first bouquet she had ever been given, and it came
   from him.

   Played as beats the player has to complete — nothing here happens on its
   own. No hearts, no pink confetti: the universe responds instead. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { HandHoldController } from "../systems/hands/HandHoldController";
import { runBloom } from "../systems/world/BloomEvent";
import { flashConstellation } from "../systems/constellation/Constellation";
import { DEPTH, MEMORY_IDS } from "../config";
import { STAR_DENSITY, WORLDS } from "../art/ArtBible";
import {
  addFog,
  addForeground,
  addLightPool,
  addRidges,
  addTerrain,
  addVignette,
} from "../art/environment";

export default class BouquetScene extends BaseScene {
  private her!: Companion;
  private hands!: HandHoldController;
  private bouquet!: Phaser.GameObjects.Container;
  private bouquetGlow!: Phaser.GameObjects.Image;
  private flowers: Phaser.GameObjects.Image[] = [];
  private phase: "approach" | "hands" | "give" | "kiss" | "done" = "approach";
  private ww = 0;
  private hh = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);
    const ww = (this.ww = Math.floor(w * 1.4));

    // an evening clearing, just the two of them
    this.skyRect(0x0b1230, 0x1e2b52, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0e1836, 1);
    g.fillEllipse(ww * 0.5, h * 1.26, ww * 1.5, h * 0.78);
    g.fillStyle(0x122043, 1);
    g.fillEllipse(ww * 0.55, h * 0.94, ww * 0.7, h * 0.2);

    // a real clearing: distant treeline, soft grass, warm evening pockets
    addRidges(this, ww, h * 0.5);
    addTerrain(this, ww, h * 0.8, h * 0.14, 1.1);
    addFog(this, ww, h * 0.46, h * 0.68, 2, WORLDS.garden.fog);
    addLightPool(this, ww * 0.62, h * 0.72, 320, 150, 0xf2b8c6, 0.12);
    addForeground(this, ww, h * 0.97, 0x070d20);
    addVignette(this, 0x0b1230, 0.3);
    this.world.addStars(STAR_DENSITY.moderate, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.46));
    // closed flowers everywhere — they are waiting for a reason
    this.flowers = this.world.addFlowers([
      { x: ww * 0.12, y: h * 0.82 },
      { x: ww * 0.2, y: h * 0.9 },
      { x: ww * 0.3, y: h * 0.86 },
      { x: ww * 0.38, y: h * 0.93, mint: true },
      { x: ww * 0.47, y: h * 0.84 },
      { x: ww * 0.58, y: h * 0.91, mint: true },
      { x: ww * 0.67, y: h * 0.85 },
      { x: ww * 0.76, y: h * 0.92 },
      { x: ww * 0.85, y: h * 0.86, mint: true },
      { x: ww * 0.93, y: h * 0.9 },
    ]);
    this.world.addDust(20, new Phaser.Geom.Rectangle(0, h * 0.4, ww, h * 0.5), 0xf2b8c6, 0.14);
    this.world.addSpirits([{ x: ww * 0.24, y: h * 0.62 }, { x: ww * 0.8, y: h * 0.6 }]);

    // her, waiting in the clearing
    this.her = new Companion(this, ww * 0.62, h * 0.68, "hazel");
    this.her.setState("seated");
    this.her.soul.setWarmth(0.4);

    // him, carrying something behind his back
    this.player = new Player(this, ww * 0.18, h * 0.76, "blue");
    this.player.speed = 150;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.08, h * 0.62, ww * 0.8, h * 0.24);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the bouquet — carried, then given
    const stems = this.add.graphics();
    stems.fillStyle(0x9aab62, 0.9);
    stems.fillRect(-3, 0, 6, 22);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.22;
      stems.fillStyle([0xf2b8c6, 0xf4dca8, 0xeaf2ff, 0x9fe3c9][i % 4], 0.95);
      stems.fillCircle(Math.cos(a) * 13, Math.sin(a) * 13 - 4, 5.5);
    }
    this.bouquetGlow = this.add
      .image(0, 0, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf2b8c6)
      .setScale(3.4)
      .setAlpha(0.35);
    this.bouquet = this.add.container(this.p.pos.x, this.p.pos.y - 4, [this.bouquetGlow, stems]).setDepth(DEPTH.soul + 1);

    this.interactables.push({
      id: "approach",
      x: this.her.x,
      y: this.her.y,
      r: 84,
      label: "go to her",
      once: true,
      when: () => this.phase === "approach",
      onUse: () => void this.beatHands(),
    });

    this.audio.playBed("night-wind");
    this.audio.startMotif("warm");
    void this.open();
  }

  private async open() {
    this.p.setFrozen(true);
    await this.ui.say([
      { text: "They were alone that evening." },
      { text: "He had brought something with him, and had been carrying it badly hidden the whole way.", kind: "whisper" },
    ]);
    this.p.setFrozen(false);
    this.ui.setHint("she's waiting");
  }

  /** Beat one: both her hands. */
  private async beatHands() {
    this.phase = "hands";
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.her.x - 58,
        y: this.her.y + 6,
        duration: 1300,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    this.rig.focusPull((this.p.pos.x + this.her.x) / 2, this.p.pos.y - 12, 1.2, 1800);
    this.audio.duckAmbience(0.5, 2);

    await new Promise((r) => this.time.delayedCall(1400, r));
    await this.ui.say([
      { text: "He took both of her hands first." },
      // the known words, used exactly
      { text: "I love you.", kind: "canon", wait: 900 },
    ]);

    // small ring of light where their hands meet
    const mx = (this.p.pos.x + this.her.x) / 2;
    const my = (this.p.pos.y + this.her.y) / 2 + 6;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const m = this.add
        .image(mx, my, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x93dcbb)
        .setScale(0.9)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: m,
        x: mx + Math.cos(a) * 54,
        y: my + Math.sin(a) * 34,
        alpha: 0,
        duration: 1600,
        onComplete: () => m.destroy(),
      });
    }

    this.phase = "give";
    this.ui.setAction("give her the flowers");
    this.interactables.push({
      id: "give",
      x: this.her.x,
      y: this.her.y,
      r: 200,
      label: "give her the flowers",
      once: true,
      when: () => this.phase === "give",
      onUse: () => void this.beatGive(),
    });
  }

  /** Beat two: the bouquet. */
  private async beatGive() {
    this.phase = "kiss";
    this.audio.sparkle();

    // it passes from his hands to hers
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.bouquet,
        x: this.her.x + 6,
        y: this.her.y - 6,
        duration: 1200,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });
    this.tweens.add({ targets: this.bouquetGlow, alpha: 0.8, scale: 6, duration: 1400, yoyo: true, repeat: -1 });
    this.her.soul.setIntensity(1.6);
    this.her.soul.setWarmth(0.75);
    this.her.joyBurst();

    await new Promise((r) => this.time.delayedCall(1400, r));
    await this.ui.say([
      { text: "It was the first bouquet anyone had ever given her." },
      { text: "It was from him. That was the part that mattered to her.", kind: "whisper" },
    ]);

    // beat three: the hand, and the kiss
    this.hands = new HandHoldController(this, this.ui, this.audio, { contactDistance: 40 });
    this.hands.onContact(() => void this.beatKiss());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.hands.destroy());
    this.hands.beginReach();
    this.p.setFrozen(false);
    this.ui.setHint("take her hand");
  }

  /** Beat four: he kisses her hand, and the universe answers. */
  private async beatKiss() {
    this.phase = "done";
    this.p.setFrozen(true);
    this.uiLocked = true;
    this.ui.setAction(null);
    this.ui.setHint(null);

    const mx = (this.p.pos.x + this.her.x) / 2;
    const my = (this.p.pos.y + this.her.y) / 2;

    this.rig.focusPull(mx, my - 6, 1.28, 2400);
    this.audio.stopMotif();
    this.audio.startIntimacy();

    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.ui.say([{ text: "He kissed her hand. It was warm.", kind: "whisper" }]);

    /* ---------------- the world answers ---------------- */
    this.saves.patch({ bloomed: true });
    await runBloom(this, this.world, this.audio, {
      // strong, but not the finale: this is the universe practising
      intensity: 0.62,
      x: mx,
      y: my,
      starArea: new Phaser.Geom.Rectangle(0, 0, this.ww, this.hh * 0.45),
      flowers: this.flowers,
    });

    this.her.soul.setIntensity(1.7);
    this.p.soul.setWarmth(0.7);
    this.audio.stopIntimacy();

    await this.ui.say([
      { text: "He would have given her every flower in the world if he could have carried them." },
      { text: "Something in the clearing had been waiting for a reason to open.", kind: "whisper" },
    ]);

    this.colors.setStage(6);
    this.saves.setColorStage(6);
    this.saves.setAliveness(99);
    this.keepMemory(MEMORY_IDS.bouquet);
    this.saves.checkpoint("BorrowedLaptopScene");

    this.ui.letterbox(false);
    this.uiLocked = false;
    this.hands.fadeOut(1000);
    this.cameras.main.zoomTo(1, 1200, "Sine.easeInOut");
    await new Promise((r) => this.time.delayedCall(1300, r));
    await flashConstellation(this, this.saves.state.memories, MEMORY_IDS.bouquet, 4200);
    this.transitionTo("BorrowedLaptopScene");
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);
    this.her.soul.lookAt(this.p.pos.x, this.p.pos.y);

    // he carries the bouquet until he gives it
    if (this.phase === "approach" || this.phase === "hands") {
      this.bouquet.setPosition(this.p.pos.x + 14, this.p.pos.y - 6 + Math.sin(t * 1.4) * 2);
    }
    if (this.phase === "kiss" && this.hands) {
      this.hands.update(dt, this.p.pos, { x: this.her.x, y: this.her.y }, this.p.isMoving);
    }
  }
}
