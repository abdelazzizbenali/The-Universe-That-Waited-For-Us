/* Shared game constants, palette and progress model. */

export const PALETTE = {
  void: 0x070b1a,
  indigo: 0x0b1230,
  ink: 0xeaf2ff,
  blue: 0x7fc4ff,
  blueDeep: 0x3e7cc4,
  blueCore: 0xd6eeff,
  hazelGold: 0xe0b36a,
  hazelCore: 0xf4dca8,
  hazelGreen: 0x9aab62,
  hazelBrown: 0x8a5f38,
  our: 0x93dcbb,
  mint: 0x9fe3c9,
  rose: 0xf2b8c6,
};

/* World-space render hierarchy — single source of truth.
   Low → high: sky, distant parallax, midground, ground, characters,
   effects, lighting, atmosphere, foreground, then world-anchored prompts. */
export const DEPTH = {
  skyFar: -40,
  sky: -30,
  skyNear: -25,
  farHills: -20,
  midHills: -15,
  back: 10,
  mid: 14,
  groundShadow: 18,
  ground: 20,
  groundDecor: 23,
  world: 30,
  props: 33,
  aura: 40,
  soul: 50,
  fx: 60,
  light: 70,
  fog: 78,
  foreground: 84,
  vignette: 88,
  overlay: 90,
  prompt: 94,
};

export type SoulKind = "hazel" | "blue";

export type SceneKey =
  | "BootScene"
  | "TitleScene"
  | "PrologueScene"
  | "LookScene"
  | "SchoolBusScene"
  | "CrowdedBusScene"
  | "TaxiScene"
  | "LibraryScene"
  | "WatchingScene"
  | "SafeBusScene"
  | "MorningBusScene"
  | "GoodbyeScene"
  | "CommitmentScene"
  | "DecemberScene"
  | "VisionScene"
  | "ConstantineScene"
  | "VideoBusScene"
  | "ExamLibraryScene"
  | "BusChangesScene"
  | "HandHoldScene"
  | "WaitingScene"
  | "YellowLightScene"
  | "ProjectScene"
  | "NaturalBusScene"
  | "CameraScene"
  | "MutualCareScene"
  | "ColorHuntScene"
  | "BottleScene"
  | "EveningWalkScene"
  | "ReportScene"
  | "RescueScene"
  | "BouquetScene"
  | "BorrowedLaptopScene"
  | "LastThreeDaysScene"
  | "CallScene"
  | "HolidayHubScene"
  | "FinaleScene"
  | "RevealScene"
  | "WishScene"
  | "FreeExploreScene";

export const SCENE_ORDER: SceneKey[] = [
  "PrologueScene",
  "LookScene",
  "SchoolBusScene",
  "CrowdedBusScene",
  "TaxiScene",
  "LibraryScene",
  "WatchingScene",
  "SafeBusScene",
  "MorningBusScene",
  "GoodbyeScene",
  "CommitmentScene",
  "DecemberScene",
  "VisionScene",
  "ConstantineScene",
  "VideoBusScene",
  "ExamLibraryScene",
  "BusChangesScene",
  "HandHoldScene",
  "WaitingScene",
  "YellowLightScene",
  "ProjectScene",
  "NaturalBusScene",
  "CameraScene",
  "MutualCareScene",
  "ColorHuntScene",
  "BottleScene",
  "EveningWalkScene",
  "ReportScene",
  "RescueScene",
  "BouquetScene",
  "BorrowedLaptopScene",
  "LastThreeDaysScene",
  "CallScene",
  "HolidayHubScene",
  "FinaleScene",
  "RevealScene",
  "WishScene",
  "FreeExploreScene",
];

