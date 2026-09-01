/**
 * Genera todos los iconos de Postula desde la misma geometría del logo
 * (src/components/ui/Logo.tsx): cuadrado ámbar con esquinas redondeadas
 * y una "P" verde profundo.
 *
 * Produce:
 *   extension/icons/icon-{16,48,128}.png   la extensión de Chrome
 *   src/app/icon.png                        pestaña del navegador
 *   src/app/apple-icon.png                  pantalla de inicio en iOS
 *   src/app/favicon.ico                     navegadores que lo piden así
 *
 * Sin dependencias: rasteriza con supermuestreo y escribe PNG e ICO a
 * mano con zlib, que viene en Node.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const AMBAR = [222, 139, 46]; // #DE8B2E
const VERDE = [23, 63, 51]; // #173F33

const LIENZO = 28; // mismo viewBox que el SVG del logo
const RADIO_CAJA = 8.5;
const GROSOR = 2.5; // trazo de la P
const MUESTRAS = 4; // 4x4 submuestras por píxel

// ---------- geometría ----------

function sdCajaRedondeada(px, py) {
  const half = LIENZO / 2;
  const dx = Math.abs(px - half) - (half - RADIO_CAJA);
  const dy = Math.abs(py - half) - (half - RADIO_CAJA);
  const fuera = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  const dentro = Math.min(Math.max(dx, dy), 0);
  return fuera + dentro - RADIO_CAJA;
}

function sdSegmento(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const largo2 = vx * vx + vy * vy;
  let t = largo2 === 0 ? 0 : (wx * vx + wy * vy) / largo2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(wx - vx * t, wy - vy * t);
}

// La "P": asta vertical, travesaños y el vientre como media circunferencia.
const X_ASTA = 9.6;
const Y_ALTO = 8.6;
const Y_BAJO = 19.5;
const CX_VIENTRE = 13.4;
const CY_VIENTRE = 12.5;
const R_VIENTRE = 3.9;

const TRAZOS = [
  [X_ASTA, Y_ALTO, X_ASTA, Y_BAJO], // asta
  [X_ASTA, Y_ALTO, CX_VIENTRE, Y_ALTO], // travesaño superior
  [X_ASTA, CY_VIENTRE + R_VIENTRE, CX_VIENTRE, CY_VIENTRE + R_VIENTRE], // inferior
];

// El arco derecho del vientre, aproximado con segmentos cortos.
const PASOS = 28;
for (let i = 0; i < PASOS; i++) {
  const a1 = -Math.PI / 2 + (Math.PI * i) / PASOS;
  const a2 = -Math.PI / 2 + (Math.PI * (i + 1)) / PASOS;
  TRAZOS.push([
    CX_VIENTRE + Math.cos(a1) * R_VIENTRE,
    CY_VIENTRE + Math.sin(a1) * R_VIENTRE,
    CX_VIENTRE + Math.cos(a2) * R_VIENTRE,
    CY_VIENTRE + Math.sin(a2) * R_VIENTRE,
  ]);
}

function sdLetra(px, py) {
  let minimo = Infinity;
  for (const [ax, ay, bx, by] of TRAZOS) {
    const d = sdSegmento(px, py, ax, ay, bx, by);
    if (d < minimo) minimo = d;
  }
  return minimo - GROSOR / 2;
}

// ---------- rasterizado ----------

function pintar(tam, { aSangre = false } = {}) {
  const pixeles = Buffer.alloc(tam * tam * 4);
  const escala = LIENZO / tam;
  // Suavizado proporcional al tamaño: medio píxel en unidades del lienzo.
  const suavizado = escala * 0.6;
  const total = MUESTRAS * MUESTRAS;

  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      let cobCaja = 0;
      let cobLetra = 0;

      for (let sy = 0; sy < MUESTRAS; sy++) {
        for (let sx = 0; sx < MUESTRAS; sx++) {
          const px = (x + (sx + 0.5) / MUESTRAS) * escala;
          const py = (y + (sy + 0.5) / MUESTRAS) * escala;
          if (aSangre || sdCajaRedondeada(px, py) <= 0) cobCaja++;
          if (sdLetra(px, py) <= 0) cobLetra++;
        }
      }

      let alfaCaja = cobCaja / total;
      let alfaLetra = cobLetra / total;

      // En 16px el supermuestreo solo no basta: se afina con la distancia
      // al borde para que la P no quede dentada.
      if (!aSangre && alfaCaja > 0 && alfaCaja < 1) {
        const d = sdCajaRedondeada((x + 0.5) * escala, (y + 0.5) * escala);
        alfaCaja = Math.max(0, Math.min(1, 0.5 - d / suavizado));
      }
      if (alfaLetra > 0 && alfaLetra < 1) {
        const d = sdLetra((x + 0.5) * escala, (y + 0.5) * escala);
        alfaLetra = Math.max(0, Math.min(1, 0.5 - d / suavizado));
      }

      const dentro = Math.min(alfaLetra, alfaCaja);
      const i = (y * tam + x) * 4;
      for (let c = 0; c < 3; c++) {
        pixeles[i + c] = Math.round(AMBAR[c] * (1 - dentro) + VERDE[c] * dentro);
      }
      pixeles[i + 3] = Math.round(alfaCaja * 255);
    }
  }
  return pixeles;
}

// ---------- codificación PNG ----------

const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function png(tam, pixeles) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tam, 0);
  ihdr.writeUInt32BE(tam, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Cada línea lleva delante su byte de filtro (0 = sin filtro).
  const crudo = Buffer.alloc(tam * (tam * 4 + 1));
  for (let y = 0; y < tam; y++) {
    crudo[y * (tam * 4 + 1)] = 0;
    pixeles.copy(crudo, y * (tam * 4 + 1) + 1, y * tam * 4, (y + 1) * tam * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo("IHDR", ihdr),
    trozo("IDAT", zlib.deflateSync(crudo, { level: 9 })),
    trozo("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Envoltorio ICO. El formato admite un PNG dentro desde Windows Vista,
 * así que se reutiliza el mismo mapa de bits en vez de codificar BMP.
 */
