/* SceneArt — which painting stands behind each scene, and in what mood.

   One painting serves several memories by being graded differently. The
   library is cold on the first visit and warm during exams; the same bus
   is daylight-ordinary, dusk-golden or night-blue depending on the memory.
   That reuse is deliberate: it is the same place, and the change in light
   is the story. */
import type { BackdropMood } from "./Backdrop";

export interface SceneArtEntry {
  key: string;
  mood: BackdropMood;
}

/** All painted backdrops, loaded once at boot. Keys match Phaser texture ids. */
export const BACKDROP_FILES: Record<string, string> = {
  "bg-night-hill": "art/night-hill.jpg",
  "bg-library": "art/library.png",
  "bg-bus": "art/bus.jpg",
  "bg-university": "art/university.jpg",
  "bg-cosmic": "art/cosmic.jpg",
  "bg-final": "art/final-world.jpg",
};

/** Character / prop spritesheet-style PNGs (transparent, single-frame). */
export const SPRITE_FILES: Record<string, string> = {
  "boy-1": "art/assets/boy-1.png",
  "boy-2": "art/assets/boy-2.png",
  "boy-3": "art/assets/boy-3.png",
  "boy-4": "art/assets/boy-4.png",
  "girl-1": "art/assets/girl-1.png",
  "girl-2": "art/assets/girl-2.png",
  "girl-3": "art/assets/girl-3.png",
  "girl-4": "art/assets/girl-4.png",
  "teacher-1": "art/assets/teacher-1.png",
  "teacher-2": "art/assets/teacher-2.png",
  "teacher-3": "art/assets/teacher-3.png",
  "table-1": "art/assets/table-1.png",
  "table-2": "art/assets/table-2.png",
  "table-3": "art/assets/table-3.png",
  "chair-front": "art/assets/chair-front.png",
  "chair-back": "art/assets/chair-back.png",
  bench: "art/assets/bench.png",
};

/* Mood presets — the grading vocabulary of the game. */
const COLD: BackdropMood = { tint: 0x9fb4dc, darken: 0.18, drift: 4 };
const COOL: BackdropMood = { tint: 0xc4d6f0, darken: 0.08, drift: 4 };
const NEUTRAL: BackdropMood = { darken: 0.04, drift: 3 };
const WARM: BackdropMood = { tint: 0xfff2e0, darken: 0.02, drift: 3 };
const GOLDEN: BackdropMood = { tint: 0xffe8c8, darken: 0.02, drift: 3 };
const NIGHT: BackdropMood = { tint: 0x5f7cbe, darken: 0.28, drift: 3 };
const DEEP_NIGHT: BackdropMood = { tint: 0x46609e, darken: 0.4, drift: 2 };
const TENDER: BackdropMood = { tint: 0xffdce8, darken: 0.08, drift: 3 };
const DREAM: BackdropMood = { darken: 0.2, drift: 6 };
const OURS: BackdropMood = { darken: 0.12, wash: 0.07, washTint: 0x93dcbb, drift: 5 };
const OURS_FULL: BackdropMood = { darken: 0.06, wash: 0.12, washTint: 0x93dcbb, drift: 6 };

/**
 * World-space geometry for each backdrop, measured once against the source
 * art. Positions are in the original image's pixel coordinates; the scene
 * uses the image at world scale = its native pixel size.
 */
export interface WorldGeom {
  /** Walkable floor rectangle (world coords). */
  floor: { x: number; y: number; w: number; h: number };
  /** Extra rectangular solid colliders (walls, shelves, bus seats…). */
  blockers?: { x: number; y: number; w: number; h: number }[];
  /** Named anchor points — scene scripts look these up. */
  anchors?: Record<string, { x: number; y: number }>;
  /** Which side of the scene is "entrance" for camera framing. */
  entrance?: { x: number; y: number };
}

