/* FREE EXPLORE — the universe, afterwards, permanently.

   Not a menu. A place. The world is laid out as districts she can walk
   between — the library, the road and its buses, the garden, the vision
   field, the colour meadow, the holiday lanterns, and the sky — and the
   memories live where they happened. Explore to remember.

   Everything the story earned stays: flowers open, stars lit, spirits out,
   birds overhead, OUR COLOR in the air, and him walking beside her. */
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";
import { Player } from "../entities/Player";
import { Companion } from "../entities/Companion";
import { buildConstellation } from "../systems/constellation/Constellation";
import { DISCOVERIES } from "../systems/world/Discoveries";
import { MemoryCamera } from "../systems/memory/MemoryCamera";
import { session } from "../systems/session/Session";
import { wishVault, currentBirthdayYear } from "../systems/wish/WishVault";
import { DEPTH, MEMORY_IDS, MEMORY_SCENE, type SceneKey } from "../config";
import { STAR_DENSITY, WORLDS } from "../art/ArtBible";
import {
  addFog,
  addForeground,
  addRidges,
  addTerrain,
  addVignette,
} from "../art/environment";

interface District {
  id: string;
  name: string;
  fx: number;
  /** Memories that belong to this place. */
  memories: string[];
  tint: number;
}

/** Where each memory lives in the world. Explore to remember. */
const DISTRICTS: District[] = [
  {
    id: "campus",
    name: "the courtyard",
    fx: 0.08,
    tint: 0xe0b36a,
    memories: [MEMORY_IDS.look, MEMORY_IDS.side],
  },
  {
    id: "buses",
    name: "the road",
    fx: 0.22,
    tint: 0x7fc4ff,
    memories: [
      MEMORY_IDS.seat,
      MEMORY_IDS.thankyou,
      MEMORY_IDS.safety,
      MEMORY_IDS.morning,
      MEMORY_IDS.goodbye,
      MEMORY_IDS.busChanges,
      MEMORY_IDS.hand,
      MEMORY_IDS.waiting,
      MEMORY_IDS.yellow,
      MEMORY_IDS.naturalHand,
      MEMORY_IDS.video,
      MEMORY_IDS.bottle,
      MEMORY_IDS.borrowed,
      MEMORY_IDS.lastDays,
    ],
  },
  {
    id: "library",
    name: "the library",
    fx: 0.36,
    tint: 0xf4dca8,
    memories: [MEMORY_IDS.library, MEMORY_IDS.exams, MEMORY_IDS.project, MEMORY_IDS.report],
  },
  {
    id: "vision",
    name: "the quiet field",
    fx: 0.5,
    tint: 0x9fb0d0,
    memories: [MEMORY_IDS.vision, MEMORY_IDS.conviction, MEMORY_IDS.commitment, MEMORY_IDS.mutualCare],
  },
  {
    id: "garden",
    name: "the garden",
    fx: 0.63,
    tint: 0xf2b8c6,
    memories: [MEMORY_IDS.bouquet, MEMORY_IDS.december, MEMORY_IDS.escort],
  },
  {
    id: "meadow",
    name: "the colour meadow",
    fx: 0.75,
    tint: 0x9aab62,
    memories: [MEMORY_IDS.colorHunt, MEMORY_IDS.camera, MEMORY_IDS.distance],
  },
  {
    id: "holidays",
    name: "the lanterns",
    fx: 0.87,
    tint: 0x93dcbb,
    memories: [MEMORY_IDS.holidays, MEMORY_IDS.call, MEMORY_IDS.rescue],
  },
];

export default class FreeExploreScene extends BaseScene {
  private him!: Companion;
  private panel: Phaser.GameObjects.Container | null = null;
  private cam: MemoryCamera | null = null;
  private ww = 0;
  private hh = 0;
  private found = new Set<string>();

  private get p() {
    return this.player!;
  }

