/* Memory 33 — THE HOLIDAYS.
   University stopped. They didn't. They played games together and finished a
   lot of them, watched films, stayed up far too late, and kept talking.

   Four small worlds, visited in any order. No titles are named — inventing
   them would be inventing memories. Each is a mood, not a product. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

interface Portal {
  id: string;
  label: string;
  x: number;
  y: number;
  tint: number;
  ring: Phaser.GameObjects.Image;
  core: Phaser.GameObjects.Image;
  lines: string[];
  visited: boolean;
}

export default class HolidayHubScene extends BaseScene {
  private companion!: Companion;
  private portals: Portal[] = [];
  private visited = 0;
  private busy = false;
  private done = false;
  private lanterns: Phaser.GameObjects.Image[] = [];
  private overlay: Phaser.GameObjects.Container | null = null;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.7);

    // a warm night hub — the holidays, seen from inside them
    this.skyRect(0x0a1028, 0x1d2450, ww, h);
    this.world.addStars(48, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.5));

    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0d1434, 1);
    g.fillEllipse(ww * 0.5, h * 1.3, ww * 1.5, h * 0.8);
    g.fillStyle(0x121b40, 1);
    g.fillEllipse(ww * 0.5, h * 0.9, ww * 0.8, h * 0.2);

    this.world.addFlowers([
      { x: ww * 0.14, y: h * 0.88, open: true, mint: true },
      { x: ww * 0.44, y: h * 0.92, open: true },
      { x: ww * 0.78, y: h * 0.88, open: true, mint: true },
    ]);
    this.world.addDust(22, new Phaser.Geom.Rectangle(0, h * 0.3, ww, h * 0.5), 0x9fe3c9, 0.16);
    this.world.addSpirits([{ x: ww * 0.3, y: h * 0.56 }, { x: ww * 0.68, y: h * 0.54 }]);
    this.world.startBirds(11000);

    const defs = [
      {
        id: "games",
        label: "the game world",
        tint: 0x9fe3c9,
        lines: [
          "They played together most nights, and finished more than they meant to.",
          "Mostly it was an excuse to be in the same place while doing something else.",
        ],
      },
      {
        id: "movies",
        label: "the movie world",
        tint: 0xf2b8c6,
        lines: [
          "They watched things together, pausing constantly to talk over them.",
          "Neither of them was ever in a hurry to reach the end.",
        ],
      },
      {
        id: "latenight",
        label: "the late-night world",
        tint: 0x7fc4ff,
        lines: [
          "The sessions ran very late. Long past the point of being sensible.",
          "Sleep kept losing the argument.",
        ],
      },
      {
        id: "talking",
        label: "the conversation world",
        tint: 0xe0b36a,
        lines: [
          "And they talked. About everything, and about nothing worth writing down.",
          "That was the part that kept everything else standing.",
        ],
      },
    ];

    defs.forEach((d, i) => {
      const x = ww * (0.18 + i * 0.21);
      const y = h * (0.6 + (i % 2 ? 0.08 : 0));
      const ring = this.add
        .image(x, y - 30, "seat-glow")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(d.tint)
        .setDisplaySize(150, 150)
        .setAlpha(0.3)
        .setDepth(DEPTH.world);
      const core = this.add
        .image(x, y - 30, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(d.tint)
        .setScale(3)
        .setAlpha(0.6)
        .setDepth(DEPTH.world + 1);
      this.tweens.add({
        targets: [ring, core],
        alpha: "+=0.2",
        duration: 2000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      const portal: Portal = { ...d, x, y, ring, core, visited: false };
      this.portals.push(portal);
      this.interactables.push({
        id: `portal-${d.id}`,
        x,
        y,
        r: 74,
        label: d.label,
        once: true,
        when: () => !this.busy && !this.done,
        onUse: () => void this.enter(portal),
      });
    });

    this.companion = new Companion(this, ww * 0.1, h * 0.76);
    this.companion.setState("beside");

    this.player = new Player(this, ww * 0.08, h * 0.74);
    this.player.speed = 172;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.04, h * 0.62, ww * 0.92, h * 0.26);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.audio.playBed("night-wind");
    this.audio.startMotif("airy");
    void this.open();
  }

  private async open() {
    await this.ui.card("The <em>holidays</em>", "university stopped · they didn't", 2600);
    this.ui.setHint("four places — any order");
  }

  /** Each portal is a short mood piece, not a level. */
  private async enter(portal: Portal) {
    this.busy = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.audio.softTick();

    const w = this.scale.width;
    const h = this.scale.height;
    const veil = this.add
      .rectangle(w / 2, h / 2, w, h, 0x070b1a, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay);
    this.overlay = this.add.container(0, 0, [veil]).setDepth(DEPTH.overlay);
    this.tweens.add({ targets: veil, fillAlpha: 0.88, duration: 900 });

    await new Promise((r) => this.time.delayedCall(900, r));

    // a small vignette drawn in the portal's own color
    const cx = w / 2;
    const cy = h * 0.44;
    const bits: Phaser.GameObjects.GameObject[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = 60 + (i % 3) * 26;
      const m = this.add
        .image(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.55, "mote")
        .setScrollFactor(0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(portal.tint)
        .setScale(0)
        .setAlpha(0.8)
        .setDepth(DEPTH.overlay + 1);
      bits.push(m);
      this.overlay.add(m);
      this.tweens.add({
        targets: m,
        scale: Phaser.Math.FloatBetween(1, 2.4),
        duration: 1400,
        delay: i * 55,
        ease: "Back.easeOut",
      });
      this.tweens.add({
        targets: m,
        alpha: 0.3,
        duration: 1600,
        delay: 1400 + i * 40,
        yoyo: true,
        repeat: -1,
      });
    }
    // two small lights at the centre — both of them, wherever they were
    const pairA = this.add
      .image(cx - 18, cy, "core-hazel")
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.3)
      .setDepth(DEPTH.overlay + 2);
    const pairB = this.add
      .image(cx + 18, cy, "core-blue")
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.3)
      .setDepth(DEPTH.overlay + 2);
    this.overlay.add(pairA);
    this.overlay.add(pairB);
    this.tweens.add({ targets: [pairA, pairB], scale: 0.42, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    await this.ui.say(portal.lines.map((text) => ({ text })));

    // close it
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.overlay,
        alpha: 0,
        duration: 900,
        onComplete: () => {
          this.overlay?.destroy(true);
          this.overlay = null;
          resolve();
        },
      });
    });

    portal.visited = true;
    this.visited++;
    // tint is a discrete swap, never a tween
    portal.core.setTint(0x93dcbb);
    portal.ring.setTint(0x93dcbb);

    // a lantern joins the hub sky for each place they've been
    const lantern = this.add
      .image(portal.x, this.scale.height * 0.3, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x93dcbb)
      .setScale(2)
      .setAlpha(0)
      .setDepth(DEPTH.light);
    this.lanterns.push(lantern);
    this.tweens.add({ targets: lantern, alpha: 0.7, y: this.scale.height * 0.22, duration: 2600, ease: "Sine.easeOut" });

    this.busy = false;
    this.p.setFrozen(false);

    if (this.visited >= this.portals.length) void this.finish();
    else this.ui.setHint(`${this.portals.length - this.visited} left`);
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    for (let i = 0; i < this.lanterns.length; i++) {
      this.lanterns[i].y += Math.sin(t * 0.6 + i) * 0.06;
    }
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 30, 1.12, 2000);
    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.ui.say([
      { text: "The academic part of it ended, and nothing else did." },
      { text: "They just carried on, in smaller rooms, at stranger hours.", kind: "whisper" },
    ]);

    this.saves.setAliveness(100);
    this.keepMemory(MEMORY_IDS.holidays);
    this.saves.patch({ storyComplete: true });
    this.saves.checkpoint("FinaleScene");

    this.audio.stopMotif();
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(900, r));
    await this.ui.card(
      "Every memory is <em>kept</em>",
      "one star is still open · the universe is ready",
      4200
    );
    this.transitionTo("FinaleScene", { fadeMs: 2400 });
  }
}
