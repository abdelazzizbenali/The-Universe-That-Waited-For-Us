/* Memory 31 — THE LAST THREE DAYS.
   A trilogy, played in one scene as three lit stages.

   DAY ONE   — she spent time with her friends; they stayed close; on the
               return they held hands.
   DAY TWO   — a graduation event, then the two of them coming back in the
               morning, alone.
   DAY THREE — the daytime is NOT remembered, so the game does not show it.
               Only the return: sitting together, hands held one of the last
               times, "I love you" said quietly in her ear, her hand on his
               shoulder, and the answer she could not get out.

   That last beat creates THE UNFINISHED STAR. It stays open. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { HandHoldController } from "../systems/hands/HandHoldController";
import { DEPTH, MEMORY_IDS } from "../config";
import { addBusBench, addStudentNpc } from "../art/NpcArt";

type Day = 1 | 2 | 3;

export default class LastThreeDaysScene extends BaseScene {
  private companion!: Companion;
  private hands: HandHoldController | null = null;
  private day: Day = 1;
  private sky!: Phaser.GameObjects.Graphics;
  private stageG!: Phaser.GameObjects.Graphics;
  private crowd: (Phaser.GameObjects.Container | Phaser.GameObjects.Image)[] = [];
  private festoon: Phaser.GameObjects.Image[] = [];
  private fog!: Phaser.GameObjects.Image;
  private busy = false;
  private speakMeter = 0;
  private speaking = false;
  private speakBar: Phaser.GameObjects.Graphics | null = null;
  private hh = 0;
  private ww = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);
    const ww = (this.ww = Math.floor(w * 1.5));

    this.sky = this.add.graphics().setDepth(DEPTH.sky);
    this.stageG = this.add.graphics().setDepth(DEPTH.back);
    this.fog = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setTint(0x1a2444)
      .setAlpha(0)
      .setDepth(DEPTH.overlay - 2);

    this.companion = new Companion(this, ww * 0.5, h * 0.62);
    this.companion.setState("seated");

    this.player = new Player(this, ww * 0.16, h * 0.74);
    this.player.speed = 155;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.06, h * 0.6, ww * 0.86, h * 0.28);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    void this.runDayOne();
  }

  /* ---------------- shared staging ---------------- */

  private paint(top: number, bottom: number) {
    this.sky.clear();
    this.sky.fillGradientStyle(top, top, bottom, bottom, 1);
    this.sky.fillRect(0, 0, this.ww, this.hh);
  }

  private clearStage() {
    this.stageG.clear();
    for (const c of this.crowd) c.destroy();
    this.crowd = [];
    for (const l of this.festoon) l.destroy();
    this.festoon = [];
    this.interactables = [];
  }

  private busInterior(tintSeat: number) {
    const h = this.hh;
    const ww = this.ww;
    this.stageG.fillStyle(0x0f1738, 1);
    this.stageG.fillRect(0, 0, ww, h);
    for (let i = 0; i < 4; i++) {
      const wx = ww * 0.08 + i * ww * 0.24;
      this.stageG.fillStyle(0x2a3a70, 1);
      this.stageG.fillRoundedRect(wx, h * 0.11, ww * 0.15, h * 0.26, 12);
    }
    this.stageG.fillStyle(0x0b1230, 1);
    this.stageG.fillRect(0, h * 0.42, ww, h * 0.58);
    for (const obj of [
      addBusBench(this, ww * 0.52, h * 0.68, 196, 0.92),
      addStudentNpc(this, "boy-2", ww * 0.22, h * 0.68, 58, 0.35),
      addStudentNpc(this, "girl-3", ww * 0.78, h * 0.68, 58, 0.32, true),
    ]) {
      if (obj) this.crowd.push(obj);
    }
    this.stageG.fillStyle(tintSeat, 0.35);
    this.stageG.fillRoundedRect(ww * 0.44, h * 0.48, 160, h * 0.16, 12);
  }

  /* ---------------- day one ---------------- */

  private async runDayOne() {
    this.day = 1;
    this.clearStage();
    this.paint(0x101a3e, 0x2e3a68);
    const h = this.hh;
    const ww = this.ww;

    // a warm, ordinary daytime with her friends nearby
    this.stageG.fillStyle(0x142046, 1);
    this.stageG.fillRect(0, h * 0.5, ww, h * 0.5);
    this.stageG.fillStyle(0x18264f, 1);
    this.stageG.fillRoundedRect(0, h * 0.66, ww, h * 0.16, 14);
    for (let i = 0; i < 5; i++) {
      const x = ww * (0.3 + i * 0.1);
      const y = h * (0.66 + (i % 2) * 0.06);
      const body = this.add.graphics();
      body.fillStyle([0x22305e, 0x1b2750][i % 2], 1);
      body.fillEllipse(0, 0, 28, 44);
      body.fillCircle(0, -26, 10);
      this.crowd.push(this.add.container(x, y, [body]).setDepth(DEPTH.world));
    }
    this.world.addStars(10, new Phaser.Geom.Rectangle(0, 0, ww, h * 0.3));

    this.p.pos.set(ww * 0.14, h * 0.76);
    this.companion.pos.set(ww * 0.22, h * 0.79);
    this.companion.setState("beside");
    this.p.soul.setWarmth(0.45);

    this.audio.playBed("road-dusk");
    await this.ui.card("Day <em>one</em>", "she was with her friends · he was never far", 2600);
    await this.ui.say([
      { text: "She spent most of that day with her friends." },
      { text: "They stayed close anyway, the way people do when they have stopped needing an excuse.", kind: "whisper" },
    ]);

    // the return: hands
    this.interactables.push({
      id: "d1-return",
      x: ww * 0.86,
      y: h * 0.76,
      r: 90,
      label: "head back with her",
      once: true,
      when: () => this.day === 1 && !this.busy,
      onUse: () => void this.dayOneReturn(),
    });
    this.ui.setHint("walk back together when you're ready");
  }

  private async dayOneReturn() {
    this.busy = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.cameras.main.fadeOut(600, 7, 11, 26);
    await new Promise<void>((r) => this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => r()));

    this.clearStage();
    this.paint(0x0c1230, 0x1c2748);
    this.busInterior(0x1d2a58);
    const h = this.hh;
    const ww = this.ww;
    this.p.pos.set(ww * 0.52, h * 0.68);
    this.companion.pos.set(ww * 0.46, h * 0.56);
    this.companion.setState("seated");
    this.cameras.main.fadeIn(600, 7, 11, 26);
    this.audio.playBed("bus-engine");
    this.audio.duckBed("bus-engine", 0.02, 1);

    await new Promise((r) => this.time.delayedCall(900, r));
    this.hands = new HandHoldController(this, this.ui, this.audio, { contactDistance: 34 });
    this.hands.onContact(() => void this.dayOneHeld());
    this.hands.beginReach();
    this.p.setFrozen(false);
    this.busy = false;
    this.ui.setHint("his hand");
  }

  private async dayOneHeld() {
    this.busy = true;
    this.p.setFrozen(true);
    this.uiLocked = true;
    this.ui.setAction(null);
    this.audio.settle();
    this.p.soul.setWarmth(0.6);
    this.companion.soul.setWarmth(0.45);

    await new Promise((r) => this.time.delayedCall(2000, r));
    await this.ui.say([{ text: "On the way back, they held hands. Nothing about it was new any more.", kind: "whisper" }]);
    this.hands?.fadeOut(700);
    this.hands?.destroy();
    this.hands = null;
    this.uiLocked = false;
    await new Promise((r) => this.time.delayedCall(700, r));
    void this.runDayTwo();
  }

  /* ---------------- day two ---------------- */

  private async runDayTwo() {
    this.day = 2;
    this.busy = true;
    this.cameras.main.fadeOut(600, 7, 11, 26);
    await new Promise<void>((r) => this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => r()));

    this.clearStage();
    this.paint(0x0a0f2a, 0x241c46);
    const h = this.hh;
    const ww = this.ww;
    this.stageG.fillStyle(0x110d2c, 1);
    this.stageG.fillRect(0, h * 0.5, ww, h * 0.5);
    this.stageG.fillStyle(0x1a1440, 1);
    this.stageG.fillRoundedRect(0, h * 0.68, ww, h * 0.16, 14);

    // graduation: lights strung above, a crowd, a stage at the far end
    for (let i = 0; i < 16; i++) {
      const l = this.add
        .image(ww * 0.06 + i * ww * 0.06, h * (0.22 + Math.sin(i * 0.7) * 0.04), "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint([0xf4dca8, 0xf2b8c6, 0x9fe3c9, 0xbfd9ff][i % 4])
        .setScale(2.4)
        .setAlpha(0.6)
        .setDepth(DEPTH.light);
      this.festoon.push(l);
      this.tweens.add({
        targets: l,
        alpha: 0.95,
        scale: 3.2,
        duration: 1200 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    for (let i = 0; i < 12; i++) {
      const x = ww * 0.2 + Math.random() * ww * 0.66;
      const y = h * (0.68 + Math.random() * 0.16);
      const body = this.add.graphics();
      body.fillStyle([0x241c46, 0x2c2352, 0x1d1740][i % 3], 1);
      body.fillEllipse(0, 0, 28, 44);
      body.fillCircle(0, -26, 10);
      this.crowd.push(this.add.container(x, y, [body]).setDepth(DEPTH.world));
    }

    this.p.pos.set(ww * 0.12, h * 0.78);
    this.companion.pos.set(ww * 0.18, h * 0.8);
    this.companion.setState("beside");
    this.cameras.main.fadeIn(600, 7, 11, 26);
    this.audio.playBed("crowd");
    this.audio.duckBed("crowd", 0.045, 1);

    await this.ui.card("Day <em>two</em>", "a graduation, and a morning that belonged to them", 2600);
    await this.ui.say([{ text: "There was a graduation event that evening. Lights, noise, everyone's families." }]);

    this.busy = false;
    this.p.setFrozen(false);
    this.interactables.push({
      id: "d2-return",
      x: ww * 0.9,
      y: h * 0.78,
      r: 92,
      label: "go home together",
      once: true,
      when: () => this.day === 2 && !this.busy,
      onUse: () => void this.dayTwoReturn(),
    });
    this.ui.setHint("stay a while — then head back with her");
  }

  private async dayTwoReturn() {
    this.busy = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.cameras.main.fadeOut(700, 7, 11, 26);
    await new Promise<void>((r) => this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => r()));

    this.clearStage();
    // morning, and only the two of them in it
    this.paint(0x172a4e, 0x4a5a86);
    this.busInterior(0x27366c);
    const h = this.hh;
    const ww = this.ww;
    this.p.pos.set(ww * 0.52, h * 0.68);
    this.companion.pos.set(ww * 0.46, h * 0.56);
    this.companion.setState("seated");
    this.cameras.main.fadeIn(900, 7, 11, 26);
    this.audio.playBed("bus-engine");
    this.audio.duckBed("bus-engine", 0.016, 2);
    this.p.soul.setWarmth(0.55);
    this.companion.soul.setWarmth(0.45);

    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 10, 1.14, 2000);
    await new Promise((r) => this.time.delayedCall(2200, r));
    await this.ui.say([
      { text: "They came back in the morning, just the two of them." },
      { text: "After all that noise, the quiet felt like something they had been given.", kind: "whisper" },
    ]);

    await new Promise((r) => this.time.delayedCall(900, r));
    void this.runDayThree();
  }

  /* ---------------- day three ---------------- */

  private async runDayThree() {
    this.day = 3;
    this.busy = true;
    this.cameras.main.fadeOut(900, 7, 11, 26);
    await new Promise<void>((r) => this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => r()));

    this.clearStage();
    this.paint(0x090d20, 0x141a38);
    this.busInterior(0x18224a);
    const h = this.hh;
    const ww = this.ww;

    this.p.pos.set(ww * 0.53, h * 0.68);
    this.companion.pos.set(ww * 0.46, h * 0.56);
    this.companion.setState("seated");
    this.cameras.main.fadeIn(1200, 7, 11, 26);

    // the daytime is not remembered — so the game refuses to show it
    this.tweens.add({ targets: this.fog, alpha: 0.42, duration: 2400 });

    this.audio.playBed("bus-engine");
    this.audio.duckBed("bus-engine", 0.012, 2);
    this.audio.stopMotif();

    await this.ui.card("Day <em>three</em>", "the daytime is not remembered clearly", 2800);
    await this.ui.say([
      { text: "What that day held before the evening is simply not remembered.", kind: "whisper" },
      { text: "This part is." },
    ]);

    this.tweens.add({ targets: this.fog, alpha: 0.18, duration: 2600 });
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 8, 1.2, 2600);

    await new Promise((r) => this.time.delayedCall(1600, r));
    this.hands = new HandHoldController(this, this.ui, this.audio, { contactDistance: 34 });
    this.hands.onContact(() => void this.dayThreeHeld());
    this.hands.beginReach();
    this.busy = false;
    this.p.setFrozen(false);
    this.ui.setHint("his hand, one of the last times");
  }

  private async dayThreeHeld() {
    this.busy = true;
    this.p.setFrozen(true);
    this.uiLocked = true;
    this.ui.setAction(null);
    this.ui.setHint(null);

    this.audio.duckBed("bus-engine", 0.006, 3);
    this.audio.startIntimacy();
    this.p.soul.setWarmth(0.6);
    this.companion.soul.setIntensity(1.4);

    await new Promise((r) => this.time.delayedCall(2600, r));
    // the known words, said quietly
    await this.ui.say([{ text: "I love you.", kind: "canon", wait: 1200 }]);
    await new Promise((r) => this.time.delayedCall(1200, r));
    await this.ui.say([{ text: "She held his shoulder.", kind: "whisper" }]);

    /* ------------- the word that did not come out ------------- */
    await new Promise((r) => this.time.delayedCall(1400, r));
    // the scene keeps ownership of the button: this prompt must not be
    // cleared by the interactable scanner, and it must not be completable
    this.uiLocked = true;
    this.speaking = true;
    this.ui.setAction("try to answer");
    this.ui.setHint("hold it");
    this.speakBar = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.overlay + 2);
  }

  /** The meter fills — and then, by design, it stops short. */
  private async speakFails() {
    this.speaking = false;
    this.ui.setAction(null);
    this.ui.setHint(null);
    this.uiLocked = true;

    // the bar breaks off. it was never going to complete.
    if (this.speakBar) {
      this.tweens.add({
        targets: this.speakBar,
        alpha: 0,
        duration: 1400,
        onComplete: () => {
          this.speakBar?.destroy();
          this.speakBar = null;
        },
      });
    }
    this.audio.tone(300, 0.016, 0.5, "heart", "sine");

    await new Promise((r) => this.time.delayedCall(1000, r));
    await this.ui.say([
      { text: "…", kind: "whisper", wait: 1400 },
      { text: "She tried. It would not come out.", kind: "whisper" },
      { text: "She was shy, and then she was sad about being shy." },
      { text: "The feeling was there the whole time. Only the sentence was missing." },
    ]);

    this.audio.stopIntimacy();

    // the star is created, and deliberately left open
    this.keepMemory(MEMORY_IDS.lastDays);
    await new Promise((r) => this.time.delayedCall(3600, r));
    this.saves.addMemory(MEMORY_IDS.unfinished);
    // revisiting this day must never re-open what the finale already closed
    if (!this.saves.state.starCompleted) {
      this.saves.patch({ unfinishedStarOpen: true });
      this.ui.toast("✦ a star was left unfinished", 4000);
    }

    this.saves.setAliveness(99);
    this.saves.checkpoint("CallScene");
    await new Promise((r) => this.time.delayedCall(2400, r));
    this.transitionTo("CallScene");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    this.companion.soul.lookAt(this.p.pos.x, this.p.pos.y);
    if (this.hands && !this.busy) {
      this.hands.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, this.p.isMoving);
    }

    // the speak attempt: it fills to about three quarters and gives out
    if (this.speaking && this.speakBar) {
      const holding = this.input2.actionHeld();
      const cap = 0.72;
      if (holding) this.speakMeter = Math.min(cap, this.speakMeter + dt * 0.34);
      else this.speakMeter = Math.max(0, this.speakMeter - dt * 0.5);

      const w = this.scale.width;
      const h = this.scale.height;
      const bw = Math.min(260, w * 0.42);
      const bx = w / 2 - bw / 2;
      const by = h * 0.82;
      this.speakBar.clear();
      this.speakBar.fillStyle(0xeaf2ff, 0.1);
      this.speakBar.fillRoundedRect(bx, by, bw, 4, 2);
      this.speakBar.fillStyle(0xf2b8c6, 0.85);
      this.speakBar.fillRoundedRect(bx, by, bw * this.speakMeter, 4, 2);
      // a faint mark where the words would have been
      this.speakBar.fillStyle(0xeaf2ff, 0.22);
      this.speakBar.fillRect(bx + bw * 0.97, by - 3, 1.5, 10);

      if (this.speakMeter >= cap - 0.001) void this.speakFails();
    }
  }
}
