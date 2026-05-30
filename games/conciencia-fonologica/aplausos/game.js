// CONTADOR DE APLAUSOS — Conciencia Fonológica
// Léxico y audios compartidos con ../silabas/ (words.js + audio/)

const BUTTON_COLORS = [0xff7675, 0xfdcb6e, 0x55efc4, 0x74b9ff, 0xa29bfe];

// ---------- Audio ----------
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

function play(text, kind, rate = 1.0) {
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

function speak(text) { play(text, 'word', 1.0); }
function speakSyllable(syl) { play(syl, 'syl', 1.0); }

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
  for (let i = 0; i < 50; i++) {
    const s = scene.add.circle(
      Math.random() * w, Math.random() * h,
      Math.random() * 2 + 1, 0xffffff, Math.random() * 0.6 + 0.2
    );
    scene.tweens.add({
      targets: s,
      alpha: { from: s.alpha, to: 0.05 },
      duration: 1500 + Math.random() * 2000,
      yoyo: true, repeat: -1, delay: Math.random() * 2000,
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

    this.add.text(w / 2, h * 0.12, 'Contador de Aplausos', {
      fontFamily: 'Georgia, serif',
      fontSize: '64px',
      color: '#ffffff',
      stroke: '#6c5ce7',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.22, '¿Cuántas sílabas tiene la palabra?', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#fdcb6e',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const emojis = ['🐱', '🚀', '🦋', '🍎', '🐘', '🌙'];
    emojis.forEach((e, i) => {
      const x = (w / (emojis.length + 1)) * (i + 1);
      const y = h * 0.38;
      const t = this.add.text(x, y, e, { fontSize: '64px', padding: { top: 10, bottom: 2 } }).setOrigin(0.5);
      this.tweens.add({
        targets: t, y: y - 18,
        duration: 1400 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.inOut',
      });
    });

    const levels = [
      { key: 'facil',   label: 'FÁCIL',   sub: '2 sílabas',        color: 0x55efc4, y: h * 0.57 },
      { key: 'medio',   label: 'MEDIO',   sub: '3 sílabas',        color: 0xfdcb6e, y: h * 0.71 },
      { key: 'dificil', label: 'DIFÍCIL', sub: '4 ó 5 sílabas',    color: 0xff7675, y: h * 0.85 },
    ];

    levels.forEach(l => {
      const btn = this.makeButton(w / 2, l.y, 380, 80, l.color, l.label, l.sub);
      btn.on('pointerup', () => this.scene.start('GameScene', { level: l.key }));
    });

    this.add.text(w / 2, h * 0.97,
      'Escucha la palabra y toca el número de sílabas correcto',
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
      fontFamily: 'Arial Black, sans-serif', fontSize: '32px', color: '#2d3436',
    }).setOrigin(0.5);
    const subTxt = this.add.text(0, 22, sub, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#2d3436',
    }).setOrigin(0.5);
    c.add([g, txt, subTxt]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 150 }));
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1,    duration: 150 }));
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

    this.add.text(20, 20, '← Menú', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#ffffff',
    }).setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.scene.start('MenuScene'));

    this.scoreText = this.add.text(w - 20, 20, '', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#fdcb6e',
    }).setOrigin(1, 0);

    this.progressText = this.add.text(w / 2, 30, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#dfe6e9',
    }).setOrigin(0.5);

    this.updateHud();
    this.startWord();
  }

  updateHud() {
    this.scoreText.setText(`⭐ ${this.score}`);
    this.progressText.setText(`Palabra ${this.currentIndex + 1} de ${this.queue.length}`);
  }

  clearWord() {
    if (this.clapDots) this.clapDots.forEach(d => { if (d && d.active) d.destroy(); });
    if (this.wordGroup) this.wordGroup.destroy(true);
    this.wordGroup = this.add.container(0, 0);
    this.clapDots = [];
    this.locked = false;
  }

  startWord() {
    this.clearWord();
    this.updateHud();
    const { width: w, height: h } = this.scale;
    const data = this.queue[this.currentIndex];

    preloadAudio(data.word, 'word');
    data.syllables.forEach(s => preloadAudio(s, 'syl'));

    // Emoji (grande, flotando)
    const emojiY = h * 0.32;
    const emoji = this.add.text(w / 2, emojiY, data.emoji, {
      fontSize: '150px', padding: { top: 20, bottom: 4 },
    }).setOrigin(0.5);
    this.wordGroup.add(emoji);
    this.tweens.add({
      targets: emoji, y: emojiY - 14,
      duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    // Botón escuchar
    const listenBg = this.add.graphics();
    listenBg.fillStyle(0x6c5ce7, 1);
    listenBg.fillRoundedRect(-115, -26, 230, 52, 26);
    listenBg.lineStyle(3, 0xffffff, 1);
    listenBg.strokeRoundedRect(-115, -26, 230, 52, 26);
    const listenTxt = this.add.text(0, 0, '🔊  Escuchar', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);
    const listen = this.add.container(w / 2, h * 0.54, [listenBg, listenTxt]);
    listen.setSize(230, 52).setInteractive({ useHandCursor: true });
    listen.on('pointerup', () => speak(data.word.toLowerCase()));
    listen.on('pointerover', () => this.tweens.add({ targets: listen, scale: 1.06, duration: 120 }));
    listen.on('pointerout',  () => this.tweens.add({ targets: listen, scale: 1,    duration: 120 }));
    this.wordGroup.add(listen);

    // Pregunta
    const prompt = this.add.text(w / 2, h * 0.63, '¿Cuántas sílabas?', {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#dfe6e9',
    }).setOrigin(0.5);
    this.wordGroup.add(prompt);

    this.time.delayedCall(400, () => speak(data.word.toLowerCase()));

    this.buildNumberButtons(data);
  }

  buildNumberButtons(data) {
    const { width: w, height: h } = this.scale;
    const correct = data.syllables.length;

    // Mostrar siempre un botón más que las sílabas correctas (mínimo 3)
    const count = Math.max(3, correct + 1);
    const numbers = Array.from({ length: count }, (_, i) => i + 1);

    const r = count >= 5 ? 62 : count === 4 ? 70 : 80;
    const gap = count >= 5 ? 20 : 28;
    const totalW = numbers.length * r * 2 + (numbers.length - 1) * gap;
    const startX = (w - totalW) / 2 + r;
    const btnY = h * 0.8;

    numbers.forEach((n, idx) => {
      const x = startX + idx * (r * 2 + gap);
      const color = BUTTON_COLORS[idx % BUTTON_COLORS.length];
      const btn = this.makeNumberButton(x, btnY, r, n, color, correct);
      this.wordGroup.add(btn);
    });
  }

  makeNumberButton(x, y, r, number, color, correctCount) {
    const c = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, r);
    g.lineStyle(5, 0xffffff, 1);
    g.strokeCircle(0, 0, r);
    // Brillo superior
    g.fillStyle(0xffffff, 0.22);
    g.fillEllipse(-r * 0.12, -r * 0.38, r * 0.75, r * 0.35);

    const txt = this.add.text(0, 2, String(number), {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: `${r > 70 ? 58 : 48}px`,
      color: '#2d3436',
    }).setOrigin(0.5);

    c.add([g, txt]);
    c.setSize(r * 2, r * 2).setInteractive({ useHandCursor: true });

    c.on('pointerover', () => { if (!this.locked) this.tweens.add({ targets: c, scale: 1.12, duration: 120 }); });
    c.on('pointerout',  () => { if (!this.locked) this.tweens.add({ targets: c, scale: 1,    duration: 120 }); });
    c.on('pointerdown', () => { if (!this.locked) this.tweens.add({ targets: c, scale: 0.88, duration: 70 }); });
    c.on('pointerup', () => {
      if (this.locked) return;
      this.tweens.add({ targets: c, scale: 1, duration: 70 });
      if (number === correctCount) {
        this.onCorrect(c);
      } else {
        this.onWrong(c);
      }
    });

    return c;
  }

  onCorrect(btn) {
    this.locked = true;
    this.score += 10;
    this.updateHud();

    this.tweens.add({
      targets: btn,
      scale: { from: 1, to: 1.35 },
      duration: 180, yoyo: true, repeat: 2,
    });

    // Confetti
    const { width: w, height: h } = this.scale;
    const symbols = ['⭐', '✨', '💫', '🌟', '🎉', '👏'];
    for (let i = 0; i < 32; i++) {
      const star = this.add.text(w / 2, h * 0.5, symbols[i % symbols.length], {
        fontSize: '34px',
      }).setOrigin(0.5);
      const angle = Math.random() * Math.PI * 2;
      const dist = 180 + Math.random() * 260;
      this.tweens.add({
        targets: star,
        x: w / 2 + Math.cos(angle) * dist,
        y: h * 0.5 + Math.sin(angle) * dist,
        alpha: 0,
        scale: { from: 1, to: 0.2 },
        duration: 900 + Math.random() * 400,
        ease: 'Cubic.out',
        onComplete: () => star.destroy(),
      });
    }

    const data = this.queue[this.currentIndex];
    speak(data.word.toLowerCase());
    this.time.delayedCall(650, () => {
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      speak(phrase.toLowerCase());
    });

    this.time.delayedCall(1900, () => {
      this.currentIndex++;
      if (this.currentIndex >= this.queue.length) {
        this.scene.start('ResultScene', {
          score: this.score, total: this.queue.length,
          errors: this.errors, level: this.level,
        });
      } else {
        this.startWord();
      }
    });
  }

  onWrong(btn) {
    this.errors++;
    this.locked = true;
    const origX = btn.x;

    this.tweens.add({
      targets: btn,
      x: origX + 14,
      duration: 55, yoyo: true, repeat: 4,
      onComplete: () => {
        btn.x = origX;
        const data = this.queue[this.currentIndex];
        this.playSyllablesSequence(data.syllables);
      },
    });
  }

  playSyllablesSequence(syllables) {
    const { width: w, height: h } = this.scale;

    // Limpiar aplausos previos
    this.clapDots.forEach(d => { if (d && d.active) d.destroy(); });
    this.clapDots = [];

    const dotSpacing = 80;
    const totalW = (syllables.length - 1) * dotSpacing;
    const startX = w / 2 - totalW / 2;
    const clapY = h * 0.17;

    syllables.forEach((syl, i) => {
      this.time.delayedCall(i * 720, () => {
        speakSyllable(syl.toLowerCase());

        const dot = this.add.text(startX + i * dotSpacing, clapY, '👏', {
          fontSize: '56px', padding: { top: 8, bottom: 2 },
        }).setOrigin(0.5).setAlpha(0).setScale(0.2);

        this.clapDots.push(dot);

        this.tweens.add({
          targets: dot,
          alpha: 1, scale: 1,
          duration: 200, ease: 'Back.out',
        });
        this.tweens.add({
          targets: dot,
          y: clapY - 22,
          duration: 280, yoyo: true, ease: 'Sine.inOut',
          delay: 50,
        });
      });
    });

    // Desbloquear tras la secuencia para que el niño intente de nuevo
    this.time.delayedCall(syllables.length * 720 + 600, () => {
      this.locked = false;
    });
  }
}

