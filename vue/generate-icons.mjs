/**
 * Genera los iconos PWA (192x192 y 512x512) en public/icons/
 * Ejecutar: node generate-icons.mjs
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

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Scanlines: 1 byte filter (0=None) + size*3 RGB bytes
  const raw = Buffer.allocUnsafe(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const base = y * (1 + size * 3)
    raw[base] = 0
    for (let x = 0; x < size; x++) {
      raw[base + 1 + x * 3]     = r
      raw[base + 1 + x * 3 + 1] = g
      raw[base + 1 + x * 3 + 2] = b
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

// FonoFlow teal #0d9488
const [r, g, b] = [13, 148, 136]
writeFileSync('./public/icons/icon-192.png', createSolidPNG(192, r, g, b))
writeFileSync('./public/icons/icon-512.png', createSolidPNG(512, r, g, b))

console.log('✓ public/icons/icon-192.png')
console.log('✓ public/icons/icon-512.png')
console.log('Ahora ejecuta: npm run build')
