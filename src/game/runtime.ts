/* Runtime singletons, constructed once in main.ts before Phaser boots and
   consumed by every scene. Keeps Phaser's registry clean and strongly typed. */
import type { AudioDirector } from "./systems/audio/AudioDirector";
import type { ColorDirector } from "./systems/color/ColorDirector";
import type { SaveSystem } from "./systems/save/SaveSystem";
import type { Settings } from "./systems/settings/Settings";
import type { UIManager } from "./ui/UIManager";

export interface Runtime {
  ui: UIManager;
  audio: AudioDirector;
  colors: ColorDirector;
  saves: SaveSystem;
  settings: Settings;
}

export const runtime = {} as Runtime;

export function initRuntime(r: Runtime) {
  runtime.ui = r.ui;
  runtime.audio = r.audio;
  runtime.colors = r.colors;
  runtime.saves = r.saves;
  runtime.settings = r.settings;
}
