// Revisa que el catalogo y los archivos esten en sincronia.
// Uso: npm run check

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, readCatalog, validate } from './lib/catalog.mjs';

const catalog = readCatalog();
const errors = validate(catalog);

// Cuenta los <li> de la tarjeta de ingredientes del HTML, para avisar cuando
// se despega de la lista estructurada. No es error: un <li> puede traer dos
// items ("Salt and black pepper"), asi que la paridad no siempre es 1:1.
function contarEnHtml(slug) {
  const html = readFileSync(join(root, 'recipes', slug + '.html'), 'utf8');
  const desde = html.indexOf('ingredients-section');
  const hasta = html.indexOf('Method', desde);
  if (desde === -1 || hasta === -1) return null;
  return (html.slice(desde, hasta).match(/<li\b/g) || []).length;
}

if (errors.length) {
  console.error(`${errors.length} problema(s):\n`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

const usadas = new Set(catalog.recipes.flatMap(r => r.tags));
const sinUsar = [...new Set(Object.values(catalog.tags).flat())].filter(t => !usadas.has(t));

const ingredientes = catalog.recipes.reduce((n, r) => n + r.ingredients.length, 0);

console.log(`OK — ${catalog.recipes.length} recetas, ${usadas.size} etiquetas en uso, ${ingredientes} ingredientes`);
if (sinUsar.length) console.log(`Etiquetas del vocabulario sin usar: ${sinUsar.join(', ')}`);

const desfasadas = catalog.recipes
  .map(r => ({ slug: r.slug, json: r.ingredients.length, html: contarEnHtml(r.slug) }))
  .filter(r => r.html !== null && r.html !== r.json);

if (desfasadas.length) {
  console.log('\nIngredientes que no calzan 1:1 con el HTML (revisar si es a proposito):');
  for (const d of desfasadas) console.log(`  - ${d.slug}: ${d.html} en el HTML, ${d.json} en el catalogo`);
}