export const WORLD_GEOM: Record<string, WorldGeom> = {
  "bg-library": {
    // Library floor is the entire visible orange-tile area. The top of the
    // wall meets the floor at ~y=380; image height is 768.
    floor: { x: 0, y: 370, w: 1407, h: 398 },
    blockers: [
      // three bookshelf/wall segments on the back wall
      { x: 140, y: 280, w: 280, h: 120 },   // left shelves
      { x: 710, y: 280, w: 280, h: 120 },   // middle shelves
      { x: 1230, y: 280, w: 170, h: 120 },  // right shelves
    ],
    anchors: {
      // special table (boy already seated on far side, girl's seat near side)
      specialTable: { x: 990, y: 540 },
      boySeat:     { x: 990, y: 500 },
      girlSeat:    { x: 990, y: 585 },
      // other tables (scattered through the room)
      tableA: { x: 350, y: 500 },
      tableB: { x: 620, y: 620 },
      tableC: { x: 1200, y: 640 },
      entrance: { x: 60, y: 700 },
    },
    entrance: { x: 60, y: 700 },
  },
  "bg-bus": {
    // Bus interior — floor is the central aisle between seat rows.
    floor: { x: 120, y: 230, w: 990, h: 250 },
    blockers: [
      // left seat bank
      { x: 0, y: 220, w: 200, h: 320 },
      // right seat bank
      { x: 1000, y: 220, w: 221, h: 320 },
      // driver's cabin / windshield up front (left)
      { x: 0, y: 0, w: 200, h: 220 },
    ],
    anchors: {
      door: { x: 1080, y: 360 },
      savedSeat: { x: 320, y: 380 },
      boySeat: { x: 320, y: 340 },
      girlSeat: { x: 320, y: 420 },
      crowdPath: { x: 600, y: 370 },
    },
    entrance: { x: 1080, y: 360 },
  },
  "bg-university": {
    // University exterior — ground band runs along the lower half; the
    // building entrance is the big archway.
    floor: { x: 0, y: 430, w: 1559, h: 258 },
    blockers: [
      // the facade wall (upper area is not walkable; pillars + steps)
      { x: 0, y: 0, w: 1559, h: 400 },
    ],
    anchors: {
      entrance: { x: 780, y: 445 },
      teacherSpot: { x: 900, y: 480 },
      approach: { x: 400, y: 600 },
    },
    entrance: { x: 780, y: 445 },
  },
  "bg-cosmic": {
    // Cosmos — the whole image is walkable dream-space.
    floor: { x: 0, y: 0, w: 1408, h: 768 },
    anchors: {
      origin: { x: 200, y: 560 },
      center: { x: 704, y: 420 },
      horizon: { x: 704, y: 240 },
    },
    entrance: { x: 200, y: 560 },
  },
  "bg-final": {
    // Final world — walkable field across the lower 2/3.
    floor: { x: 0, y: 420, w: 1264, h: 423 },
    blockers: [],
    anchors: {
      start: { x: 120, y: 720 },
      meeting: { x: 900, y: 520 },
      horizon: { x: 640, y: 360 },
    },
    entrance: { x: 120, y: 720 },
  },
  "bg-night-hill": {
    // Night hill — the walkable slope is the lower 2/3, fading upward into
    // sky. The "hilltop" sits near the upper-center where the blue glow waits.
    floor: { x: 0, y: 480, w: 1672, h: 461 },
    anchors: {
      start: { x: 180, y: 820 },
      hilltop: { x: 1280, y: 540 },
      blueLight: { x: 1480, y: 360 },
    },
    entrance: { x: 180, y: 820 },
  },
};

