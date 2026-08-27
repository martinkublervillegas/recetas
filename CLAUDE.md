# Recetas

Colección personal de recetas en HTML, CSS y JS vanilla. Sin frameworks, sin
build step obligatorio. Uso local; la estructura sirve para GitHub Pages sin
cambios.

## Mapa

```
index.html          app de índice: listado, búsqueda, filtro por tags
recipes.json        catálogo: metadata + ingredientes estructurados — fuente de verdad
recipes/[slug].html una receta por archivo, sin CSS inline
assets/recipe.css   diseño de la vista de receta
assets/index.css    diseño del índice
assets/print.css    reglas @media print
assets/icons/       íconos PWA (icon-192.png, icon-512.png, apple-touch-icon.png)
manifest.json        manifest PWA — nombre, ícono, color, display standalone
service-worker.js    cachea assets/páginas visitadas para acceso offline
scripts/            dev-server, catalog, check, standalone
export/             salidas de standalone (generado, no editar)
```

## PWA

`index.html` y cada `recipes/[slug].html` linkean `manifest.json` y registran
`service-worker.js`. Toda receta nueva debe traer esos mismos tres tags en el
`<head>` (ya están en el template del skill `receta-nueva`) — si se agregan a
mano sin el skill, copiarlos de cualquier receta existente.

El botón ★ "para cocinar pronto" funciona con o sin servidor: con `npm run dev`
guarda en `recipes.json`; en GitHub Pages u otro estático guarda en
`localStorage` del navegador (por dispositivo, no se sincroniza entre celu y
PC).

## Convenciones

- Nombre de archivo: `[recipe-slug].html`, minúsculas con guiones, sin tildes.
  El `slug` del catálogo es idéntico al nombre del archivo sin `.html`.
- **Toda receta nueva actualiza `recipes.json` en el mismo commit que su HTML.**
- El diseño vive solo en `assets/`. Una receta nunca trae `<style>` ni
  `style="…"` inline.
- `recipes.json` lo escriben los scripts. Se puede editar a mano, pero después
  hay que correr `npm run catalog`.

## Comandos

```bash
npm run dev                      # servidor local en :4173, habilita editar etiquetas
npm run catalog                  # inyecta recipes.json en index.html
npm run check                    # valida catálogo, archivos y vocabulario de tags
npm run hero -- <url>            # mide una foto y dice qué variante de hero usar
npm run standalone -- <slug>     # export/[slug].html autocontenido (--embed para las fotos)
```

Para ver recetas basta abrir `index.html` con doble clic — no necesita servidor.
`npm run dev` es solo para editar etiquetas desde la app: al guardar escribe
`recipes.json` y re-inyecta `index.html` solo.

## Recetas nuevas

Usa el skill `receta-nueva` (`.claude/skills/receta-nueva/`). Cubre el workflow
de conversión desde URL, PDF, imagen o texto, las reglas de formato y el
checklist de validación. No repitas las reglas acá: viven en el skill.
