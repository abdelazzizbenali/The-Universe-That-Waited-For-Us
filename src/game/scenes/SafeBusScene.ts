/* Memory 7 — PROTECTION ON THE CROWDED BUS.
   Standing room only. He positions himself so no one gets too close to her.
   SAFE RADIUS: inside, the world softens; outside, the crowd rises and the
   grade cools. No combat, no enemies — only presence. At the end of the
   journey she rests her head on his shoulder, and the game does not
   interrupt her. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { SafeRadius } from "../systems/companion/SafeRadius";
import { DEPTH, MEMORY_IDS } from "../config";
import { addBusBench, addStudentNpc, type NpcArtKey } from "../art/NpcArt";

interface Passenger {
  c: Phaser.GameObjects.Container | Phaser.GameObjects.Image;
  home: Phaser.Math.Vector2;
  phase: number;
}

const JOURNEY_SECONDS = 26;

export default class SafeBusScene extends BaseScene {
  private companion!: Companion;
  private safe!: SafeRadius;
  private passengers: Passenger[] = [];
  private stops = [0.28, 0.55, 0.8];
  private stopIdx = 0;
  private resting = false;
  private restOffered = false;
  private hh = 0;
  private ww = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);
    const ww = (this.ww = Math.floor(w * 1.35));

    this.skyRect(0x080d22, 0x0d1330, ww, h);
    const g = this.add.graphics().setDepth(DEPTH.back);
    g.fillStyle(0x0e1636, 1);
    g.fillRect(0, 0, ww, h);
    for (let i = 0; i < 5; i++) {
      const wx = ww * 0.06 + i * ww * 0.19;
      g.fillStyle(0x28356a, 1);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.26, 12);
      g.fillStyle(0x8ba7e0, 0.18);
      g.fillRoundedRect(wx, h * 0.1, ww * 0.13, h * 0.05, { tl: 12, tr: 12, bl: 0, br: 0 });
    }
    g.fillStyle(0x0a1028, 1);
    g.fillRect(0, h * 0.38, ww, h * 0.62);
    // handrail
    g.fillStyle(0x1b2551, 1);
    g.fillRect(0, h * 0.44, ww, 5);

    // a full bus of people, breathing and shifting, using the provided NPC art.
    const npcKeys: NpcArtKey[] = ["boy-1", "girl-1", "boy-2", "girl-2", "boy-3", "girl-3", "boy-4", "girl-4"];
    for (let i = 0; i < 26; i++) {
      const x = ww * 0.1 + Math.random() * ww * 0.82;
      const y = h * (0.56 + Math.random() * 0.3);
      const c =
        addStudentNpc(this, npcKeys[i % npcKeys.length], x, y, 60 + (i % 4) * 5, 0.76, i % 2 === 0) ??
        this.add.container(x, y).setDepth(DEPTH.world);
      this.passengers.push({ c, home: new Phaser.Math.Vector2(x, y), phase: Math.random() * 6 });
    }

    this.world.addDust(14, new Phaser.Geom.Rectangle(0, h * 0.35, ww, h * 0.5), 0x8f9fc9, 0.12);

    // Side benches from the provided art ground the crowded bus interior.
    addBusBench(this, ww * 0.24, h * 0.67, 170, 0.85);
    addBusBench(this, ww * 0.66, h * 0.67, 170, 0.75);

    // him — he holds his ground between her and the crowd, so the shelter is
    // a place she chooses to stay in, not something that trails her
    this.companion = new Companion(this, ww * 0.3, h * 0.72);
    this.companion.setState("seated");
    this.companion.maxSpeed = 120;

    this.player = new Player(this, ww * 0.24, h * 0.76);
    this.player.speed = 176;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.06, h * 0.55, ww * 0.86, h * 0.34);
    this.rig.follow(this.player.soul.container, 0.07, 1.05);
    this.rig.setBounds(0, 0, ww, h);

    this.safe = new SafeRadius(this, {
      radius: 96,
      bed: "crowd",
      insideBedLevel: 0.012,
      outsideBedLevel: 0.085,
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.safe.destroy());

    this.audio.playBed("crowd");
    this.ui.setHint("stay close to him");

    // he shifts along the aisle as the bus fills; she follows to stay sheltered
    this.time.addEvent({
      delay: 9000,
      loop: true,
      callback: () => {
        if (this.resting) return;
        if (this.stopIdx >= this.stops.length) return;
        const fx = this.stops[this.stopIdx++];
        this.companion.moveTo(this.ww * fx, this.hh * (0.68 + Math.random() * 0.1));
        this.crowdSurge();
      },
    });
  }

  /** More people board — the bus presses in a little. */
  private crowdSurge() {
    this.audio.softTick();
    for (const ps of this.passengers) {
      const nx = Phaser.Math.Clamp(ps.home.x + Phaser.Math.Between(-40, 40), this.ww * 0.08, this.ww * 0.92);
      const ny = Phaser.Math.Clamp(ps.home.y + Phaser.Math.Between(-16, 16), this.hh * 0.54, this.hh * 0.88);
      ps.home.set(nx, ny);
      this.tweens.add({ targets: ps.c, x: nx, y: ny, duration: 1600, ease: "Sine.easeInOut" });
    }
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    if (this.resting) return;

    this.safe.update(dt, this.p.pos, { x: this.companion.x, y: this.companion.y }, this.audio);

    // sheltered: her aura steadies and warms. exposed: it thins and cools.
    const s = this.safe.shelter;
    this.p.soul.setIntensity(0.8 + s * 0.5);
    this.p.soul.setWarmth(s * 0.55);
    this.companion.soul.setIntensity(0.95 + s * 0.35);

    // people drift; when she is exposed they crowd a little closer
    for (const ps of this.passengers) {
      const sway = Math.sin(t * 0.9 + ps.phase) * 3;
      const press = (1 - s) * 6;
      const dir = ps.home.x < this.p.pos.x ? 1 : -1;
      ps.c.setPosition(ps.home.x + sway + press * dir, ps.home.y + Math.cos(t * 0.7 + ps.phase) * 2);
    }

    // the camera is less comfortable when she is out in the open
    this.cameras.main.setFollowOffset(
      Math.sin(t * 2.1) * this.safe.unease * 7,
      Math.cos(t * 1.7) * this.safe.unease * 5
    );

    // the journey rewards presence, not speed
    if (!this.restOffered && this.safe.secondsInside > JOURNEY_SECONDS) {
      this.restOffered = true;
      this.offerRest();
    }
  }

  private offerRest() {
    this.ui.setHint(null);
    this.interactables.push({
      id: "rest",
      x: this.companion.x,
      y: this.companion.y,
      r: 140,
      label: "rest",
      once: true,
      when: () => !this.resting,
      onUse: () => void this.rest(),
    });
    // keep the prompt anchored to him as he shifts
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        const it = this.interactables.find((i) => i.id === "rest");
        if (it && !this.resting) {
          it.x = this.companion.x;
          it.y = this.companion.y;
        }
      },
    });
    void this.ui.say([{ text: "The whole way, he stood between her and the crowd.", kind: "whisper" }]);
  }

  private async rest() {
    this.resting = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.cameras.main.setFollowOffset(0, 0);

    // she leans in
    await new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.p.pos,
        x: this.companion.x - 26,
        y: this.companion.y + 6,
        duration: 1200,
        ease: "Sine.easeInOut",
        onComplete: () => resolve(),
      });
    });

    this.ui.letterbox(true);
    this.audio.duckBed("crowd", 0.004, 3);
    this.audio.settle();
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 12, 1.22, 1600);
    this.p.soul.setWarmth(0.75);
    this.p.soul.setIntensity(1.25);
    this.companion.soul.setWarmth(0.45);
    this.companion.soul.setIntensity(1.4);

    // the shoulder — and then the game simply waits with her
    await new Promise((r) => this.time.delayedCall(3200, r));
    await this.ui.say([
      { text: "She didn't need the whole world to disappear." },
      { text: "She only needed to know he was there." },
    ]);

    this.saves.setAliveness(34);
    this.keepMemory(MEMORY_IDS.safety);
    this.saves.checkpoint("MorningBusScene");
    await new Promise((r) => this.time.delayedCall(1400, r));
    this.ui.letterbox(false);
    this.transitionTo("MorningBusScene");
  }
}
