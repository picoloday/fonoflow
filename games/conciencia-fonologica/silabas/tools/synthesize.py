"""
Helper de síntesis de voz para generate-audio.js.

Stóstrategy:
  - Sílabas (path contiene 'silabas'): gTTS con lang='es' — garantiza
    pronunciación española sin ambigüedad para strings cortos como
    'ni', 'be', 'co', 'nio', 'cóp'.
  - Palabras / frases (path contiene 'palabras'): edge_tts con voz
    neuronal — mejor calidad para texto largo.

Uso:
    python synthesize.py <voz> <texto> <archivo_salida>
"""
import asyncio
import sys


def main() -> None:
    voice = sys.argv[1]
    text  = sys.argv[2]
    output = sys.argv[3]

    if 'silabas' in output:
        _gtts(text, output)
    else:
        asyncio.run(_edge_tts(voice, text, output))


def _gtts(text: str, output: str) -> None:
    """Google TTS — pronunciación española garantizada."""
    from gtts import gTTS  # type: ignore
    tts = gTTS(text=text, lang='es', tld='es')
    tts.save(output)


async def _edge_tts(voice: str, text: str, output: str) -> None:
    """Microsoft Edge TTS — voz neuronal de alta calidad."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output)


main()

