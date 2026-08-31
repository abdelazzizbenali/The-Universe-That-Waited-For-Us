/* Memory 10 — JEALOUSY, LOVE, RELATIONSHIPS AND MARRIAGE.
   Before it was official, it was already being taken seriously. A quiet
   night walk with four lights to visit: what hurts, what holds, what lasts,
   and what it would mean to choose someone for good.

   Deliberately pace-locked. This chapter is not in a hurry. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { DEPTH, MEMORY_IDS } from "../config";

interface Topic {
  id: string;
  label: string;
  x: number;
  lines: string[];
  glow?: Phaser.GameObjects.Image;
}

export default class CommitmentScene extends BaseScene {
  private companion!: Companion;
  private visited = new Set<string>();
  private topics: Topic[] = [];
  private done = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 2.3);

    this.skyRect(0x080c22, 0x141d44, ww, h);
    this.world.addStars(30, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.5));

    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0a1028, 1);
    g.fillEllipse(ww * 0.5, h * 1.28, ww * 1.4, h * 0.75);
    g.fillStyle(0x0d1533, 1);
    g.fillRoundedRect(0, h * 0.72, ww, h * 0.14, 20);

    this.world.addFlowers([
      { x: ww * 0.14, y: h * 0.9, open: true, mint: true },
      { x: ww * 0.38, y: h * 0.93 },
      { x: ww * 0.61, y: h * 0.89, open: true },
      { x: ww * 0.86, y: h * 0.92, open: true, mint: true },
    ]);
    this.world.addDust(20, new Phaser.Geom.Rectangle(0, h * 0.4, ww, h * 0.5), 0xbfd9ff, 0.14);
    this.world.addSpirits([
      { x: ww * 0.25, y: h * 0.58 },
      { x: ww * 0.72, y: h * 0.55 },
    ]);

    this.topics = [
      {
        id: "jealousy",
        label: "what stung",
        x: ww * 0.2,
        lines: [
          "There was jealousy sometimes. Neither of them pretended otherwise.",
          "It turned out to be easier to talk about than to carry quietly.",
        ],
      },
      {
        id: "trust",
        label: "what held",
        x: ww * 0.4,
        lines: [
          "They talked about what makes people stay — really stay.",
          "Not the beginning of things. The middle of them.",
        ],
      },
      {
        id: "future",
        label: "what comes after",
        x: ww * 0.62,
        lines: [
          "They talked about later. About what they each wanted a life to look like.",
          "Neither of them changed the subject.",
        ],
      },
      {
        id: "marriage",
        label: "what it would mean",
        x: ww * 0.84,
        lines: [
          "He spoke about marriage the way you speak about something you have actually thought about.",
          "She understood that this had stopped being a passing thing.",
        ],
      },
    ];

    for (const tp of this.topics) {
      const y = h * 0.56;
      const post = this.add.graphics().setDepth(DEPTH.world);
      post.fillStyle(0x1a2444, 1);
      post.fillRect(tp.x - 2, y, 4, h * 0.2);
      const glow = this.add
        .image(tp.x, y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xe0b36a)
        .setScale(4)
        .setAlpha(0.35)
        .setDepth(DEPTH.light);
      tp.glow = glow;
      this.tweens.add({ targets: glow, alpha: 0.6, scale: 5, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

      this.interactables.push({
        id: `topic-${tp.id}`,
        x: tp.x,
        y: h * 0.78,
        r: 78,
        label: tp.label,
        once: true,
        when: () => !this.visited.has(tp.id),
        onUse: () => void this.visit(tp),
      });
    }

    this.player = new Player(this, ww * 0.06, h * 0.8);
    // pace-locked: reflection has a speed limit
    this.player.speed = 132;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.04, h * 0.7, ww * 0.92, h * 0.16);
    this.companion = new Companion(this, ww * 0.03, h * 0.83);
    this.companion.setState("beside");
    this.companion.maxSpeed = 140;

    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.audio.playBed("night-wind");
    this.audio.startMotif("warm");
    this.ui.setHint("walk slowly — four things they talked about");
  }

  private async visit(tp: Topic) {
    this.visited.add(tp.id);
    this.p.setFrozen(true);
    this.audio.softTick();
    if (tp.glow) {
      // tint is a discrete swap; only alpha and scale are tweened
      tp.glow.setTint(0x93dcbb);
      this.tweens.add({ targets: tp.glow, alpha: 0.8, scale: 7, duration: 1400 });
    }
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 30, 1.1, 900);
    await this.ui.say(tp.lines.map((text) => ({ text })));
    this.rig.release(1, 900);
    this.p.setFrozen(false);

    if (this.visited.size === this.topics.length && !this.done) void this.finish();
    else this.ui.setHint(`${this.topics.length - this.visited.size} left`);
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 16, 1.18, 1600);
    this.p.soul.setWarmth(0.45);
    this.companion.soul.setWarmth(0.4);
    this.companion.soul.setIntensity(1.3);

    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "None of it was official yet." },
      { text: "All of it was already serious." },
    ]);

    this.colors.setStage(4);
    this.saves.setColorStage(4);
    this.saves.setAliveness(44);
    this.keepMemory(MEMORY_IDS.commitment);
    this.saves.checkpoint("DecemberScene");
    this.audio.stopMotif();
    await new Promise((r) => this.time.delayedCall(900, r));
    this.ui.letterbox(false);
    this.transitionTo("DecemberScene");
  }
}
