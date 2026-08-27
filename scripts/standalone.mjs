// Genera una version autocontenida de una receta para compartirla suelta
// (por WhatsApp, mail, lo que sea). Inyecta el CSS local inline y escribe
// el resultado en export/[slug].html. El original no se toca.
//
// Uso:
//   npm run standalone -- minestrone-soup
//   npm run standalone -- minestrone-soup --embed
//
// Sin --embed las imagenes remotas quedan como URL: el archivo pesa poco
// pero necesita internet para mostrar la foto. Con --embed se descargan y
// quedan incrustadas en base64.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { root } from './lib/catalog.mjs';

const args = process.argv.slice(2);
const embed = args.includes('--embed');
const slug = args.find(a => !a.startsWith('--'));

const recipesDir = join(root, 'recipes');
const exportDir = join(root, 'export');

function disponibles() {
  return readdirSync(recipesDir)
    .filter(f => f.endsWith('.html'))
    .map(f => f.slice(0, -5));
}

if (!slug) {
  console.error('Falta el slug.\n\n  npm run standalone -- <slug> [--embed]\n');
  console.error('Disponibles:\n' + disponibles().map(s => '  ' + s).join('\n'));
  process.exit(1);
}

const source = join(recipesDir, slug + '.html');
if (!existsSync(source)) {
  console.error(`No existe recipes/${slug}.html\n`);
  console.error('Disponibles:\n' + disponibles().map(s => '  ' + s).join('\n'));
  process.exit(1);
}

let html = readFileSync(source, 'utf8');

/* ── CSS local a inline ── */
const LINK_RE = /<link\b[^>]*>/g;
let inlined = 0;

html = html.replace(LINK_RE, tag => {
  if (!/rel=["']stylesheet["']/.test(tag)) return tag;

  const href = (tag.match(/href=["']([^"']+)["']/) || [])[1];
  // Las fuentes de Google se dejan como link: sin internet el navegador
  // cae a las fuentes del sistema, que es mejor que incrustar los woff2.
  if (!href || /^https?:/i.test(href)) return tag;

  const cssPath = join(dirname(source), href);
  if (!existsSync(cssPath)) {
    console.warn(`  aviso: no encontre ${href}, se deja el <link>`);
    return tag;
  }

  const media = (tag.match(/media=["']([^"']+)["']/) || [])[1];
  const css = readFileSync(cssPath, 'utf8');
  inlined++;
  return `<style${media ? ` media="${media}"` : ''}>\n${css}</style>`;
});

/* ── Imagenes remotas a base64 (solo con --embed) ── */
let embedded = 0;

if (embed) {
  const urls = [...html.matchAll(/<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi)]
    .map(m => m[1]);

  for (const url of new Set(urls)) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const type = res.headers.get('content-type') || 'image/jpeg';
      const b64 = Buffer.from(await res.arrayBuffer()).toString('base64');
      html = html.split(url).join(`data:${type};base64,${b64}`);
      embedded++;
    } catch (err) {
      console.warn(`  aviso: no pude bajar ${url} (${err.message}), se deja la URL`);
    }
  }
}

/* ── Escribir ── */
if (!existsSync(exportDir)) mkdirSync(exportDir, { recursive: true });

const target = join(exportDir, slug + '.html');
writeFileSync(target, html, 'utf8');

const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
console.log(`export/${slug}.html — ${kb} KB, ${inlined} hoja(s) de estilo inline${embed ? `, ${embedded} imagen(es) incrustada(s)` : ''}`);
if (!embed && /<img\b[^>]*src=["']https?:/i.test(html)) {
  console.log('Tiene imagenes remotas: se ven solo con internet. Usa --embed para incrustarlas.');
}
