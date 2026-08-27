// Servidor local para editar etiquetas desde la app.
// Sirve la carpeta y expone /api/catalog para leer y guardar recipes.json.
// Al guardar, re-inyecta el catalogo en index.html para que el doble clic
// tambien quede al dia.
//
// Uso: npm run dev

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { root, readCatalog, writeCatalog } from './lib/catalog.mjs';

const PORT = 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/catalog') {
    if (req.method === 'GET') {
      return json(res, 200, readCatalog());
    }
    if (req.method === 'PUT') {
      let catalog;
      try {
        catalog = JSON.parse(await readBody(req));
      } catch {
        return json(res, 400, { error: 'JSON invalido' });
      }
      try {
        writeCatalog(catalog);
      } catch (err) {
        return json(res, 422, { error: err.message, errors: err.errors || [] });
      }
      console.log(`guardado — ${catalog.recipes.length} recetas`);
      return json(res, 200, { ok: true });
    }
    return json(res, 405, { error: 'Metodo no permitido' });
  }

  // Archivos estaticos, sin salir de la carpeta del proyecto.
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(root, rel === '/' || rel === '\\' ? 'index.html' : rel);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    return res.end('Prohibido');
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      'content-type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Modo edicion en http://localhost:${PORT}`);
  console.log('Ctrl+C para salir.');
});
