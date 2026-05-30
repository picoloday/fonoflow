// MEMORY DE GEMELOS SILÁBICOS — Conciencia Fonológica
// Empareja cartas que comparten la misma sílaba inicial.

// ─── Grupos (cada grupo = una pareja) ────────────────────────────────────────
const MEMORY_GROUPS = [
  { syllable: 'CA', words: [{ word: 'CASA',      emoji: '🏠' }, { word: 'CAMISA',    emoji: '👕' }] },
  { syllable: 'PE', words: [{ word: 'PERRO',     emoji: '🐶' }, { word: 'PELOTA',    emoji: '⚽' }] },
  { syllable: 'CO', words: [{ word: 'COCHE',     emoji: '🚗' }, { word: 'CONEJO',    emoji: '🐰' }] },
  { syllable: 'MA', words: [{ word: 'MARIPOSA',  emoji: '🦋' }, { word: 'MANZANA',   emoji: '🍎' }] },
  { syllable: 'PA', words: [{ word: 'PATO',      emoji: '🦆' }, { word: 'PALOMA',    emoji: '🕊️' }] },
  { syllable: 'PI', words: [{ word: 'PIÑA',      emoji: '🍍' }, { word: 'PINO',      emoji: '🌲' }] },
  { syllable: 'GA', words: [{ word: 'GATO',      emoji: '🐱' }, { word: 'GALLINA',   emoji: '🐓' }] },
  { syllable: 'ES', words: [{ word: 'ESTRELLA',  emoji: '⭐' }, { word: 'ESCOBA',    emoji: '🧹' }] },
  { syllable: 'LU', words: [{ word: 'LUNA',      emoji: '🌙' }, { word: 'LUCIÉRNAGA',emoji: '✨' }] },
  { syllable: 'TO', words: [{ word: 'TORO',      emoji: '🐂' }, { word: 'TOMATE',    emoji: '🍅' }] },
];

// ─── Config de niveles ───────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  facil:   { pairs: 3, cols: 3, rows: 2, cardW: 242, cardH: 180, gap: 22 },
  medio:   { pairs: 4, cols: 4, rows: 2, cardW: 218, cardH: 163, gap: 18 },
  dificil: { pairs: 6, cols: 4, rows: 3, cardW: 204, cardH: 152, gap: 16 },
};

// ─── Audio ────────────────────────────────────────────────────────────────────
const audioCache = new Map();
let currentAudio = null;
let preferredVoice = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  preferredVoice =
    voices.find(v => /^es-ES/i.test(v.lang)) ||
    voices.find(v => /^es-MX/i.test(v.lang)) ||
    voices.find(v => /^es-/i.test(v.lang))   ||
    voices.find(v => /^es/i.test(v.lang))    ||
    null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

