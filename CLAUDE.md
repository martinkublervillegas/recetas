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
scripts/            dev-server, catalog, check, standalone
export/             salidas de standalone (generado, no editar)
```

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
