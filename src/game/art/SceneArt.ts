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

/** All painted backdrops, loaded once at boot. */
export const BACKDROP_FILES: Record<string, string> = {
  "bg-night-hill": "art/bg-night-hill.jpg",
  "bg-library": "art/bg-library.jpg",
  "bg-bus-day": "art/bg-bus-day.jpg",
  "bg-road": "art/bg-road-evening.jpg",
  "bg-cosmic": "art/bg-cosmic.jpg",
  "bg-garden": "art/bg-garden.jpg",
  "bg-final": "art/bg-final-world.jpg",
};

/* Mood presets — the grading vocabulary of the game.
   The flat 2D art is high-contrast and already stylized, so grades stay
   restrained: heavy veils would only muddy clean colour fills. Tints do
   most of the emotional work; darkening is used sparingly. */
const COLD: BackdropMood = { tint: 0x9fb4dc, darken: 0.24, drift: 6 };
const COOL: BackdropMood = { tint: 0xc4d6f0, darken: 0.14, drift: 6 };
const NEUTRAL: BackdropMood = { darken: 0.08, drift: 5 };
const WARM: BackdropMood = { tint: 0xfff2e0, darken: 0.04, drift: 4 };
const GOLDEN: BackdropMood = { tint: 0xffe8c8, darken: 0.03, drift: 4 };
/* Night is reached by tinting the daylight bus down, not by drowning it —
   the same vehicle, later in the day. */
const NIGHT: BackdropMood = { tint: 0x5f7cbe, darken: 0.3, drift: 4 };
const DEEP_NIGHT: BackdropMood = { tint: 0x46609e, darken: 0.42, drift: 3 };
const TENDER: BackdropMood = { tint: 0xffdce8, darken: 0.14, drift: 4 };
const DREAM: BackdropMood = { darken: 0.24, drift: 8 };
/** Late-game: OUR COLOR begins to live in the light itself. */
const OURS: BackdropMood = { darken: 0.16, wash: 0.07, washTint: 0x93dcbb, drift: 6 };
const OURS_FULL: BackdropMood = { darken: 0.1, wash: 0.12, washTint: 0x93dcbb, drift: 7 };

export const SCENE_ART: Record<string, SceneArtEntry> = {
  /* ---- prologue and first looks ---- */
  PrologueScene: { key: "bg-night-hill", mood: COLD },
  LookScene: { key: "bg-road", mood: COOL },
  TaxiScene: { key: "bg-road", mood: { ...COOL, darken: 0.34 } },

  /* ---- the buses ---- */
  SchoolBusScene: { key: "bg-bus-day", mood: NEUTRAL },
  CrowdedBusScene: { key: "bg-bus-day", mood: { ...NEUTRAL, darken: 0.38 } },
  SafeBusScene: { key: "bg-bus-day", mood: { ...NEUTRAL, darken: 0.34 } },
  MorningBusScene: { key: "bg-bus-day", mood: { tint: 0xdce9ff, darken: 0.16, drift: 5 } },
  /* every bus memory now uses the one stylized bus, graded by time of day —
     it is the same vehicle throughout the story, and the light is the mood */
  GoodbyeScene: { key: "bg-bus-day", mood: NIGHT },
  VideoBusScene: { key: "bg-bus-day", mood: { tint: 0xffca8a, darken: 0.14, drift: 4 } },
  BusChangesScene: { key: "bg-bus-day", mood: NEUTRAL },
  // the private universe: the bus itself recedes into the dark
  HandHoldScene: { key: "bg-bus-day", mood: DEEP_NIGHT },
  // the lights are off so people can sleep — darkest grade in the game
  YellowLightScene: { key: "bg-bus-day", mood: { tint: 0x37528e, darken: 0.5, drift: 2 } },
  NaturalBusScene: { key: "bg-bus-day", mood: { ...NIGHT, wash: 0.05, washTint: 0x93dcbb } },
  BottleScene: { key: "bg-bus-day", mood: { ...NEUTRAL, darken: 0.14 } },
  BorrowedLaptopScene: { key: "bg-bus-day", mood: WARM },
  LastThreeDaysScene: { key: "bg-bus-day", mood: NIGHT },

  /* ---- the library, across the whole story ---- */
  LibraryScene: { key: "bg-library", mood: COOL },
  ExamLibraryScene: { key: "bg-library", mood: WARM },
  ProjectScene: { key: "bg-library", mood: { ...GOLDEN, darken: 0.24 } },
  ReportScene: { key: "bg-library", mood: { tint: 0xb9c4e0, darken: 0.44, drift: 3 } },
  RescueScene: { key: "bg-library", mood: { tint: 0xffe0bc, darken: 0.3, drift: 3 } },

  /* ---- roads, campus, evenings ---- */
  WatchingScene: { key: "bg-road", mood: { tint: 0x7d8fc0, darken: 0.5, drift: 4 } },
  EveningWalkScene: { key: "bg-road", mood: NIGHT },
  WaitingScene: { key: "bg-road", mood: { ...NIGHT, darken: 0.42 } },
  MutualCareScene: { key: "bg-road", mood: { tint: 0x7f93c4, darken: 0.48, drift: 4 } },
  CameraScene: { key: "bg-road", mood: { ...WARM, darken: 0.28 } },

  /* ---- dream and cosmic spaces ---- */
  CommitmentScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.34 } },
  DecemberScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.28, wash: 0.05 } },
  VisionScene: { key: "bg-cosmic", mood: { tint: 0x9fb0d0, darken: 0.4, drift: 7 } },
  ConstantineScene: { key: "bg-cosmic", mood: DREAM },
  CallScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.4 } },
  HolidayHubScene: { key: "bg-cosmic", mood: OURS },
  ColorHuntScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.2 } },

  /* ---- the garden ---- */
  BouquetScene: { key: "bg-garden", mood: TENDER },

  /* ---- the end ---- */
  // asleep: drained of colour and light, waiting to be woken
  FinaleScene: { key: "bg-final", mood: { tint: 0x6c7ea8, darken: 0.52, drift: 5 } },
  RevealScene: { key: "bg-final", mood: OURS_FULL },
  WishScene: { key: "bg-cosmic", mood: { ...OURS, darken: 0.34 } },
  FreeExploreScene: { key: "bg-final", mood: OURS_FULL },
  TitleScene: { key: "bg-night-hill", mood: { tint: 0x9fb0d0, darken: 0.46, drift: 8 } },
};

/** The mood the finale grades to once the universe has woken. */
export const FINALE_AWAKE_MOOD: BackdropMood = {
  tint: 0xffffff,
  darken: 0.14,
  wash: 0.1,
  washTint: 0x93dcbb,
};
