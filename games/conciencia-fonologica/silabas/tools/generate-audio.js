// =========================================================
// Generador de audios MP3 para Sílabas Mágicas.
//
// Usa Microsoft Edge TTS (voz neuronal española) a través de la librería
// Python `edge-tts` (rany2/edge-tts), que es la implementación de
// referencia y se mantiene activamente.
//
// Requisitos:
//   - Node.js 16+
//   - Python 3.7+ con `edge-tts` instalado:
//       pip install edge-tts
//     (Windows: `py -m pip install edge-tts`)
//
// Uso:
//   cd tools
//   node generate-audio.js
//
// Cambiar voz:
//   VOICE=es-ES-AlvaroNeural node generate-audio.js
// =========================================================

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { WORDS, PHRASES } = require('../words.js');

const VOICE = process.env.VOICE || 'es-ES-ElviraNeural';
const ROOT = path.resolve(__dirname, '..');
const OUT_WORDS = path.join(ROOT, 'audio', 'palabras');
const OUT_SYL = path.join(ROOT, 'audio', 'silabas');

const SHELL = process.platform === 'win32';

// If the TTS command is a Windows .exe (called from WSL), paths must be
// converted from /mnt/c/... to C:\... so Windows Python can open them.
function toMediaPath(p) {
  if (tts && tts.cmd && tts.cmd.endsWith('.exe')) {
    return p.replace(/^\/mnt\/([a-z])(\/|$)/, (_, drive, rest) =>
      `${drive.toUpperCase()}:\\${rest}`).replace(/\//g, '\\');
  }
  return p;
}

function tryRun(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { stdio: 'pipe', shell: SHELL });
    return r.status === 0;
  } catch {
    return false;
  }
}

function findEdgeTts() {
  // On WSL, look for Windows Python installs under /mnt/c/Users/*/AppData/...
  function wslWindowsPythonCandidates() {
    try {
      const usersDir = '/mnt/c/Users';
      if (!fs.existsSync(usersDir)) return [];
      const results = [];
      for (const user of fs.readdirSync(usersDir)) {
        const pyBase = `${usersDir}/${user}/AppData/Local/Programs/Python`;
        if (!fs.existsSync(pyBase)) continue;
        for (const ver of fs.readdirSync(pyBase).sort().reverse()) {
          const exe = `${pyBase}/${ver}/python.exe`;
          if (fs.existsSync(exe)) results.push({ cmd: exe, prefix: ['-m', 'edge_tts'] });
        }
      }
      return results;
    } catch { return []; }
  }

  const candidates = [
    { cmd: 'edge-tts', prefix: [] },
    { cmd: 'py',       prefix: ['-m', 'edge_tts'] },
    { cmd: 'python',   prefix: ['-m', 'edge_tts'] },
    { cmd: 'python3',  prefix: ['-m', 'edge_tts'] },
    ...wslWindowsPythonCandidates(),
  ];
  for (const c of candidates) {
    if (tryRun(c.cmd, [...c.prefix, '--help'])) return c;
  }
  return null;
}

const tts = findEdgeTts();
if (!tts) {
  console.error('\nNo encuentro `edge-tts` en el sistema.\n');
  console.error('Instálalo (necesita Python):');
  console.error('   pip install edge-tts');
  console.error('\nEn Windows si tienes el lanzador `py`:');
  console.error('   py -m pip install edge-tts\n');
  process.exit(1);
}

console.log(`Motor TTS: ${tts.cmd} ${tts.prefix.join(' ')}`.trim());
console.log(`Voz:       ${VOICE}`);

fs.mkdirSync(OUT_WORDS, { recursive: true });
fs.mkdirSync(OUT_SYL,   { recursive: true });

const words     = new Set();
const syllables = new Set();
for (const level of Object.values(WORDS)) {
  for (const it of level) {
    words.add(it.word.toLowerCase());
    it.syllables.forEach(s => syllables.add(s.toLowerCase()));
  }
}
const phrases = new Set((PHRASES || []).map(p => p.toLowerCase()));

const total = words.size + syllables.size + phrases.size;
console.log(`Palabras: ${words.size}, sílabas: ${syllables.size}, frases: ${phrases.size} (${total} archivos)`);
console.log('---');

let n = 0;
let errors = 0;

function generate(text, dir) {
  n++;
  const target = path.join(dir, `${text}.mp3`);
  if (fs.existsSync(target)) {
    console.log(`[${n}/${total}] · saltado: ${text}`);
    return;
  }
  process.stdout.write(`[${n}/${total}] · generando: ${text} ... `);
  const res = spawnSync(
    tts.cmd,
    [
      ...tts.prefix,
      '--voice', VOICE,
      '--text', text,
      '--write-media', toMediaPath(target),
    ],
    { stdio: 'pipe', shell: SHELL },
  );
  if (res.status !== 0) {
    errors++;
    console.log('ERROR');
    if (res.stderr && res.stderr.length) {
      console.error('  ' + res.stderr.toString().trim().split('\n').join('\n  '));
    }
  } else {
    console.log('OK');
  }
}

for (const w of words)     generate(w, OUT_WORDS);
for (const s of syllables) generate(s, OUT_SYL);
for (const p of phrases)   generate(p, OUT_WORDS);

console.log('---');
if (errors > 0) {
  console.log(`Hecho con ${errors} error(es). Revisa las líneas con ERROR arriba.`);
  process.exit(1);
} else {
  console.log(`Listo. ${total} audios generados en /audio/`);
}