// =========================================================
// RESULT SCENE
// =========================================================
class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data) {
    this.score  = data.score;
    this.total  = data.total;
    this.errors = data.errors;
    this.level  = data.level;
  }

  create() {
    paintGradientBackground(this);
    const { width: w, height: h } = this.scale;

    const stars = this.errors === 0 ? 3 : this.errors <= 2 ? 2 : 1;
    const title = stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Bien!';

    this.add.text(w / 2, h * 0.18, title, {
      fontFamily: 'Georgia, serif', fontSize: '88px', color: '#ffffff',
      stroke: '#6c5ce7', strokeThickness: 6,
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const filled = i < stars;
      const s = this.add.text(w / 2 - 110 + i * 110, h * 0.4, filled ? '⭐' : '☆', {
        fontSize: '90px', color: filled ? '#fdcb6e' : '#636e72',
        padding: { top: 16, bottom: 4 },
      }).setOrigin(0.5).setScale(0);
      this.tweens.add({
        targets: s, scale: 1, delay: 300 + i * 200, duration: 400, ease: 'Back.out',
      });
    }

    this.add.text(w / 2, h * 0.6, `Puntos: ${this.score}`, {
      fontFamily: 'Arial Black', fontSize: '36px', color: '#fdcb6e',
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.67, `Errores: ${this.errors}`, {
      fontFamily: 'Arial', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    const again = this.makeBtn(w / 2 - 140, h * 0.85, 240, 64, 0x55efc4, 'Otra vez');
    again.on('pointerup', () => this.scene.start('GameScene', { level: this.level }));

    const menu = this.makeBtn(w / 2 + 140, h * 0.85, 240, 64, 0x74b9ff, 'Menú');
    menu.on('pointerup', () => this.scene.start('MenuScene'));

    this.time.delayedCall(900, () => speak(stars === 3 ? '¡perfecto, increíble!' : '¡muy bien!'));
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
    c.on('pointerout',  () => this.tweens.add({ targets: c, scale: 1,    duration: 150 }));
    return c;
  }
}

// =========================================================
// CONFIG
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
