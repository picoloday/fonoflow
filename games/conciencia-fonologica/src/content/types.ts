export type WordChallenge = {
  id: string;
  /** Número correcto de sílabas (1–3 en este prototipo). */
  syllableCount: 1 | 2 | 3;
  /** Color de la tarjeta central (hex). */
  cardColor: string;
  /**
   * Rutas opcionales a audio en `public/`.
   * Si faltan, `AudioService` usa pitidos sintéticos para desarrollo.
   */
  audioWord?: string;
  audioSuccess?: string;
  syllableAudios?: string[];
  /**
   * Texto para generar MP3 con `npm run generate-audio` (edge-tts).
   * No lo usa Phaser en runtime.
   */
  ttsWord?: string;
  /** Sílabas en el mismo orden que `syllableAudios` (para el generador). */
  ttsSyllables?: string[];
};

export type WordsManifest = {
  locale: string;
  words: WordChallenge[];
};
