// EL PUENTE DE LA SÍLABA INICIAL — Conciencia Fonológica
// Identifica las palabras que empiezan por la misma sílaba inicial.
// Audio compartido con ../silabas/audio/palabras/

// ─── Niveles ─────────────────────────────────────────────────────────────────
const PUENTE_LEVELS = [
  {
    anchor: { word: 'CASA',     syllable: 'CA', emoji: '🏠' },
    correct: [{ word: 'CAMISA',   emoji: '👕' }, { word: 'CALABAZA', emoji: '🎃' }],
    wrong:   [{ word: 'LUNA',     emoji: '🌙' }, { word: 'GATO',     emoji: '🐱' }],
  },
  {
    anchor: { word: 'PELOTA',   syllable: 'PE', emoji: '⚽' },
    correct: [{ word: 'PERRO',   emoji: '🐶' }, { word: 'PEINE',    emoji: '🪮' }],
    wrong:   [{ word: 'MANZANA', emoji: '🍎' }, { word: 'PATO',     emoji: '🦆' }],
  },
  {
    anchor: { word: 'COCHE',    syllable: 'CO', emoji: '🚗' },
    correct: [{ word: 'CONEJO',  emoji: '🐰' }, { word: 'COHETE',   emoji: '🚀' }],
    wrong:   [{ word: 'PIÑA',    emoji: '🍍' }, { word: 'ESTRELLA', emoji: '⭐' }],
  },
  {
    anchor: { word: 'MARIPOSA', syllable: 'MA', emoji: '🦋' },
    correct: [{ word: 'MANZANA', emoji: '🍎' }, { word: 'MALETA',   emoji: '🧳' }],
    wrong:   [{ word: 'COHETE',  emoji: '🚀' }, { word: 'TORTUGA',  emoji: '🐢' }],
  },
  {
    anchor: { word: 'PATO',     syllable: 'PA', emoji: '🦆' },
    correct: [{ word: 'PALOMA',  emoji: '🕊️' }, { word: 'PAPÁ',     emoji: '👨' }],
    wrong:   [{ word: 'LUNA',    emoji: '🌙' }, { word: 'MESA',     emoji: '🪑' }],
  },
  {
    anchor: { word: 'PIÑA',     syllable: 'PI', emoji: '🍍' },
    correct: [{ word: 'PINO',    emoji: '🌲' }, { word: 'PIRULETA', emoji: '🍭' }],
    wrong:   [{ word: 'GATO',    emoji: '🐱' }, { word: 'PERRO',    emoji: '🐶' }],
  },
];

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
function googleUrl(text) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`;
}
function preloadAudio(text) {
  const key = text.toLowerCase();
  if (audioCache.has(key)) return audioCache.get(key);
  const a = new Audio(localWordUrl(text));
  a.preload = 'auto';
  let fallbackTried = false;
  a.addEventListener('error', () => {
    if (fallbackTried) return;
    fallbackTried = true;
    a.src = googleUrl(text);
    a.load();
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
  u.rate = rate;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}
function speak(text, rate = 1.0) {
  if (!text) return;
  const a = preloadAudio(text);
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

// ─── MENU SCENE ───────────────────────────────────────────────────────────────
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    this.add.text(w / 2, h * 0.13, 'El Puente de la Sílaba', {
      fontFamily: 'Georgia, serif', fontSize: '66px', color: '#ffffff',
      stroke: '#6c5ce7', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.23, '¡Ayuda al osito a cruzar el río!', {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#fdcb6e', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Animated preview icons
    const icons = ['🐻', '🌊', '🏠', '👕', '🐰', '🚀'];
    icons.forEach((e, i) => {
      const x = (w / (icons.length + 1)) * (i + 1);
      const y = h * 0.4;
      const t = this.add.text(x, y, e, { fontSize: '62px', padding: { top: 10, bottom: 2 } }).setOrigin(0.5);
      this.tweens.add({ targets: t, y: y - 16, duration: 1300 + i * 110, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    this.add.text(w / 2, h * 0.57, 'Arrastra las piedras que empiecen\npor la misma sílaba que la palabra guía', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#dfe6e9', align: 'center',
    }).setOrigin(0.5);

    this.makeBtn(w / 2, h * 0.74, 300, 86, 0x55efc4, '¡ JUGAR ! 🎮')
      .on('pointerup', () => this.scene.start('GameScene'));

    this.makeBtn(w / 2, h * 0.88, 210, 58, 0x74b9ff, '← Atrás')
      .on('pointerup', () => window.history && window.history.back());
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
    this.levels     = shuffle(PUENTE_LEVELS);
    this.levelIndex = 0;
    this.score      = 0;
    this.errors     = 0;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    // River (fixed, drawn once)
    this.riverY  = Math.round(h * 0.34);
    this.riverH  = Math.round(h * 0.22);
    this.riverMY = this.riverY + Math.round(this.riverH / 2);
    this.drawRiver(w, h);

    // HUD
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

    // Per-level container
    this.levelGroup = null;
    this.slots = [];
    this.stones = [];
    this.locked = false;
    this.filledSlots = 0;

    this.startLevel();
  }

  drawRiver(w, h) {
    const g = this.add.graphics();
    // Main water body
    g.fillStyle(0x0652dd, 0.75);
    g.fillRect(0, this.riverY, w, this.riverH);
    // Lighter shimmer stripes
    g.lineStyle(3, 0x74b9ff, 0.3);
    for (let i = 1; i <= 5; i++) {
      const y = this.riverY + (this.riverH / 6) * i;
      g.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const yy = y + Math.sin((x / w) * Math.PI * 10 + i * 0.8) * 5;
        if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
      }
      g.strokePath();
    }
    // Bank edges
    g.fillStyle(0x27ae60, 0.45);
    g.fillRect(0, this.riverY - 14, w, 14);
    g.fillRect(0, this.riverY + this.riverH, w, 14);
  }

  updateHud() {
    this.levelTxt.setText(`Nivel ${this.levelIndex + 1} / ${this.levels.length}`);
    this.scoreTxt.setText(`⭐ ${this.score}`);
  }

  startLevel() {
    if (this.levelGroup) this.levelGroup.destroy(true);
    this.levelGroup = this.add.container(0, 0);
    this.slots      = [];
    this.stones     = [];
    this.locked     = false;
    this.filledSlots = 0;
    this.updateHud();

    const lvl = this.levels[this.levelIndex];
    const { width: w, height: h } = this.scale;

    // Preload all audio for this level
    preloadAudio(lvl.anchor.word);
    lvl.correct.forEach(s => preloadAudio(s.word));
    lvl.wrong.forEach(s => preloadAudio(s.word));

    // ── Anchor display (upper left) ──────────────────────
    this.buildAnchor(lvl, w, h);

    // ── Character 🐻 (left bank) ─────────────────────────
    this.character = this.add.text(80, this.riverMY, '🐻', {
      fontSize: '72px', padding: { top: 10, bottom: 4 },
    }).setOrigin(0.5);
    this.levelGroup.add(this.character);

    this.charBob = this.tweens.add({
      targets: this.character, y: this.riverMY - 10,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    // ── Bridge slots (in river center) ───────────────────
    const slotGap = 160;
    const slotCenterX = w / 2;
    [-slotGap / 2, slotGap / 2].forEach(offset => {
      const slot = this.makeSlot(slotCenterX + offset, this.riverMY);
      this.slots.push(slot);
      this.levelGroup.add(slot);
    });

    // ── Stones (bottom area, shuffled) ───────────────────
    const allStones = [
      ...lvl.correct.map(d => ({ ...d, isCorrect: true })),
      ...lvl.wrong.map(d => ({ ...d, isCorrect: false })),
    ];
    const shuffled = shuffle(allStones);
    const stW = 180, stH = 130, stGap = 26;
    const totalW = shuffled.length * stW + (shuffled.length - 1) * stGap;
    const stStartX = (w - totalW) / 2 + stW / 2;
    const stY = h * 0.79;

    shuffled.forEach((data, i) => {
      const stone = this.makeStone(stStartX + i * (stW + stGap), stY, stW, stH, data);
      this.stones.push(stone);
      this.levelGroup.add(stone);
    });

    // Auto-pronounce anchor word
    this.time.delayedCall(450, () => speak(lvl.anchor.word.toLowerCase()));
  }

  buildAnchor(lvl, w, h) {
    const ax = 145, ay = h * 0.19;
    const boxW = 240, boxH = 190;

    // Container box
    const bg = this.add.graphics();
    bg.fillStyle(0x6c5ce7, 0.9);
    bg.fillRoundedRect(ax - boxW / 2, ay - boxH / 2, boxW, boxH, 20);
    bg.lineStyle(3, 0xffffff, 0.7);
    bg.strokeRoundedRect(ax - boxW / 2, ay - boxH / 2, boxW, boxH, 20);
    this.levelGroup.add(bg);

    // Label
    const lbl = this.add.text(ax, ay - boxH / 2 + 18, '¡Empieza como!', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#dfe6e9',
    }).setOrigin(0.5);
    this.levelGroup.add(lbl);

    // Emoji (animated)
    const emojiTxt = this.add.text(ax, ay - 22, lvl.anchor.emoji, {
      fontSize: '72px', padding: { top: 8, bottom: 4 },
    }).setOrigin(0.5);
    this.levelGroup.add(emojiTxt);
    this.tweens.add({ targets: emojiTxt, scale: 1.1, duration: 950, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Syllable split — "CA" in gold + "-SA" in white
    const syllable = lvl.anchor.syllable;
    const rest     = lvl.anchor.word.slice(syllable.length);

    const sylTxt = this.add.text(0, 0, syllable, {
      fontFamily: 'Arial Black, sans-serif', fontSize: '30px', color: '#fdcb6e',
      stroke: '#2d3436', strokeThickness: 3,
    });
    this.levelGroup.add(sylTxt);

    const restStr = rest.length > 0 ? `-${rest}` : '';
    const restTxt = this.add.text(0, 0, restStr, {
      fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#dfe6e9',
    });
    this.levelGroup.add(restTxt);

    // Position side-by-side, centered at ax
    const totalTxtW = sylTxt.width + (restStr.length > 0 ? restTxt.width + 2 : 0);
    sylTxt.x = ax - totalTxtW / 2;
    sylTxt.y = ay + 55;
    restTxt.x = ax - totalTxtW / 2 + sylTxt.width + 2;
    restTxt.y = ay + 60;

    // Speaker button
    const spkBg = this.add.graphics();
    spkBg.fillStyle(0x0984e3, 0.85);
    spkBg.fillCircle(ax, ay + boxH / 2 - 20, 22);
    this.levelGroup.add(spkBg);

    const spkTxt = this.add.text(ax, ay + boxH / 2 - 20, '🔊', { fontSize: '22px' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    spkTxt.on('pointerup', () => speak(lvl.anchor.word.toLowerCase()));
    this.levelGroup.add(spkTxt);
  }

  makeSlot(x, y) {
    const sw = 130, sh = 110;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x2d3436, 0.5);
    g.fillRoundedRect(-sw / 2, -sh / 2, sw, sh, 18);
    g.lineStyle(4, 0xffffff, 0.4);
    g.strokeRoundedRect(-sw / 2, -sh / 2, sw, sh, 18);
    g.lineStyle(2, 0xffffff, 0.18);
    g.strokeRoundedRect(-sw / 2 + 8, -sh / 2 + 8, sw - 16, sh - 16, 12);
    c.add(g);
    c.setSize(sw, sh);
    c.filled = false;
    c.slotW  = sw;
    c.slotH  = sh;
    return c;
  }

  makeStone(x, y, sw, sh, data) {
    const c = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(0x636e72, 1);
    g.fillRoundedRect(-sw / 2, -sh / 2, sw, sh, 22);
    g.lineStyle(4, 0xffffff, 0.55);
    g.strokeRoundedRect(-sw / 2, -sh / 2, sw, sh, 22);
    // Highlight gloss
    g.fillStyle(0xffffff, 0.13);
    g.fillRoundedRect(-sw / 2 + 8, -sh / 2 + 8, sw - 16, sh * 0.38, 14);

    const emoji = this.add.text(0, -6, data.emoji, {
      fontSize: '52px', padding: { top: 8, bottom: 2 },
    }).setOrigin(0.5);

    c.add([g, emoji]);
    c.setSize(sw, sh);
    c.originX0  = x;
    c.originY0  = y;
    c.isCorrect = data.isCorrect;
    c.word      = data.word;
    c.lockedInPlace = false;

    c.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(c);

    c.on('pointerdown', () => {
      if (!this.locked && !c.lockedInPlace) speak(data.word.toLowerCase());
    });

    c.on('dragstart', () => {
      if (this.locked || c.lockedInPlace) return;
      this.children.bringToTop(c);
      this.tweens.add({ targets: c, scale: 1.12, duration: 120 });
      // Vacate slot if already placed
      if (c.placedSlot) {
        c.placedSlot.filled = false;
        c.placedSlot = null;
        this.filledSlots--;
      }
    });

    c.on('drag', (_, dragX, dragY) => {
      if (this.locked || c.lockedInPlace) return;
      c.x = dragX;
      c.y = dragY;
    });

    c.on('dragend', () => {
      if (this.locked || c.lockedInPlace) return;
      this.tweens.add({ targets: c, scale: 1, duration: 120 });
      const slot = this.nearestFreeSlot(c);
      if (slot) {
        this.onDrop(c, slot);
      } else {
        this.returnToOrigin(c);
      }
    });

    return c;
  }

  nearestFreeSlot(stone) {
    const threshold = 90;
    let best = null, bestDist = threshold;
    for (const slot of this.slots) {
      if (slot.filled) continue;
      const d = Phaser.Math.Distance.Between(stone.x, stone.y, slot.x, slot.y);
      if (d < bestDist) { bestDist = d; best = slot; }
    }
    return best;
  }

  returnToOrigin(stone, ease = 'Back.out') {
    this.tweens.add({
      targets: stone, x: stone.originX0, y: stone.originY0,
      duration: 300, ease,
    });
  }

  onDrop(stone, slot) {
    if (stone.isCorrect) {
      this.onCorrect(stone, slot);
    } else {
      this.onWrong(stone, slot);
    }
  }

  onCorrect(stone, slot) {
    slot.filled   = true;
    stone.placedSlot = slot;
    this.filledSlots++;

    // Snap into slot
    this.tweens.add({ targets: stone, x: slot.x, y: slot.y, duration: 200, ease: 'Back.out' });

    // Green flash ring
    const flash = this.add.graphics();
    flash.lineStyle(8, 0x00b894, 0.9);
    flash.strokeRoundedRect(slot.x - slot.slotW / 2, slot.y - slot.slotH / 2, slot.slotW, slot.slotH, 18);
    this.levelGroup.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });

    // Sparkle burst
    for (let i = 0; i < 10; i++) {
      const star = this.add.text(slot.x, slot.y, '✨', { fontSize: '22px' }).setOrigin(0.5);
      const angle = (i / 10) * Math.PI * 2;
      this.tweens.add({
        targets: star,
        x: slot.x + Math.cos(angle) * 80, y: slot.y + Math.sin(angle) * 80,
        alpha: 0, scale: 0.2,
        duration: 550, ease: 'Cubic.out',
        onComplete: () => star.destroy(),
      });
    }

    // Lock stone in place
    this.time.delayedCall(220, () => { stone.lockedInPlace = true; });

    speak(stone.word.toLowerCase());

    if (this.filledSlots >= 2) {
      this.time.delayedCall(700, () => this.onLevelWon());
    }
  }

  onWrong(stone, slot) {
    this.errors++;
    this.locked = true;

    // Short snap toward slot then reject
    this.tweens.add({
      targets: stone, x: slot.x, y: slot.y,
      duration: 160, ease: 'Quad.out',
      onComplete: () => {
        // Water-splash emoji
        const splash = this.add.text(slot.x, slot.y - 20, '💧', { fontSize: '34px' }).setOrigin(0.5);
        this.tweens.add({
          targets: splash, y: slot.y - 70, alpha: 0,
          duration: 500, ease: 'Quad.out', onComplete: () => splash.destroy(),
        });
        // Shake then return
        const ox = slot.x;
        this.tweens.add({
          targets: stone, x: ox + 14,
          duration: 55, yoyo: true, repeat: 4,
          onComplete: () => {
            this.returnToOrigin(stone, 'Back.out');
            this.time.delayedCall(320, () => { this.locked = false; });
          },
        });
      },
    });

    speak(stone.word.toLowerCase());
  }

  onLevelWon() {
    this.locked = true;
    this.score += 20;
    this.updateHud();

    const { width: w } = this.scale;

    // Kill idle bob, run character across
    if (this.charBob) this.charBob.stop();
    this.tweens.add({
      targets: this.character,
      x: w + 100, y: this.riverMY,
      duration: 1100, ease: 'Quad.in',
    });

    // Confetti rain
    const symbols = ['⭐', '✨', '💫', '🌟', '🎉', '🎊', '🏆'];
    for (let i = 0; i < 38; i++) {
      const s = this.add.text(
        180 + Math.random() * (w - 360),
        this.riverMY - 30 + Math.random() * 80,
        symbols[i % symbols.length],
        { fontSize: '30px' }
      ).setOrigin(0.5);
      this.tweens.add({
        targets: s,
        y: s.y + 320 + Math.random() * 200,
        alpha: 0, rotation: Math.random() * 4,
        duration: 1000 + Math.random() * 600,
        delay: Math.random() * 350, ease: 'Quad.in',
        onComplete: () => s.destroy(),
      });
    }

    this.time.delayedCall(350, () => speak('¡genial!'));

    this.time.delayedCall(1700, () => {
      this.levelIndex++;
      if (this.levelIndex >= this.levels.length) {
        this.scene.start('ResultScene', {
          score: this.score, total: this.levels.length, errors: this.errors,
        });
      } else {
        this.startLevel();
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

    this.time.delayedCall(900, () => speak(stars === 3 ? '¡perfecto, increíble!' : '¡muy bien!'));
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
  width: 1280,
  height: 800,
  parent: 'game',
  backgroundColor: '#0f0c29',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [MenuScene, GameScene, ResultScene],
});
