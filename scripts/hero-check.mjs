// Mide una imagen de hero y dice que variante usar.
// Uso: npm run hero -- <url>
//
// El hero full-bleed recorta a una franja de 420px y estira la imagen al ancho
// de la ventana. Sirve solo para fotos horizontales y grandes: cualquier otra
// cosa sale ampliada y borrosa. Ahi va la variante contenida.

const MIN_ANCHO = 1200;

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const url = process.argv[2];
if (!url) {
  console.error('Falta la URL.\n\n  npm run hero -- <url>\n');
  process.exit(1);
}

const res = await fetch(url);
if (!res.ok) {
  console.error(`No pude bajar la imagen: HTTP ${res.status}`);
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
const size = pngSize(buf) || jpegSize(buf);

if (!size) {
  console.error('No reconozco el formato (solo JPEG y PNG). Revisala a ojo.');
  process.exit(1);
}

const { width, height } = size;
const horizontal = width > height;
const grande = width >= MIN_ANCHO;
const fullBleed = horizontal && grande;

console.log(`${width}x${height} — ${horizontal ? 'horizontal' : 'vertical'}, ${(buf.length / 1024).toFixed(0)} KB`);
console.log();

if (fullBleed) {
  console.log('Variante: HERO FULL-BLEED (la de siempre)');
  console.log('  <div class="recipe-hero">');
  console.log('    <img src="..." alt="..." />');
  console.log('  </div>');
} else {
  const motivo = !horizontal
    ? 'es vertical'
    : `mide ${width}px de ancho, menos de los ${MIN_ANCHO}px que necesita el full-bleed`;
  console.log(`Variante: HERO CONTENIDO — ${motivo}.`);
  console.log('  <div class="recipe-hero recipe-hero--contained">');
  console.log('    <img class="hero-backdrop" src="..." alt="" aria-hidden="true" />');
  console.log('    <img src="..." alt="..." />');
  console.log('  </div>');
  console.log();
  console.log('  (la misma URL en las dos <img>: la primera es el fondo desenfocado)');
}
