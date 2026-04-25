// =========================================================
// Léxico compartido entre el juego (navegador) y el generador de audios (Node).
// Si añades / quitas / modificas palabras, vuelve a ejecutar tools/generate-audio.js
// para regenerar los MP3 que falten.
// =========================================================

const WORDS = {
  facil: [
    { word: 'GATO',  syllables: ['GA', 'TO'],  emoji: '🐱' },
    { word: 'CASA',  syllables: ['CA', 'SA'],  emoji: '🏠' },
    { word: 'COCHE', syllables: ['CO', 'CHE'], emoji: '🚗' },
    { word: 'LUNA',  syllables: ['LU', 'NA'],  emoji: '🌙' },
    { word: 'GLOBO', syllables: ['GLO', 'BO'], emoji: '🎈' },
    { word: 'OSO',   syllables: ['O', 'SO'],   emoji: '🐻' },
    { word: 'PERRO', syllables: ['PE', 'RRO'], emoji: '🐶' },
    { word: 'PATO',  syllables: ['PA', 'TO'],  emoji: '🦆' },
    { word: 'PIÑA',  syllables: ['PI', 'ÑA'],  emoji: '🍍' },
    { word: 'MESA',  syllables: ['ME', 'SA'],  emoji: '🪑' },
  ],
  medio: [
    { word: 'MANZANA',  syllables: ['MAN', 'ZA', 'NA'],  emoji: '🍎' },
    { word: 'CONEJO',   syllables: ['CO', 'NE', 'JO'],   emoji: '🐰' },
    { word: 'JIRAFA',   syllables: ['JI', 'RA', 'FA'],   emoji: '🦒' },
    { word: 'TORTUGA',  syllables: ['TOR', 'TU', 'GA'],  emoji: '🐢' },
    { word: 'ABEJA',    syllables: ['A', 'BE', 'JA'],    emoji: '🐝' },
    { word: 'COHETE',   syllables: ['CO', 'HE', 'TE'],   emoji: '🚀' },
    { word: 'ESTRELLA', syllables: ['ES', 'TRE', 'LLA'], emoji: '⭐' },
    { word: 'PLÁTANO',  syllables: ['PLÁ', 'TA', 'NO'],  emoji: '🍌' },
    { word: 'PELOTA',   syllables: ['PE', 'LO', 'TA'],   emoji: '⚽' },
    { word: 'CAMISA',   syllables: ['CA', 'MI', 'SA'],   emoji: '👕' },
  ],
  dificil: [
    { word: 'MARIPOSA',     syllables: ['MA', 'RI', 'PO', 'SA'],       emoji: '🦋' },
    { word: 'ELEFANTE',     syllables: ['E', 'LE', 'FAN', 'TE'],       emoji: '🐘' },
    { word: 'UNICORNIO',    syllables: ['U', 'NI', 'COR', 'NIO'],      emoji: '🦄' },
    { word: 'CALABAZA',     syllables: ['CA', 'LA', 'BA', 'ZA'],       emoji: '🎃' },
    { word: 'TELÉFONO',     syllables: ['TE', 'LÉ', 'FO', 'NO'],       emoji: '📞' },
    { word: 'HELICÓPTERO',  syllables: ['HE', 'LI', 'CÓP', 'TE', 'RO'], emoji: '🚁' },
    { word: 'DINOSAURIO',   syllables: ['DI', 'NO', 'SAU', 'RIO'],     emoji: '🦕' },
    { word: 'CHOCOLATE',    syllables: ['CHO', 'CO', 'LA', 'TE'],      emoji: '🍫' },
  ],
};

// Frases dinámicas de feedback / celebración. También se pre-generan como MP3.
const PHRASES = [
  '¡Muy bien!',
  '¡Perfecto, increíble!',
  '¡Bien!',
  '¡Genial!',
];

// Compatibilidad navegador <-> Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WORDS, PHRASES };
}