function localUrl(text, kind) {
  const folder = kind === 'syl' ? 'silabas' : 'palabras';
  return `../silabas/audio/${folder}/${encodeURIComponent(text.toLowerCase())}.mp3?v=4`;
}
function googleUrl(text) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`;
}
function preloadAudio(text, kind = 'word') {
  const key = `${kind}:${text.toLowerCase()}`;
  if (audioCache.has(key)) return audioCache.get(key);
  const a = new Audio(localUrl(text, kind));
  a.preload = 'auto';
  let fb = false;
  a.addEventListener('error', () => { if (fb) return; fb = true; a.src = googleUrl(text); a.load(); });
  audioCache.set(key, a);
  return a;
}
function speakWebApi(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES'; if (preferredVoice) u.voice = preferredVoice;
  u.rate = rate; u.pitch = 1.05;
  speechSynthesis.speak(u);
}
function speak(text, kind = 'word', rate = 1.0) {
  if (!text) return;
  const a = preloadAudio(text, kind);
  try {
    if (currentAudio && currentAudio !== a) currentAudio.pause();
    a.pause(); a.currentTime = 0; a.playbackRate = rate; currentAudio = a;
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => speakWebApi(text, rate));
  } catch (e) { speakWebApi(text, rate); }
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function paintGradientBackground(scene) {
  const w = scene.scale.width, h = scene.scale.height;
  const g = scene.add.graphics();
  const top = Phaser.Display.Color.HexStringToColor('#0f0c29');
  const mid = Phaser.Display.Color.HexStringToColor('#302b63');
  const bot = Phaser.Display.Color.HexStringToColor('#24243e');
  const steps = 60;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const c = t < 0.5
      ? Phaser.Display.Color.Interpolate.ColorWithColor(top, mid, 1, t * 2)
      : Phaser.Display.Color.Interpolate.ColorWithColor(mid, bot, 1, (t - 0.5) * 2);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(0, (h / steps) * i, w, (h / steps) + 1);
  }
  for (let i = 0; i < 40; i++) {
    const s = scene.add.circle(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0xffffff, Math.random() * 0.5 + 0.2);
    scene.tweens.add({ targets: s, alpha: { from: s.alpha, to: 0.05 }, duration: 1500 + Math.random() * 2000, yoyo: true, repeat: -1, delay: Math.random() * 2000 });
  }
}

// ─── MENU SCENE ───────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    this.add.text(w / 2, h * 0.12, 'Memory Silábico', {
      fontFamily: 'Georgia, serif', fontSize: '72px', color: '#ffffff',
      stroke: '#6c5ce7', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.22, '¡Encuentra las parejas que empiezan igual!', {
      fontFamily: 'Georgia, serif', fontSize: '25px', color: '#fdcb6e', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Card back preview animation
    const previewCards = [
      { x: w * 0.25, y: h * 0.42, emoji: '🐶', color: 0xa29bfe },
      { x: w * 0.38, y: h * 0.42, emoji: '⚽', color: 0xfd79a8 },
      { x: w * 0.5,  y: h * 0.42, emoji: '🚗', color: 0xfdcb6e },
      { x: w * 0.62, y: h * 0.42, emoji: '🐰', color: 0x55efc4 },
      { x: w * 0.75, y: h * 0.42, emoji: '🌙', color: 0x74b9ff },
    ];
    previewCards.forEach((pc, i) => {
      const c = this.add.container(pc.x, pc.y);
      const g = this.add.graphics();
      g.fillStyle(pc.color, 1); g.fillRoundedRect(-55, -42, 110, 84, 16);
      g.lineStyle(3, 0xffffff, 0.7); g.strokeRoundedRect(-55, -42, 110, 84, 16);
      const e = this.add.text(0, 0, pc.emoji, { fontSize: '44px', padding: { top: 6, bottom: 2 } }).setOrigin(0.5);
      c.add([g, e]);
      this.tweens.add({ targets: c, y: pc.y - 14, duration: 1200 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    const levels = [
      { key: 'facil',   label: 'FÁCIL',   sub: '3 parejas · 6 cartas',  color: 0x55efc4, y: h * 0.62 },
      { key: 'medio',   label: 'MEDIO',   sub: '4 parejas · 8 cartas',  color: 0xfdcb6e, y: h * 0.75 },
      { key: 'dificil', label: 'DIFÍCIL', sub: '6 parejas · 12 cartas', color: 0xff7675, y: h * 0.88 },
    ];
    levels.forEach(l => {
      const btn = this.makeBtn(w / 2, l.y, 380, 76, l.color, l.label, l.sub);
      btn.on('pointerup', () => this.scene.start('GameScene', { level: l.key }));
    });
  }

  makeBtn(x, y, w, h, color, label, sub) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    g.lineStyle(4, 0xffffff, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
    const t  = this.add.text(0, -10, label, { fontFamily: 'Arial Black, sans-serif', fontSize: '30px', color: '#2d3436' }).setOrigin(0.5);
    const st = this.add.text(0, 20,  sub,   { fontFamily: 'Arial, sans-serif',       fontSize: '16px', color: '#2d3436' }).setOrigin(0.5);
    c.add([g, t, st]); c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 140 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1,    duration: 140 }));
    c.on('pointerdown', () => this.tweens.add({ targets: c, scale: 0.94, duration: 70  }));
    return c;
  }
}

// ─── GAME SCENE ───────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.levelKey  = data.level || 'facil';
    this.cfg       = LEVEL_CONFIG[this.levelKey];
    this.score     = 0;
    this.errors    = 0;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    // HUD
    this.add.text(20, 18, '← Menú', { fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#ffffff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MenuScene'));

    this.pairsTxt = this.add.text(w / 2, 28, '', { fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#dfe6e9' }).setOrigin(0.5);
    this.scoreTxt = this.add.text(w - 20, 18, '', { fontFamily: 'Arial Black', fontSize: '24px', color: '#fdcb6e' }).setOrigin(1, 0);

    // State
    this.locked      = false;
    this.firstCard   = null;
    this.matchedPairs = 0;
    this.totalPairs  = this.cfg.pairs;
    this.cards       = [];

    this.buildGrid();
    this.updateHud();
  }

  updateHud() {
    this.pairsTxt.setText(`Parejas: ${this.matchedPairs} / ${this.totalPairs}`);
    this.scoreTxt.setText(`⭐ ${this.score}`);
  }

  // ── Grid builder ──────────────────────────────────────────────────────────
  buildGrid() {
    const cfg = this.cfg;
    const { width: w, height: h } = this.scale;

    // Pick N random groups, each contributing 2 word cards
    const groups  = shuffle(MEMORY_GROUPS).slice(0, cfg.pairs);
    const rawCards = [];
    groups.forEach(g => {
      g.words.forEach(wd => rawCards.push({ syllable: g.syllable, word: wd.word, emoji: wd.emoji }));
    });
    const deck = shuffle(rawCards);

    // Preload audio for all words and syllables in this game
    deck.forEach(d => { preloadAudio(d.word, 'word'); preloadAudio(d.syllable, 'syl'); });

    // Compute grid dimensions and center
    const totalW = cfg.cols * cfg.cardW + (cfg.cols - 1) * cfg.gap;
    const totalH = cfg.rows * cfg.cardH + (cfg.rows - 1) * cfg.gap;
    const startX = (w - totalW) / 2 + cfg.cardW / 2;
    const startY = 70 + (h - 70 - totalH) / 2 + cfg.cardH / 2;

    deck.forEach((cardData, idx) => {
      const col = idx % cfg.cols;
      const row = Math.floor(idx / cfg.cols);
      const x = startX + col * (cfg.cardW + cfg.gap);
      const y = startY + row * (cfg.cardH + cfg.gap);

      const card = this.makeCard(x, y, cfg.cardW, cfg.cardH, cardData);
      this.cards.push(card);

      // Staggered deal-in animation
      card.setScale(0);
      this.tweens.add({
        targets: card, scale: 1,
        duration: 300, ease: 'Back.out',
        delay: idx * 60 + 100,
      });
    });
  }

  // ── Card factory ──────────────────────────────────────────────────────────
  makeCard(x, y, cw, ch, cardData) {
    const hw = cw / 2, hh = ch / 2;
    const c = this.add.container(x, y);

    // ── Back face ──────────────────────────────────────────────
    const backG = this.add.graphics();
    backG.fillStyle(0x6c5ce7, 1);
    backG.fillRoundedRect(-hw, -hh, cw, ch, 18);
    backG.lineStyle(4, 0xffeaa7, 1);
    backG.strokeRoundedRect(-hw, -hh, cw, ch, 18);
    // Corner dots
    const dotR = 8;
    backG.fillStyle(0xffeaa7, 0.4);
    [[-hw+18,-hh+16],[hw-18,-hh+16],[-hw+18,hh-16],[hw-18,hh-16]].forEach(([dx,dy]) => backG.fillCircle(dx, dy, dotR));
    // Center decorative lines
    backG.lineStyle(2, 0xffeaa7, 0.25);
    backG.strokeRoundedRect(-hw+12, -hh+12, cw-24, ch-24, 12);

    const backStar = this.add.text(0, 0, '🌟', { fontSize: `${Math.round(ch * 0.38)}px`, padding: { top: 4, bottom: 2 } }).setOrigin(0.5);

    // ── Front face (hidden initially) ─────────────────────────
    const frontG = this.add.graphics();
    frontG.fillStyle(0xf8f9fa, 1);
    frontG.fillRoundedRect(-hw, -hh, cw, ch, 18);
    frontG.lineStyle(3, 0xdfe6e9, 1);
    frontG.strokeRoundedRect(-hw, -hh, cw, ch, 18);
    frontG.setVisible(false);

    const emojiSize = Math.round(ch * 0.44);
    const frontEmoji = this.add.text(0, -ch * 0.07, cardData.emoji, {
      fontSize: `${emojiSize}px`, padding: { top: 6, bottom: 2 },
    }).setOrigin(0.5).setVisible(false);

    const frontWord = this.add.text(0, hh - 22, cardData.word, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${Math.round(ch * 0.13)}px`,
      color: '#636e72',
    }).setOrigin(0.5).setVisible(false);

    c.add([backG, backStar, frontG, frontEmoji, frontWord]);
    c.setSize(cw, ch);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerup', () => this.onCardTap(c));
    c.on('pointerover', () => { if (!c.matched && !c.faceUp) this.tweens.add({ targets: c, scale: 1.06, duration: 110 }); });
    c.on('pointerout',  () => { if (!c.matched)              this.tweens.add({ targets: c, scale: 1,    duration: 110 }); });

    // Card metadata
    c.cardData = cardData;
    c.faceUp   = false;
    c.matched  = false;
    c.backG    = backG;
    c.backStar = backStar;
    c.frontG   = frontG;
    c.frontEmoji = frontEmoji;
    c.frontWord  = frontWord;
    c.cardW    = cw;
    c.cardH    = ch;

    return c;
  }

  // ── 2-phase card flip (fake 3D via scaleX) ────────────────────────────────
  flipCard(card, toFront, onDone) {
    this.tweens.add({
      targets: card, scaleX: 0,
      duration: 130, ease: 'Linear',
      onComplete: () => {
        if (toFront) {
          card.backG.setVisible(false);
          card.backStar.setVisible(false);
          card.frontG.setVisible(true);
          card.frontEmoji.setVisible(true);
          card.frontWord.setVisible(true);
        } else {
          card.backG.setVisible(true);
          card.backStar.setVisible(true);
          card.frontG.setVisible(false);
          card.frontEmoji.setVisible(false);
          card.frontWord.setVisible(false);
          if (card.matchGlow) { card.matchGlow.destroy(); card.matchGlow = null; }
        }
        this.tweens.add({
          targets: card, scaleX: 1,
          duration: 130, ease: 'Linear',
          onComplete: () => { if (onDone) onDone(); },
        });
      },
    });
  }

  // ── Input state machine ───────────────────────────────────────────────────
  onCardTap(card) {
    if (this.locked || card.matched || card.faceUp) return;
    this.locked = true;

    this.flipCard(card, true, () => {
      card.faceUp = true;
      speak(card.cardData.word.toLowerCase(), 'word');

      if (!this.firstCard) {
        this.firstCard = card;
        this.locked = false;   // allow tapping second card
      } else {
        this.checkMatch(card); // locked stays true during validation
      }
    });
  }

  checkMatch(secondCard) {
    const first = this.firstCard;
    this.firstCard = null;

    if (first.cardData.syllable === secondCard.cardData.syllable) {
      // ── MATCH ────────────────────────────────────────────────
      this.matchedPairs++;
      this.score += 10;
      first.matched = secondCard.matched = true;
      this.celebrateMatch(first, secondCard);
      this.updateHud();
      this.locked = false;

      if (this.matchedPairs >= this.totalPairs) {
        this.time.delayedCall(900, () => this.onWin());
      }
    } else {
      // ── MISMATCH ─────────────────────────────────────────────
      this.errors++;
      // Brief shake on both, then flip back
      this.time.delayedCall(60, () => {
        [first, secondCard].forEach(c => {
          this.tweens.add({ targets: c, x: c.x + 8, duration: 55, yoyo: true, repeat: 2,
            onComplete: () => { c.x = c.x; } });
        });
      });
      this.time.delayedCall(1500, () => {
        let pending = 2;
        const done = () => { if (--pending === 0) { first.faceUp = secondCard.faceUp = false; this.locked = false; } };
        this.flipCard(first,      false, done);
        this.flipCard(secondCard, false, done);
      });
    }
  }

  // ── Match celebration ─────────────────────────────────────────────────────
  celebrateMatch(c1, c2) {
    const addGlow = (card) => {
      const hw = card.cardW / 2, hh = card.cardH / 2;
      const g = this.add.graphics();
      g.fillStyle(0x00b894, 0.18);
      g.fillRoundedRect(-hw, -hh, card.cardW, card.cardH, 18);
      g.lineStyle(6, 0x00b894, 1);
      g.strokeRoundedRect(-hw, -hh, card.cardW, card.cardH, 18);
      g.setAlpha(0);
      card.add(g);
      card.matchGlow = g;
      this.tweens.add({ targets: g, alpha: 1, duration: 280 });
      this.tweens.add({ targets: card, scale: { from: 1, to: 1.1 }, duration: 200, yoyo: true, ease: 'Back.out' });
    };

    addGlow(c1);
    addGlow(c2);

    // Speak shared syllable
    this.time.delayedCall(200, () => speak(c1.cardData.syllable.toLowerCase(), 'syl'));

    // Mini confetti burst between the two cards
    const mx = (c1.x + c2.x) / 2;
    const my = (c1.y + c2.y) / 2;
    for (let i = 0; i < 12; i++) {
      const s = this.add.text(mx, my, ['✨', '⭐', '💫'][i % 3], { fontSize: '22px' }).setOrigin(0.5);
      const angle = (i / 12) * Math.PI * 2;
      this.tweens.add({
        targets: s,
        x: mx + Math.cos(angle) * 90, y: my + Math.sin(angle) * 90,
        alpha: 0, scale: 0.2,
        duration: 550, ease: 'Cubic.out',
        onComplete: () => s.destroy(),
      });
    }
  }

  // ── Victory ───────────────────────────────────────────────────────────────
  onWin() {
    this.locked = true;

    // Wave-bounce all matched cards
    this.cards.forEach((card, i) => {
      this.tweens.add({
        targets: card, y: card.y - 22,
        duration: 300, yoyo: true, ease: 'Sine.inOut',
        delay: i * 60,
      });
    });

    // Big confetti
    const { width: w, height: h } = this.scale;
    const syms = ['⭐', '✨', '💫', '🌟', '🎉', '🎊', '🏆'];
    for (let i = 0; i < 50; i++) {
      const s = this.add.text(Math.random() * w, -30, syms[i % syms.length], { fontSize: '30px' }).setOrigin(0.5);
      this.tweens.add({
        targets: s, y: h + 40,
        x: s.x + (Math.random() - 0.5) * 200,
        rotation: Math.random() * 6, alpha: { from: 1, to: 0.2 },
        duration: 1400 + Math.random() * 800,
        delay: Math.random() * 600, ease: 'Quad.in',
        onComplete: () => s.destroy(),
      });
    }

    this.time.delayedCall(300, () => speak('¡perfecto, increíble!', 'word'));

    this.time.delayedCall(2200, () => {
      this.scene.start('ResultScene', {
        score: this.score, errors: this.errors, level: this.levelKey,
        totalPairs: this.totalPairs,
      });
    });
  }
}

