/* Memory 6 — THE INSTAGRAM MESSAGE / THE WATCHING WORLD.
   She thanked him, then asked him to stop: the attention had become too
   much. He answered that other people's opinions should not decide what
   they do. No villains here — only pressure, and two people walking through
   it together. Mechanic: CONVICTION WALK. Distance travelled side by side
   dissolves the watching. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

interface Watcher {
  g: Phaser.GameObjects.Container;
  eyes: Phaser.GameObjects.Image;
  x: number;
}

export default class WatchingScene extends BaseScene {
  private companion!: Companion;
  private watchers: Watcher[] = [];
  private startX = 0;
  private endX = 0;
  private progress = 0;
  private done = false;
  private opened = false;
  private whisperTimer = 0;
  private lastWhisperLevel = -1;
  private pressure!: Phaser.GameObjects.Image;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 2.6);

    this.skyRect(0x080c20, 0x111634, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    // a corridor of cold architecture
    g.fillStyle(0x0b1026, 1);
    g.fillRect(0, 0, ww, h * 0.46);
    g.fillStyle(0x0d1330, 1);
    g.fillRect(0, h * 0.46, ww, h * 0.54);
    for (let i = 0; i < 22; i++) {
      const cx = i * (ww / 22);
      g.fillStyle(0x121a3c, 1);
      g.fillRect(cx, h * 0.2, 26, h * 0.3);
    }
    g.fillStyle(0x0f1738, 1);
    g.fillRoundedRect(0, h * 0.66, ww, h * 0.16, 10);

    this.world.addStars(9, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.18));
    this.world.addDust(18, new Phaser.Geom.Rectangle(0, h * 0.3, ww, h * 0.5), 0x8f9fc9, 0.12);

    // the watchers — silhouettes with eyes that turn toward them
    for (let i = 0; i < 20; i++) {
      const x = ww * 0.16 + (i / 20) * ww * 0.72 + Phaser.Math.Between(-40, 40);
      const y = h * (i % 2 === 0 ? 0.58 : 0.83) + Phaser.Math.Between(-12, 12);
      const body = this.add.graphics();
      const shade = [0x141c3c, 0x18204a, 0x101836][i % 3];
      body.fillStyle(shade, 1);
      body.fillEllipse(0, 0, 32, 50);
      body.fillCircle(0, -30, 11);
      const eyes = this.add
        .image(0, -30, "spirit")
        .setScale(0.6)
        .setAlpha(0.5)
        .setBlendMode(Phaser.BlendModes.ADD);
      const c = this.add.container(x, y, [body, eyes]).setDepth(DEPTH.world);
      this.watchers.push({ g: c, eyes, x });
    }

    // pressure overlay — the feeling of being looked at
    this.pressure = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.4, h * 1.4)
      .setTint(0x3a4f8f)
      .setAlpha(0.5)
      .setDepth(DEPTH.overlay - 1);

    // the two of them
    this.startX = ww * 0.08;
    this.endX = ww * 0.93;
    this.player = new Player(this, this.startX, h * 0.74);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.05, h * 0.6, ww * 0.9, h * 0.3);
    this.companion = new Companion(this, this.startX - 40, h * 0.78);
    this.companion.setState(this.saves.state.companionBeside ? "beside" : "follow");

    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the far end of the corridor
    const doorGlow = this.add
      .image(this.endX + 40, h * 0.62, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(20, 26)
      .setAlpha(0.3)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: doorGlow, alpha: 0.6, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.interactables.push({
      id: "corridor-end",
      x: this.endX + 30,
      y: h * 0.72,
      r: 90,
      label: "keep going",
      when: () => this.progress > 0.95 && !this.done,
      once: true,
      onUse: () => void this.finish(),
    });

    this.audio.playBed("whispers");
    void this.openBeat();
  }

  private async openBeat() {
    this.p.setFrozen(true);
    await new Promise((r) => this.time.delayedCall(1200, r));
    // the message: paraphrase only — the exact words are not ours to invent
    await this.ui.say([
      { text: "A message came, late in the evening." },
      { text: "She thanked him for everything he had been doing.", kind: "whisper" },
      { text: "Then she asked him to stop. People were beginning to look, and it had become too much." },
      { text: "He answered that other people's opinions should not be the ones deciding.", kind: "whisper" },
      { text: "That what they did, they should do with love — and mean it." },
    ]);
    this.opened = true;
    this.p.setFrozen(false);
    this.ui.setHint("walk together — all the way through");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    if (!this.opened || this.done) return;

    // conviction is measured in distance covered side by side
    const together = this.companion.distanceToPlayer(this.p.pos) < 120;
    const raw = Phaser.Math.Clamp((this.p.pos.x - this.startX) / (this.endX - this.startX), 0, 1);
    if (together) this.progress = Math.max(this.progress, raw);

    // the watching dissolves as they keep going
    const fade = Phaser.Math.Clamp(1 - this.progress * 1.15, 0, 1);
    for (const wt of this.watchers) {
      wt.g.setAlpha(0.15 + fade * 0.85);
      // eyes turn toward them while the pressure lasts
      const dx = this.p.pos.x - wt.x;
      wt.eyes.setX(Phaser.Math.Clamp(dx * 0.02, -5, 5) * fade);
      wt.eyes.setAlpha(0.5 * fade);
    }
    this.pressure.setAlpha(0.12 + fade * 0.4);
    // throttle WebAudio param scheduling — only push meaningful changes
    const lvl = 0.008 + fade * 0.05;
    if (Math.abs(lvl - this.lastWhisperLevel) > 0.004) {
      this.lastWhisperLevel = lvl;
      this.audio.duckBed("whispers", lvl, 0.6);
    }

    // whispers thin out as conviction grows
    this.whisperTimer -= dt;
    if (this.whisperTimer <= 0 && fade > 0.25) {
      this.whisperTimer = 2.2 + Math.random() * 3 + this.progress * 6;
      this.spawnWhisper(fade);
    }

    if (this.progress > 0.95) this.ui.setHint(null);
  }

  private spawnWhisper(fade: number) {
    const words = ["they saw", "again?", "those two", "everyone knows", "look", "together again"];
    const txt = this.add
      .text(
        this.p.pos.x + Phaser.Math.Between(-260, 260),
        this.p.pos.y + Phaser.Math.Between(-120, 60),
        words[Phaser.Math.Between(0, words.length - 1)],
        { fontFamily: "Fraunces, Georgia, serif", fontSize: "13px", color: "#8f9fc9" }
      )
      .setAlpha(0)
      .setDepth(DEPTH.fx)
      .setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      alpha: 0.5 * fade,
      y: txt.y - 22,
      duration: 2200,
      yoyo: true,
      hold: 500,
      ease: "Sine.easeInOut",
      onComplete: () => txt.destroy(),
    });
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    // the world goes quiet around them — they are simply not part of it now
    this.tweens.add({ targets: this.pressure, alpha: 0.05, duration: 2400 });
    for (const wt of this.watchers) {
      this.tweens.add({ targets: wt.g, alpha: 0, duration: 1800 });
    }
    this.audio.duckBed("whispers", 0.002, 2.6);
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 10, 1.14, 1400);
    this.companion.setState("beside");
    this.p.soul.setWarmth(0.4);
    this.companion.soul.setIntensity(1.3);

    await new Promise((r) => this.time.delayedCall(1700, r));
    await this.ui.say([
      { text: "The world could look." },
      { text: "It still did not get to decide." },
    ]);

    this.colors.setStage(3);
    this.saves.setColorStage(3);
    this.saves.setAliveness(28);
    this.keepMemory(MEMORY_IDS.conviction);
    this.saves.checkpoint("SafeBusScene");
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("SafeBusScene");
  }
}
