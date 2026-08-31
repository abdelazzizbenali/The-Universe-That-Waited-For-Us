/* Game boot — wires the runtime singletons, mounts the DOM UI layer beside
   the canvas, and starts Phaser 4 in RESIZE scale mode (mobile-first). */
import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import TitleScene from "./scenes/TitleScene";
import PrologueScene from "./scenes/PrologueScene";
import LookScene from "./scenes/LookScene";
import SchoolBusScene from "./scenes/SchoolBusScene";
import CrowdedBusScene from "./scenes/CrowdedBusScene";
import TaxiScene from "./scenes/TaxiScene";
import LibraryScene from "./scenes/LibraryScene";
import WatchingScene from "./scenes/WatchingScene";
import SafeBusScene from "./scenes/SafeBusScene";
import MorningBusScene from "./scenes/MorningBusScene";
import GoodbyeScene from "./scenes/GoodbyeScene";
import CommitmentScene from "./scenes/CommitmentScene";
import DecemberScene from "./scenes/DecemberScene";
import VisionScene from "./scenes/VisionScene";
import ConstantineScene from "./scenes/ConstantineScene";
import VideoBusScene from "./scenes/VideoBusScene";
import ExamLibraryScene from "./scenes/ExamLibraryScene";
import BusChangesScene from "./scenes/BusChangesScene";
import HandHoldScene from "./scenes/HandHoldScene";
import WaitingScene from "./scenes/WaitingScene";
import YellowLightScene from "./scenes/YellowLightScene";
import ProjectScene from "./scenes/ProjectScene";
import NaturalBusScene from "./scenes/NaturalBusScene";
import CameraScene from "./scenes/CameraScene";
import MutualCareScene from "./scenes/MutualCareScene";
import ColorHuntScene from "./scenes/ColorHuntScene";
import BottleScene from "./scenes/BottleScene";
import EveningWalkScene from "./scenes/EveningWalkScene";
import ReportScene from "./scenes/ReportScene";
import RescueScene from "./scenes/RescueScene";
import BouquetScene from "./scenes/BouquetScene";
import BorrowedLaptopScene from "./scenes/BorrowedLaptopScene";
import LastThreeDaysScene from "./scenes/LastThreeDaysScene";
import CallScene from "./scenes/CallScene";
import HolidayHubScene from "./scenes/HolidayHubScene";
import FinaleScene from "./scenes/FinaleScene";
import RevealScene from "./scenes/RevealScene";
import WishScene from "./scenes/WishScene";
import FreeExploreScene from "./scenes/FreeExploreScene";
import { initRuntime } from "./runtime";
import { UIManager } from "./ui/UIManager";
import { AudioDirector } from "./systems/audio/AudioDirector";
import { ColorDirector } from "./systems/color/ColorDirector";
import { SaveSystem } from "./systems/save/SaveSystem";
import { Settings } from "./systems/settings/Settings";
import { setEnvironmentReduced } from "./art/environment";

export interface GameHandle {
  game: Phaser.Game;
  dispose: () => void;
}

type SceneConstructor = new () => Phaser.Scene;

/**
 * Phaser gives every constructor in a config array the temporary key
 * "default". Most chapter scenes inherit BaseScene without defining their
 * own constructor, so they would all keep that same key and collide during
 * boot. Register concrete instances with explicit, stable keys instead.
 *
 * The keys must not depend on JavaScript class names: production minifiers
 * are allowed to rename those, while story transitions use these strings.
 */
function keyedScene(key: string, SceneClass: SceneConstructor): Phaser.Scene {
  const scene = new SceneClass();
  scene.sys.settings.key = key;
  return scene;
}

export function startGame(rootEl: HTMLElement): GameHandle {
  const uiRoot = document.createElement("div");
  uiRoot.id = "ui-root";
  rootEl.appendChild(uiRoot);

  const ui = new UIManager(uiRoot);
  const audio = new AudioDirector();
  const saves = new SaveSystem();
  const colors = new ColorDirector(saves.state.colorStage);
  const settings = new Settings();
  initRuntime({ ui, audio, colors, saves, settings });

  let gameRef: Phaser.Game | null = null;
  // volumes, motion, and zoom apply live, without needing a restart
  settings.onChange((s) => {
    audio.setVolumes(settings.gain("music"), settings.gain("effects"), s.muted);
    setEnvironmentReduced(s.reducedMotion);
    const current = gameRef?.scene.getScenes(true)[0];
    current?.cameras?.main?.setZoom(settings.zoom);
  });
  ui.bindSettings(settings);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: rootEl,
    backgroundColor: "#070b1a",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: rootEl.clientWidth || window.innerWidth,
      height: rootEl.clientHeight || window.innerHeight,
    },
    fps: { target: 60 },
    render: { antialias: true, pixelArt: false },
    disableContextMenu: true,
    scene: [
      keyedScene("BootScene", BootScene),
      keyedScene("TitleScene", TitleScene),
      keyedScene("PrologueScene", PrologueScene),
      keyedScene("LookScene", LookScene),
      keyedScene("SchoolBusScene", SchoolBusScene),
      keyedScene("CrowdedBusScene", CrowdedBusScene),
      keyedScene("TaxiScene", TaxiScene),
      keyedScene("LibraryScene", LibraryScene),
      keyedScene("WatchingScene", WatchingScene),
      keyedScene("SafeBusScene", SafeBusScene),
      keyedScene("MorningBusScene", MorningBusScene),
      keyedScene("GoodbyeScene", GoodbyeScene),
      keyedScene("CommitmentScene", CommitmentScene),
      keyedScene("DecemberScene", DecemberScene),
      keyedScene("VisionScene", VisionScene),
      keyedScene("ConstantineScene", ConstantineScene),
      keyedScene("VideoBusScene", VideoBusScene),
      keyedScene("ExamLibraryScene", ExamLibraryScene),
      keyedScene("BusChangesScene", BusChangesScene),
      keyedScene("HandHoldScene", HandHoldScene),
      keyedScene("WaitingScene", WaitingScene),
      keyedScene("YellowLightScene", YellowLightScene),
      keyedScene("ProjectScene", ProjectScene),
      keyedScene("NaturalBusScene", NaturalBusScene),
      keyedScene("CameraScene", CameraScene),
      keyedScene("MutualCareScene", MutualCareScene),
      keyedScene("ColorHuntScene", ColorHuntScene),
      keyedScene("BottleScene", BottleScene),
      keyedScene("EveningWalkScene", EveningWalkScene),
      keyedScene("ReportScene", ReportScene),
      keyedScene("RescueScene", RescueScene),
      keyedScene("BouquetScene", BouquetScene),
      keyedScene("BorrowedLaptopScene", BorrowedLaptopScene),
      keyedScene("LastThreeDaysScene", LastThreeDaysScene),
      keyedScene("CallScene", CallScene),
      keyedScene("HolidayHubScene", HolidayHubScene),
      keyedScene("FinaleScene", FinaleScene),
      keyedScene("RevealScene", RevealScene),
      keyedScene("WishScene", WishScene),
      keyedScene("FreeExploreScene", FreeExploreScene),
    ],
  });

  gameRef = game;

  return {
    game,
    dispose: () => {
      try {
        game.destroy(true);
      } finally {
        ui.destroy();
        uiRoot.remove();
      }
    },
  };
}
