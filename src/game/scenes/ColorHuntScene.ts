/* Memory 24 — COLOR HUNTING.
   A trend, done properly: she went looking for BLUE for him, he went looking
   for GREEN for her, and then they traded.

   She chose blue because blue is him. He chose green because green is in her
   eyes. What comes back from the exchange is neither: it is the third color
   they had been making since the beginning. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { collectFragment, exchangeCinematic, spawnFragments, type Fragment } from "../systems/color/ColorExchange";
import { DEPTH, MEMORY_IDS } from "../config";
import { STAR_DENSITY, WORLDS } from "../art/ArtBible";
import {
  addFog,
  addForeground,
  addRidges,
  addTerrain,
  addVignette,
} from "../art/environment";

const BLUE = 0x7fc4ff;
const GREEN = 0x9aab62;
const NEED = 5;

export default class ColorHuntScene extends BaseScene {
  private companion!: Companion;
  private blue: Fragment[] = [];
  private green: Fragment[] = [];
  private blueCount = 0;
  private greenCount = 0;
  private counter!: Phaser.GameObjects.Text;
  private exchanging = false;
  private done = false;
  private gatherTimer = 0;

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = this.scale.height;
    const ww = Math.floor(w * 2);
    const hh = Math.floor(h * 1.5);

    // an open, living place — the world is fuller now than it was
    this.skyRect(0x0d1a3c, 0x1e3a5e, ww, hh);
    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x12233f, 1);
    g.fillEllipse(ww * 0.5, hh * 1.25, ww * 1.6, hh * 0.8);
    g.fillStyle(0x16304a, 1);
    g.fillEllipse(ww * 0.7, hh * 1.3, ww * 1.1, hh * 0.7);

    // an open meadow with real distance — this is a playful, bright memory
    addRidges(this, ww, hh * 0.5);
    addTerrain(this, ww, hh * 0.74, hh * 0.18, 1.3);
    addFog(this, ww, hh * 0.46, hh * 0.68, 2, WORLDS.cosmic.fog);
    addForeground(this, ww, hh * 0.98, 0x0a1a2e);
    addVignette(this, 0x0d1a3c, 0.22);
    this.world.addStars(STAR_DENSITY.moderate, new Phaser.Geom.Rectangle(0, 0, ww, hh * 0.52));
    this.world.addFlowers([
      { x: ww * 0.12, y: hh * 0.8, open: true, mint: true },
      { x: ww * 0.28, y: hh * 0.86, open: true },
      { x: ww * 0.44, y: hh * 0.82, open: true, mint: true },
      { x: ww * 0.6, y: hh * 0.88, open: true },
      { x: ww * 0.78, y: hh * 0.84, open: true, mint: true },
      { x: ww * 0.9, y: hh * 0.9, open: true },
    ]);
    this.world.addDust(26, new Phaser.Geom.Rectangle(0, hh * 0.3, ww, hh * 0.6), 0x9fe3c9, 0.14);
    this.world.addSpirits([
      { x: ww * 0.22, y: hh * 0.62 },
      { x: ww * 0.55, y: hh * 0.58 },
      { x: ww * 0.84, y: hh * 0.64 },
    ]);
    this.world.startBirds(9000);

    // blue things, for him — hers to find
    const blueSpots = [0.14, 0.26, 0.4, 0.52, 0.66, 0.8, 0.92].map((f, i) => ({
      x: ww * f,
      y: hh * (0.62 + (i % 3) * 0.09),
    }));
    this.blue = spawnFragments(this, blueSpots, BLUE, "blue");
    for (const f of this.blue) {
      this.interactables.push({
        id: `blue-${f.id}`,
        x: f.x,
        y: f.y,
        r: 62,
        label: "something blue",
        once: true,
        when: () => !this.exchanging && !this.done,
        onUse: () => {
          collectFragment(this, f, this.p.pos);
          this.blueCount++;
          this.audio.softTick();
          this.p.soul.setWarmth(Math.min(0.5, 0.15 + this.blueCount * 0.06));
          this.updateCounter();
          this.ui.toast(`blue for him · ${this.blueCount}/${NEED}`);
          if (this.blueCount >= NEED && this.greenCount >= NEED) void this.meet();
          else if (this.blueCount >= NEED) this.ui.setHint("he is still looking for green");
        },
      });
    }

    // green things, for her — his to find
    const greenSpots = [0.18, 0.32, 0.46, 0.6, 0.74, 0.88].map((f, i) => ({
      x: ww * f,
      y: hh * (0.5 + (i % 2) * 0.14),
    }));
    this.green = spawnFragments(this, greenSpots, GREEN, "green");

    this.companion = new Companion(this, ww * 0.2, hh * 0.7);
    this.companion.setState("distant");
    this.companion.maxSpeed = 210;

    this.player = new Player(this, ww * 0.1, hh * 0.76);
    this.player.speed = 190;
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.03, hh * 0.44, ww * 0.94, hh * 0.44);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, hh);

    this.counter = this.add
      .text(w / 2, 24, "", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "11px",
        color: "#9fb0d0",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);
    this.updateCounter();

    this.audio.playBed("road-dusk");
    this.audio.startMotif("airy");
    void this.open();
  }

  private updateCounter() {
    this.counter.setText(`blue for him ${this.blueCount}/${NEED}   ·   green for her ${this.greenCount}/${NEED}`);
  }

  private async open() {
    await this.ui.say([
      { text: "There was a trend going around: go and find a color." },
      { text: "She chose blue. He chose green.", kind: "whisper" },
      { text: "Neither of them chose their own." },
    ]);
    this.ui.setHint("find blue for him · he is looking for green for you");
  }

  protected tick(dt: number, t: number) {
    this.companion.update(dt, t, this.p.pos, this.colors);
    if (this.exchanging || this.done) return;

    // he gathers green on his own — that is his half of the game
    this.gatherTimer -= dt;
    if (this.gatherTimer <= 0 && this.greenCount < NEED) {
      const next = this.green.find((f) => !f.taken);
      if (next) {
        const d = Phaser.Math.Distance.Between(this.companion.x, this.companion.y, next.x, next.y);
        if (d < 46) {
          collectFragment(this, next, { x: this.companion.x, y: this.companion.y });
          this.greenCount++;
          this.updateCounter();
          this.audio.softTick();
          this.companion.soul.setIntensity(1.15 + this.greenCount * 0.05);
          this.ui.toast(`green for her · ${this.greenCount}/${NEED}`);
          this.gatherTimer = 0.8;
          if (this.blueCount >= NEED && this.greenCount >= NEED) void this.meet();
        } else {
          this.companion.moveTo(next.x, next.y);
          this.gatherTimer = 0.5;
        }
      }
    }
    void t;
  }

  private async meet() {
    this.exchanging = true;
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.counter.setText("");

    await this.ui.say([
      { text: "They found each other in the middle of it, the way they always did." },
    ]);

    this.companion.moveTo(this.p.pos.x - 60, this.p.pos.y + 6);
    await new Promise((r) => this.time.delayedCall(1600, r));
    this.ui.letterbox(true);
    this.rig.focusPull((this.p.pos.x + this.companion.x) / 2, this.p.pos.y - 20, 1.18, 1800);
    await new Promise((r) => this.time.delayedCall(1200, r));

    await this.ui.say([
      { text: "She gave him her blue." },
      { text: "He gave her his green." },
    ]);

    // the exchange — and the third thing that appears where they meet
    await exchangeCinematic(
      this,
      this.audio,
      this.p.pos,
      { x: this.companion.x, y: this.companion.y },
      this.blueCount,
      this.greenCount
    );

    // permanent visual language: blue is his, green is hers
    this.saves.patch({ blueForHim: true, greenForHer: true, finishedPhase4: true });
    this.p.soul.setWarmth(0.65);
    this.companion.soul.setWarmth(0.5);
    this.companion.soul.setIntensity(1.5);

    await this.ui.say([
      { text: "Neither color was given up. Both were given away." },
      { text: "And where they met, there was something that had not existed before them.", kind: "whisper" },
    ]);

    this.colors.setStage(6);
    this.saves.setColorStage(6);
    this.saves.setAliveness(94);
    this.keepMemory(MEMORY_IDS.colorHunt);
    this.saves.checkpoint("BottleScene");

    this.ui.letterbox(false);
    await new Promise((r) => this.time.delayedCall(900, r));
    await this.ui.card(
      "The world is <em>fuller</em> than it was",
      `${this.saves.state.memories.length} memories · blue for him · green for her`,
      3600
    );
    this.audio.stopMotif();
    this.done = true;
    this.transitionTo("BottleScene");
  }
}
