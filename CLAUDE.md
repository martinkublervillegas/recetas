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

## Etiquetas

El vocabulario vive en el bloque `tags` de `recipes.json` y es cerrado:
`npm run check` falla si una receta usa una etiqueta que no está declarada. Son
tres ejes:

- **`tipo`** — el formato del plato: `sopa`, `pasta`, `guiso`, `noodles`,
  `ensalada`, `horno`, `dip`. Normalmente uno por receta.
- **`base`** — qué sostiene el plato: `vegetariano`, `pollo`, `cerdo`, `vacuno`,
  `pescado`, `legumbres`. Es el grano grueso.
- **`ingrediente`** — qué hay que comprar: los ingredientes protagonistas.
  Vocabulario abierto, crece receta a receta.

**Una misma etiqueta puede estar declarada en dos ejes.** `cerdo` es a la vez
la base del plato y lo que se compra, y las dos preguntas son legítimas. Como
`recipes[].tags` es una lista plana, la etiqueta se escribe una sola vez en la
receta y sirve a los dos ejes; lo que el validador sí rechaza es repetirla
dentro del mismo eje.

Reglas del eje `ingrediente`:

1. Solo protagonistas: el ingrediente que le da identidad al plato y por el que
   uno buscaría la receta. Normalmente uno o dos, tres cuando el plato de
   verdad los tiene (un dip de zanahoria, poroto y harissa), y puede no llevar
   ninguno — un minestrone es la suma de sus verduras, no una de ellas.
2. Nunca despensa básica (ajo, cebolla, sal, aceite, especias, caldo, limón).
   Si se tiene siempre en la casa, no es etiqueta — son justo los que más se
   repiten y por eso no sirven para filtrar. El criterio es si hay que salir a
   comprarlo: la harissa entra, el comino no.
3. Nombre canónico en español, minúsculas con guiones y sin tildes
   (`esparragos`, `zapallo-italiano`, `leche-de-coco`), aunque la receta esté en
   inglés y diga `asparagus`. La etiqueta existe para colapsar sinónimos y el
   idioma de la fuente: un solo término por concepto.
4. Precisar donde `base` generaliza. `base` dice `legumbres` y el ingrediente
   dice cuál (`garbanzos`, `porotos-negros`, `porotos-canarios`); `base` dice
   `pollo` y el ingrediente dice en qué formato se compra (`carne-molida`).
   Repetir la etiqueta tal cual solo vale cuando no hay nada que precisar.

Las etiquetas de `ingrediente` se deciden con Martín receta por receta — el
skill `receta-nueva` pregunta antes de escribirlas.

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
