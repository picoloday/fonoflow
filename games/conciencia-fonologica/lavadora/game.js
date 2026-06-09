// LA LAVADORA DE SÍLABAS — Conciencia Fonológica
// Síntesis silábica: toca las sílabas flotantes EN ORDEN para descubrir la palabra.

// ─── Palabras ─────────────────────────────────────────────────────────────────
const WASH_WORDS = [
  // 2 sílabas
  { word: 'GATO',     syllables: ['GA',  'TO'],        emoji: '🐱' },
  { word: 'CASA',     syllables: ['CA',  'SA'],        emoji: '🏠' },
  { word: 'LUNA',     syllables: ['LU',  'NA'],        emoji: '🌙' },
  { word: 'PATO',     syllables: ['PA',  'TO'],        emoji: '🦆' },
  { word: 'GLOBO',    syllables: ['GLO', 'BO'],        emoji: '🎈' },
  { word: 'PERRO',    syllables: ['PE',  'RRO'],       emoji: '🐶' },
  { word: 'COCHE',    syllables: ['CO',  'CHE'],       emoji: '🚗' },
  { word: 'MESA',     syllables: ['ME',  'SA'],        emoji: '🪑' },
  // 3 sílabas
  { word: 'CONEJO',   syllables: ['CO',  'NE',  'JO'],  emoji: '🐰' },
  { word: 'PELOTA',   syllables: ['PE',  'LO',  'TA'],  emoji: '⚽' },
  { word: 'MANZANA',  syllables: ['MAN', 'ZA',  'NA'],  emoji: '🍎' },
  { word: 'ESTRELLA', syllables: ['ES',  'TRE', 'LLA'], emoji: '⭐' },
  { word: 'ABEJA',    syllables: ['A',   'BE',  'JA'],  emoji: '🐝' },
  { word: 'COHETE',   syllables: ['CO',  'HE',  'TE'],  emoji: '🚀' },
  { word: 'JIRAFA',   syllables: ['JI',  'RA',  'FA'],  emoji: '🦒' },
  { word: 'TORTUGA',  syllables: ['TOR', 'TU',  'GA'],  emoji: '🐢' },
];

// Geometría de la lavadora (constantes globales para reutilizar en escenas)
const DRUM_X  = 360;   // centro del tambor, eje X
const DRUM_Y  = 440;   // centro del tambor, eje Y
const DRUM_R  = 128;   // radio del área flotante interna
const BEZEL_R = 152;   // radio del cristal/bisel exterior

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
    voices.find(v => /^es-/i.test(v.lang))  ||
    voices.find(v => /^es/i.test(v.lang))   ||
    null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