export const SCENE_ART: Record<string, SceneArtEntry> = {
  /* ---- prologue ---- */
  PrologueScene: { key: "bg-night-hill", mood: COLD },
  TitleScene:    { key: "bg-night-hill", mood: { ...COLD, darken: 0.34 } },

  /* ---- first looks & campus ---- */
  LookScene:     { key: "bg-university", mood: COOL },
  TaxiScene:     { key: "bg-university", mood: { ...COOL, darken: 0.28 } },

  /* ---- the buses (all share the bus interior, graded by time of day) ---- */
  SchoolBusScene:  { key: "bg-bus", mood: NEUTRAL },
  CrowdedBusScene: { key: "bg-bus", mood: { ...NEUTRAL, darken: 0.24 } },
  SafeBusScene:    { key: "bg-bus", mood: { ...NEUTRAL, darken: 0.22 } },
  MorningBusScene: { key: "bg-bus", mood: { tint: 0xdce9ff, darken: 0.1 } },
  GoodbyeScene:    { key: "bg-bus", mood: NIGHT },
  VideoBusScene:   { key: "bg-bus", mood: { tint: 0xffca8a, darken: 0.1 } },
  BusChangesScene: { key: "bg-bus", mood: NEUTRAL },
  HandHoldScene:   { key: "bg-bus", mood: DEEP_NIGHT },
  YellowLightScene:{ key: "bg-bus", mood: { tint: 0x37528e, darken: 0.46 } },
  NaturalBusScene: { key: "bg-bus", mood: { ...NIGHT, wash: 0.05, washTint: 0x93dcbb } },
  BottleScene:     { key: "bg-bus", mood: { ...NEUTRAL, darken: 0.08 } },
  BorrowedLaptopScene: { key: "bg-bus", mood: WARM },
  LastThreeDaysScene:  { key: "bg-bus", mood: NIGHT },

  /* ---- the library, across the whole story ---- */
  LibraryScene:     { key: "bg-library", mood: COOL },
  ExamLibraryScene: { key: "bg-library", mood: WARM },
  ProjectScene:     { key: "bg-library", mood: { ...GOLDEN, darken: 0.14 } },
  ReportScene:      { key: "bg-library", mood: { tint: 0xb9c4e0, darken: 0.3 } },
  RescueScene:      { key: "bg-library", mood: { tint: 0xffe0bc, darken: 0.18 } },

  /* ---- roads, campus exteriors, evening walks ---- */
  WatchingScene:    { key: "bg-university", mood: { tint: 0x7d8fc0, darken: 0.34 } },
  EveningWalkScene: { key: "bg-university", mood: NIGHT },
  WaitingScene:     { key: "bg-university", mood: { ...NIGHT, darken: 0.3 } },
  MutualCareScene:  { key: "bg-university", mood: { tint: 0x7f93c4, darken: 0.32 } },
  CameraScene:      { key: "bg-university", mood: { ...WARM, darken: 0.18 } },

  /* ---- dream and cosmic spaces ---- */
  CommitmentScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.26 } },
  DecemberScene:   { key: "bg-cosmic", mood: { ...DREAM, darken: 0.2, wash: 0.05 } },
  VisionScene:     { key: "bg-cosmic", mood: { tint: 0x9fb0d0, darken: 0.3 } },
  ConstantineScene:{ key: "bg-cosmic", mood: DREAM },
  CallScene:       { key: "bg-cosmic", mood: { ...DREAM, darken: 0.3 } },
  HolidayHubScene: { key: "bg-cosmic", mood: OURS },
  ColorHuntScene:  { key: "bg-cosmic", mood: { ...DREAM, darken: 0.14 } },
  WishScene:       { key: "bg-cosmic", mood: { ...OURS, darken: 0.24 } },

  /* ---- garden / bouquet ---- */
  BouquetScene: { key: "bg-final", mood: TENDER },

  /* ---- the end ---- */
  FinaleScene:      { key: "bg-final", mood: { tint: 0x6c7ea8, darken: 0.36 } },
  RevealScene:      { key: "bg-final", mood: OURS_FULL },
  FreeExploreScene: { key: "bg-final", mood: OURS_FULL },
};

/** The mood the finale grades to once the universe has woken. */
export const FINALE_AWAKE_MOOD: BackdropMood = {
  tint: 0xffffff,
  darken: 0.06,
  wash: 0.1,
  washTint: 0x93dcbb,
};
