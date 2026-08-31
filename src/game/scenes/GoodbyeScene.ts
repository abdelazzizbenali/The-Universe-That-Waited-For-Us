/* Memory 9 — THE GOODBYE.
   He got off first at the university city. She continued alone, and she
   cried. The camera does not follow him out. It stays with her, because
   that is where the memory lives.

   Nothing is asked of the player here except to stay. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

export default class GoodbyeScene extends BaseScene {
  private companion!: Companion;
  private streaks: Phaser.GameObjects.Image[] = [];
  private cold!: Phaser.GameObjects.Image;
  private said = false;
  private hh = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);

    this.skyRect(0x070b1a, 0x0e1432, w, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x0c1230, 1);
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const wx = w * 0.08 + i * w * 0.24;
      g.fillStyle(0x1c2b56, 1);
      g.fillRoundedRect(wx, h * 0.12, w * 0.17, h * 0.3, 12);
    }
    g.fillStyle(0x090e26, 1);
    g.fillRect(0, h * 0.45, w, h * 0.55);
    g.fillStyle(0x111b40, 1);
    g.fillRoundedRect(w * 0.1, h * 0.56, w * 0.8, h * 0.16, 12);

    // the world going past the window
    for (let i = 0; i < 5; i++) {
      const s = this.add
        .image(-100 - i * 220, h * (0.16 + (i % 3) * 0.07), "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xbfd9ff)
        .setAlpha(0.18)
        .setScale(20, 4)
        .setDepth(DEPTH.back + 1);
      this.streaks.push(s);
      this.tweens.add({ targets: s, x: w + 200, duration: 6000 + i * 700, repeat: -1, delay: i * 500 });
    }

    this.cold = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.4, h * 1.4)
      .setTint(0x2c4a8a)
      .setAlpha(0.1)
      .setDepth(DEPTH.overlay - 1);

    // the two of them, side by side, near the end of the ride
    this.player = new Player(this, w * 0.44, h * 0.66);
    this.player.setFrozen(true);
    this.companion = new Companion(this, w * 0.53, h * 0.66);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.4);
    this.player.soul.setWarmth(0.5);

    this.cameras.main.centerOn(w * 0.5, h * 0.56);
    this.audio.playBed("bus-engine");
    this.audio.duckBed("bus-engine", 0.03, 0.1);

    this.interactables.push({
      id: "goodbye",
      x: this.companion.x,
      y: this.companion.y,
      r: 400,
      label: "goodbye",
      once: true,
      when: () => !this.said,
      onUse: () => void this.sayGoodbye(),
    });
    this.ui.setHint("his stop is first");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    if (!this.said) this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
  }

  private async sayGoodbye() {
    this.said = true;
    this.ui.setHint(null);
    this.ui.letterbox(true);

    await this.ui.say([{ text: "He told her goodbye." }]);

    // he leaves — and the camera stays exactly where it is
    this.companion.setState("distant");
    this.companion.moveTo(this.scale.width * 1.15, this.hh * 0.7);
    this.audio.tone(196, 0.03, 1.8, "ambience");
    this.tweens.add({ targets: this.companion.soul.container, alpha: 0, duration: 2600, delay: 900 });

    await new Promise((r) => this.time.delayedCall(2600, r));

    // the bus goes on. the world gets bigger, and emptier.
    this.tweens.add({ targets: this.cold, alpha: 0.34, duration: 4000 });
    this.audio.duckBed("bus-engine", 0.012, 4);
    this.audio.stopMotif();
    this.cameras.main.zoomTo(this.settings.zoom * 0.94, 4200, "Sine.easeInOut");
    this.p.soul.setIntensity(0.72);
    this.p.soul.setWarmth(0.08);
    for (const s of this.streaks) this.tweens.getTweensOf(s).forEach((tw) => (tw.timeScale = 0.55));

    await new Promise((r) => this.time.delayedCall(2400, r));

    // one light tear — small, and not explained away
    const tear = this.add
      .image(this.p.pos.x + 6, this.p.pos.y + 2, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xd6eeff)
      .setScale(0.7)
      .setDepth(DEPTH.fx);
    this.tweens.add({
      targets: tear,
      y: tear.y + 34,
      alpha: 0,
      scale: 0.35,
      duration: 3000,
      ease: "Sine.easeIn",
      onComplete: () => tear.destroy(),
    });

    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.ui.say([
      { text: "She rode the rest of the way alone." },
      { text: "Sometimes the size of a goodbye reveals the size of the presence that came before it." },
    ]);

    this.keepMemory(MEMORY_IDS.goodbye);
    this.saves.checkpoint("CommitmentScene");
    await new Promise((r) => this.time.delayedCall(1200, r));
    this.ui.letterbox(false);
    this.transitionTo("CommitmentScene");
  }
}
