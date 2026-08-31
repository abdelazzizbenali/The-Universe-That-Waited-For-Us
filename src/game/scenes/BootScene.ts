/* BootScene — loads the painted environment art, paints the procedural
   sprite set, restores saved colour state, then hands over to the title. */
import Phaser from "phaser";
import { makeTextures } from "../art/textures";
import { BACKDROP_FILES } from "../art/SceneArt";
import { runtime } from "../runtime";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // painted backdrops — the base layer of every environment
    for (const [key, path] of Object.entries(BACKDROP_FILES)) {
      this.load.image(key, path);
    }
    // never let a missing file take the whole game down: the scenes fall
    // back to their procedural sky if a painting fails to arrive
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn(`[boot] backdrop unavailable: ${file.key}`);
    });
  }

  create() {
    makeTextures(this);
    runtime.colors.setStage(runtime.saves.state.colorStage);
    runtime.ui.veilGone();
    this.cameras.main.setBackgroundColor("#070b1a");
    this.scene.start("TitleScene");
  }
}
