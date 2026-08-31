/* Memory 27 — THE SCIENTIFIC TRIP REPORT.
   She had a report to write and she was sick. He helped with part of it; she
   said that was enough and she would finish the rest. Then the teacher
   announced the deadline was that day. She was frightened. She cried.

   He reassured her, finished the work, and she submitted it that night. She
   got an acceptable grade. The reward here is relief, not triumph. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { StressState } from "../systems/companion/StressState";
import { rect } from "../systems/world/colliders";
import { DEPTH, MEMORY_IDS } from "../config";

interface Section {
  id: string;
  label: string;
  img: Phaser.GameObjects.Image;
  slotX: number;
  slotY: number;
}

const SECTIONS = [
  { id: "observations", label: "the observations", color: 0x9fe3c9 },
  { id: "photos", label: "the photographs", color: 0x7fc4ff },
  { id: "conclusion", label: "a conclusion", color: 0xe0b36a },
  { id: "formatting", label: "the formatting", color: 0xf2b8c6 },
];

export default class ReportScene extends BaseScene {
  private her!: Companion;
  private stress!: StressState;
  private placed = 0;
  private docGlow!: Phaser.GameObjects.Image;
  private submitReady = false;
  private done = false;
  private deadlineAnnounced = false;
  private reassured = false;
  private tablePos!: Phaser.Math.Vector2;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.5);

    // her room, late, unwell
    this.skyRect(0x0d1228, 0x1a1f3e, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x141a38, 1);
    g.fillRect(0, 0, ww, h);
    g.fillStyle(0x0f1430, 1);
    g.fillRect(0, h * 0.64, ww, h * 0.36);
    // a window with night behind it
    g.fillStyle(0x1e2a52, 1);
    g.fillRoundedRect(ww * 0.72, h * 0.14, ww * 0.16, h * 0.3, 10);
    g.fillStyle(0x0a0f24, 1);
    g.fillRoundedRect(ww * 0.73, h * 0.15, ww * 0.14, h * 0.28, 8);
    // a desk lamp, the only warm thing in the room
    const lamp = this.add
      .image(ww * 0.55, h * 0.36, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xf4e3c0)
      .setScale(44, 30)
      .setAlpha(0.22)
      .setDepth(DEPTH.light);
    this.tweens.add({ targets: lamp, alpha: 0.32, duration: 2800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.tablePos = new Phaser.Math.Vector2(ww * 0.55, h * 0.6);
    const t = this.tablePos;
    g.fillStyle(0x27336a, 1);
    g.fillRoundedRect(t.x - 105, t.y - 24, 210, 48, 12);
    g.fillStyle(0x2f3d7e, 1);
    g.fillRoundedRect(t.x - 105, t.y - 24, 210, 12, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.colliders.push(rect(t.x, t.y, 220, 56));

    // the document, assembling as they work
    g.fillStyle(0xdfe8ff, 0.14);
    g.fillRoundedRect(t.x - 52, t.y - 56, 104, 46, 4);
    this.docGlow = this.add
      .image(t.x, t.y - 34, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x9fe3c9)
      .setScale(16, 12)
      .setAlpha(0.2)
      .setDepth(DEPTH.light);

    this.world.addDust(14, new Phaser.Geom.Rectangle(0, h * 0.2, ww, h * 0.5), 0xbfd9ff, 0.12);

    // her — unwell, and about to be frightened
    this.her = new Companion(this, t.x - 82, t.y + 34, "hazel");
    this.her.setState("seated");

    this.player = new Player(this, ww * 0.12, h * 0.78, "blue");
    this.player.speed = 158;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.04, h * 0.66, ww * 0.92, h * 0.22);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.stress = new StressState(this, 0.25);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stress.destroy());

    // the missing pieces, scattered around the room
    SECTIONS.forEach((def, i) => {
      const x = ww * (0.16 + i * 0.13);
      const y = h * (0.74 + (i % 2) * 0.08);
      const img = this.add
        .image(x, y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(def.color)
        .setScale(2)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: img,
        alpha: 0.5,
        scale: 2.7,
        duration: 1500 + i * 130,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      const sec: Section = { id: def.id, label: def.label, img, slotX: t.x - 40 + i * 27, slotY: t.y - 34 };
      this.interactables.push({
        id: `sec-${def.id}`,
        x,
        y,
        r: 66,
        label: def.label,
        once: true,
        when: () => this.deadlineAnnounced && !this.done,
        onUse: () => void this.place(sec),
      });
    });

    this.interactables.push({
      id: "submit",
      x: t.x,
      y: t.y + 40,
      r: 70,
      label: "submit it",
      once: true,
      when: () => this.submitReady && !this.done,
      onUse: () => void this.submit(),
    });

    // being near her is always available, and always helps
    this.interactables.push({
      id: "reassure",
      x: t.x - 82,
      y: t.y + 34,
      r: 96,
      label: "tell her it's fine",
      when: () => this.deadlineAnnounced && !this.done && this.stress.value > 0.3,
      onUse: () => {
        this.reassured = true;
        this.stress.ease(0.28);
        this.audio.tone(392, 0.024, 1.6);
        void this.ui.say([
          { text: "He told her it would be finished in time, and meant it.", kind: "whisper" },
        ]);
      },
    });

    this.audio.playBed("night-wind");
    void this.open();
  }

  private async open() {
    this.p.setFrozen(true);
    await this.ui.say([
      { text: "She had a report to write, and she was sick." },
      { text: "He did part of it. She said that was enough — she would finish the rest." },
    ]);
    // the announcement
    this.audio.tone(180, 0.05, 1.6, "ambience", "sawtooth");
    this.stress.set(0.85);
    this.deadlineAnnounced = true;
    await this.ui.say([
      { text: "Then the teacher announced that the deadline was that day." },
      { text: "She was frightened. She cried.", kind: "whisper" },
    ]);
    this.p.setFrozen(false);
    this.ui.setHint("finish it for her — four pieces");
  }

  private async place(sec: Section) {
    this.placed++;
    this.audio.softTick();
    this.tweens.add({
      targets: sec.img,
      x: sec.slotX,
      y: sec.slotY,
      scale: 1.2,
      alpha: 0.9,
      duration: 700,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({ targets: this.docGlow, alpha: 0.2 + this.placed * 0.13, scale: 16 + this.placed * 2, duration: 700 });
    // every piece that gets handled makes her a little less afraid
    this.stress.ease(0.16);

    if (this.placed >= SECTIONS.length) {
      this.submitReady = true;
      this.ui.setHint("it's ready — submit it");
      await this.ui.say([{ text: "It was all there. It just needed sending.", kind: "whisper" }]);
    } else {
      this.ui.setHint(`${SECTIONS.length - this.placed} left`);
    }
  }

  private async submit() {
    this.done = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    // the send
    this.audio.sparkle();
    this.tweens.add({ targets: this.docGlow, alpha: 0.9, scale: 40, duration: 1400, ease: "Sine.easeOut" });
    this.stress.set(0);

    await new Promise((r) => this.time.delayedCall(1400, r));

    // relief: everything slows down and warms up
    this.rig.focusPull(this.tablePos.x - 40, this.tablePos.y, 1.16, 2000);
    this.her.soul.setIntensity(1.4);
    this.her.soul.setWarmth(0.55);
    this.p.soul.setWarmth(0.45);
    this.audio.settle();
    this.audio.startMotif("warm");

    await new Promise((r) => this.time.delayedCall(1800, r));
    await this.ui.say([
      { text: "She submitted it that night." },
      { text: "The grade that came back was fine. That was never really the point.", kind: "whisper" },
      { text: this.reassured ? "The point was that she had not been alone with it." : "The point was that it got done." },
    ]);

    this.saves.setAliveness(97);
    this.keepMemory(MEMORY_IDS.report);
    this.saves.checkpoint("RescueScene");
    this.audio.stopMotif();
    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("RescueScene");
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);
    this.her.soul.lookAt(this.p.pos.x, this.p.pos.y);
    this.stress.update(dt, this.her, this.audio);
  }
}