// ─── RESULT SCENE ─────────────────────────────────────────────────────────────
class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data) {
    this.score      = data.score;
    this.errors     = data.errors;
    this.level      = data.level;
    this.totalPairs = data.totalPairs;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    const stars = this.errors === 0 ? 3 : this.errors <= 2 ? 2 : 1;
    const title = stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Bien!';

    this.add.text(w / 2, h * 0.17, title, {
      fontFamily: 'Georgia, serif', fontSize: '88px', color: '#ffffff',
      stroke: '#6c5ce7', strokeThickness: 6,
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const s = this.add.text(w / 2 - 110 + i * 110, h * 0.40, filled ? '⭐' : '☆', {
        fontSize: '90px', color: filled ? '#fdcb6e' : '#636e72', padding: { top: 16, bottom: 4 },
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({ targets: s, scale: 1, delay: 300 + i * 200, duration: 400, ease: 'Back.out' });
    }

    this.add.text(w / 2, h * 0.60, `Puntos: ${this.score}`, {
      fontFamily: 'Arial Black', fontSize: '36px', color: '#fdcb6e',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.67, `Errores: ${this.errors}`, {
      fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    this.makeBtn(w / 2 - 145, h * 0.84, 250, 64, 0x55efc4, 'Otra vez')
      .on('pointerup', () => this.scene.start('GameScene', { level: this.level }));

    this.makeBtn(w / 2 + 145, h * 0.84, 250, 64, 0x74b9ff, 'Menú')
      .on('pointerup', () => this.scene.start('MenuScene'));

    this.time.delayedCall(900, () => speak(stars === 3 ? '¡perfecto, increíble!' : '¡muy bien!', 'word'));
  }

  makeBtn(x, y, w, h, color, label) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(3, 0xffffff, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    const t = this.add.text(0, 0, label, { fontFamily: 'Arial Black', fontSize: '28px', color: '#2d3436' }).setOrigin(0.5);
    c.add([g, t]); c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 150 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1,    duration: 150 }));
    return c;
  }
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  parent: 'game',
  backgroundColor: '#0f0c29',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [MenuScene, GameScene, ResultScene],
});
