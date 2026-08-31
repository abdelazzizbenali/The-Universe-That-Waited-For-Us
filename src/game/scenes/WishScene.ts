/* THE PRIVATE WISH.
   A quiet place, a single star, and somewhere to put something that is only
   hers. She writes; the words become light; the star takes them and closes.

   Nothing in the game will show the wish again. The vault decides when — and
   the answer is: her next birthday. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Soul } from "../entities/Soul";
import { currentBirthdayYear, wishVault } from "../systems/wish/WishVault";
import { DEPTH } from "../config";

export default class WishScene extends BaseScene {
  private her!: Soul;
  private him!: Soul;
  private star!: Phaser.GameObjects.Image;
  private halo!: Phaser.GameObjects.Image;
  private cx = 0;
  private cy = 0;

  build() {
    // her hands are needed for writing, not for walking
    this.ui.setTouchGameplay(false);
    this.uiLocked = true;
    const w = this.scale.width;
    const h = this.scale.height;
    this.cx = w / 2;
    this.cy = h * 0.78;

    this.skyRect(0x05070f, 0x0c1430, w, h);
    this.world.addStars(90, new Phaser.Geom.Rectangle(0, 0, w, h * 0.7));
    this.world.addDust(18, new Phaser.Geom.Rectangle(0, h * 0.3, w, h * 0.6), 0x9fe3c9, 0.14);

    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x080e22, 1);
    g.fillEllipse(w * 0.5, h * 1.4, w * 1.6, h * 0.9);

    // the two of them, together, off to one side — this part is hers
    this.her = new Soul(this, this.cx - 24, this.cy, "hazel", { scale: 0.62 });
    this.him = new Soul(this, this.cx + 24, this.cy, "blue", { scale: 0.62 });
    this.her.setWarmth(0.6);
    const joined = this.add
      .image(this.cx, this.cy + 4, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.5)
      .setAlpha(0.35)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: joined, alpha: 0.5, scale: 0.62, duration: 4000, yoyo: true, repeat: -1 });

    // the star that will hold it
    this.halo = this.add
      .image(this.cx, h * 0.36, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(10)
      .setAlpha(0.2)
      .setDepth(DEPTH.light);
    this.star = this.add
      .image(this.cx, h * 0.36, "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.4)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: this.star, scale: 1.7, duration: 3200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: this.halo, alpha: 0.34, scale: 13, duration: 3200, yoyo: true, repeat: -1 });

    this.audio.playBed("vision-space");
    this.audio.duckAmbience(0.5, 2);
    void this.run();
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.colors);
    this.him.update(dt, t, this.colors);
    this.her.lookAt(this.him.x, this.him.y);
    this.him.lookAt(this.her.x, this.her.y);
  }

  /** Kept only in memory, only for a retry, and cleared the moment it lands. */
  private pending = "";

  private async run() {
    await new Promise((r) => this.time.delayedCall(2000, r));

    // if she has already left one this year, the star stays shut
    const year = currentBirthdayYear();
    if (this.saves.state.wishSealed && this.saves.state.wishYear === year) {
      await this.ui.say([
        { text: "There is already something of hers inside that star.", kind: "whisper" },
        { text: "It is still waiting. That is what it is for." },
      ]);
      await this.finish();
      return;
    }

    const text = await this.ui.composeWish(this.pending);
    this.pending = text;

    /* ---- the words become light ---- */
    this.audio.sparkle();
    this.ui.wishRising();

    // particles rise from where she was writing and spiral into the star
    const w = this.scale.width;
    const h = this.scale.height;
    for (let i = 0; i < 34; i++) {
      this.time.delayedCall(i * 55, () => {
        const m = this.add
          .image(w * 0.5 + Phaser.Math.Between(-150, 150), h * 0.52, "mote")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint([0x93dcbb, 0xeaf2ff, 0xf4dca8][i % 3])
          .setScale(Phaser.Math.FloatBetween(0.5, 1.1))
          .setAlpha(0)
          .setDepth(DEPTH.fx);
        this.tweens.add({ targets: m, alpha: 0.9, duration: 400 });
        // spiral in
        const spin = { a: Math.random() * Math.PI * 2, r: 150 + Math.random() * 90, t: 0 };
        this.tweens.add({
          targets: spin,
          t: 1,
          duration: 2600,
          ease: "Sine.easeIn",
          onUpdate: () => {
            const ang = spin.a + spin.t * 5;
            const rad = spin.r * (1 - spin.t);
            m.setPosition(this.star.x + Math.cos(ang) * rad, this.star.y + Math.sin(ang) * rad * 0.7);
            m.setAlpha(0.9 * (1 - spin.t * 0.7));
          },
          onComplete: () => m.destroy(),
        });
      });
    }

    // seal it while the animation plays — she never waits on the network
    const sealing = wishVault.seal(text, year);

    await new Promise((r) => this.time.delayedCall(3200, r));

    // the star takes it and closes
    this.audio.starIgnite();
    this.tweens.add({ targets: this.star, scale: 2.6, duration: 700, ease: "Back.easeOut", yoyo: true });
    this.tweens.add({ targets: this.halo, alpha: 0.6, scale: 20, duration: 700, yoyo: true });
    await new Promise((r) => this.time.delayedCall(1400, r));
    this.tweens.add({ targets: this.star, scale: 1.1, duration: 2600, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: this.halo, alpha: 0.16, scale: 9, duration: 2600 });

    const receipt = await sealing;
    this.saves.patch({ wishSealed: receipt.ok, wishYear: receipt.ok ? year : null });

    await new Promise((r) => this.time.delayedCall(1400, r));

    if (!receipt.ok) {
      // never claim it was kept when it wasn't — but stay in the world's voice
      this.audio.tone(300, 0.02, 1.6);
      await this.ui.say([
        { text: "The star could not hold it just now.", kind: "whisper" },
        { text: "Nothing was lost — it simply was not put away. Try again in a moment." },
      ]);
      this.retryWish();
      return;
    }

    this.pending = ""; // it is put away; nothing of it stays in memory here
    await this.ui.say([{ text: "Your wish is safe." }]);
    await new Promise((r) => this.time.delayedCall(900, r));
    await this.ui.say([{ text: "Some things are meant to wait.", kind: "whisper" }]);

    await this.finish();
  }

  /** Re-opens the writing surface after a failed seal. Her words are never
      lost to a network problem — the star simply asks again. */
  private retryWish() {
    this.time.delayedCall(1200, () => void this.run());
  }

  private async finish() {
    await new Promise((r) => this.time.delayedCall(1000, r));
    await this.ui.say([
      { text: "Come back whenever you miss this universe." },
      { text: "It stays open now. It is yours as much as anyone's.", kind: "whisper" },
    ]);
    await this.ui.card("Come back <em>next birthday</em>", "", 4000);

    // the universe stays alive from here on
    this.saves.patch({ freeExplore: true });
    this.saves.checkpoint("FreeExploreScene");
    this.transitionTo("FreeExploreScene", { fadeMs: 2000 });
  }
}
