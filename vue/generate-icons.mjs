/**
 * Genera los iconos PWA (192x192 y 512x512) en public/icons/
 * Ejecutar: node generate-icons.mjs
 *
 * Diseño: micrófono blanco sobre fondo teal (#0d9488)
 */
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function crc32(buf) {
  const table = Array.from({ length: 256 }, (_, i) => {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    return c
  })
  let crc = 0xFFFFFFFF
  for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type)
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

/**
 * Determina si el pixel (px, py) debe ser blanco (icono) o teal (fondo)
 * Diseño: burbuja de chat con 3 barras de onda sonora (logopedia)
 * Mismo icono que aparece en las páginas internas de la app (AppLayout.vue)
 */

// Rasteriza el icono en coordenadas normalizadas del SVG original (viewBox 0 0 28 28)
// Devuelve { white: bool } — true = pixel blanco (burbuja), false = fondo teal
function getPixelColor(px, py, size) {
  // Mapear pixel a coordenadas del viewBox 28x28
  const margin = size * 0.08
  const vx = ((px - margin) / (size - margin * 2)) * 28
  const vy = ((py - margin) / (size - margin * 2)) * 28

  // --- Burbuja de chat (path del SVG original) ---
  // "M4 8.5A2.5 2.5 0 016.5 6h15A2.5 2.5 0 0124 8.5v8a2.5 2.5 0 01-2.5 2.5H17l-3 2.5-3-2.5H6.5A2.5 2.5 0 014 16.5v-8z"
  // Aproximación: rectángulo redondeado de (4,6) a (24,19) + cola triangular
  const bx1 = 4, by1 = 6, bx2 = 24, by2 = 19, br = 2.5

  // Rectángulo redondeado
  const inBubbleRect =
    vx >= bx1 + br && vx <= bx2 - br && vy >= by1 && vy <= by2 ||
    vx >= bx1 && vx <= bx2 && vy >= by1 + br && vy <= by2 - br

  // Esquinas redondeadas
  const corners = [
    [bx1 + br, by1 + br],
    [bx2 - br, by1 + br],
    [bx1 + br, by2 - br],
    [bx2 - br, by2 - br],
  ]
  const inCorner = corners.some(([cx, cy]) => (vx - cx) ** 2 + (vy - cy) ** 2 <= br * br)

  // Cola triangular: desde (14, 19) baja hasta (11, 21.5) y vuelve a (17, 19)
  // Cola aproximada como triángulo
  const tailTop = by2
  const tailBot = 21.5
  const tailCx = 14
  const tailW = 3  // semi-ancho en la base
  let inTail = false
  if (vy >= tailTop && vy <= tailBot) {
    const progress = (vy - tailTop) / (tailBot - tailTop)
    const halfW = tailW * (1 - progress)
    inTail = vx >= tailCx - halfW && vx <= tailCx + halfW
  }

  const inBubble = inBubbleRect || inCorner || inTail

  if (!inBubble) return 'teal'

  // --- Barras teal dentro de la burbuja ---
  // Barra izquierda:  x=9..10.8, y=11.5..15
  if (vx >= 9 && vx <= 10.8 && vy >= 11.5 && vy <= 15) return 'teal'
  // Barra central:   x=13..14.8, y=9.5..17
  if (vx >= 13 && vx <= 14.8 && vy >= 9.5 && vy <= 17) return 'teal'
  // Barra derecha:   x=17..18.8, y=11.5..15
  if (vx >= 17 && vx <= 18.8 && vy >= 11.5 && vy <= 15) return 'teal'

  return 'white'
}

function createIconPNG(size) {
  // Teal background: #0d9488 = rgb(13, 148, 136)
  const [bgR, bgG, bgB] = [13, 148, 136]
  const [fgR, fgG, fgB] = [255, 255, 255]

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Scanlines con antialiasing simple (supersampling 2x)
  const ss = 2  // supersampling factor
  const raw = Buffer.allocUnsafe(size * (1 + size * 3))

  for (let y = 0; y < size; y++) {
    const base = y * (1 + size * 3)
    raw[base] = 0  // filter byte

    for (let x = 0; x < size; x++) {
      // Supersampling 2x para antialiasing
      let rAcc = 0, gAcc = 0, bAcc = 0
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const spx = x + (sx + 0.5) / ss
          const spy = y + (sy + 0.5) / ss
          const color = getPixelColor(spx, spy, size)
          if (color === 'white') { rAcc += 255; gAcc += 255; bAcc += 255 }
          else { rAcc += bgR; gAcc += bgG; bAcc += bgB }
        }
      }
      const n = ss * ss
      raw[base + 1 + x * 3]     = Math.round(rAcc / n)
      raw[base + 1 + x * 3 + 1] = Math.round(gAcc / n)
      raw[base + 1 + x * 3 + 2] = Math.round(bAcc / n)
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('./public/icons', { recursive: true })

console.log('Generando icon-192.png...')
writeFileSync('./public/icons/icon-192.png', createIconPNG(192))
console.log('✓ public/icons/icon-192.png')

console.log('Generando icon-512.png...')
writeFileSync('./public/icons/icon-512.png', createIconPNG(512))
console.log('✓ public/icons/icon-512.png')

console.log('\nAhora ejecuta: npm run build')
