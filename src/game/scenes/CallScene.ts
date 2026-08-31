/* Memory 32 — THE CALL AFTERWARD.
   They got home and talked on the phone. They went over the day. They
   laughed. They said how happy they were. She was still sad that she had not
   managed to say it out loud.

   Two rooms, one line of light between them. The day ended. They didn't. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { ConnectionThread } from "../systems/connection/ConnectionThread";
import { DEPTH, MEMORY_IDS } from "../config";

interface Topic {
  id: string;
  label: string;
  lines: string[];
  img: Phaser.GameObjects.Image;
  used: boolean;
}

export default class CallScene extends BaseScene {
  private companion!: Companion;
  private thread!: ConnectionThread;
  private topics: Topic[] = [];
  private spoken = 0;
  private done = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.7);

    this.skyRect(0x070b1c, 0x121a3a, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);

    // her room, left
    g.fillStyle(0x141a3c, 1);
    g.fillRoundedRect(ww * 0.04, h * 0.3, ww * 0.34, h * 0.56, 16);
    g.fillStyle(0x1c2450, 1);
    g.fillRoundedRect(ww * 0.06, h * 0.34, ww * 0.3, h * 0.48, 12);
    const herLamp = this.add
      .image(ww * 0.2, h * 0.52, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xe0b36a)
      .setScale(36, 30)
      .setAlpha(0.2)
      .setDepth(DEPTH.light);

    // his room, right
    g.fillStyle(0x111a3e, 1);
    g.fillRoundedRect(ww * 0.62, h * 0.3, ww * 0.34, h * 0.56, 16);
    g.fillStyle(0x18234e, 1);
    g.fillRoundedRect(ww * 0.64, h * 0.34, ww * 0.3, h * 0.48, 12);
    const hisLamp = this.add
      .image(ww * 0.78, h * 0.52, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x7fc4ff)
      .setScale(36, 30)
      .setAlpha(0.18)
      .setDepth(DEPTH.light);

    this.tweens.add({ targets: [herLamp, hisLamp], alpha: "+=0.08", duration: 3000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.world.addStars(24, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.28));
    this.world.addDust(10, new Phaser.Geom.Rectangle(ww * 0.4, h * 0.2, ww * 0.2, h * 0.6), 0x93dcbb, 0.16);

    this.companion = new Companion(this, ww * 0.78, h * 0.66);
    this.companion.setState("seated");
    this.companion.soul.setWarmth(0.45);

    this.player = new Player(this, ww * 0.18, h * 0.68);
    this.player.speed = 130;
    // she can move around her own room; the line reaches across on its own
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.07, h * 0.48, ww * 0.27, h * 0.32);
    this.rig.follow(this.player.soul.container, 0.06, 1);
    this.rig.setBounds(0, 0, ww, h);
    this.cameras.main.centerOn(ww * 0.5, h * 0.55);

    // the line between the rooms
    this.thread = new ConnectionThread(this, { strength: 0.7, motes: 7 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.thread.destroy());

    const defs = [
      {
        id: "day",
        label: "the day",
        lines: [
          "They went back over the whole day, out of order, the way people do.",
          "Small things neither of them would remember on their own.",
        ],
      },
      {
        id: "laugh",
        label: "something funny",
        lines: ["Something set them both laughing, and then neither could stop.", "It was very late by then."],
      },
      {
        id: "happy",
        label: "how happy",
        lines: ["They said out loud how happy they were. Both of them. Plainly."],
      },
      {
        id: "sorry",
        label: "the thing she couldn't say",
        lines: [
          "She was still upset with herself about the words that had not come out.",
          "He told her he had understood her anyway. He had.",
        ],
      },
    ];

    defs.forEach((d, i) => {
      // laid out inside her room, in world space (ww), not screen space
      const x = ww * (0.12 + (i % 2) * 0.11);
      const y = h * (0.56 + Math.floor(i / 2) * 0.13);
      const img = this.add
        .image(x, y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x93dcbb)
        .setScale(2)
        .setAlpha(0.55)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: img,
        alpha: 0.9,
        scale: 2.7,
        duration: 1700 + i * 140,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      const topic: Topic = { id: d.id, label: d.label, lines: d.lines, img, used: false };
      this.topics.push(topic);
      this.interactables.push({
        id: `call-${d.id}`,
        x,
        y,
        r: 62,
        label: d.label,
        once: true,
        when: () => !this.done,
        onUse: () => void this.talk(topic),
      });
    });

    this.audio.playBed("night-wind");
    this.audio.startMotif("warm");
    void this.open();
  }

  private async open() {
    await this.ui.say([
      { text: "They both got home, and then they called each other anyway." },
    ]);
    this.ui.setHint("talk about it");
  }

  private async talk(topic: Topic) {
    topic.used = true;
    this.spoken++;
    this.audio.softTick();
    this.thread.setStrength(0.7 + this.spoken * 0.07);
    this.thread.sendMote(this.p.pos, { x: this.companion.x, y: this.companion.y });
    this.tweens.add({ targets: topic.img, alpha: 0, scale: 5, duration: 800, onComplete: () => topic.img.destroy() });
    await this.ui.say(topic.lines.map((text) => ({ text })));
    if (this.spoken >= this.topics.length && !this.done) void this.finish();
    else this.ui.setHint(`${this.topics.length - this.spoken} left to say`);
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    this.thread.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, 40);
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.cameras.main.zoomTo(this.settings.zoom * 1.06, 2400, "Sine.easeInOut");

    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "The day ended." },
      { text: "They didn't." },
    ]);

    this.keepMemory(MEMORY_IDS.call);
    this.saves.checkpoint("HolidayHubScene");
    this.audio.stopMotif();
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("HolidayHubScene");
  }
}