function ico(tam, datosPng) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // 1 = icono
  cabecera.writeUInt16LE(1, 4); // una sola imagen

  const entrada = Buffer.alloc(16);
  entrada[0] = tam === 256 ? 0 : tam; // 0 significa 256
  entrada[1] = tam === 256 ? 0 : tam;
  entrada[2] = 0; // sin paleta
  entrada[3] = 0; // reservado
  entrada.writeUInt16LE(1, 4); // planos
  entrada.writeUInt16LE(32, 6); // bits por píxel
  entrada.writeUInt32LE(datosPng.length, 8);
  entrada.writeUInt32LE(cabecera.length + entrada.length, 12);

  return Buffer.concat([cabecera, entrada, datosPng]);
}

function escribir(ruta, contenido) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, contenido);
  console.log(`${ruta}  ${fs.statSync(ruta).size} bytes`);
}

const raiz = process.argv[2] || ".";

// Extensión de Chrome
for (const tam of [16, 48, 128]) {
  escribir(path.join(raiz, "extension/icons", `icon-${tam}.png`), png(tam, pintar(tam)));
}

// Sitio web. Next.js recoge estos nombres por convención desde src/app
// y emite las etiquetas <link> solo, sin tocar el layout.
const pngPestana = png(32, pintar(32));
escribir(path.join(raiz, "src/app/icon.png"), pngPestana);
escribir(path.join(raiz, "src/app/favicon.ico"), ico(32, pngPestana));

// iOS aplica su propia máscara redondeada y no admite transparencia:
// va a sangre para que no salga con esquinas oscuras.
escribir(path.join(raiz, "src/app/apple-icon.png"), png(180, pintar(180, { aSangre: true })));
