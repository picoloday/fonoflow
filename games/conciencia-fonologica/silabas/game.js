// =========================================================
// SÍLABAS MÁGICAS — Conciencia Fonológica
// =========================================================
// La constante WORDS se carga desde words.js (script anterior en index.html).

const TILE_COLORS = [0x74b9ff, 0xa29bfe, 0xfd79a8, 0xfdcb6e, 0x55efc4, 0xff9ff3];

// ---------- Audio / Speech ----------
// Estrategia: archivos MP3 locales (generados con Microsoft Edge TTS) como
// fuente principal. Si falta un archivo, fallback a Google Translate TTS
// (online). Si Google falla, fallback final a Web Speech API.
//
// Generar los MP3: ver tools/README.md.
const audioCache = new Map();          // key: 'word:gato' o 'syl:ra'
let currentAudio = null;
let preferredVoice = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  preferredVoice =
    voices.find(v => /^es-ES/i.test(v.lang)) ||
    voices.find(v => /^es-MX/i.test(v.lang)) ||
    voices.find(v => /^es-/i.test(v.lang)) ||
    voices.find(v => /^es/i.test(v.lang)) ||
    null;
}

if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

function localUrl(text, kind) {
  const folder = kind === 'word' ? 'palabras' : 'silabas';
  return `audio/${folder}/${encodeURIComponent(text.toLowerCase())}.mp3?v=4`;
}