  build() {
    const w = this.scale.width;
    const h = (this.hh = this.scale.height);
    const ww = (this.ww = Math.floor(w * 5));
    const rm = this.settings.reducedMotion;

    session.endReplay(); // arriving here always ends a replay cleanly

    /* ---------------- the permanent sky ---------------- */
    this.skyRect(0x0a1228, 0x1e3050, ww, h);
    // the world she earned: layered distance, terrain, warm haze
    addRidges(this, ww, h * 0.54);
    addFog(this, ww, h * 0.48, h * 0.72, rm ? 1 : 3, WORLDS.finalAwake.fog);
    this.world.addStars(
      this.settings.particles(STAR_DENSITY.full),
      new Phaser.Geom.Rectangle(0, 0, ww, h * 0.62)
    );

    const g = this.add.graphics().setDepth(DEPTH.ground);
    g.fillStyle(0x0d1834, 1);
    g.fillEllipse(ww * 0.5, h * 1.3, ww * 1.3, h * 0.86);
    g.fillStyle(0x122240, 1);
    g.fillRoundedRect(0, h * 0.74, ww, h * 0.13, 22);

    // flowers, all open, the way she left them
    const flowerPts = Array.from({ length: 52 }, (_, i) => ({
      x: ww * (0.02 + i * 0.019),
      y: h * (0.83 + (i % 3) * 0.045),
      open: true,
      mint: i % 3 === 0,
    }));
    this.world.addFlowers(flowerPts);
    addTerrain(this, ww, h * 0.78, h * 0.14, 1.2);
    addForeground(this, ww, h * 0.97, 0x08122a);
    addVignette(this, 0x0a1228, 0.24);
    this.world.addDust(this.settings.particles(34), new Phaser.Geom.Rectangle(0, h * 0.3, ww, h * 0.6), 0x9fe3c9, 0.16);
    this.world.addSpirits(
      DISTRICTS.map((d) => ({ x: ww * d.fx + 60, y: h * (0.56 + (DISTRICTS.indexOf(d) % 2) * 0.06) }))
    );
    if (!rm) this.world.startBirds(6500);

    // OUR COLOR is simply part of the air now
    this.add
      .image(w / 2, h / 2, "vignette")
      .setScrollFactor(0)
      .setDisplaySize(w * 1.5, h * 1.5)
      .setTint(0x93dcbb)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.13)
      .setDepth(DEPTH.overlay - 3);

    this.buildDistricts(g);
    this.buildDiscoveries();
    this.buildLandmarks();

    /* ---------------- the two of them ---------------- */
    this.him = new Companion(this, ww * 0.04, h * 0.8);
    this.him.setState("beside");
    this.him.soul.setWarmth(0.45);

    this.player = new Player(this, ww * 0.06, h * 0.78);
    this.player.speed = 196; // the world is wide; walking it should feel easy
    this.player.bounds = new Phaser.Geom.Rectangle(ww * 0.02, h * 0.7, ww * 0.96, h * 0.18);
    this.rig.follow(this.player.soul.container, 0.07, 1);
    this.rig.setBounds(0, 0, ww, h);

    // the camera stays hers forever
    if (this.saves.state.cameraUnlocked) {
      this.cam = new MemoryCamera(this, this.ui, this.audio, {
        onCapture: (t) => {
          this.saves.addFrame(`frame-${t.id}`);
          this.ui.toast(`◈ ${t.label}`);
        },
        onToggle: (active) => {
          this.uiLocked = active;
          if (!active) this.ui.setHint(null);
        },
      });
      const shot = DISCOVERIES.find((d) => d.cameraOnly)!;
      this.cam.addTargets([
        { id: shot.id, x: ww * shot.fx, y: h * shot.fy, label: shot.label },
      ]);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cam?.destroy());

