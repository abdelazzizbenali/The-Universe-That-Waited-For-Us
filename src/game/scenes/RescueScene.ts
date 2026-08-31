/* Memory 28 — THE 7:30 AM RESEARCH RESCUE.
   She went to university alone with a research presentation. A teammate's
   part had come back poor. She called him around 07:30 and woke him. He
   opened his computer, rebuilt the work, and sent it roughly five minutes
   before she had to present. He called to tell her it was done.

   She presented confidently and did well. She told her sister, her mother
   and her closest friend. Her mother later bought him a very good bar of
   chocolate. (No brand, no price — that is all that is known.)

   The mission is about being reliable under pressure, not about software. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { StressState } from "../systems/companion/StressState";
import { DEPTH, MEMORY_IDS } from "../config";

interface Task {
  id: string;
  label: string;
  hint: string;
  x: number;
  y: number;
  img: Phaser.GameObjects.Image;
  done: boolean;
}

/** Five minutes, generously counted. */
const DEADLINE = 300;

export default class RescueScene extends BaseScene {
  private stress!: StressState;
  private tasks: Task[] = [];
  private idx = 0;
  private timeLeft = DEADLINE;
  private running = false;
  private done = false;
  private clock!: Phaser.GameObjects.Text;
  private clockSub!: Phaser.GameObjects.Text;
  private urgency!: Phaser.GameObjects.Image;
  private phoneGlow!: Phaser.GameObjects.Image;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;

    // his room, 07:30, curtains still shut
    this.skyRect(0x0e1228, 0x232a4a, w, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x161c3c, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x111634, 1);
    g.fillRect(0, h * 0.66, w, h * 0.34);
    // early light at the edge of the curtain
    g.fillStyle(0x2c3a6e, 1);
    g.fillRoundedRect(w * 0.06, h * 0.12, w * 0.2, h * 0.34, 10);
    const dawn = this.add
      .image(w * 0.16, h * 0.29, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf4dca8)
      .setScale(26, 30)
      .setAlpha(0.14)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: dawn, alpha: 0.26, duration: 4000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // the desk
    g.fillStyle(0x27336a, 1);
    g.fillRoundedRect(w * 0.35, h * 0.5, w * 0.34, h * 0.1, 12);
    g.fillStyle(0x1b2550, 1);
    g.fillRoundedRect(w * 0.44, h * 0.38, w * 0.16, h * 0.13, 6);
    g.fillStyle(0x2b3a70, 1);
    g.fillRoundedRect(w * 0.45, h * 0.39, w * 0.14, h * 0.11, 4);

