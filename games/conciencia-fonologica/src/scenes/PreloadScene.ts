import Phaser from "phaser";
import type { WordsManifest } from "../content/types";
import { ClapCounterScene } from "./ClapCounterScene";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.json("words", "content/words.json");
  }

  create(): void {
    const manifest = this.cache.json.get("words") as WordsManifest;
    this.registry.set("wordsManifest", manifest);

    this.createButtonTextures();
    this.createWordCardTexture();

    let loads = 0;
    const queueOptionalAudio = (): void => {
      for (const w of manifest.words) {
        if (w.audioWord) {
          this.load.audio(`aw_${w.id}_word`, w.audioWord);
          loads++;
        }
        if (w.audioSuccess) {
          this.load.audio(`aw_${w.id}_ok`, w.audioSuccess);
          loads++;
        }
        if (w.syllableAudios?.length) {
          w.syllableAudios.forEach((url, i) => {
            this.load.audio(`aw_${w.id}_syl_${i}`, url);
            loads++;
          });
        }
      }
    };

    queueOptionalAudio();

    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      // Si aún no has generado los MP3, el juego sigue con pitidos de respaldo.
      // eslint-disable-next-line no-console
      console.warn("[audio] No se pudo cargar:", file.key, file.url);
    });

    const startGame = (): void => {
      this.scene.add("ClapCounterScene", ClapCounterScene, false);
      this.scene.start("ClapCounterScene");
    };

    if (loads === 0) {
      startGame();
      return;
    }

    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      startGame();
    });
    this.load.start();
  }

  /** Botones redondos (el dígito se dibuja encima en la escena del minijuego). */
  private createButtonTextures(): void {
    const size = 140;
    const radius = size / 2 - 6;
    for (const n of [1, 2, 3] as const) {
      const g = this.make.graphics({ x: 0, y: 0 });
      const bg = n === 1 ? 0xff6b6b : n === 2 ? 0xfeca57 : 0x48dbfb;
      g.fillStyle(bg, 1);
      g.fillCircle(size / 2, size / 2, radius);
      g.lineStyle(8, 0xffffff, 1);
      g.strokeCircle(size / 2, size / 2, radius - 4);
      g.generateTexture(`btn_num_${n}`, size, size);
      g.destroy();
    }
  }

  /** Marco neutro para la “imagen” central (sustituir por sprite real). */
  private createWordCardTexture(): void {
    const w = 520;
    const h = 380;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, w, h, 36);
    g.lineStyle(12, 0xdfe6e9, 1);
    g.strokeRoundedRect(0, 0, w, h, 36);
    g.generateTexture("word_card_frame", w, h);
    g.destroy();
  }
}
