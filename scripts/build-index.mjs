// Inyecta recipes.json dentro de index.html.
// Uso: npm run catalog

import { readCatalog, injectIndex } from './lib/catalog.mjs';

const catalog = readCatalog();
injectIndex(catalog);

console.log(`index.html actualizado — ${catalog.recipes.length} recetas`);
