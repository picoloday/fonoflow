import Phaser from "phaser";
import type { WordChallenge, WordsManifest } from "../content/types";
import { audioService } from "../services/AudioService";

type Phase = "idle" | "feedback";

export class ClapCounterScene extends Phaser.Scene {
  private manifest!: WordsManifest;
  private index = 0;
  private phase: Phase = "idle";

  /** Los navegadores bloquean audio hasta un gesto; hasta entonces no llamamos a playWord. */
  private audioStarted = false;
  private bootOverlay?: Phaser.GameObjects.Rectangle;
  private pulseTween?: Phaser.Tweens.Tween;

  private cardContainer!: Phaser.GameObjects.Container;
  private colorOverlay!: Phaser.GameObjects.Rectangle;

  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: "ClapCounterScene" });
  }

  init(): void {
    this.manifest = this.registry.get("wordsManifest") as WordsManifest;
    this.index = 0;
    this.phase = "idle";
  }

  create(): void {
    this.drawBackground();

    this.cardContainer = this.add.container(this.scale.width / 2, this.scale.height * 0.42);
    const cardBg = this.add.image(0, 0, "word_card_frame").setOrigin(0.5);
    this.colorOverlay = this.add
      .rectangle(0, 0, 480, 320, 0x48dbfb, 0.85)
      .setStrokeStyle(0, 0x000000, 0);

    this.cardContainer.add([cardBg, this.colorOverlay]);

    const bottomY = this.scale.height * 0.82;
    const spacing = Math.min(this.scale.width * 0.22, 260);
    const startX = this.scale.width / 2 - spacing;
    for (const n of [1, 2, 3] as const) {
      const cx = startX + (n - 1) * spacing;
      const wrap = this.add.container(cx, bottomY);

      const base = this.add.image(0, 0, `btn_num_${n}`).setInteractive({ useHandCursor: false });
      const labelTxt = this.add
        .text(0, 0, String(n), {
          fontFamily: "system-ui, Segoe UI, Roboto, sans-serif",
          fontSize: "72px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      wrap.add([base, labelTxt]);

      base.on("pointerdown", () => {
        void this.handleNumber(n);
      });
      base.on("pointerover", () => base.setScale(1.06));
      base.on("pointerout", () => base.setScale(1));

      this.buttons.push(wrap);
    }

    this.showWord();
    this.setupAudioBootstrap();
  }

  /**
   * Capa a pantalla completa hasta el primer toque: desbloquea Web Audio
   * y entonces suena la palabra del turno (política de autoplay).
   */
  private setupAudioBootstrap(): void {
    this.bootOverlay = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.28,
      )
      .setInteractive()
      .setDepth(100);

    this.pulseTween = this.tweens.add({
      targets: this.bootOverlay,
      alpha: { from: 0.18, to: 0.42 },
      yoyo: true,
      repeat: -1,
      duration: 650,
      ease: "Sine.inOut",
    });

    this.bootOverlay.once("pointerdown", async () => {
      await audioService.unlock(this);
      this.audioStarted = true;
      this.pulseTween?.stop();
      this.bootOverlay?.destroy();
      this.bootOverlay = undefined;
      audioService.playWord(this, this.current());
    });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x74b9ff, 0x74b9ff, 0xa29bfe, 0xa29bfe, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    g.setDepth(-10);
  }

  private current(): WordChallenge {
    return this.manifest.words[this.index];
  }

  private showWord(): void {
    const w = this.current();
    this.colorOverlay.setFillStyle(Phaser.Display.Color.HexStringToColor(w.cardColor).color, 0.92);
    if (this.audioStarted) {
      void audioService.unlock(this).then(() => {
        audioService.playWord(this, w);
      });
    }

    this.tweens.add({
      targets: this.cardContainer,
      scale: { from: 0.94, to: 1 },
      duration: 420,
      ease: "Sine.easeOut",
    });
  }

  private async handleNumber(n: 1 | 2 | 3): Promise<void> {
    if (this.phase !== "idle") return;

    await audioService.unlock(this);

    const w = this.current();

    if (n === w.syllableCount) {
      void this.onCorrect(n);
    } else {
      void this.onWrong();
    }
  }

  private onCorrect(n: 1 | 2 | 3): void {
    this.phase = "feedback";
    const w = this.current();

    const btn = this.buttons[n - 1];
    this.tweens.add({
      targets: btn,
      scale: { from: 1, to: 1.15 },
      yoyo: true,
      duration: 160,
      ease: "Sine.easeInOut",
    });

    audioService.playSuccess(this, w, () => {
      this.phase = "idle";
      this.nextWord();
    });
  }

  private async onWrong(): Promise<void> {
    this.phase = "feedback";
    const w = this.current();

    this.tweens.add({
      targets: this.cardContainer,
      x: this.cardContainer.x - 18,
      duration: 60,
      yoyo: true,
      repeat: 5,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.cardContainer.setX(this.scale.width / 2);
      },
    });

    await audioService.playSyllableBreakdown(this, w, 120);
    this.phase = "idle";
  }

  private nextWord(): void {
    this.index += 1;
    if (this.index >= this.manifest.words.length) {
      this.index = 0;
    }
    this.showWord();
  }
}