function localWordUrl(text) {
  return `../silabas/audio/palabras/${encodeURIComponent(text.toLowerCase())}.mp3?v=4`;
}
function localSylUrl(text) {
  return `../silabas/audio/silabas/${encodeURIComponent(text.toLowerCase())}.mp3?v=4`;
}
function googleUrl(text) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`;
}
function preloadAudio(text, kind = 'word') {
  const key = `${kind}:${text.toLowerCase()}`;
  if (audioCache.has(key)) return audioCache.get(key);
  const url = kind === 'syl' ? localSylUrl(text) : localWordUrl(text);
  const a = new Audio(url);
  a.preload = 'auto';
  let fb = false;
  a.addEventListener('error', () => {
    if (fb) return; fb = true;
    a.src = googleUrl(text); a.load();
  });
  audioCache.set(key, a);
  return a;
}
function speakWebApi(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  if (preferredVoice) u.voice = preferredVoice;
  u.rate = rate; u.pitch = 1.05;
  speechSynthesis.speak(u);
}
function speak(text, kind = 'word', rate = 1.0) {
  if (!text) return;
  const a = preloadAudio(text, kind);
  try {
    if (currentAudio && currentAudio !== a) currentAudio.pause();
    a.pause(); a.currentTime = 0; a.playbackRate = rate;
    currentAudio = a;
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
    const s = scene.add.circle(
      Math.random() * w, Math.random() * h,
      Math.random() * 2 + 1, 0xffffff, Math.random() * 0.5 + 0.2
    );
    scene.tweens.add({
      targets: s, alpha: { from: s.alpha, to: 0.05 },
      duration: 1500 + Math.random() * 2000, yoyo: true, repeat: -1, delay: Math.random() * 2000,
    });
  }
}

function addOrientationRestart(scene) {
  scene._portrait = scene.scale.height > scene.scale.width;
  const handler = () => {
    const portrait = scene.scale.height > scene.scale.width;
    if (portrait !== scene._portrait) {
      scene._portrait = portrait;
      scene.scene.restart();
    }
  };
  scene.scale.on('resize', handler);
  scene.events.once('shutdown', () => scene.scale.off('resize', handler));
}

// ─── MENU SCENE ───────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    this.add.text(w / 2, h * 0.12, 'La Lavadora de Sílabas', {
      fontFamily: 'Georgia, serif', fontSize: '64px', color: '#ffffff',
      stroke: '#6c5ce7', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.22, '¡Toca las sílabas en orden para descubrir la palabra!', {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#fdcb6e', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Floating preview icons
    const icons = ['🧺', '👕', '🐱', '🌙', '🚗', '🍎'];
    icons.forEach((e, i) => {
      const x = (w / (icons.length + 1)) * (i + 1);
      const y = h * 0.39;
      const t = this.add.text(x, y, e, { fontSize: '60px', padding: { top: 10, bottom: 2 } }).setOrigin(0.5);
      this.tweens.add({ targets: t, y: y - 16, duration: 1300 + i * 110, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    this.add.text(w / 2, h * 0.56, 'Las sílabas flotan dentro de la lavadora.\n¡Tócalas en el orden correcto!', {
      fontFamily: 'Arial, sans-serif', fontSize: '21px', color: '#dfe6e9', align: 'center',
    }).setOrigin(0.5);

    this.makeBtn(w / 2, h * 0.74, 300, 86, 0x55efc4, '¡ JUGAR ! 🧺')
      .on('pointerup', () => this.scene.start('GameScene'));

    this.makeBtn(w / 2, h * 0.88, 210, 58, 0x74b9ff, '← Atrás')
      .on('pointerup', () => window.history && window.history.back());
    addOrientationRestart(this);
  }

  makeBtn(x, y, w, h, color, label) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22);
    g.lineStyle(4, 0xffffff, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
    const t = this.add.text(0, 0, label, { fontFamily: 'Arial Black, sans-serif', fontSize: '28px', color: '#2d3436' }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.07, duration: 130 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1,    duration: 130 }));
    c.on('pointerdown', () => this.tweens.add({ targets: c, scale: 0.93, duration: 70 }));
    return c;
  }
}

// ─── GAME SCENE ───────────────────────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init() {
    this.wordPool = shuffle(WASH_WORDS).slice(0, 6);
    this.wordIndex = 0;
    this.score = 0;
    this.errors = 0;
  }

  create() {
    paintGradientBackground(this);

    // Machine layers: body first (lowest z), foreground last (highest z).
    // Tiles (level content) are added between these two in startWord().
    this.drawMachineBody();

    this.hudCont = this.buildHud();

    // Foreground: bezel ring drawn on top of tiles to create "inside drum" illusion.
    this.machineFG = this.drawMachineForeground();

    this.levelGroup  = null;
    this.bubbleTimer = null;
    this.tiles = [];
    this.slots = [];

    this.startWord();
    addOrientationRestart(this);
  }

  // ── Machine body (drawn once, behind everything) ───────────────────────────
  drawMachineBody() {
    const g = this.add.graphics();
    const cx = DRUM_X;

    // Outer housing
    g.fillStyle(0xcfd9df, 1);
    g.fillRoundedRect(cx - 190, 120, 380, 530, 26);
    g.lineStyle(4, 0xaab7b8, 1);
    g.strokeRoundedRect(cx - 190, 120, 380, 530, 26);

    // Control panel strip (top)
    g.fillStyle(0xaab7b8, 1);
    g.fillRoundedRect(cx - 190, 120, 380, 82, { tl: 26, tr: 26, bl: 0, br: 0 });

    // Brand label bar
    g.fillStyle(0x636e72, 0.35);
    g.fillRoundedRect(cx - 80, 138, 160, 28, 8);

    // Control knobs / buttons
    const btnColors = [0xff7675, 0xfdcb6e, 0x55efc4, 0x74b9ff];
    btnColors.forEach((col, i) => {
      g.fillStyle(col, 1);
      g.fillCircle(cx - 100 + i * 66, 171, 14);
      g.lineStyle(2, 0xffffff, 0.5);
      g.strokeCircle(cx - 100 + i * 66, 171, 14);
    });

    // Outer door ring (chrome effect: two concentric circles)
    g.fillStyle(0x7f8c8d, 1);
    g.fillCircle(DRUM_X, DRUM_Y, BEZEL_R + 18);
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(DRUM_X, DRUM_Y, BEZEL_R + 8);

    // Drum background (dark water blue)
    g.fillStyle(0x0a3d62, 1);
    g.fillCircle(DRUM_X, DRUM_Y, BEZEL_R);

    // Drum inner background gradient simulation (lighter center)
    g.fillStyle(0x0652dd, 0.7);
    g.fillCircle(DRUM_X, DRUM_Y, DRUM_R + 12);

    // Drum radial "drum hole" texture lines
    g.lineStyle(2, 0x1e6fa8, 0.3);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      g.beginPath();
      g.moveTo(DRUM_X + Math.cos(angle) * 20, DRUM_Y + Math.sin(angle) * 20);
      g.lineTo(DRUM_X + Math.cos(angle) * DRUM_R, DRUM_Y + Math.sin(angle) * DRUM_R);
      g.strokePath();
    }

    // Small drum center circle
    g.fillStyle(0x1e6fa8, 0.6);
    g.fillCircle(DRUM_X, DRUM_Y, 18);

    // Bottom panel
    g.fillStyle(0xaab7b8, 1);
    g.fillRoundedRect(cx - 190, 608, 380, 42, { tl: 0, tr: 0, bl: 26, br: 26 });

    // Door handle (right side)
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(DRUM_X + BEZEL_R + 22, DRUM_Y, 16);
    g.fillStyle(0x636e72, 1);
    g.fillCircle(DRUM_X + BEZEL_R + 22, DRUM_Y, 9);
  }

  // ── Machine foreground: drawn AFTER tiles each word (stays on top) ─────────
  drawMachineForeground() {
    const g = this.add.graphics();

    // Bezel ring: thick stroke creates "inside drum" illusion over tile edges
    g.lineStyle(24, 0x2d3436, 1);
    g.strokeCircle(DRUM_X, DRUM_Y, BEZEL_R + 2);

    // Subtle blue glass tint over whole drum area
    g.fillStyle(0x74b9ff, 0.05);
    g.fillCircle(DRUM_X, DRUM_Y, BEZEL_R);

    // Glass gloss highlight (upper-left)
    g.fillStyle(0xffffff, 0.11);
    g.fillEllipse(DRUM_X - 40, DRUM_Y - 65, 100, 72);

    // Thin inner glass edge
    g.lineStyle(2, 0x74b9ff, 0.35);
    g.strokeCircle(DRUM_X, DRUM_Y, BEZEL_R - 2);

    return g;
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  buildHud() {
    const { width: w } = this.scale;
    const c = this.add.container(0, 0);

    this.add.text(20, 18, '← Menú', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#ffffff',
    }).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MenuScene'));

    this.levelTxt = this.add.text(w / 2, 28, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#dfe6e9',
    }).setOrigin(0.5);

    this.scoreTxt = this.add.text(w - 20, 18, '', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#fdcb6e',
    }).setOrigin(1, 0);

    c.add([this.levelTxt, this.scoreTxt]);
    return c;
  }

  updateHud() {
    this.levelTxt.setText(`Palabra ${this.wordIndex + 1} / ${this.wordPool.length}`);
    this.scoreTxt.setText(`⭐ ${this.score}`);
  }

  // ── Per-word setup ─────────────────────────────────────────────────────────
  startWord() {
    if (this.levelGroup)  this.levelGroup.destroy(true);
    if (this.bubbleTimer) { this.bubbleTimer.remove(false); this.bubbleTimer = null; }

    this.levelGroup        = this.add.container(0, 0);
    this.tiles             = [];
    this.slots             = [];
    this.locked            = false;
    this.nextExpectedIndex = 0;
    this.placedCount       = 0;
    this.updateHud();

    this.currentWord = this.wordPool[this.wordIndex];
    const { syllables, emoji } = this.currentWord;

    // Preload audio
    preloadAudio(this.currentWord.word, 'word');
    syllables.forEach(s => { preloadAudio(s, 'syl'); preloadAudio(s, 'word'); });

    // Build right-side UI: slots + silhouette
    this.buildSlots(syllables);
    this.buildSilhouette(emoji);

    // Bubbles (behind tiles)
    this.startBubbles();

    // Syllable tiles floating in drum
    this.buildTiles(syllables);

    // Bring overlays to top so they render above level content
    this.children.bringToTop(this.machineFG);
    this.children.bringToTop(this.hudCont);
    // Bring menu text (not in hudCont) to top too
    this.children.list
      .filter(c => c.type === 'Text' && c.text === '← Menú')
      .forEach(t => this.children.bringToTop(t));

    // Auto-pronounce word
    this.time.delayedCall(500, () => speak(this.currentWord.word.toLowerCase(), 'word'));
  }

  // ── Answer slots (right panel) ─────────────────────────────────────────────
  buildSlots(syllables) {
    const { height: h } = this.scale;
    const n = syllables.length;
    const sw = 110, sh = 68, gap = 16;
    const totalW = n * sw + (n - 1) * gap;
    const startX = 920 - totalW / 2 + sw / 2;
    const sy = h * 0.21;

    const lbl = this.add.text(920, sy - 46, 'Ordena aquí 👇', {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', color: '#dfe6e9',
    }).setOrigin(0.5);
    this.levelGroup.add(lbl);

    for (let i = 0; i < n; i++) {
      const x = startX + i * (sw + gap);
      const bg = this.add.graphics();
      bg.lineStyle(3, 0xffffff, 0.35);
      bg.strokeRoundedRect(x - sw / 2, sy - sh / 2, sw, sh, 14);
      bg.lineStyle(2, 0xffffff, 0.12);
      bg.strokeRoundedRect(x - sw / 2 + 6, sy - sh / 2 + 6, sw - 12, sh - 12, 9);
      this.levelGroup.add(bg);
      this.slots.push({ x, y: sy, bg });
    }
  }

  // ── Silhouette: gray → color on win ────────────────────────────────────────
  buildSilhouette(emoji) {
    const { height: h } = this.scale;
    const sx = 920, sy = h * 0.64;

    const lbl = this.add.text(sx, sy - 95, '¿Qué hay en la lavadora?', {
      fontFamily: 'Arial, sans-serif', fontSize: '19px', color: '#dfe6e9',
    }).setOrigin(0.5);
    this.levelGroup.add(lbl);

    // Gray silhouette (question mark feel)
    this.silhouetteGray = this.add.text(sx, sy, emoji, {
      fontSize: '118px', padding: { top: 10, bottom: 4 },
    }).setOrigin(0.5).setTint(0x1a1a2e).setAlpha(0.55);
    this.levelGroup.add(this.silhouetteGray);

    // Full-color version (hidden initially)
    this.silhouetteColor = this.add.text(sx, sy, emoji, {
      fontSize: '118px', padding: { top: 10, bottom: 4 },
    }).setOrigin(0.5).setAlpha(0);
    this.levelGroup.add(this.silhouetteColor);

    // Subtle pulse on gray silhouette
    this.tweens.add({
      targets: this.silhouetteGray,
      scale: 1.06, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
  }

  // ── Bubbles inside drum ────────────────────────────────────────────────────
  startBubbles() {
    this.bubbleTimer = this.time.addEvent({
      delay: 850, callback: this.spawnBubble, callbackScope: this, loop: true,
    });
  }

  spawnBubble() {
    const r = 3 + Math.random() * 9;
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * (DRUM_R - 12);
    const x = DRUM_X + Math.cos(angle) * dist;
    const y = DRUM_Y + 30 + Math.random() * (DRUM_R - 30);
    const b = this.add.circle(x, y, r, 0x74b9ff, 0.3);
    this.levelGroup.add(b);
    this.tweens.add({
      targets: b, y: DRUM_Y - DRUM_R * 0.8, alpha: 0,
      duration: 1000 + Math.random() * 800, ease: 'Quad.out',
      onComplete: () => b.destroy(),
    });
  }

  // ── Syllable tiles (interactive, floating) ─────────────────────────────────
  buildTiles(syllables) {
    const tileColors = [0xa29bfe, 0xfd79a8, 0xfdcb6e, 0x55efc4, 0xff7675];

    // Shuffle visual order but preserve syllableIndex for validation
    const indexed = syllables.map((s, i) => ({ s, i }));
    const shuffled = shuffle(indexed);

    shuffled.forEach(({ s, i }) => {
      // Spread initial positions evenly around the drum
      const startAngle = (i / syllables.length) * Math.PI * 2 + Math.random() * 0.8;
      const startDist  = 25 + Math.random() * 50;
      const x = DRUM_X + Math.cos(startAngle) * startDist;
      const y = DRUM_Y + Math.sin(startAngle) * startDist;

      const tile = this.makeTile(x, y, s, i, tileColors[i % tileColors.length]);
      this.tiles.push(tile);
      this.levelGroup.add(tile);
    });

    // Begin floating after tiles settle
    this.time.delayedCall(180, () => this.tiles.forEach(t => this.startFloat(t)));
  }

  makeTile(x, y, syllable, syllableIndex, color) {
    const tw = 90, th = 58;
    const c = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-tw / 2, -th / 2, tw, th, 15);
    g.lineStyle(3, 0xffffff, 0.85);
    g.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 15);
    // Gloss highlight
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-tw / 2 + 5, -th / 2 + 5, tw - 10, th * 0.38, 9);

    const fontSize = syllable.length > 2 ? 22 : 26;
    const txt = this.add.text(0, 1, syllable, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#2d3436',
    }).setOrigin(0.5);

    c.add([g, txt]);
    c.setSize(tw, th);
    c.syllable      = syllable;
    c.syllableIndex = syllableIndex;
    c.isPlaced      = false;
    c.floatStopped  = false;
    c._floatTween   = null;

    c.setInteractive({ useHandCursor: true });

    c.on('pointerover', () => {
      if (!c.isPlaced && !this.locked) this.tweens.add({ targets: c, scale: 1.18, duration: 100 });
    });
    c.on('pointerout', () => {
      if (!c.isPlaced) this.tweens.add({ targets: c, scale: 1, duration: 100 });
    });
    c.on('pointerup', () => this.onTileTap(c));

    return c;
  }

  // ── Float: organic random movement within drum ─────────────────────────────
  startFloat(tile) {
    if (tile.isPlaced || tile.floatStopped) return;

    const angle   = Math.random() * Math.PI * 2;
    const maxDist = DRUM_R - 50;           // keep tile center well inside drum
    const dist    = 12 + Math.random() * maxDist;
    const tx = DRUM_X + Math.cos(angle) * dist;
    const ty = DRUM_Y + Math.sin(angle) * dist;

    tile._floatTween = this.tweens.add({
      targets: tile, x: tx, y: ty,
      duration: 1400 + Math.random() * 1800,
      ease: 'Sine.inOut',
      onComplete: () => {
        if (!tile.isPlaced && !tile.floatStopped) this.startFloat(tile);
      },
    });
  }

  // ── Input: sequential syllable validation ─────────────────────────────────
  onTileTap(tile) {
    if (this.locked || tile.isPlaced) return;

    if (tile.syllableIndex === this.nextExpectedIndex) {
      this.onCorrectTap(tile);
    } else {
      this.onWrongTap(tile);
    }
  }

  onCorrectTap(tile) {
    this.locked = true;
    tile.floatStopped = true;
    if (tile._floatTween) tile._floatTween.stop();

    // Pronounce syllable
    speak(tile.syllable.toLowerCase(), 'syl');

    const slot = this.slots[this.nextExpectedIndex];
    this.nextExpectedIndex++;

    // Pulse up then fly to slot
    this.tweens.add({
      targets: tile, scale: 1.25, duration: 120,
      onComplete: () => {
        this.tweens.add({
          targets: tile, x: slot.x, y: slot.y, scale: 1,
          duration: 400, ease: 'Back.out',
          onComplete: () => {
            tile.isPlaced = true;

            // Green flash on slot outline
            const flash = this.add.graphics();
            flash.lineStyle(5, 0x00b894, 1);
            flash.strokeRoundedRect(slot.x - 55, slot.y - 34, 110, 68, 14);
            this.levelGroup.add(flash);
            this.tweens.add({
              targets: flash, alpha: 0, duration: 650,
              onComplete: () => flash.destroy(),
            });

            this.placedCount++;
            this.locked = false;

            if (this.placedCount >= this.currentWord.syllables.length) {
              this.time.delayedCall(280, () => this.onWordWon());
            }
          },
        });
      },
    });
  }

  onWrongTap(tile) {
    if (this.locked) return;
    this.locked = true;
    this.errors++;

    // Stop float momentarily
    tile.floatStopped = true;
    if (tile._floatTween) tile._floatTween.stop();

    speak(tile.syllable.toLowerCase(), 'syl');

    // Shake in place
    const ox = tile.x;
    this.tweens.add({
      targets: tile, x: ox + 18,
      duration: 60, yoyo: true, repeat: 4,
      onComplete: () => {
        tile.x = ox;
        tile.floatStopped = false;
        this.locked = false;
        this.startFloat(tile); // resume floating
      },
    });
  }

  // ── Victory: reveal emoji, confetti ───────────────────────────────────────
  onWordWon() {
    this.locked = true;
    this.score += 15;
    this.updateHud();

    // Stop bubbles
    if (this.bubbleTimer) { this.bubbleTimer.remove(false); this.bubbleTimer = null; }

    // Stop silhouette pulse
    this.tweens.killTweensOf(this.silhouetteGray);

    // "Ding" — washing done: speak word
    speak(this.currentWord.word.toLowerCase(), 'word');

    // Silhouette: gray fades out, color fades in with a pop
    this.tweens.add({ targets: this.silhouetteGray, alpha: 0, duration: 300 });
    this.tweens.add({
      targets: this.silhouetteColor, alpha: 1, duration: 400, delay: 220,
      onComplete: () => {
        this.tweens.add({
          targets: this.silhouetteColor,
          scale: { from: 1.0, to: 1.3 },
          duration: 300, yoyo: true, ease: 'Back.out',
        });
      },
    });

    // Radiate star burst from revealed emoji
    const sx = 920, sy = this.scale.height * 0.64;
    const symbols = ['⭐', '✨', '💫', '🌟', '🎉'];
    for (let i = 0; i < 14; i++) {
      const s = this.add.text(sx, sy, symbols[i % symbols.length], { fontSize: '28px' }).setOrigin(0.5);
      const angle = (i / 14) * Math.PI * 2;
      const dist  = 120 + Math.random() * 100;
      this.tweens.add({
        targets: s,
        x: sx + Math.cos(angle) * dist,
        y: sy + Math.sin(angle) * dist,
        alpha: 0, scale: 0.2,
        duration: 800 + Math.random() * 300, ease: 'Cubic.out',
        onComplete: () => s.destroy(),
      });
    }

    // Confetti rain from top
    const { width: w } = this.scale;
    const confettiSyms = ['⭐', '✨', '🌟', '🎊', '💫'];
    for (let i = 0; i < 28; i++) {
      const s = this.add.text(
        600 + Math.random() * (w - 620),
        100 + Math.random() * 200,
        confettiSyms[i % confettiSyms.length],
        { fontSize: '26px' }
      ).setOrigin(0.5);
      this.tweens.add({
        targets: s, y: s.y + 400, alpha: 0, rotation: Math.random() * 4,
        duration: 1000 + Math.random() * 600,
        delay: Math.random() * 400, ease: 'Quad.in',
        onComplete: () => s.destroy(),
      });
    }

    this.time.delayedCall(750, () => speak('¡genial!', 'word'));

    this.time.delayedCall(2500, () => {
      this.wordIndex++;
      if (this.wordIndex >= this.wordPool.length) {
        this.scene.start('ResultScene', {
          score: this.score, total: this.wordPool.length, errors: this.errors,
        });
      } else {
        this.startWord();
      }
    });
  }
}

// ─── RESULT SCENE ─────────────────────────────────────────────────────────────
class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data) {
    this.score  = data.score;
    this.total  = data.total;
    this.errors = data.errors;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    const stars = this.errors === 0 ? 3 : this.errors <= 3 ? 2 : 1;
    const title = stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Bien!';

    this.add.text(w / 2, h * 0.18, title, {
      fontFamily: 'Georgia, serif', fontSize: '88px', color: '#ffffff',
      stroke: '#6c5ce7', strokeThickness: 6,
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const s = this.add.text(w / 2 - 110 + i * 110, h * 0.41, filled ? '⭐' : '☆', {
        fontSize: '90px', color: filled ? '#fdcb6e' : '#636e72',
        padding: { top: 16, bottom: 4 },
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({ targets: s, scale: 1, delay: 300 + i * 200, duration: 400, ease: 'Back.out' });
    }

    this.add.text(w / 2, h * 0.61, `Puntos: ${this.score}`, {
      fontFamily: 'Arial Black', fontSize: '36px', color: '#fdcb6e',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.68, `Errores: ${this.errors}`, {
      fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    this.makeBtn(w / 2 - 140, h * 0.85, 240, 64, 0x55efc4, 'Otra vez')
      .on('pointerup', () => this.scene.start('GameScene'));

    this.makeBtn(w / 2 + 140, h * 0.85, 240, 64, 0x74b9ff, 'Menú')
      .on('pointerup', () => this.scene.start('MenuScene'));

    this.time.delayedCall(900, () => speak(stars === 3 ? '¡perfecto, increíble!' : '¡muy bien!', 'word'));
    addOrientationRestart(this);
  }

  makeBtn(x, y, w, h, color, label) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    const t = this.add.text(0, 0, label, { fontFamily: 'Arial Black', fontSize: '28px', color: '#2d3436' }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 150 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1,    duration: 150 }));
    return c;
  }
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#0f0c29',
  scale: { mode: Phaser.Scale.RESIZE },
  scene: [MenuScene, GameScene, ResultScene],
});
