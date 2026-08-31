/* BootScene — loads the painted environment art and painted character
   sprites, paints the procedural sprite set used for glow/effects, then
   hands over to the title. */
import Phaser from "phaser";
import { makeTextures } from "../art/textures";
import { BACKDROP_FILES, SPRITE_FILES } from "../art/SceneArt";
import { runtime } from "../runtime";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    for (const [key, path] of Object.entries(BACKDROP_FILES)) {
      this.load.image(key, path);
    }
    for (const [key, path] of Object.entries(SPRITE_FILES)) {
      this.load.image(key, path);
    }
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn(`[boot] asset unavailable: ${file.key}`);
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
