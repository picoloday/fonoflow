import type Phaser from "phaser";
import type { WordChallenge } from "../content/types";

/**
 * Capa de audio: usa clips cargados en Phaser si existen;
 * si no, pitidos sintéticos (útil sin ficheros todavía).
 */
export class AudioService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  /**
   * Obligatorio tras la política de autoplay: hay que llamar esto en el mismo
   * tick que un gesto del usuario (pointerdown) y esperar a que el contexto arranque.
   */
  async unlock(scene: Phaser.Scene): Promise<void> {
    if (scene.sound.locked) {
      scene.sound.unlock();
    }
    const ctx = this.getContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  playWord(scene: Phaser.Scene, w: WordChallenge): void {
    const key = `aw_${w.id}_word`;
    if (scene.cache.audio.exists(key)) {
      scene.sound.play(key, { volume: 1 });
      return;
    }
    this.playTone(523.25, 0.22);
  }

  playSuccess(scene: Phaser.Scene, w: WordChallenge, onComplete?: () => void): void {
    const key = `aw_${w.id}_ok`;
    if (scene.cache.audio.exists(key)) {
      const inst = scene.sound.play(key, { volume: 1 }) as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
      if (onComplete) {
        inst.once("complete", onComplete);
      }
      return;
    }
    this.playChord(onComplete);
  }

  /**
   * Reproduce sílabas en secuencia (clips o tonos descendentes).
   */
  async playSyllableBreakdown(
    scene: Phaser.Scene,
    w: WordChallenge,
    gapMs: number,
  ): Promise<void> {
    const count = w.syllableCount;
    for (let i = 0; i < count; i++) {
      const key = `aw_${w.id}_syl_${i}`;
      await new Promise<void>((resolve) => {
        if (scene.cache.audio.exists(key)) {
          const inst = scene.sound.play(key, { volume: 1 }) as Phaser.Sound.WebAudioSound;
          inst.once("complete", () => {
            window.setTimeout(resolve, gapMs);
          });
        } else {
          const base = 440 - i * 90;
          this.playTone(base, 0.18);
          window.setTimeout(resolve, gapMs + 180);
        }
      });
    }
  }

  private playTone(freq: number, durationSec: number): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
    gain.gain.linearRampToValueAtTime(0.0001, t + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + durationSec + 0.05);
  }

  private playChord(onComplete?: () => void): void {
    const ctx = this.getContext();
    const freqs = [523.25, 659.25, 783.99];
    const durationSec = 0.35;
    const t = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05 + i * 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, t + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + durationSec + 0.05);
    });
    window.setTimeout(() => onComplete?.(), durationSec * 1000 + 80);
  }
}

export const audioService = new AudioService();
