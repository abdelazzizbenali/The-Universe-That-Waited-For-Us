/* Memory 12 — TELLING HER ABOUT MY EYES.
   He told her about the condition his eyes carry. She listened. She
   remembered the details. She cried, and she wanted to help — she wanted him
   to see the world the way she sees it.

   Played from HIS side, so she can stand inside it. Her presence steadies
   the world; it never repairs it. That distinction is the whole memory. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { VisionStack } from "../systems/vision/VisionStack";
import { flashConstellation } from "../systems/constellation/Constellation";
import { DEPTH, MEMORY_IDS } from "../config";
import { WORLDS } from "../art/ArtBible";
import { addFog, addRidges, addTerrain } from "../art/environment";

interface Lamp {
  x: number;
  y: number;
  img: Phaser.GameObjects.Image;
}

export default class VisionScene extends BaseScene {
  private her!: Companion;
  private vision!: VisionStack;
  private farStars: Phaser.GameObjects.Image[] = [];
  private lamps: Lamp[] = [];
  private overlookX = 0;
  private arrived = false;
  private opened = false;
  private glare = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 2.4);
    this.overlookX = ww * 0.9;

    // a wide, spacious, uncertain place — depth matters here because the
    // vision system takes distance away from him
    this.skyRect(0x070b1c, 0x101a3e, ww, h);
    addRidges(this, ww, h * 0.56);
    addFog(this, ww, h * 0.5, h * 0.74, 3, WORLDS.vision.fog);

    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x090f28, 1);
    g.fillEllipse(ww * 0.5, h * 1.3, ww * 1.5, h * 0.8);
    // a path of light-stones, the only reliably visible thing
    for (let i = 0; i < 40; i++) {
      const x = ww * 0.05 + (i / 40) * ww * 0.9;
      const y = h * 0.78 + Math.sin(i * 0.6) * 12;
      this.add
        .image(x, y, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0x9fe3c9)
        .setScale(1.1)
        .setAlpha(0.4)
        .setDepth(DEPTH.ground + 1);
    }

    // distant stars — the things that are hardest to hold onto
    for (let i = 0; i < 60; i++) {
      const s = this.add
        .image(Math.random() * ww, Math.random() * h * 0.5, "star")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(Phaser.Math.FloatBetween(0.25, 0.7))
        .setAlpha(0.1)
        .setDepth(DEPTH.sky);
      this.farStars.push(s);
    }

    // lights that are uncomfortable to look into
    for (let i = 0; i < 3; i++) {
      const lx = ww * (0.3 + i * 0.22);
      const ly = h * 0.52;
      const img = this.add
        .image(lx, ly, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xf4e3c0)
        .setScale(9)
        .setAlpha(0.5)
        .setDepth(DEPTH.light);
      this.tweens.add({ targets: img, alpha: 0.75, scale: 11, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.lamps.push({ x: lx, y: ly, img });
    }

    addTerrain(this, ww, h * 0.8, h * 0.12, 0.6);
    this.world.addDust(18, new Phaser.Geom.Rectangle(0, h * 0.3, ww, h * 0.5), 0xbfd9ff, 0.12);

    // him — the player this time
    this.player = new Player(this, ww * 0.06, h * 0.8, "blue");
    this.player.speed = 168;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.04, h * 0.68, ww * 0.92, h * 0.2);
    this.player.setFrozen(true);

    // her — she stays close, and chooses paths that keep her beside him
    this.her = new Companion(this, ww * 0.03, h * 0.83, "hazel");
    this.her.setState("beside");
    this.her.maxSpeed = 190;

    // zoom stays at exactly 1 here: the vision layer maps screen-space 1:1,
    // so any zoom would slide the clarity away from where she actually is
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.vision = new VisionStack(this, { haze: 0.7, clarity: 165, selfClarity: 66 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.vision.destroy());

    this.interactables.push({
      id: "overlook",
      x: this.overlookX,
      y: h * 0.8,
      r: 96,
      label: "stop here",
      once: true,
      when: () => this.opened && !this.arrived,
      onUse: () => void this.theOverlook(),
    });

    this.audio.playBed("vision-space");
    void this.open();
  }

  private async open() {
    await this.ui.card("This one, <em>through his eyes</em>", "he told her what they carry", 3000);
    await this.ui.say([
      { text: "He told her about his eyes. What they do in certain light. What they lose at a distance." },
      { text: "She listened to all of it, and she remembered the details afterwards.", kind: "whisper" },
    ]);
    this.opened = true;
    this.p.setFrozen(false);
    this.ui.setHint("walk the path — she stays close");
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);

    // painful light: proximity to a lamp raises discomfort
    let g = 0;
    for (const l of this.lamps) {
      const d = Phaser.Math.Distance.Between(this.p.pos.x, this.p.pos.y, l.x, l.y);
      g = Math.max(g, Phaser.Math.Clamp(1 - d / 260, 0, 1));
    }
    this.glare = g;

    const cam = this.cameras.main;
    const toScreen = (x: number, y: number) => ({
      x: x - cam.worldView.x,
      y: y - cam.worldView.y,
    });
    const herNear = this.her.distanceToPlayer(this.p.pos) < 240;
    if (!this.arrived) {
      this.vision.update(
        dt,
        toScreen(this.p.pos.x, this.p.pos.y),
        herNear ? toScreen(this.her.x, this.her.y) : null,
        this.glare
      );
    }

    // the far stars come and go with clarity — hers to give, not to fix
    const vis = this.vision.farVisibility();
    for (let i = 0; i < this.farStars.length; i++) {
      const s = this.farStars[i];
      s.setAlpha(0.06 + vis * 0.75 * (0.5 + 0.5 * Math.sin(t * 0.8 + i)));
    }

    // his aura is unsteady in the light; hers warms and holds
    this.p.soul.setIntensity(1 - this.vision.strain * 0.35 + this.vision.steadiness * 0.2);
    this.p.soul.setWarmth(this.vision.steadiness * 0.25);
    this.her.soul.setIntensity(1 + this.vision.steadiness * 0.3);
    this.her.soul.setWarmth(0.35 + this.vision.steadiness * 0.3);

    if (this.arrived) return;
    if (!herNear) this.ui.setHint("she keeps up — let her");
    else if (this.glare > 0.45) this.ui.setHint("the light is hard — keep moving");
    else this.ui.setHint(null);
  }

  private async theOverlook() {
    this.arrived = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.ui.letterbox(true);

    // she comes and stands with him
    this.her.setState("seated");
    this.her.moveTo(this.p.pos.x - 46, this.p.pos.y + 6);
    this.rig.focusPull(this.p.pos.x - 20, this.p.pos.y - 20, 1, 1800);

    await new Promise((r) => this.time.delayedCall(2000, r));
    await this.ui.say([
      { text: "She cried when she understood what he lives with." },
      { text: "Then she started looking for something that could help — because that is what she does." },
    ]);

    // her nearness widens the clarity, and the sky comes partway back
    const seam = this.add
      .image(this.p.pos.x - 22, this.p.pos.y, "aura-our")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.5)
      .setAlpha(0)
      .setDepth(DEPTH.fx);
    this.tweens.add({ targets: seam, alpha: 0.26, scale: 1.1, duration: 3000, ease: "Sine.easeOut" });
    this.audio.sparkle();

    await new Promise((r) => this.time.delayedCall(1600, r));
    await this.ui.say([
      { text: "She promised she would find a way for him to see the world the way she sees it." },
      { text: "She could not change everything his eyes carry." },
      { text: "She made sure he would never have to face it by himself." },
    ]);

    this.saves.setAliveness(62);
    this.keepMemory(MEMORY_IDS.vision);
    this.saves.patch({ finishedArc: true });
    this.saves.checkpoint("VisionScene");

    this.ui.letterbox(false);
    await this.vision.fadeOut(1600);
    await flashConstellation(this, this.saves.state.memories, MEMORY_IDS.vision, 4600);

    await this.ui.card(
      "Winter is <em>coming</em>",
      "the story continues · the sky is filling in",
      3000
    );
    this.saves.checkpoint("ConstantineScene");
    this.transitionTo("ConstantineScene");
  }
}
