// Lectura, validacion y escritura del catalogo.
// recipes.json es la fuente de verdad; index.html lleva una copia inyectada
// para poder abrirse con file:// (donde fetch esta bloqueado).

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const jsonPath = join(root, 'recipes.json');
const indexPath = join(root, 'index.html');

const START = '<!-- catalog:start';
const END = '<!-- catalog:end -->';

// Vocabulario cerrado de unidades. Pesos siempre en g, liquidos en ml, para
// que la lista de compras pueda sumar. unit null = unidades enteras ("1 onion").
export const UNITS = [
  'g', 'ml', 'cup', 'tbsp', 'tsp',
  'clove', 'can', 'pinch', 'handful', 'sprig', 'stalk', 'leaf', 'rind',
];

export function readCatalog() {
  return JSON.parse(readFileSync(jsonPath, 'utf8'));
}

export function validate(catalog) {
  const errors = [];

  if (!catalog.tags || !catalog.recipes) {
    errors.push('El catalogo necesita las claves "tags" y "recipes"');
    return errors;
  }

  const vocab = new Set();
  for (const [axis, tags] of Object.entries(catalog.tags)) {
    for (const tag of tags) {
      if (vocab.has(tag)) errors.push(`La etiqueta "${tag}" esta repetida en mas de un eje`);
      vocab.add(tag);
    }
    if (!Array.isArray(tags)) errors.push(`El eje "${axis}" no es una lista`);
  }

  const slugs = new Set();
  for (const r of catalog.recipes) {
    if (slugs.has(r.slug)) errors.push(`Slug duplicado: "${r.slug}"`);
    slugs.add(r.slug);

    if (!existsSync(join(root, 'recipes', r.slug + '.html'))) {
      errors.push(`"${r.slug}" no tiene su archivo en recipes/`);
    }
    for (const tag of r.tags) {
      if (!vocab.has(tag)) errors.push(`"${r.slug}" usa la etiqueta "${tag}", que no existe en el vocabulario`);
    }

    if (!Array.isArray(r.ingredients) || r.ingredients.length === 0) {
      errors.push(`"${r.slug}" no tiene lista de ingredientes estructurada`);
      continue;
    }
    r.ingredients.forEach((ing, n) => {
      const donde = `"${r.slug}" ingrediente ${n + 1}`;
      if (typeof ing.item !== 'string' || !ing.item.trim()) {
        errors.push(`${donde}: le falta "item"`);
      }
      if (ing.qty !== null && typeof ing.qty !== 'number') {
        errors.push(`${donde}: "qty" tiene que ser un numero o null`);
      }
      if (ing.unit !== null && !UNITS.includes(ing.unit)) {
        errors.push(`${donde}: unidad "${ing.unit}" fuera del vocabulario (${UNITS.join(', ')})`);
      }
      if (ing.unit !== null && ing.qty === null) {
        errors.push(`${donde}: tiene unidad "${ing.unit}" pero no tiene cantidad`);
      }
    });
  }

  for (const file of readdirSync(join(root, 'recipes'))) {
    if (!file.endsWith('.html')) continue;
    const slug = file.slice(0, -5);
    if (!slugs.has(slug)) errors.push(`recipes/${file} no tiene entrada en recipes.json`);
  }

  return errors;
}

export function injectIndex(catalog) {
  const html = readFileSync(indexPath, 'utf8');

  const startIdx = html.indexOf(START);
  const endIdx = html.indexOf(END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('No encuentro los marcadores catalog:start / catalog:end en index.html');
  }
  const startTagEnd = html.indexOf('-->', startIdx) + 3;

  // </ dentro del JSON cerraria el <script> antes de tiempo.
  const json = JSON.stringify(catalog).replace(/<\//g, '<\\/');
  const block = '\n  <script type="application/json" id="catalog">' + json + '</script>\n  ';

  writeFileSync(indexPath, html.slice(0, startTagEnd) + block + html.slice(endIdx), 'utf8');
}

export function writeCatalog(catalog) {
  const errors = validate(catalog);
  if (errors.length) {
    const err = new Error('El catalogo no paso la validacion');
    err.errors = errors;
    throw err;
  }
  writeFileSync(jsonPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  injectIndex(catalog);
}
