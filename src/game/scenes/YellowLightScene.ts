/* Memory 19 — THE YELLOW LIGHT.
   The driver turned the lights off so people could sleep. He could not
   sleep. Near arrival the small yellow lights came on — and she, who had
   been told long before that this light hurt his eyes, remembered, and
   warned him not to look into it.

   Played from his side, using the established VISION SYSTEM. She does not
   fix it. She remembers it. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { VisionStack } from "../systems/vision/VisionStack";
import { DEPTH, MEMORY_IDS } from "../config";

interface YellowLamp {
  x: number;
  y: number;
  img: Phaser.GameObjects.Image;
  on: boolean;
}

export default class YellowLightScene extends BaseScene {
  private her!: Companion;
  private vision!: VisionStack;
  private lamps: YellowLamp[] = [];
  private dark!: Phaser.GameObjects.Image;
  private lightsOn = false;
  private arrived = false;
  private warned = false;
  private journeyT = 0;
  private glare = 0;
  private strainPeak = 0;
  private shaded = false;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 1.9);

    this.skyRect(0x05080f, 0x0a0f1e, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x070b16, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 5; i++) {
      const wx = ww * 0.07 + i * ww * 0.2;
      g.fillStyle(0x0c1226, 1);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.26, 12);
    }
    g.fillStyle(0x05080f, 1);
    g.fillRect(0, h * 0.38, ww, h * 0.62);
    g.fillStyle(0x0b1228, 1);
    g.fillRoundedRect(0, h * 0.56, ww, h * 0.24, 10);

    // the small yellow lights above the passengers, off for now
    for (let i = 0; i < 6; i++) {
      const lx = ww * 0.1 + i * ww * 0.16;
      const img = this.add
        .image(lx, h * 0.3, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xf4e3c0)
        .setScale(0)
        .setDepth(DEPTH.light);
      this.lamps.push({ x: lx, y: h * 0.3, img, on: false });
    }

    // sleeping passengers — shapes in the dark
    for (let i = 0; i < 10; i++) {
      const x = ww * 0.12 + Math.random() * ww * 0.76;
      const y = h * (0.6 + Math.random() * 0.2);
      const body = this.add.graphics();
      body.fillStyle(0x101828, 1);
      body.fillEllipse(0, 0, 28, 44);
      body.fillCircle(0, -26, 10);
      this.add.container(x, y, [body]).setDepth(DEPTH.world);
    }

    this.dark = this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setAlpha(0.5)
      .setDepth(DEPTH.overlay - 3);

    this.player = new Player(this, ww * 0.06, h * 0.72, "blue");
    this.player.speed = 160;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.04, h * 0.62, ww * 0.92, h * 0.22);
    this.player.setFrozen(true);

    this.her = new Companion(this, ww * 0.02, h * 0.75, "hazel");
    this.her.setState("beside");
    this.her.maxSpeed = 180;

    // zoom stays at 1: the vision layer maps screen-space 1:1
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    this.vision = new VisionStack(this, { haze: 0.62, clarity: 170, selfClarity: 60 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.vision.destroy());

    this.interactables.push({
      id: "arrival",
      x: ww * 0.93,
      y: h * 0.72,
      r: 90,
      label: "we're nearly there",
      when: () => this.lightsOn && !this.arrived,
      once: true,
      onUse: () => void this.arrive(),
    });

    this.audio.playBed("bus-engine");
    this.audio.duckBed("bus-engine", 0.014, 0.1);
    void this.open();
  }

  private async open() {
    await this.ui.card("The lights went <em>off</em>", "so that people could sleep", 2400);
    await this.ui.say([
      { text: "The driver turned the lights off so people could sleep." },
      { text: "He could not sleep.", kind: "whisper" },
    ]);
    this.player!.setFrozen(false);
    this.ui.setHint("sit with the dark for a while");
  }

  private turnOnLights() {
    this.lightsOn = true;
    for (const l of this.lamps) {
      l.on = true;
      this.tweens.add({ targets: l.img, scale: 3.2, alpha: 0.9, duration: 900, ease: "Sine.easeOut" });
      this.tweens.add({ targets: l.img, alpha: 0.55, duration: 2200, delay: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    this.audio.tone(220, 0.02, 1.2);
    void this.ui.say([{ text: "Near arrival, the driver switched on the small yellow lights.", kind: "whisper" }]);

    // she remembers — before he has to say anything
    this.time.delayedCall(2600, () => {
      if (this.arrived) return;
      this.warned = true;
      this.her.soul.setIntensity(1.4);
      void this.ui.say([
        { text: "She had remembered what that light does to his eyes." },
        { text: "She told him not to look into it." },
      ]);
    });
  }

  protected tick(dt: number, t: number) {
    this.her.update(dt, t, this.p.pos, this.colors);

    // the journey runs on its own clock; the lights come on near the end
    if (!this.arrived) {
      this.journeyT += dt;
      if (!this.lightsOn && this.journeyT > 26) this.turnOnLights();
    }

    // glare is a function of how close he is to a lit lamp
    let g = 0;
    for (const l of this.lamps) {
      if (!l.on) continue;
      const d = Phaser.Math.Distance.Between(this.p.pos.x, this.p.pos.y, l.x, l.y);
      g = Math.max(g, Phaser.Math.Clamp(1 - d / 300, 0, 1));
    }
    this.glare = g;

    const cam = this.cameras.main;
    const toScreen = (x: number, y: number) => ({ x: x - cam.worldView.x, y: y - cam.worldView.y });
    const herNear = this.her.distanceToPlayer(this.p.pos) < 240;
    this.vision.update(dt, toScreen(this.p.pos.x, this.p.pos.y), herNear ? toScreen(this.her.x, this.her.y) : null, this.glare);
    this.strainPeak = Math.max(this.strainPeak, this.vision.strain);

    // his eyes struggle; her nearness steadies him without curing anything
    this.p.soul.setIntensity(1 - this.vision.strain * 0.4 + this.vision.steadiness * 0.18);
    this.her.soul.setWarmth(0.35 + this.vision.steadiness * 0.35);

    // she shades him when the strain gets high — care, not magic
    // (guarded by a flag: this runs every frame, so the tween must be once)
    if (this.warned && this.vision.strain > 0.55 && !this.shaded) {
      this.shaded = true;
      this.tweens.add({ targets: this.dark, alpha: 0.62, duration: 1200 });
      this.audio.duckAmbience(0.4, 0.8);
    } else if (this.warned && this.vision.strain < 0.35 && this.shaded) {
      this.shaded = false;
      this.tweens.add({ targets: this.dark, alpha: 0.5, duration: 1200 });
      this.audio.duckAmbience(1, 1.2);
    }

    if (this.lightsOn && !this.arrived) {
      this.ui.setHint(this.vision.strain > 0.4 ? "look away — she's right there" : "walk past them");
    }
  }

  private async arrive() {
    this.arrived = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);

    // the light is behind him now, and the clarity comes back on its own
    for (const l of this.lamps) {
      this.tweens.add({ targets: l.img, alpha: 0, scale: 1, duration: 2000 });
      l.on = false;
    }
    this.audio.duckBed("bus-engine", 0.008, 2);
    this.her.moveTo(this.p.pos.x - 44, this.p.pos.y + 4);
    this.rig.focusPull(this.p.pos.x - 20, this.p.pos.y - 16, 1, 1800);

    await new Promise((r) => this.time.delayedCall(2000, r));
    await this.vision.fadeOut(1400);
    await this.ui.say([
      { text: "She could not make the light stop hurting." },
      { text: "She remembered it. She noticed. She said something." },
      { text: "And that changed what the light was like to be inside of." },
    ]);

    this.saves.setAliveness(80);
    this.keepMemory(MEMORY_IDS.yellow);
    this.saves.checkpoint("ProjectScene");
    await new Promise((r) => this.time.delayedCall(800, r));
    this.transitionTo("ProjectScene");
  }
}
