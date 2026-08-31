/* THE REVEAL — everything the story has been holding onto, released.

   1. the unfinished star finally closes
   2. all 35 stars connect, and the shape underneath becomes visible
   3. the bouquet comes back, and this time the whole world answers
   4. the eyes: blue, hazel, and what the two of them made between them
   5. the day she arrived in the universe

   Almost no player input: this is the one place the game takes over. But it
   never rushes, and it never gets loud. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Soul } from "../entities/Soul";
import { STAR_MAP } from "../systems/constellation/Constellation";
import { DEPTH, HER_NAME } from "../config";

export default class RevealScene extends BaseScene {
  private her!: Soul;
  private him!: Soul;
  private cx = 0;
  private cy = 0;
  private starObjs = new Map<string, Phaser.GameObjects.Image>();
  private lines!: Phaser.GameObjects.Graphics;
  private skyLayer!: Phaser.GameObjects.Container;
  private flowers: Phaser.GameObjects.Image[] = [];
  private ourTint!: Phaser.GameObjects.Image;

  build() {
    // nothing to steer here — the controls step out of the way
    this.ui.setTouchGameplay(false);
    this.uiLocked = true;
    const w = this.scale.width;
    const h = this.scale.height;
    this.cx = w / 2;
    this.cy = h * 0.72;

    this.skyRect(0x070b1c, 0x101a38, w, h);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0a1128, 1);
    g.fillEllipse(w * 0.5, h * 1.35, w * 1.6, h * 0.9);

    this.world.addStars(80, new Phaser.Geom.Rectangle(0, 0, w, h * 0.62));
    this.flowers = this.world.addFlowers(
      Array.from({ length: 16 }, (_, i) => ({
        x: w * (0.05 + i * 0.062),
        y: h * (0.86 + (i % 3) * 0.04),
        open: false,
        mint: i % 3 === 0,
      }))
    );
    this.world.addDust(24, new Phaser.Geom.Rectangle(0, h * 0.3, w, h * 0.6), 0x9fe3c9, 0.16);
    this.world.startBirds(7000);

    this.ourTint = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setTint(0x93dcbb)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.16)
      .setDepth(DEPTH.overlay - 3);

    // the two of them, hands already joined
    this.her = new Soul(this, this.cx - 26, this.cy, "hazel", { scale: 0.9 });
    this.him = new Soul(this, this.cx + 26, this.cy, "blue", { scale: 0.9 });
    this.her.setIntensity(1.4);
    this.him.setIntensity(1.4);
    this.her.setWarmth(0.55);

    const joined = this.add
      .image(this.cx, this.cy + 8, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.7)
      .setAlpha(0.4)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: joined, alpha: 0.55, scale: 0.85, duration: 3600, yoyo: true, repeat: -1 });

    this.skyLayer = this.add.container(0, 0).setDepth(DEPTH.overlay);
    this.lines = this.add.graphics().setDepth(DEPTH.overlay - 1);

    this.audio.playBed("vision-space");
    this.audio.duckAmbience(0.4, 2);
    void this.run();
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.colors);
    this.him.update(dt, t, this.colors);
    this.her.lookAt(this.him.x, this.him.y);
    this.him.lookAt(this.her.x, this.her.y);
  }

  private async run() {
    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.closeTheStar();
    await this.drawConstellation();
    await this.bouquetAgain();
    await this.eyes();
    await this.birthday();
  }

  /* ---------------- 1. the word she couldn't say ---------------- */

  private async closeTheStar() {
    const w = this.scale.width;
    const h = this.scale.height;

    await this.ui.say([{ text: "Something had been left open for a long time.", kind: "whisper" }]);

    // it drifts in from the edge, still unfinished
    const star = this.add
      .image(w * 0.12, h * 0.3, "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf2b8c6)
      .setScale(0.7)
      .setDepth(DEPTH.fx);
    const ring = this.add.graphics().setDepth(DEPTH.fx);
    const drawRing = (gap: number, x: number, y: number) => {
      ring.clear();
      ring.lineStyle(1.4, 0xf2b8c6, 0.85);
      ring.beginPath();
      ring.arc(x, y, 18, Phaser.Math.DegToRad(gap), Phaser.Math.DegToRad(360 - gap * 0.2), false);
      ring.strokePath();
    };
    drawRing(35, star.x, star.y);

    this.audio.tone(300, 0.02, 1.8, "heart", "sine");
    await new Promise((r) => this.time.delayedCall(1400, r));

    // it comes to them
    const target = { x: this.cx, y: this.cy - h * 0.3 };
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: star,
        x: target.x,
        y: target.y,
        duration: 4200,
        ease: "Sine.easeInOut",
        onUpdate: () => drawRing(35, star.x, star.y),
        onComplete: () => resolve(),
      });
    });

    await this.ui.say([
      { text: "She had tried to say it, on the last day, and it had not come out." },
      { text: "The game never claimed otherwise.", kind: "whisper" },
    ]);

    // the gap closes — quietly, and without putting words in her mouth
    await new Promise<void>((resolve) => {
      const state = { gap: 35 };
      this.tweens.add({
        targets: state,
        gap: 0,
        duration: 3200,
        ease: "Sine.easeInOut",
        onUpdate: () => drawRing(state.gap, star.x, star.y),
        onComplete: () => resolve(),
      });
    });

    this.audio.starIgnite();
    star.setTint(0xffffff);
    this.tweens.add({ targets: star, scale: 1.5, duration: 1400, ease: "Back.easeOut" });
    this.tweens.add({ targets: ring, alpha: 0, duration: 1800, onComplete: () => ring.destroy() });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const m = this.add
        .image(star.x, star.y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xf2b8c6)
        .setScale(1)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: m,
        x: star.x + Math.cos(a) * 90,
        y: star.y + Math.sin(a) * 60,
        alpha: 0,
        duration: 1800,
        onComplete: () => m.destroy(),
      });
    }

    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "The love had been there the whole time." },
      { text: "Only the sentence was missing. The sky kept its place anyway." },
    ]);

    this.saves.patch({ starCompleted: true, unfinishedStarOpen: false });
    this.tweens.add({ targets: star, alpha: 0, duration: 1600, onComplete: () => star.destroy() });
  }

  /* ---------------- 2. the whole sky ---------------- */

  private async drawConstellation() {
    const w = this.scale.width;
    const h = this.scale.height;
    const rect = new Phaser.Geom.Rectangle(w * 0.08, h * 0.1, w * 0.84, h * 0.44);
    const unlocked = this.saves.state.memories;

    await this.ui.say([{ text: "Every one of them had left a light up there.", kind: "whisper" }]);

    const ink = { blue: 0x7fc4ff, hazel: 0xe0b36a, our: 0x93dcbb };
    const earned = STAR_MAP.filter((n) => unlocked.includes(n.id));

    // every memory, lighting in the order it happened
    for (let i = 0; i < earned.length; i++) {
      const n = earned[i];
      const x = rect.x + n.x * rect.width;
      const y = rect.y + n.y * rect.height;
      const img = this.add
        .image(x, y, "star")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(ink[n.ink])
        .setScale(0)
        .setDepth(DEPTH.overlay);
      this.skyLayer.add(img);
      this.starObjs.set(n.id, img);
      this.tweens.add({ targets: img, scale: 0.6, alpha: 1, duration: 400, ease: "Back.easeOut" });
      this.tweens.add({
        targets: img,
        scale: 0.45,
        duration: 1800 + i * 40,
        delay: 400,
        yoyo: true,
        repeat: -1,
      });
      if (i % 5 === 0) this.audio.softTick();
      await new Promise((r) => this.time.delayedCall(110, r));
    }

    // the thread of the whole story, drawn in one pass
    this.lines.lineStyle(1, 0x93dcbb, 0.34);
    for (let i = 0; i < earned.length - 1; i++) {
      const a = this.starObjs.get(earned[i].id)!;
      const b = this.starObjs.get(earned[i + 1].id)!;
      const seg = { t: 0 };
      await new Promise<void>((resolve) => {
        this.tweens.add({
          targets: seg,
          t: 1,
          duration: 90,
          onUpdate: () => {
            this.lines.lineBetween(
              a.x,
              a.y,
              Phaser.Math.Linear(a.x, b.x, seg.t),
              Phaser.Math.Linear(a.y, b.y, seg.t)
            );
          },
          onComplete: () => resolve(),
        });
      });
    }

    await new Promise((r) => this.time.delayedCall(1200, r));

    /* the shape underneath — two eyes, a soul inside each,
       and what they made between them. Never hinted at before now. */
    const shape = this.add.graphics().setDepth(DEPTH.overlay + 1).setAlpha(0);
    this.skyLayer.add(shape);
    const eyeY = rect.y + rect.height * 0.5;
    const lx = rect.x + rect.width * 0.3;
    const rx = rect.x + rect.width * 0.7;
    const ew = rect.width * 0.22;
    const eh = rect.height * 0.3;

    const drawEye = (cx: number, tint: number) => {
      shape.lineStyle(1.4, tint, 0.55);
      shape.beginPath();
      shape.moveTo(cx - ew, eyeY);
      shape.lineTo(cx, eyeY - eh);
      shape.lineTo(cx + ew, eyeY);
      shape.lineTo(cx, eyeY + eh);
      shape.closePath();
      shape.strokePath();
      shape.lineStyle(1.2, tint, 0.75);
      shape.strokeCircle(cx, eyeY, eh * 0.34);
    };
    drawEye(lx, 0xe0b36a);
    drawEye(rx, 0x7fc4ff);
    shape.lineStyle(1.2, 0x93dcbb, 0.6);
    shape.lineBetween(lx + eh * 0.34, eyeY, rx - eh * 0.34, eyeY);

    this.audio.sparkle();
    this.tweens.add({ targets: shape, alpha: 1, duration: 3000, ease: "Sine.easeOut" });

    await new Promise((r) => this.time.delayedCall(2600, r));
    await this.ui.say([
      { text: "Two eyes." },
      { text: "A soul inside each of them." },
      { text: "And in the space between, the thing they made together.", kind: "whisper" },
    ]);

    await new Promise((r) => this.time.delayedCall(1400, r));
    this.tweens.add({ targets: this.skyLayer, alpha: 0.28, duration: 2600 });
    this.tweens.add({ targets: this.lines, alpha: 0.28, duration: 2600 });
  }

  /* ---------------- 3. the bouquet, and the whole world ---------------- */

  private async bouquetAgain() {
    const w = this.scale.width;
    const h = this.scale.height;

    await this.ui.say([{ text: "He had something for her. Again.", kind: "whisper" }]);

    const stems = this.add.graphics();
    stems.fillStyle(0x9aab62, 0.9);
    stems.fillRect(-3, 0, 6, 24);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.2;
      stems.fillStyle([0xf2b8c6, 0xf4dca8, 0xeaf2ff, 0x9fe3c9][i % 4], 0.95);
      stems.fillCircle(Math.cos(a) * 15, Math.sin(a) * 15 - 4, 6);
    }
    const glow = this.add
      .image(0, 0, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf2b8c6)
      .setScale(4)
      .setAlpha(0.4);
    const bouquet = this.add.container(this.him.x + 20, this.him.y - 10, [glow, stems]).setDepth(DEPTH.soul + 1);
    bouquet.setScale(0);
    this.tweens.add({ targets: bouquet, scale: 1, duration: 1400, ease: "Back.easeOut" });

    await new Promise((r) => this.time.delayedCall(1800, r));
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: bouquet,
        x: this.her.x - 14,
        y: this.her.y - 8,
        duration: 1800,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    this.audio.sparkle();
    this.her.setIntensity(1.75);
    this.her.setWarmth(0.8);
    this.tweens.add({ targets: glow, alpha: 0.85, scale: 7, duration: 1600, yoyo: true, repeat: -1 });

    await this.ui.say([
      { text: "The first flowers she had ever been given had come from him." },
      { text: "So did these.", kind: "whisper" },
    ]);

    // he kisses her hand — small, and not performed for anyone
    const kiss = this.add
      .image((this.her.x + this.him.x) / 2, this.cy + 16, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf4dca8)
      .setScale(1.4)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: kiss, scale: 4, alpha: 0, duration: 2200, onComplete: () => kiss.destroy() });
    this.audio.tone(392, 0.02, 2);

    await new Promise((r) => this.time.delayedCall(1600, r));

    /* the payoff: last time a few flowers opened. this time, everything. */
    await this.ui.say([{ text: "And this time the whole place answered.", kind: "whisper" }]);

    const sorted = [...this.flowers].sort(
      (a, b) =>
        Phaser.Math.Distance.Between(a.x, a.y, this.cx, this.cy) -
        Phaser.Math.Distance.Between(b.x, b.y, this.cx, this.cy)
    );
    sorted.forEach((f, i) => {
      this.time.delayedCall(i * 160, () => {
        this.world.openFlower(f);
        if (i % 4 === 0) this.audio.softTick();
      });
    });

    // OUR COLOR moves out through everything — without flattening anything
    this.tweens.add({ targets: this.ourTint, alpha: 0.3, duration: 6000, ease: "Sine.easeInOut" });
    for (let i = 0; i < 46; i++) {
      this.time.delayedCall(i * 110, () => {
        const m = this.add
          .image(Math.random() * w, h * Phaser.Math.FloatBetween(0.55, 1), "mote")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint([0x93dcbb, 0xf2b8c6, 0xf4dca8, 0x9fe3c9, 0x7fc4ff][i % 5])
          .setScale(Phaser.Math.FloatBetween(0.6, 1.5))
          .setAlpha(0)
          .setDepth(DEPTH.fx);
        this.tweens.add({ targets: m, alpha: 0.7, duration: 1200 });
        this.tweens.add({
          targets: m,
          y: m.y - Phaser.Math.Between(200, 420),
          x: m.x + Phaser.Math.Between(-60, 60),
          alpha: 0,
          duration: Phaser.Math.Between(6000, 11000),
          onComplete: () => m.destroy(),
        });
      });
    }
    this.audio.playBed("library", 4);

    await new Promise((r) => this.time.delayedCall(5200, r));
    await this.ui.say([
      { text: "Some worlds are not finished when they are made." },
      { text: "They wait, and they finish themselves when the right two souls find each other." },
    ]);
  }

  /* ---------------- 4. the eyes ---------------- */

  private async eyes() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.ui.letterbox(true);
    const veil = this.add
      .rectangle(w / 2, h / 2, w, h, 0x04060f, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 4);
    this.tweens.add({ targets: veil, fillAlpha: 0.96, duration: 2600 });
    await new Promise((r) => this.time.delayedCall(2800, r));

    const eyeY = h * 0.44;
    const drawEye = (cx: number, kind: "blue" | "hazel") => {
      const c = this.add.container(cx, eyeY).setDepth(DEPTH.overlay + 5).setAlpha(0);
      const g = this.add.graphics();
      const rw = Math.min(w * 0.19, 168);
      const rh = rw * 0.52;
      // the eye shape
      g.fillStyle(0xf4f8ff, 0.14);
      g.beginPath();
      g.moveTo(-rw, 0);
      g.lineTo(0, -rh);
      g.lineTo(rw, 0);
      g.lineTo(0, rh);
      g.closePath();
      g.fillPath();
      g.lineStyle(1.4, 0xdfe8ff, 0.5);
      g.strokePath();
      c.add(g);

      const irisR = rh * 0.86;
      if (kind === "blue") {
        // sky-like, calm, luminous
        const iris = this.add.graphics();
        iris.fillStyle(0x3e7cc4, 1);
        iris.fillCircle(0, 0, irisR);
        iris.fillStyle(0x7fc4ff, 0.85);
        iris.fillCircle(0, 0, irisR * 0.78);
        iris.fillStyle(0xd6eeff, 0.55);
        iris.fillCircle(0, -irisR * 0.15, irisR * 0.5);
        c.add(iris);
      } else {
        // hazel: brown, gold and green, all present at once
        const iris = this.add.graphics();
        iris.fillStyle(0x8a5f38, 1);
        iris.fillCircle(0, 0, irisR);
        iris.fillStyle(0x9aab62, 0.65);
        iris.fillCircle(0, irisR * 0.12, irisR * 0.82);
        iris.fillStyle(0xe0b36a, 0.75);
        iris.fillCircle(0, -irisR * 0.1, irisR * 0.6);
        iris.fillStyle(0xf4dca8, 0.5);
        iris.fillCircle(0, -irisR * 0.2, irisR * 0.34);
        c.add(iris);
      }
      const pupil = this.add.graphics();
      pupil.fillStyle(0x05070f, 1);
      pupil.fillCircle(0, 0, irisR * 0.34);
      c.add(pupil);
      return { c, irisR };
    };

    const hazel = drawEye(w * 0.3, "hazel");
    const blue = drawEye(w * 0.7, "blue");

    this.tweens.add({ targets: hazel.c, alpha: 1, duration: 2200 });
    await new Promise((r) => this.time.delayedCall(1600, r));
    this.tweens.add({ targets: blue.c, alpha: 1, duration: 2200 });
    await new Promise((r) => this.time.delayedCall(2600, r));

    // each one carrying a reflection of the other
    const refl = (parent: Phaser.GameObjects.Container, tint: number, r: number) => {
      const m = this.add
        .image(r * 0.42, -r * 0.3, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tint)
        .setScale(0)
        .setAlpha(0.9);
      parent.add(m);
      this.tweens.add({ targets: m, scale: 1.5, duration: 2600, ease: "Sine.easeOut" });
      return m;
    };
    refl(hazel.c, 0x7fc4ff, hazel.irisR);
    refl(blue.c, 0xe0b36a, blue.irisR);
    this.audio.tone(523.25, 0.02, 2.6);

    await new Promise((r) => this.time.delayedCall(2600, r));

    // and between them, the third colour
    const between = this.add
      .image(w / 2, eyeY, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.2)
      .setAlpha(0)
      .setDepth(DEPTH.overlay + 6);
    this.tweens.add({ targets: between, alpha: 0.5, scale: 1.1, duration: 3000, ease: "Sine.easeOut" });

    await new Promise((r) => this.time.delayedCall(2400, r));
    await this.ui.say([
      { text: "Blue stayed blue. Hazel stayed hazel." },
      { text: "They never had to become the same thing." },
      { text: "They only had to find out what they could make together." },
    ]);

    await new Promise((r) => this.time.delayedCall(1600, r));
    this.tweens.add({ targets: [hazel.c, blue.c, between], alpha: 0, duration: 2600 });
    this.tweens.add({ targets: veil, fillAlpha: 0, duration: 3000, delay: 800 });
    await new Promise((r) => this.time.delayedCall(3600, r));
    veil.destroy();
    this.ui.letterbox(false);
  }

  /* ---------------- 5. the day she arrived ---------------- */

  private async birthday() {
    const w = this.scale.width;
    const h = this.scale.height;

    // the world goes quiet again, on purpose
    this.audio.stopAllBeds(3);
    this.audio.duckAmbience(0.3, 2);
    await new Promise((r) => this.time.delayedCall(2600, r));

    // one star left, and it comes to her
    const star = this.add
      .image(w * 0.5, h * 0.18, "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.5)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: star, scale: 0.9, duration: 2000, yoyo: true, repeat: -1 });
    this.audio.starIgnite();

    await new Promise((r) => this.time.delayedCall(2000, r));
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: star,
        y: this.cy - h * 0.22,
        duration: 4200,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    await this.ui.say([{ text: "Today, the universe is celebrating one thing." }]);
    await new Promise((r) => this.time.delayedCall(1400, r));
    await this.ui.say([{ text: "The day you arrived in it." }]);

    await new Promise((r) => this.time.delayedCall(1200, r));
    this.audio.playBed("library", 4);
    await this.ui.card(HER_NAME, "", 3400);
    await this.ui.card("Happy <em>birthday</em>", "", 4000);

    this.saves.patch({ birthdayShown: true });
    this.saves.checkpoint("WishScene");
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("WishScene", { fadeMs: 2000 });
  }
}