function googleUrl(text) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`;
}

function preloadAudio(text, kind = 'word') {
  const key = `${kind}:${text.toLowerCase()}`;
  if (audioCache.has(key)) return audioCache.get(key);

  const a = new Audio(localUrl(text, kind));
  a.preload = 'auto';
  a.dataset && (a.dataset.kind = kind);

  // Si el archivo local no existe (404), pasamos automáticamente a Google TTS.
  let fallbackTried = false;
  a.addEventListener('error', () => {
    if (fallbackTried) return;
    fallbackTried = true;
    console.warn(`[audio] sin archivo local para "${text}" — usando Google TTS`);
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

function play(text, kind, rate) {
  if (!text) return;
  const a = preloadAudio(text, kind);
  try {
    if (currentAudio && currentAudio !== a) currentAudio.pause();
    a.pause();
    a.currentTime = 0;
    a.playbackRate = rate;
    currentAudio = a;
    const p = a.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => speakWebApi(text, rate));
    }
  } catch (e) {
    speakWebApi(text, rate);
  }
}

function speak(text) {
  play(text, 'word', 1.0);
}

function speakSyllable(syllable) {
  play(syllable, 'syl', 1.0);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function paintGradientBackground(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;
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
  // Sparkles
  for (let i = 0; i < 50; i++) {
    const s = scene.add.circle(
      Math.random() * w,
      Math.random() * h,
      Math.random() * 2 + 1,
      0xffffff,
      Math.random() * 0.6 + 0.2
    );
    scene.tweens.add({
      targets: s,
      alpha: { from: s.alpha, to: 0.05 },
      duration: 1500 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 2000,
    });
  }
}

// =========================================================
// MENU SCENE
// =========================================================
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    // Title
    this.add.text(w / 2, h * 0.16, 'Sílabas Mágicas', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#6c5ce7',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.25, 'Conciencia Fonológica', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#fdcb6e',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Floating emojis
    const emojis = ['🦋', '⭐', '🌙', '🎈', '🦄', '🐘'];
    emojis.forEach((e, i) => {
      const x = (w / (emojis.length + 1)) * (i + 1);
      const y = h * 0.4;
      const t = this.add.text(x, y, e, { fontSize: '64px' }).setOrigin(0.5);
      this.tweens.add({
        targets: t,
        y: y - 18,
        duration: 1400 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    });

    // Level buttons
    const levels = [
      { key: 'facil',   label: 'FÁCIL',   sub: '2 sílabas',  color: 0x55efc4, y: h * 0.58 },
      { key: 'medio',   label: 'MEDIO',   sub: '3 sílabas',  color: 0xfdcb6e, y: h * 0.72 },
      { key: 'dificil', label: 'DIFÍCIL', sub: '4 ó 5 sílabas', color: 0xff7675, y: h * 0.86 },
    ];

    levels.forEach((l) => {
      const btn = this.makeButton(w / 2, l.y, 380, 80, l.color, l.label, l.sub);
      btn.on('pointerup', () => this.scene.start('GameScene', { level: l.key }));
    });

    this.add.text(w / 2, h * 0.97,
      'Arrastra las sílabas en el orden correcto para formar la palabra',
      { fontSize: '16px', color: '#dfe6e9' }
    ).setOrigin(0.5, 1);
  }

  makeButton(x, y, w, h, color, label, sub) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    g.lineStyle(4, 0xffffff, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);

    const txt = this.add.text(0, -10, label, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '32px',
      color: '#2d3436',
    }).setOrigin(0.5);

    const subTxt = this.add.text(0, 22, sub, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#2d3436',
    }).setOrigin(0.5);

    c.add([g, txt, subTxt]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 150 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1, duration: 150 }));
    c.on('pointerdown', () => this.tweens.add({ targets: c, scale: 0.95, duration: 80 }));
    return c;
  }
}

// =========================================================
// GAME SCENE
// =========================================================
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.level = data.level || 'facil';
    const pool = WORDS[this.level];
    this.queue = shuffle(pool).slice(0, Math.min(6, pool.length));
    this.currentIndex = 0;
    this.score = 0;
    this.errors = 0;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    // HUD
    this.add.text(20, 20, '← Menú', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MenuScene'));

    this.scoreText = this.add.text(w - 20, 20, '', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '24px',
      color: '#fdcb6e',
    }).setOrigin(1, 0);

    this.progressText = this.add.text(w / 2, 30, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#dfe6e9',
    }).setOrigin(0.5);

    this.updateHud();
    this.startWord();
  }

  updateHud() {
    this.scoreText.setText(`⭐ ${this.score}`);
    this.progressText.setText(`Palabra ${this.currentIndex + 1} de ${this.queue.length}`);
  }

  clearWord() {
    if (this.wordGroup) this.wordGroup.destroy(true);
    this.wordGroup = this.add.container(0, 0);
    this.slots = [];
    this.tiles = [];
    this.locked = false;
  }

  startWord() {
    this.clearWord();
    this.updateHud();
    const { width: w, height: h } = this.scale;
    const data = this.queue[this.currentIndex];

    // Pre-carga audios (palabra + sílabas) para evitar latencia al pronunciar
    preloadAudio(data.word, 'word');
    data.syllables.forEach(s => preloadAudio(s, 'syl'));

    // Emoji
    const emoji = this.add.text(w / 2, h * 0.22, data.emoji, { fontSize: '120px' }).setOrigin(0.5);
    this.wordGroup.add(emoji);
    this.tweens.add({
      targets: emoji,
      y: emoji.y - 12,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Listen button
    const listenBg = this.add.graphics();
    listenBg.fillStyle(0x6c5ce7, 1);
    listenBg.fillRoundedRect(-100, -22, 200, 44, 22);
    listenBg.lineStyle(3, 0xffffff, 1);
    listenBg.strokeRoundedRect(-100, -22, 200, 44, 22);
    const listenTxt = this.add.text(0, 0, '🔊  Escuchar', {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const listen = this.add.container(w / 2, h * 0.37, [listenBg, listenTxt]);
    listen.setSize(200, 44).setInteractive({ useHandCursor: true });
    listen.on('pointerup', () => speak(data.word.toLowerCase()));
    listen.on('pointerover', () => this.tweens.add({ targets: listen, scale: 1.06, duration: 120 }));
    listen.on('pointerout',  () => this.tweens.add({ targets: listen, scale: 1, duration: 120 }));
    this.wordGroup.add(listen);

    // Auto-pronounce after a small delay
    this.time.delayedCall(250, () => speak(data.word.toLowerCase()));

    // Slot layout
    const n = data.syllables.length;
    const tileW = n >= 5 ? 95 : n === 4 ? 110 : 130;
    const tileH = 90;
    const gap = 14;
    const totalW = n * tileW + (n - 1) * gap;
    const startX = (w - totalW) / 2 + tileW / 2;
    const slotY = h * 0.55;

    for (let i = 0; i < n; i++) {
      const x = startX + i * (tileW + gap);
      const slot = this.makeSlot(x, slotY, tileW, tileH);
      slot.expected = data.syllables[i];
      slot.index = i;
      slot.filledTile = null;
      this.slots.push(slot);
      this.wordGroup.add(slot);
    }

    // Tiles (scrambled)
    const tileY = h * 0.78;
    const indexed = data.syllables.map((s, i) => ({ s, originalIndex: i }));
    const scrambled = shuffle(indexed);
    // Make sure scramble is not already correct
    if (scrambled.every((e, i) => e.originalIndex === i) && scrambled.length > 1) {
      [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
    }
    scrambled.forEach((entry, idx) => {
      const x = startX + idx * (tileW + gap);
      const color = TILE_COLORS[entry.originalIndex % TILE_COLORS.length];
      const tile = this.makeTile(x, tileY, tileW, tileH, entry.s, color);
      tile.originX0 = x;
      tile.originY0 = tileY;
      this.tiles.push(tile);
      this.wordGroup.add(tile);
    });
  }

  makeSlot(x, y, w, h) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(4, 0xffffff, 0.55);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    c.add(g);
    c.setSize(w, h);
    c.tileWidth = w;
    c.tileHeight = h;
    return c;
  }

  makeTile(x, y, w, h, label, color) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    g.lineStyle(4, 0xffffff, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.35, 12);

    const fontSize = label.length > 2 ? 32 : 40;
    const t = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#2d3436',
    }).setOrigin(0.5);

    c.add([g, t]);
    c.setSize(w, h);
    c.label = label;
    c.placedSlot = null;
    c.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(c);

    c.on('drag', (pointer, dragX, dragY) => {
      if (this.locked) return;
      c.x = dragX;
      c.y = dragY;
    });

    c.on('dragstart', () => {
      if (this.locked) return;
      this.children.bringToTop(c);
      this.tweens.add({ targets: c, scale: 1.1, duration: 120 });
      if (c.placedSlot) {
        c.placedSlot.filledTile = null;
        c.placedSlot = null;
      }
      speakSyllable(label);
    });

    c.on('dragend', () => {
      if (this.locked) return;
      this.tweens.add({ targets: c, scale: 1, duration: 120 });
      const nearest = this.findSlotForTile(c);
      if (nearest) {
        this.tweens.add({
          targets: c,
          x: nearest.x,
          y: nearest.y,
          duration: 180,
          ease: 'Back.out',
        });
        nearest.filledTile = c;
        c.placedSlot = nearest;
        this.checkComplete();
      } else {
        this.tweens.add({
          targets: c,
          x: c.originX0,
          y: c.originY0,
          duration: 220,
          ease: 'Back.out',
        });
      }
    });

    return c;
  }

  findSlotForTile(tile) {
    let best = null;
    let bestDist = 90;
    for (const slot of this.slots) {
      if (slot.filledTile) continue;
      const d = Phaser.Math.Distance.Between(tile.x, tile.y, slot.x, slot.y);
      if (d < bestDist) {
        bestDist = d;
        best = slot;
      }
    }
    return best;
  }

  checkComplete() {
    const allFilled = this.slots.every(s => s.filledTile);
    if (!allFilled) return;

    const correct = this.slots.every(s => s.filledTile.label === s.expected);
    if (correct) this.onSuccess();
    else this.onPartialError();
  }

  onPartialError() {
    this.errors++;
    this.locked = true;
    let pending = 0;
    this.slots.forEach(s => {
      if (s.filledTile && s.filledTile.label !== s.expected) {
        const t = s.filledTile;
        pending++;
        this.tweens.add({
          targets: t,
          x: { from: t.x - 8, to: t.x + 8 },
          duration: 60,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            s.filledTile = null;
            t.placedSlot = null;
            this.tweens.add({
              targets: t,
              x: t.originX0,
              y: t.originY0,
              duration: 250,
              ease: 'Back.out',
              onComplete: () => {
                pending--;
                if (pending === 0) this.locked = false;
              },
            });
          },
        });
      }
    });
    if (pending === 0) this.locked = false;
  }

  onSuccess() {
    this.locked = true;
    this.score += 10;
    this.updateHud();
    const data = this.queue[this.currentIndex];
    speak(data.word.toLowerCase());

    // Particle burst (emoji confetti)
    const { width: w, height: h } = this.scale;
    const symbols = ['⭐', '✨', '💫', '🌟', '🎉'];
    for (let i = 0; i < 28; i++) {
      const star = this.add.text(w / 2, h * 0.55, symbols[i % symbols.length], {
        fontSize: '32px',
      }).setOrigin(0.5);
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 220;
      this.tweens.add({
        targets: star,
        x: w / 2 + Math.cos(angle) * dist,
        y: h * 0.55 + Math.sin(angle) * dist,
        alpha: 0,
        scale: { from: 1, to: 0.3 },
        rotation: Math.random() * Math.PI * 2,
        duration: 900 + Math.random() * 400,
        ease: 'Cubic.out',
        onComplete: () => star.destroy(),
      });
    }

    // Tile pulse
    this.slots.forEach(s => {
      if (s.filledTile) {
        this.tweens.add({
          targets: s.filledTile,
          scale: { from: 1, to: 1.15 },
          yoyo: true,
          duration: 220,
        });
      }
    });

    this.time.delayedCall(1500, () => {
      this.currentIndex++;
      if (this.currentIndex >= this.queue.length) {
        this.scene.start('ResultScene', {
          score: this.score,
          total: this.queue.length,
          errors: this.errors,
          level: this.level,
        });
      } else {
        this.startWord();
      }
    });
  }
}

// =========================================================
// RESULT SCENE
// =========================================================
class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data) {
    this.score = data.score;
    this.total = data.total;
    this.errors = data.errors;
    this.level = data.level;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    const stars = this.errors === 0 ? 3 : this.errors <= 2 ? 2 : 1;
    const titleText = stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Bien!';

    this.add.text(w / 2, h * 0.18, titleText, {
      fontFamily: 'Georgia, serif',
      fontSize: '88px',
      color: '#ffffff',
      stroke: '#6c5ce7',
      strokeThickness: 6,
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const s = this.add.text(w / 2 - 110 + i * 110, h * 0.4, filled ? '⭐' : '☆', {
        fontSize: '90px',
        color: filled ? '#fdcb6e' : '#636e72',
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({
        targets: s,
        scale: 1,
        delay: 300 + i * 200,
        duration: 400,
        ease: 'Back.out',
      });
    }

    this.add.text(w / 2, h * 0.6, `Puntos: ${this.score}`, {
      fontFamily: 'Arial Black', fontSize: '36px', color: '#fdcb6e',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.66, `Errores: ${this.errors}`, {
      fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    const again = this.makeBtn(w / 2 - 140, h * 0.85, 240, 64, 0x55efc4, 'Otra vez');
    again.on('pointerup', () => this.scene.start('GameScene', { level: this.level }));

    const menu = this.makeBtn(w / 2 + 140, h * 0.85, 240, 64, 0x74b9ff, 'Menú');
    menu.on('pointerup', () => this.scene.start('MenuScene'));

    this.time.delayedCall(900, () => speak(stars === 3 ? '¡Perfecto, increíble!' : '¡Muy bien!'));
  }

  makeBtn(x, y, w, h, color, label) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    const t = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#2d3436',
    }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 150 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1, duration: 150 }));
    return c;
  }
}

// =========================================================
// GAME CONFIG
// =========================================================
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  parent: 'game',
  backgroundColor: '#0f0c29',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MenuScene, GameScene, ResultScene],
};

new Phaser.Game(config);
