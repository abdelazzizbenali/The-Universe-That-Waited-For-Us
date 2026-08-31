/* SceneArt — which painting stands behind each scene, and in what mood.

   The repository's production art now lives in public/art. One painting serves
   several memories by being graded differently. The file paths below are kept
   deliberately literal so a missing/renamed asset is caught at boot instead of
   silently falling back to procedural blocks. */
import type { BackdropMood } from "./Backdrop";

export interface SceneArtEntry {
  key: string;
  mood: BackdropMood;
}

export const BACKDROP_FILES: Record<string, string> = {
  "bg-night-hill": "art/night-hill.jpg",
  "bg-library": "art/library.png",
  "bg-bus-day": "art/bus.jpg",
  "bg-road": "art/university.jpg",
  "bg-cosmic": "art/cosmic.jpg",
  "bg-garden": "art/final-world.jpg",
  "bg-final": "art/final-world.jpg",
};

const COLD: BackdropMood = { tint: 0x9fb4dc, darken: 0.16, drift: 0 };
const COOL: BackdropMood = { tint: 0xc4d6f0, darken: 0.08, drift: 0 };
const NEUTRAL: BackdropMood = { darken: 0.04, drift: 0 };
const WARM: BackdropMood = { tint: 0xfff2e0, darken: 0.02, drift: 0 };
const GOLDEN: BackdropMood = { tint: 0xffe8c8, darken: 0.02, drift: 0 };
const NIGHT: BackdropMood = { tint: 0x5f7cbe, darken: 0.24, drift: 0 };
const DEEP_NIGHT: BackdropMood = { tint: 0x46609e, darken: 0.34, drift: 0 };
const TENDER: BackdropMood = { tint: 0xffdce8, darken: 0.1, drift: 0 };
const DREAM: BackdropMood = { darken: 0.18, drift: 0 };
const OURS: BackdropMood = { darken: 0.12, wash: 0.06, washTint: 0x93dcbb, drift: 0 };
const OURS_FULL: BackdropMood = { darken: 0.08, wash: 0.1, washTint: 0x93dcbb, drift: 0 };

export const SCENE_ART: Record<string, SceneArtEntry> = {
  PrologueScene: { key: "bg-night-hill", mood: COLD },
  LookScene: { key: "bg-road", mood: COOL },
  TaxiScene: { key: "bg-road", mood: { ...COOL, darken: 0.2 } },

  SchoolBusScene: { key: "bg-bus-day", mood: NEUTRAL },
  CrowdedBusScene: { key: "bg-bus-day", mood: { ...NEUTRAL, darken: 0.26 } },
  SafeBusScene: { key: "bg-bus-day", mood: { ...NEUTRAL, darken: 0.22 } },
  MorningBusScene: { key: "bg-bus-day", mood: { tint: 0xdce9ff, darken: 0.08, drift: 0 } },
  GoodbyeScene: { key: "bg-bus-day", mood: NIGHT },
  VideoBusScene: { key: "bg-bus-day", mood: { tint: 0xffca8a, darken: 0.1, drift: 0 } },
  BusChangesScene: { key: "bg-bus-day", mood: NEUTRAL },
  HandHoldScene: { key: "bg-bus-day", mood: DEEP_NIGHT },
  YellowLightScene: { key: "bg-bus-day", mood: { tint: 0x37528e, darken: 0.42, drift: 0 } },
  NaturalBusScene: { key: "bg-bus-day", mood: { ...NIGHT, wash: 0.04, washTint: 0x93dcbb } },
  BottleScene: { key: "bg-bus-day", mood: { ...NEUTRAL, darken: 0.1 } },
  BorrowedLaptopScene: { key: "bg-bus-day", mood: WARM },
  LastThreeDaysScene: { key: "bg-bus-day", mood: NIGHT },

  LibraryScene: { key: "bg-library", mood: COOL },
  ExamLibraryScene: { key: "bg-library", mood: WARM },
  ProjectScene: { key: "bg-library", mood: { ...GOLDEN, darken: 0.16 } },
  ReportScene: { key: "bg-library", mood: { tint: 0xb9c4e0, darken: 0.34, drift: 0 } },
  RescueScene: { key: "bg-library", mood: { tint: 0xffe0bc, darken: 0.22, drift: 0 } },

  WatchingScene: { key: "bg-road", mood: { tint: 0x7d8fc0, darken: 0.34, drift: 0 } },
  EveningWalkScene: { key: "bg-road", mood: NIGHT },
  WaitingScene: { key: "bg-road", mood: { ...NIGHT, darken: 0.3 } },
  MutualCareScene: { key: "bg-road", mood: { tint: 0x7f93c4, darken: 0.32, drift: 0 } },
  CameraScene: { key: "bg-road", mood: { ...WARM, darken: 0.18 } },

  CommitmentScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.28 } },
  DecemberScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.22, wash: 0.04 } },
  VisionScene: { key: "bg-cosmic", mood: { tint: 0x9fb0d0, darken: 0.32, drift: 0 } },
  ConstantineScene: { key: "bg-cosmic", mood: DREAM },
  CallScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.32 } },
  HolidayHubScene: { key: "bg-cosmic", mood: OURS },
  ColorHuntScene: { key: "bg-cosmic", mood: { ...DREAM, darken: 0.16 } },

  BouquetScene: { key: "bg-garden", mood: TENDER },
  FinaleScene: { key: "bg-final", mood: { tint: 0x6c7ea8, darken: 0.42, drift: 0 } },
  RevealScene: { key: "bg-final", mood: OURS_FULL },
  WishScene: { key: "bg-cosmic", mood: { ...OURS, darken: 0.28 } },
  FreeExploreScene: { key: "bg-final", mood: OURS_FULL },
  TitleScene: { key: "bg-night-hill", mood: { tint: 0x9fb0d0, darken: 0.34, drift: 0 } },
};

export const FINALE_AWAKE_MOOD: BackdropMood = {
  tint: 0xffffff,
  darken: 0.1,
  wash: 0.1,
  washTint: 0x93dcbb,
};
