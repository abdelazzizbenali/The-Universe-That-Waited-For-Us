/* Backdrop — painted environment art as an actual world-space layer.

   The art is fitted to each scene's authored playable rectangle. That keeps
   backgrounds from appearing giant, prevents camera black/blue edges, and makes
   collision/interactable coordinates line up with what the player sees. */
import Phaser from "phaser";

export interface BackdropMood {
  tint?: number;
  darken?: number;
  wash?: number;
  washTint?: number;
  drift?: number;
  zoom?: number;
}

const BACKDROP_DEPTH = -1000;

/**
 * Most scenes author their world width as a multiple of the current viewport.
 * The backdrop has to exist before build() runs, so it mirrors those known
 * dimensions here. This keeps camera bounds from clipping buses, campus walks,
 * the cosmic world, the final world, and free exploration, while still never
 * showing outside the painted image.
 */
const SCENE_WIDTH_SCALE: Record<string, number> = {
  BorrowedLaptopScene: 1.25,
  BottleScene: 1.25,
  BouquetScene: 1.4,
  BusChangesScene: 1.9,
  CallScene: 1.7,
  CameraScene: 1.8,
  ColorHuntScene: 2,
  CommitmentScene: 2.3,
  ConstantineScene: 2.2,
  CrowdedBusScene: 1.7,
  EveningWalkScene: 2.5,
  ExamLibraryScene: 1.6,
  FinaleScene: 6.2,
  FreeExploreScene: 5,
  HandHoldScene: 1.3,
  HolidayHubScene: 1.7,
  LastThreeDaysScene: 1.5,
  LibraryScene: 1.7,
  MorningBusScene: 1.45,
  MutualCareScene: 1.6,
  NaturalBusScene: 1.6,
  ProjectScene: 1.5,
  ReportScene: 1.5,
  SafeBusScene: 1.35,
  SchoolBusScene: 1.55,
  TaxiScene: 2.2,
  VideoBusScene: 1.3,
  VisionScene: 2.4,
  WatchingScene: 2.6,
  YellowLightScene: 1.9,
};

export class Backdrop {
  private img: Phaser.GameObjects.Image;
  private veil: Phaser.GameObjects.Rectangle;
  private wash: Phaser.GameObjects.Rectangle | null = null;
  readonly width: number;
  readonly height: number;

  constructor(
    private scene: Phaser.Scene,
    key: string,
    mood: BackdropMood = {},
    _reduced = false
  ) {
    const { tint, darken = 0, wash = 0, washTint = 0x93dcbb } = mood;
    const viewportW = scene.scale.width || 960;
    const viewportH = scene.scale.height || 540;
    const desiredW = viewportW * (SCENE_WIDTH_SCALE[scene.scene.key] ?? 1);
    this.width = desiredW;
    this.height = viewportH;

    this.img = scene.add
      .image(0, 0, key)
      .setOrigin(0, 0)
      .setScrollFactor(1)
      .setDisplaySize(this.width, this.height)
      .setDepth(BACKDROP_DEPTH);
    if (tint !== undefined) this.img.setTint(tint);

    this.veil = scene.add
      .rectangle(0, 0, 10, 10, 0x05070f, darken)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(BACKDROP_DEPTH + 1);

    if (wash > 0) {
      this.wash = scene.add
        .rectangle(0, 0, 10, 10, washTint, wash)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(BACKDROP_DEPTH + 2)
        .setBlendMode(Phaser.BlendModes.ADD);
    }

    this.fitOverlay();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.fitOverlay, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.fitOverlay, this);
    });
  }

  private fitOverlay() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.veil.setPosition(w / 2, h / 2).setSize(w, h);
    this.wash?.setPosition(w / 2, h / 2).setSize(w, h);
  }

  update(_dtSec: number, _cam?: Phaser.Cameras.Scene2D.Camera) {
    this.fitOverlay();
  }

  grade(mood: BackdropMood, ms = 2000) {
    if (mood.tint !== undefined) this.img.setTint(mood.tint);
    if (mood.darken !== undefined) this.scene.tweens.add({ targets: this.veil, fillAlpha: mood.darken, duration: ms });
    if (mood.wash !== undefined && this.wash) this.scene.tweens.add({ targets: this.wash, fillAlpha: mood.wash, duration: ms });
  }

  destroy() {
    this.img.destroy();
    this.veil.destroy();
    this.wash?.destroy();
  }
}
