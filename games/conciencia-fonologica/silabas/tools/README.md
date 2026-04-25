# Generador de audios — Sílabas Mágicas

Genera todos los MP3 (palabras + sílabas + frases) que usa el juego, con voz neuronal de Microsoft Edge TTS. **Gratis**, **sin API key**, voz mucho mejor que cualquier TTS del navegador.

## Requisitos

- **Node.js** 16+ (probablemente ya lo tienes — `node --version` para comprobar).
- **Python 3.7+** con la librería `edge-tts`:

```bash
pip install edge-tts
```

En Windows, si tienes el lanzador `py`:

```bash
py -m pip install edge-tts
```

(Si no tienes Python instalado: descárgalo desde https://www.python.org/downloads/ — durante la instalación marca "Add Python to PATH".)

## Uso

Desde Git Bash o terminal, en esta carpeta `tools/`:

```bash
node generate-audio.js
```

Tarda 1-2 minutos la primera vez (~93 archivos: 28 palabras + ~61 sílabas + 4 frases). Si vuelves a ejecutarlo, salta los que ya existen — solo genera los nuevos.

## Forzar regeneración completa

Borra `../audio/` y ejecuta de nuevo.

## Cambiar la voz

Por defecto usa `es-ES-ElviraNeural` (femenina, España). Otras opciones:

| Voz                   | Acento    | Género    |
|-----------------------|-----------|-----------|
| es-ES-ElviraNeural    | España    | Femenina  |
| es-ES-AlvaroNeural    | España    | Masculina |
| es-MX-DaliaNeural     | México    | Femenina  |
| es-MX-JorgeNeural     | México    | Masculina |
| es-AR-ElenaNeural     | Argentina | Femenina  |

```bash
VOICE=es-ES-AlvaroNeural node generate-audio.js
```

En Windows PowerShell:

```powershell
$env:VOICE='es-ES-AlvaroNeural'; node generate-audio.js
```

## Reemplazar audios manualmente

Cualquier MP3 puede sustituirse por una grabación propia (la voz de la logopeda, por ejemplo). Mismo nombre de archivo, mismo formato. El juego lo carga sin tocar código.

Estructura:

```
audio/
├── palabras/
│   ├── gato.mp3
│   ├── tortuga.mp3
│   ├── ¡muy bien!.mp3
│   └── ...
└── silabas/
    ├── ga.mp3
    ├── tor.mp3
    └── ...
```

Los nombres usan minúsculas y mantienen acentos (`plá.mp3`, `lé.mp3`).

## ¿Por qué Python en vez de un paquete Node?

Los paquetes Node tipo `msedge-tts` rompen con frecuencia porque dependen de tokens internos de Microsoft que cambian. La librería Python `edge-tts` (rany2/edge-tts) es la implementación de referencia y se actualiza el mismo día. Este script Node solo lee `words.js` y delega la síntesis a Python — así obtenemos la fiabilidad de la una y la integración con la otra.

## WSL (Windows Subsystem for Linux)

Si lanzas el script desde WSL y no tienes Python en el sistema Linux, el script detecta automáticamente instalaciones de Python en Windows bajo `/mnt/c/Users/*/AppData/Local/Programs/Python/`. Instala `edge-tts` desde PowerShell o CMD:

```powershell
pip install edge-tts
```

## Qué va al servidor de producción

La carpeta `tools/` (y `node_modules/`) es **solo para desarrollo local**. Al desplegar el juego solo necesitas:

```
silabas/
  index.html
  words.js
  game.js
  audio/
    palabras/   ← MP3 de palabras y frases de feedback
    silabas/    ← MP3 de sílabas individuales
```

## Añadir palabras a otro juego

`words.js` y `tools/` son independientes del juego. Para un nuevo juego de sílabas:

1. Crea su carpeta con su propio `words.js`
2. Copia `tools/` o apunta el `require` al `words.js` del nuevo juego
3. Ejecuta `npm run generate` → solo genera los MP3 que faltan