    this.phoneGlow = this.add
      .image(w * 0.78, h * 0.56, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(4)
      .setAlpha(0.6)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: this.phoneGlow, alpha: 1, scale: 6, duration: 500, yoyo: true, repeat: -1 });

    this.urgency = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.4, h * 1.4)
      .setTint(0x8a5f38)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 2);

    this.clock = this.add
      .text(w / 2, 24, "07:30", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "20px",
        color: "#eaf2ff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);
    this.clockSub = this.add
      .text(w / 2, 48, "she is calling", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "9px",
        color: "#9fb0d0",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    this.player = new Player(this, w * 0.78, h * 0.72, "blue");
    this.player.speed = 190;
    this.player.bounds = new Phaser.Geom.Rectangle(w * 0.1, h * 0.62, w * 0.8, h * 0.24);
    this.player.setFrozen(true);
    this.cameras.main.setBounds(0, 0, w, h);
    this.cameras.main.centerOn(w / 2, h * 0.55);

    this.stress = new StressState(this, 0.7);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stress.destroy());

    // the ordered chain: answer → open → rebuild → fix → send
    const defs = [
      { id: "answer", label: "answer", hint: "she is calling", x: w * 0.78, y: h * 0.62, color: 0x9fe3c9 },
      { id: "open", label: "open the laptop", hint: "open the laptop", x: w * 0.52, y: h * 0.6, color: 0x7fc4ff },
      { id: "rebuild", label: "rebuild it", hint: "rebuild the research", x: w * 0.44, y: h * 0.6, color: 0x7fc4ff },
      { id: "fix", label: "fix the rest", hint: "fix what's left", x: w * 0.6, y: h * 0.6, color: 0xe0b36a },
      { id: "send", label: "send it", hint: "send it to her", x: w * 0.52, y: h * 0.68, color: 0x93dcbb },
    ];
    defs.forEach((d, i) => {
      const img = this.add
        .image(d.x, d.y - 26, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(d.color)
        .setScale(2.2)
        .setAlpha(0)
        .setDepth(DEPTH.fx);
      const task: Task = { id: d.id, label: d.label, hint: d.hint, x: d.x, y: d.y, img, done: false };
      this.tasks.push(task);
      this.interactables.push({
        id: `task-${d.id}`,
        x: d.x,
        y: d.y,
        r: 68,
        label: d.label,
        once: true,
        when: () => this.running && this.idx === i && !this.done,
        onUse: () => void this.doTask(i),
      });
    });

    this.audio.playBed("night-wind");
    void this.open();
  }

  private async open() {
    await this.ui.card("<em>07:30</em>", "the phone is ringing", 2200);
    await this.ui.say([
      { text: "She had gone to university alone. She had a presentation." },
      { text: "Her teammate's part had come back badly done.", kind: "whisper" },
      { text: "She called him at half past seven and woke him up." },
    ]);
    this.running = true;
    this.p.setFrozen(false);
    this.highlight(0);
    this.ui.setHint(this.tasks[0].hint);
  }

  private highlight(i: number) {
    const t = this.tasks[i];
    if (!t) return;
    this.tweens.add({ targets: t.img, alpha: 0.85, scale: 3, duration: 500 });
    this.tweens.add({ targets: t.img, alpha: 0.4, duration: 900, delay: 500, yoyo: true, repeat: -1 });
  }

  private async doTask(i: number) {
    const t = this.tasks[i];
    t.done = true;
    this.idx++;
    this.audio.softTick();
    this.tweens.killTweensOf(t.img);
    this.tweens.add({ targets: t.img, alpha: 0, scale: 5, duration: 500, onComplete: () => t.img.destroy() });
    // every step handled takes a little pressure off
    this.stress.ease(0.14);

    if (t.id === "answer") {
      this.tweens.killTweensOf(this.phoneGlow);
      this.tweens.add({ targets: this.phoneGlow, alpha: 0.2, scale: 3, duration: 600 });
      this.clockSub.setText("five minutes");
      await this.ui.say([{ text: "She explained it fast, and she was close to tears.", kind: "whisper" }]);
    }

    if (this.idx >= this.tasks.length) {
      void this.sent();
      return;
    }
    this.highlight(this.idx);
    this.ui.setHint(this.tasks[this.idx].hint);
  }

  protected tick(dt: number, t: number) {
    this.stress.update(dt, null, this.audio);
    if (!this.running || this.done) return;

    this.timeLeft = Math.max(0, this.timeLeft - dt);
    const m = Math.floor(this.timeLeft / 60);
    const s = Math.floor(this.timeLeft % 60);
    this.clock.setText(`${m}:${String(s).padStart(2, "0")}`);

    // pressure rises visibly, but the mission never fails outright
    const pressure = 1 - this.timeLeft / DEADLINE;
    this.urgency.setAlpha(pressure * 0.3);
    this.clock.setColor(this.timeLeft < 60 ? "#f2b8c6" : "#eaf2ff");
    this.stress.set(Math.max(0.25, 0.3 + pressure * 0.5 - this.idx * 0.1));

    if (this.timeLeft <= 0 && !this.done) {
      // he still finishes. it is just tighter than anyone wanted.
      this.clockSub.setText("cutting it fine");
      this.timeLeft = 20;
    }
    void t;
  }

  private async sent() {
    this.done = true;
    this.running = false;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    // the send, and then everything stops being fast
    this.audio.sparkle();
    const comet = this.add
      .image(this.scale.width * 0.52, this.scale.height * 0.6, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x93dcbb)
      .setScale(3)
      .setDepth(DEPTH.fx);
    this.tweens.add({
      targets: comet,
      x: this.scale.width * 1.1,
      alpha: 0,
      scale: 8,
      duration: 1600,
      ease: "Sine.easeIn",
      onComplete: () => comet.destroy(),
    });

    const left = Math.max(1, Math.floor(this.timeLeft / 60) || 0);
    void left;
    this.clock.setText("in time");
    this.clockSub.setText("");

    await new Promise((r) => this.time.delayedCall(1600, r));

    // the calm afterwards is the actual reward
    this.stress.set(0);
    this.urgency.setAlpha(0);
    this.tweens.add({ targets: this.clock, alpha: 0, duration: 1800 });
    this.audio.settle();
    this.audio.startMotif("warm");
    this.cameras.main.zoomTo(1.08, 3000, "Sine.easeInOut");
    this.p.soul.setWarmth(0.5);
    this.p.soul.setIntensity(1.3);

    await new Promise((r) => this.time.delayedCall(2000, r));
    await this.ui.say([
      { text: "It reached her a few minutes before she had to stand up and speak." },
      { text: "He called to tell her it was done, so she would know for certain.", kind: "whisper" },
      { text: "She presented well. She told her sister, her mother, her closest friend." },
      { text: "Her mother bought him a very good bar of chocolate, some time after.", kind: "whisper" },
      { text: "He had very little time. She needed certainty. He gave it to her." },
    ]);

    this.saves.setAliveness(98);
    this.keepMemory(MEMORY_IDS.rescue);
    this.saves.checkpoint("BouquetScene");
    this.audio.stopMotif();
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(900, r));
    this.transitionTo("BouquetScene");
  }
}
