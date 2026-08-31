/* Memory 13 — WINTER BREAK AND CONSTANTINE.
   Winter break. She went to Constantine. Two worlds, drawn apart, joined by
   one luminous thread. The thread never disappears: distance changed the
   map, not the direction.

   Mechanic: CONNECTION THREAD + shared moments that travel across it. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { ConnectionThread } from "../systems/connection/ConnectionThread";
import { DEPTH, MEMORY_IDS } from "../config";

export default class ConstantineScene extends BaseScene {
  private companion!: Companion;
  private thread!: ConnectionThread;
  private sent = 0;
  private responded: Phaser.GameObjects.Image[] = [];
  private done = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 2.2);

    /* ---- her side: gold dusk, winter-soft ---- */
    this.skyRect(0x0d1330, 0x2a2a4e, ww, h).setDepth(DEPTH.sky);
    const g = this.add.graphics().setDepth(DEPTH.back);
    // her ground
    g.fillStyle(0x141a3a, 1);
    g.fillRect(0, h * 0.44, ww * 0.46, h * 0.56);
    const herGlow = this.add
      .image(ww * 0.2, h * 0.5, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe0b36a)
      .setScale(60, 22)
      .setAlpha(0.16)
      .setDepth(DEPTH.back);
    herGlow.setDepth(DEPTH.back);

    /* ---- the distance: open sky between them ---- */
    const gap = this.add.graphics().setDepth(DEPTH.back - 1);
    gap.fillStyle(0x070b1a, 1);
    gap.fillRect(ww * 0.46, 0, ww * 0.14, h);

    /* ---- his side: blue night ---- */
    g.fillStyle(0x0b1230, 1);
    g.fillRect(ww * 0.6, h * 0.44, ww * 0.4, h * 0.56);
    const hisGlow = this.add
      .image(ww * 0.78, h * 0.5, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x7fc4ff)
      .setScale(60, 22)
      .setAlpha(0.14)
      .setDepth(DEPTH.back);
    hisGlow.setDepth(DEPTH.back);

    this.world.addStars(34, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.44));
    this.world.addStars(18, new Phaser.Geom.Rectangle(ww * 0.6, 0, ww * 0.4, h * 0.44));
    this.world.addFlowers([
      { x: ww * 0.1, y: h * 0.86, open: true },
      { x: ww * 0.26, y: h * 0.9, mint: true },
      { x: ww * 0.38, y: h * 0.84, open: true },
    ]);
    this.world.addDust(14, new Phaser.Geom.Rectangle(0, h * 0.4, ww * 0.46, h * 0.5), 0xe0b36a, 0.14);
    this.world.addDust(10, new Phaser.Geom.Rectangle(ww * 0.6, h * 0.4, ww * 0.4, h * 0.5), 0x7fc4ff, 0.12);
    this.world.addSpirits([
      { x: ww * 0.32, y: h * 0.62 },
      { x: ww * 0.86, y: h * 0.6 },
    ]);

    /* ---- the two of them, apart ---- */
    this.player = new Player(this, ww * 0.08, h * 0.74);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.6, ww * 0.4, h * 0.3);
    this.companion = new Companion(this, ww * 0.78, h * 0.7);
    this.companion.setState("seated");

    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.thread = new ConnectionThread(this, { strength: 0.3, motes: 6 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.thread.destroy());

    /* ---- shared moments on her side ---- */
    const moments: { id: string; x: number; y: number; label: string; tint: number }[] = [
      { id: "star", x: ww * 0.14, y: h * 0.62, label: "a star you both saw", tint: 0xd6eeff },
      { id: "light", x: ww * 0.24, y: h * 0.78, label: "a message, late", tint: 0x93dcbb },
      { id: "flower", x: ww * 0.33, y: h * 0.68, label: "a flower you'd have shown him", tint: 0xf2b8c6 },
      { id: "bird", x: ww * 0.4, y: h * 0.6, label: "a bird that crossed both skies", tint: 0x9fb0d0 },
    ];

    for (const m of moments) {
      const img = this.add
        .image(m.x, m.y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(m.tint)
        .setScale(2.2)
        .setDepth(DEPTH.fx);
      this.tweens.add({ targets: img, alpha: 0.45, scale: 3, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

      this.interactables.push({
        id: `moment-${m.id}`,
        x: m.x,
        y: m.y,
        r: 70,
        label: m.label,
        once: true,
        when: () => !this.done,
        onUse: () => {
          this.tweens.add({ targets: img, alpha: 0, scale: 5, duration: 700, onComplete: () => img.destroy() });
          void this.share(m.tint);
        },
      });
    }

    this.audio.playBed("vision-space");
    void this.open();
  }

  private async open() {
    await this.ui.say([
      { text: "Winter break came, and with it a city between them." },
      { text: "She went to Constantine. The days went on without the other in them.", kind: "whisper" },
    ]);
    this.ui.setHint("small things can still be shared");
  }

  /** A moment travels the thread and lights something on his side. */
  private async share(tint: number) {
    this.sent++;
    this.audio.softTick();
    const to = { x: this.companion.x + Phaser.Math.Between(-70, 70), y: this.companion.y - 40 };
    this.thread.sendMote(this.p.pos, to, () => {
      const light = this.add
        .image(to.x, to.y, "star")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(tint)
        .setScale(0.2)
        .setDepth(DEPTH.fx);
      this.responded.push(light);
      this.tweens.add({ targets: light, scale: 1.4, alpha: 0.9, duration: 700, ease: "Back.easeOut" });
      this.tweens.add({
        targets: light,
        alpha: 0.45,
        scale: 1.1,
        duration: 1800,
        delay: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.companion.soul.setIntensity(1.2 + this.sent * 0.08);
      this.audio.starIgnite();
    });
    this.thread.setStrength(0.3 + this.sent * 0.18);
    this.p.soul.setWarmth(0.2 + this.sent * 0.08);

    if (this.sent === 2) {
      await this.ui.say([
        { text: "Nothing had to arrive by post.", kind: "whisper" },
        { text: "The thread was carrying things on its own by then." },
      ]);
    }
    if (this.sent >= 4 && !this.done) void this.finish();
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    // the thread always holds, however far apart the two halves are
    this.thread.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, 70);
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    this.rig.focusPull(this.p.pos.x, this.p.pos.y - 20, 1.1, 1600);
    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "Distance changed the map." },
      { text: "It did not change the direction." },
    ]);

    this.saves.setAliveness(66);
    this.keepMemory(MEMORY_IDS.distance);
    this.saves.checkpoint("VideoBusScene");
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("VideoBusScene");
  }
}
