/**
 * Genera MP3 con Microsoft Edge TTS (edge-tts), sin API key.
 * Requisito: `pip install edge-tts` (ver public/assets/audio/LEEME.txt).
 */
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const wordsPath = join(root, "public", "content", "words.json");
const voice = process.env.VOICE ?? "es-ES-ElviraNeural";
const SHELL = process.platform === "win32";

function tryRun(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { stdio: "pipe", shell: SHELL });
    return r.status === 0;
  } catch {
    return false;
  }
}

function findEdgeTts() {
  const candidates = [
    { cmd: "edge-tts", prefix: [] },
    { cmd: "py", prefix: ["-m", "edge_tts"] },
    { cmd: "python", prefix: ["-m", "edge_tts"] },
    { cmd: "python3", prefix: ["-m", "edge_tts"] },
  ];
  for (const c of candidates) {
    if (tryRun(c.cmd, [...c.prefix, "--help"])) return c;
  }
  return null;
}

function publicPathToAbs(urlPath) {
  if (!urlPath.startsWith("/")) {
    throw new Error(`Ruta de audio debe empezar por /: ${urlPath}`);
  }
  return join(root, "public", urlPath.replace(/^\//, ""));
}

const tts = findEdgeTts();
if (!tts) {
  // eslint-disable-next-line no-console
  console.error("\nNo encuentro edge-tts. Instala:\n  pip install edge-tts\n");
  process.exit(1);
}

function runEdgeTts(text, outAbs) {
  mkdirSync(dirname(outAbs), { recursive: true });
  if (existsSync(outAbs)) {
    // eslint-disable-next-line no-console
    console.log("  (ya existe)", relative(root, outAbs));
    return true;
  }

  const args = [...tts.prefix, "--voice", voice, "--text", text, "--write-media", outAbs];
  const r = spawnSync(tts.cmd, args, { stdio: "inherit", shell: SHELL });
  if (r.status === 0 && existsSync(outAbs)) {
    // eslint-disable-next-line no-console
    console.log("  OK", relative(root, outAbs));
    return true;
  }

  // eslint-disable-next-line no-console
  console.error("  ERROR al generar:", relative(root, outAbs));
  return false;
}

const raw = readFileSync(wordsPath, "utf8");
const manifest = JSON.parse(raw);

let ok = true;

const successUrl = manifest.words.find((w) => w.audioSuccess)?.audioSuccess;
if (successUrl) {
  // eslint-disable-next-line no-console
  console.log("Refuerzo compartido:", successUrl);
  ok = runEdgeTts("¡Genial!", publicPathToAbs(successUrl)) && ok;
}

for (const w of manifest.words) {
  // eslint-disable-next-line no-console
  console.log(`Palabra [${w.id}]`);

  if (w.audioWord && w.ttsWord) {
    ok = runEdgeTts(w.ttsWord, publicPathToAbs(w.audioWord)) && ok;
  } else if (w.audioWord && !w.ttsWord) {
    // eslint-disable-next-line no-console
    console.warn("  Falta ttsWord en JSON para generar:", w.audioWord);
  }

  if (Array.isArray(w.syllableAudios) && Array.isArray(w.ttsSyllables)) {
    if (w.syllableAudios.length !== w.ttsSyllables.length) {
      // eslint-disable-next-line no-console
      console.warn("  syllableAudios y ttsSyllables no tienen la misma longitud");
      ok = false;
      continue;
    }
    for (let i = 0; i < w.syllableAudios.length; i++) {
      ok = runEdgeTts(w.ttsSyllables[i], publicPathToAbs(w.syllableAudios[i])) && ok;
    }
  }
}

if (!ok) {
  process.exitCode = 1;
} else {
  // eslint-disable-next-line no-console
  console.log("\nListo. Recarga el juego en el navegador.");
}