      // the camera lives in the world too, near where she learned to use it
      const lens = this.add
        .image(ww * 0.75, h * 0.66, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xeaf2ff)
        .setScale(3.4)
        .setAlpha(0.4)
        .setDepth(DEPTH.light);
      if (!rm) {
        this.tweens.add({ targets: lens, alpha: 0.7, duration: 2400, yoyo: true, repeat: -1 });
      }
      this.interactables.push({
        id: "camera-toggle",
        x: ww * 0.75,
        y: h * 0.78,
        r: 64,
        label: "the camera",
        onUse: () => this.cam?.toggle(),
      });
    }

    this.audio.playBed("library");
    this.audio.startMotif("warm");
    void this.open();
  }

  /* ---------------- districts: memories where they happened ---------------- */

  private buildDistricts(g: Phaser.GameObjects.Graphics) {
    const ww = this.ww;
    const h = this.hh;
    const unlocked = this.saves.state.memories;

    for (const d of DISTRICTS) {
      const x = ww * d.fx;
      // a soft landmark shape for each place
      g.fillStyle(d.tint, 0.06);
      g.fillRoundedRect(x - 130, h * 0.36, 260, h * 0.34, 18);
      const glow = this.add
        .image(x, h * 0.55, "mote")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(d.tint)
        .setScale(26, 22)
        .setAlpha(0.14)
        .setDepth(DEPTH.light);
      if (!this.settings.reducedMotion) {
        this.tweens.add({ targets: glow, alpha: 0.24, duration: 3400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      this.add
        .text(x, h * 0.34, d.name, {
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "9px",
          color: "#5c6c8f",
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.light);

      // the memories that belong here, standing as small lights
      const mine = d.memories.filter((m) => unlocked.includes(m) && MEMORY_SCENE[m]);
      mine.forEach((mid, i) => {
        const cols = Math.min(mine.length, 5);
        const row = Math.floor(i / cols);
        const col = i % cols;
        const mx = x - (cols - 1) * 26 + col * 52;
        const my = h * (0.46 + row * 0.07);
        const star = this.add
          .image(mx, my, "star")
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(d.tint)
          .setScale(0.45)
          .setDepth(DEPTH.fx);
        if (!this.settings.reducedMotion) {
          this.tweens.add({
            targets: star,
            scale: 0.62,
            duration: 2000 + i * 130,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
        this.interactables.push({
          id: `mem-${mid}`,
          x: mx,
          y: h * 0.78,
          r: 42,
          label: this.saves.memoryLabel(mid).toLowerCase(),
          onUse: () => void this.replay(mid, MEMORY_SCENE[mid]),
        });
      });
    }
  }

  /* ---------------- the seven quiet things ---------------- */

  private buildDiscoveries() {
    const ww = this.ww;
    const h = this.hh;
    const storyDone = this.saves.state.storyComplete;
    this.found = new Set(this.saves.state.collectibles);

    for (const d of DISCOVERIES) {
      if (d.cameraOnly) continue; // that one belongs to the viewfinder
      if (d.needsStory && !storyDone) continue;

      const x = ww * d.fx;
      const y = h * d.fy;
      const already = this.found.has(d.id);
      const img = this.add
        .image(x, y, d.id === "the-moon" ? "core-blue" : "star")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(d.tint)
        .setScale(d.id === "the-moon" ? 0.8 : 0.5)
        .setAlpha(already ? 0.9 : 0.42)
        .setDepth(DEPTH.fx);
      if (!this.settings.reducedMotion) {
        this.tweens.add({
          targets: img,
          alpha: already ? 1 : 0.7,
          duration: 2600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      this.interactables.push({
        id: `disc-${d.id}`,
        x,
        // reachable from the walkable band, whatever height it floats at
        y: h * 0.78,
        r: 62,
        label: d.label,
        onUse: () => {
          const isNew = !this.found.has(d.id);
          if (isNew) {
            this.found.add(d.id);
            this.saves.addCollectible(d.id);
            this.audio.starIgnite();
            this.tweens.add({ targets: img, alpha: 1, scale: img.scale * 1.5, duration: 900, yoyo: true });
            this.ui.toast(`✦ found — ${d.label}`);
          } else {
            this.audio.softTick();
          }
          void this.ui.say(d.lines.map((text) => ({ text, kind: "whisper" as const })));
        },
      });
    }
  }

  /* ---------------- sky, wish star, final world, empty place ---------------- */

  private buildLandmarks() {
    const ww = this.ww;
    const h = this.hh;

    // the sky, always readable
    const skyStone = this.add
      .image(ww * 0.44, h * 0.66, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xd6eeff)
      .setScale(5)
      .setAlpha(0.5)
      .setDepth(DEPTH.light);
    if (!this.settings.reducedMotion) {
      this.tweens.add({ targets: skyStone, alpha: 0.85, scale: 6.5, duration: 2600, yoyo: true, repeat: -1 });
    }
    this.interactables.push({
      id: "sky",
      x: ww * 0.44,
      y: h * 0.78,
      r: 70,
      label: "the sky",
      onUse: () => this.showSky(),
    });

    // her wish, kept in a star that will not open early
    const wishStar = this.add
      .image(ww * 0.57, h * 0.24, "star")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.2)
      .setDepth(DEPTH.fx);
    if (!this.settings.reducedMotion) {
      this.tweens.add({ targets: wishStar, scale: 1.6, duration: 3600, yoyo: true, repeat: -1 });
    }
    this.interactables.push({
      id: "wish-star",
      x: ww * 0.57,
      y: h * 0.78,
      r: 70,
      label: "her star",
      onUse: () => void this.touchWishStar(),
    });

    // the way back to where they met — walkable, never forced
    const gate = this.add
      .image(ww * 0.97, h * 0.6, "shaft")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.3)
      .setScale(1, 1.1)
      .setDepth(DEPTH.light);
    if (!this.settings.reducedMotion) {
      this.tweens.add({ targets: gate, alpha: 0.55, duration: 3000, yoyo: true, repeat: -1 });
    }
    this.interactables.push({
      id: "final-world",
      x: ww * 0.97,
      y: h * 0.78,
      r: 84,
      label: "where they met",
      onUse: () => void this.replay(MEMORY_IDS.reunion, "FinaleScene"),
    });

    // and the place where nothing has happened yet
    const empty = this.add
      .image(ww * 0.685, h * 0.62, "mote")
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xeaf2ff)
      .setScale(7)
      .setAlpha(0.09)
      .setDepth(DEPTH.light);
    if (!this.settings.reducedMotion) {
      this.tweens.add({ targets: empty, alpha: 0.2, duration: 4600, yoyo: true, repeat: -1 });
    }
    this.interactables.push({
      id: "empty",
      x: ww * 0.685,
      y: h * 0.78,
      r: 70,
      label: "a quiet clearing",
      onUse: () => {
        this.audio.softTick();
        void this.ui.say([
          { text: "Nothing has happened here yet.", kind: "whisper" },
          { text: "That is not a mistake. There is still room." },
        ]);
      },
    });
  }

  /* ---------------- behaviour ---------------- */

  private async open() {
    if (!this.saves.state.freeExplore) this.saves.patch({ freeExplore: true });
    await this.ui.say([
      { text: "The universe stayed exactly as they left it.", kind: "whisper" },
      { text: "Open, and in no hurry at all." },
    ]);
    this.ui.setHint("wander · every place remembers something");
  }

  /** Enters a memory, with a soft landing on the way in. */
  private async replay(memoryId: string, scene: SceneKey) {
    this.p.setFrozen(true);
    this.ui.setHint(null);
    this.audio.stopMotif();
    session.beginReplay(memoryId, "FreeExploreScene");
    await this.ui.card("", this.saves.memoryLabel(memoryId).toLowerCase(), 2000);
    this.cameras.main.fadeOut(900, 7, 11, 26);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(scene);
    });
  }

  private showSky() {
    if (this.panel) return;
    const w = this.scale.width;
    const h = this.scale.height;
    const bg = this.add
      .rectangle(w / 2, h / 2, w, h, 0x070b1a, 0.93)
      .setScrollFactor(0)
      .setDepth(80)
      .setInteractive();
    const c = buildConstellation(this, this.saves.state.memories, {
      rect: new Phaser.Geom.Rectangle(w * 0.06, h * 0.13, w * 0.88, h * 0.54),
      labels: false,
      animate: !this.settings.reducedMotion,
      starCompleted: this.saves.state.starCompleted,
      depth: 82,
    });
    const found = this.saves.state.collectibles.length;
    const cap = this.add
      .text(
        w / 2,
        h * 0.76,
        `${this.saves.state.memories.length} memories · ${found} quiet things found · every one of them real`,
        { fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "#5c6c8f" }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(83);
    const close = this.add
      .text(w / 2, h * 0.86, "close", {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "11px",
        color: "#93dcbb",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(83)
      .setInteractive({ useHandCursor: true });

    const panel = this.add.container(0, 0, [bg, c, cap, close]).setDepth(80);
    this.panel = panel;
    close.on("pointerdown", (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.audio.blip();
      panel.destroy(true);
      this.panel = null;
    });
    bg.on("pointerdown", (p: Phaser.Input.Pointer) => p.event.stopPropagation());
  }

  /** The star keeps its promise: nothing comes out before the day. */
  private async touchWishStar() {
    const year = this.saves.state.wishYear ?? currentBirthdayYear();
    if (!this.saves.state.wishSealed) {
      void this.ui.say([{ text: "This one is still empty. It is waiting for her.", kind: "whisper" }]);
      return;
    }
    this.audio.tone(880, 0.02, 1.4);

    if (!wishVault.isDue(year)) {
      const at = wishVault.unlockAt(year);
      const when = at
        ? at.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
        : "her next birthday";
      await this.ui.say([
        { text: "Something of hers is folded up in there.", kind: "whisper" },
        { text: `It opens on ${when}. Not before — not even for her.` },
      ]);
      return;
    }

    const text = await wishVault.reveal(year);
    if (!text) {
      await this.ui.say([
        { text: "The star is quiet just now.", kind: "whisper" },
        { text: "Whatever is inside is staying there a little longer." },
      ]);
      return;
    }
    this.audio.sparkle();
    await this.ui.say([
      { text: "A year ago, she left this here:", kind: "whisper" },
      { text, kind: "canon" },
    ]);
  }

  protected tick(dt: number, t: number) {
    this.him.update(dt, t, this.p.pos, this.colors);
    if (this.cam?.active) {
      this.cam.update(dt, this.cameras.main, this.input2.consumeActionPulse(), this.input2.actionHeld());
    }
  }
}
