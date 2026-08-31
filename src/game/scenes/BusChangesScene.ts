/* Memory 16 — BUS CHANGES AND DAILY CHALLENGES.
   The buses changed. Every day became a new small problem: a different
   route, a fuller bus, a longer wait, aching tiredness. What stayed the same
   was the person standing next to it all.

   Structured as four short travel beats rather than one long level — the
   world keeps changing, the companionship does not. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { circle } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";
import { addBusBench, addStudentNpc, type NpcArtKey } from "../art/NpcArt";

interface Beat {
  id: string;
  intro: string[];
  /** 0..1 crowd density for this beat. */
  crowd: number;
  /** Sky colors as [top, bottom]. */
  sky: [number, number];
  label: string;
}

const BEATS: Beat[] = [
  {
    id: "changed",
    label: "a different bus",
    crowd: 0.4,
    sky: [0x0c1330, 0x1b2a55],
    intro: ["The route changed first.", "Then the bus. Then the time."],
  },
  {
    id: "full",
    label: "packed again",
    crowd: 0.9,
    sky: [0x0b1026, 0x241f44],
    intro: ["Some days there was barely room to stand.", "He found room anyway."],
  },
  {
    id: "empty",
    label: "almost empty",
    crowd: 0.08,
    sky: [0x101a3e, 0x3a3a68],
    intro: ["Other days the bus was nearly theirs.", "They talked about everything."],
  },
  {
    id: "arrival",
    label: "arriving, late",
    crowd: 0.25,
    sky: [0x14102a, 0x3c2a52],
    intro: ["Tired, and late, and still not finished talking.", "They would keep going until sleep."],
  },
];

export default class BusChangesScene extends BaseScene {
  private companion!: Companion;
  private beat = 0;
  private beatW = 0;
  private gate!: Phaser.GameObjects.Image;
  private traveling = true;
  private done = false;
  private skyG!: Phaser.GameObjects.Graphics;
  private crowdGroup: (Phaser.GameObjects.Container | Phaser.GameObjects.Image)[] = [];

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = (this.beatW = Math.floor(w * 1.9));

    this.skyG = this.add.graphics().setDepth(DEPTH.sky);
    this.paintSky(BEATS[0].sky, ww, h);

    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x0e1636, 1);
    g.fillRect(0, h * 0.4, ww, h * 0.6);
    g.fillStyle(0x111c40, 1);
    g.fillRoundedRect(0, h * 0.6, ww, h * 0.22, 8);
    for (let i = 0; i < 5; i++) {
      const wx = ww * 0.07 + i * ww * 0.2;
      g.fillStyle(0x2b3a70, 1);
      g.fillRoundedRect(wx, h * 0.12, ww * 0.12, h * 0.24, 12);
    }
    addBusBench(this, ww * 0.28, h * 0.68, 170, 0.75);
    addBusBench(this, ww * 0.58, h * 0.68, 170, 0.75);
    addBusBench(this, ww * 0.82, h * 0.68, 170, 0.75);

    this.player = new Player(this, ww * 0.06, h * 0.72);
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, h * 0.62, ww * 0.94, h * 0.28);
    this.companion = new Companion(this, ww * 0.02, h * 0.75);
    this.companion.setState("beside");

    this.rig.follow(this.player.soul.container, 0.08, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the way forward: a lit doorway at the end of each stretch
    this.gate = this.add
      .image(ww * 0.94, h * 0.66, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(16, 22)
      .setAlpha(0.4)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: this.gate, alpha: 0.7, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.interactables.push({
      id: "next-beat",
      x: ww * 0.94,
      y: h * 0.7,
      r: 84,
      label: "keep going",
      when: () => this.traveling && !this.done,
      onUse: () => void this.nextBeat(),
    });

    this.audio.playBed("bus-engine");
    this.spawnCrowd(BEATS[0].crowd, ww, h);
    this.ui.setHint(BEATS[0].label);
    void this.open();
  }

  private paintSky(sky: [number, number], w: number, h: number) {
    this.skyG.clear();
    this.skyG.fillGradientStyle(sky[0], sky[0], sky[1], sky[1], 1);
    this.skyG.fillRect(0, 0, w, h);
  }

  private spawnCrowd(density: number, ww: number, h: number) {
    for (const c of this.crowdGroup) c.destroy();
    this.crowdGroup = [];
    const count = Math.round(density * 18);
    const npcKeys: NpcArtKey[] = ["boy-1", "girl-1", "boy-2", "girl-2", "boy-3", "girl-3", "boy-4", "girl-4"];
    for (let i = 0; i < count; i++) {
      const x = ww * 0.12 + Math.random() * ww * 0.78;
      const y = h * (0.64 + Math.random() * 0.24);
      const c =
        addStudentNpc(this, npcKeys[(i + this.beat) % npcKeys.length], x, y, 58 + (i % 4) * 5, 0.72, i % 2 === 0) ??
        this.add.container(x, y).setDepth(DEPTH.world);
      this.crowdGroup.push(c);
      // people are soft obstacles — they part, they never fight
      this.colliders.push(circle(x, y, 15));
    }
  }

  private async open() {
    await this.ui.say([
      { text: "Later, the buses changed." },
      { text: "After that, every day was a slightly different problem." },
    ]);
  }

  private async nextBeat() {
    this.traveling = false;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    const beat = BEATS[this.beat];
    await this.ui.say(beat.intro.map((text) => ({ text })));
    this.beat++;

    if (this.beat >= BEATS.length) {
      void this.finish();
      return;
    }

    const next = BEATS[this.beat];
    // the world changes around them: sky, light, crowd
    this.cameras.main.fadeOut(520, 7, 11, 26);
    await new Promise<void>((resolve) => {
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => resolve());
    });
    this.paintSky(next.sky, this.beatW, this.scale.height);
    this.colliders = this.colliders.filter((c) => c.kind !== "circle");
    this.spawnCrowd(next.crowd, this.beatW, this.scale.height);
    this.p.pos.set(this.beatW * 0.06, this.scale.height * 0.72);
    this.companion.pos.set(this.beatW * 0.02, this.scale.height * 0.75);
    this.companion.setState("beside");
    this.cameras.main.fadeIn(520, 7, 11, 26);

    // the connection is the only constant — it gets a little stronger each time
    this.p.soul.setWarmth(0.2 + this.beat * 0.08);
    this.companion.soul.setIntensity(1.1 + this.beat * 0.08);
    this.audio.softTick();

    await new Promise((r) => this.time.delayedCall(600, r));
    this.p.setFrozen(false);
    this.traveling = true;
    this.ui.setHint(next.label);
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    for (let i = 0; i < this.crowdGroup.length; i++) {
      const c = this.crowdGroup[i];
      c.y += Math.sin(t * 1.2 + i) * 0.12;
    }
  }

  private async finish() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.letterbox(true);
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 20, 1.14, 1500);
    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "The world kept changing." },
      { text: "They kept finding each other." },
    ]);
    this.saves.setAliveness(72);
    this.keepMemory(MEMORY_IDS.busChanges);
    this.saves.checkpoint("HandHoldScene");
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(700, r));
    this.transitionTo("HandHoldScene");
  }
}