export const MEMORY_IDS = {
  hill: "mem-hill",
  look: "mem-look",
  seat: "mem-seat",
  thankyou: "mem-thank-you",
  side: "mem-side-by-side",
  library: "mem-first-words",
  conviction: "mem-conviction",
  safety: "mem-safety",
  morning: "mem-morning-seat",
  goodbye: "mem-goodbye",
  commitment: "mem-commitment",
  december: "mem-december-15",
  vision: "mem-vision",
  // phase 4
  distance: "mem-distance",
  video: "mem-first-video",
  exams: "mem-ordinary-together",
  busChanges: "mem-persistence",
  hand: "mem-first-hand",
  waiting: "mem-waiting",
  yellow: "mem-sensory-care",
  project: "mem-collaboration",
  naturalHand: "mem-natural-intimacy",
  camera: "mem-memory-preservation",
  mutualCare: "mem-mutual-care",
  colorHunt: "mem-color-exchange",
  // phase 5
  bottle: "mem-small-gesture",
  escort: "mem-protective-presence",
  report: "mem-support-in-crisis",
  rescue: "mem-emergency-support",
  bouquet: "mem-first-bouquet",
  borrowed: "mem-familiarity",
  lastDays: "mem-last-three-days",
  unfinished: "mem-unfinished-star",
  call: "mem-the-call",
  holidays: "mem-holidays",
  // finale
  reunion: "mem-reunion",
} as const;

export const MEMORY_LABELS: Record<string, string> = {
  [MEMORY_IDS.hill]: "The Hill",
  [MEMORY_IDS.look]: "The First Look",
  [MEMORY_IDS.seat]: "The Saved Seat",
  [MEMORY_IDS.thankyou]: "The Written Thank-You",
  [MEMORY_IDS.side]: "Side by Side",
  [MEMORY_IDS.library]: "The Library of First Words",
  [MEMORY_IDS.conviction]: "Anyway",
  [MEMORY_IDS.safety]: "The Shoulder",
  [MEMORY_IDS.morning]: "The Morning Seat",
  [MEMORY_IDS.goodbye]: "The Goodbye",
  [MEMORY_IDS.commitment]: "Serious Love",
  [MEMORY_IDS.december]: "15.12.2025",
  [MEMORY_IDS.vision]: "What His Eyes Carry",
  [MEMORY_IDS.distance]: "Distance Connection",
  [MEMORY_IDS.video]: "First Video",
  [MEMORY_IDS.exams]: "Ordinary Togetherness",
  [MEMORY_IDS.busChanges]: "Persistence",
  [MEMORY_IDS.hand]: "First Hand Holding",
  [MEMORY_IDS.waiting]: "Waiting",
  [MEMORY_IDS.yellow]: "Sensory Care",
  [MEMORY_IDS.project]: "Collaboration",
  [MEMORY_IDS.naturalHand]: "Natural Intimacy",
  [MEMORY_IDS.camera]: "Memory Preservation",
  [MEMORY_IDS.mutualCare]: "Mutual Care",
  [MEMORY_IDS.colorHunt]: "Color Exchange",
  [MEMORY_IDS.bottle]: "Small Gesture",
  [MEMORY_IDS.escort]: "Protective Presence",
  [MEMORY_IDS.report]: "Support in Crisis",
  [MEMORY_IDS.rescue]: "Emergency Support",
  [MEMORY_IDS.bouquet]: "The First Bouquet",
  [MEMORY_IDS.borrowed]: "Familiarity",
  [MEMORY_IDS.lastDays]: "The Last Three Days",
  [MEMORY_IDS.unfinished]: "The Unfinished Star",
  [MEMORY_IDS.call]: "The Call Afterward",
  [MEMORY_IDS.holidays]: "The Holidays",
  [MEMORY_IDS.reunion]: "The Reunion",
};

/** Replayable memory scenes, surfaced from the title once discovered. */
export const MEMORY_SCENE: Record<string, SceneKey> = {
  [MEMORY_IDS.look]: "LookScene",
  [MEMORY_IDS.seat]: "SchoolBusScene",
  [MEMORY_IDS.thankyou]: "CrowdedBusScene",
  [MEMORY_IDS.side]: "TaxiScene",
  [MEMORY_IDS.library]: "LibraryScene",
  [MEMORY_IDS.conviction]: "WatchingScene",
  [MEMORY_IDS.safety]: "SafeBusScene",
  [MEMORY_IDS.morning]: "MorningBusScene",
  [MEMORY_IDS.goodbye]: "GoodbyeScene",
  [MEMORY_IDS.commitment]: "CommitmentScene",
  [MEMORY_IDS.december]: "DecemberScene",
  [MEMORY_IDS.vision]: "VisionScene",
  [MEMORY_IDS.distance]: "ConstantineScene",
  [MEMORY_IDS.video]: "VideoBusScene",
  [MEMORY_IDS.exams]: "ExamLibraryScene",
  [MEMORY_IDS.busChanges]: "BusChangesScene",
  [MEMORY_IDS.hand]: "HandHoldScene",
  [MEMORY_IDS.waiting]: "WaitingScene",
  [MEMORY_IDS.yellow]: "YellowLightScene",
  [MEMORY_IDS.project]: "ProjectScene",
  [MEMORY_IDS.naturalHand]: "NaturalBusScene",
  [MEMORY_IDS.camera]: "CameraScene",
  [MEMORY_IDS.mutualCare]: "MutualCareScene",
  [MEMORY_IDS.colorHunt]: "ColorHuntScene",
  [MEMORY_IDS.bottle]: "BottleScene",
  [MEMORY_IDS.escort]: "EveningWalkScene",
  [MEMORY_IDS.report]: "ReportScene",
  [MEMORY_IDS.rescue]: "RescueScene",
  [MEMORY_IDS.bouquet]: "BouquetScene",
  [MEMORY_IDS.borrowed]: "BorrowedLaptopScene",
  [MEMORY_IDS.lastDays]: "LastThreeDaysScene",
  [MEMORY_IDS.call]: "CallScene",
  [MEMORY_IDS.holidays]: "HolidayHubScene",
  [MEMORY_IDS.reunion]: "FinaleScene",
};

/** Memory Frames — captured moments kept in the archive. */
export const FRAME_LABELS: Record<string, string> = {
  "frame-first-video": "First Video · the two of us",
  "frame-window-sky": "Sky through the window",
  "frame-lamp-road": "Lamp on the evening road",
  "frame-hidden-star": "A star only the camera found",
  "frame-blue-cloth": "Something blue, for him",
  "frame-green-leaf": "Something green, for her",
};

export interface ProgressState {
  version: number;
  scene: SceneKey; // checkpoint = next scene to resume
  colorStage: number; // 0..7
  aliveness: number; // 0..100 ecosystem score
  memories: string[]; // unlocked memory ids
  frames: string[]; // Memory Frame collectibles
  collectibles: string[]; // small found objects
  looked: boolean; // THE LOOK completed
  companionBeside: boolean; // FOLLOW -> BESIDE unlocked (taxi)
  cameraUnlocked: boolean; // Memory Camera tool (M22)
  blueForHim: boolean; // she chose blue for him (M24)
  greenForHer: boolean; // he chose green for her (M24)
  finishedSlice: boolean; // library reached
  finishedArc: boolean; // vision world reached
  finishedPhase4: boolean; // color exchange reached
  bloomed: boolean; // the bouquet bloom event has happened (M29)
  /** The word she could not get out on the last day. Stays open until the
      final reunion — this flag must never be set before the finale. */
  unfinishedStarOpen: boolean;
  storyComplete: boolean; // all 33 memories lived
  reunited: boolean; // the finale has been walked
  starCompleted: boolean; // the unfinished star finally closed
  birthdayShown: boolean;
  wishSealed: boolean; // a wish exists, hidden among the stars
  wishYear: number | null; // the birthday year it belongs to
  freeExplore: boolean; // the universe stays open, permanently
  playSeconds: number;
  updatedAt: number;
}

/* ============================================================
   ⚠  SET THESE TWO BEFORE GIVING HER THE GAME.
   These are the only placeholder values in the entire project.
   HER_NAME is shown once, alone on screen, right before
   "Happy birthday" — it is the last thing the story says to her.
   BIRTHDAY decides when her sealed wish is allowed to reopen.
   ============================================================ */

/** Her birthday. Month is 1-based (1 = January). */
export const BIRTHDAY = { month: 9, day: 1 }; // September 1st

/** Her name, revealed only at the very end. */
export const HER_NAME = "Sarah";

export const DEFAULT_PROGRESS: ProgressState = {
  version: 2,
  scene: "PrologueScene",
  colorStage: 0,
  aliveness: 8,
  memories: [],
  frames: [],
  collectibles: [],
  looked: false,
  companionBeside: false,
  cameraUnlocked: false,
  blueForHim: false,
  greenForHer: false,
  finishedSlice: false,
  finishedArc: false,
  finishedPhase4: false,
  bloomed: false,
  unfinishedStarOpen: false,
  storyComplete: false,
  reunited: false,
  starCompleted: false,
  birthdayShown: false,
  wishSealed: false,
  wishYear: null,
  freeExplore: false,
  playSeconds: 0,
  updatedAt: 0,
};

export const SAVE_KEY = "utwfu.save.v1";
