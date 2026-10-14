# Reglas de formato

Están definidas y validadas por uso. No reinterpretarlas ni "mejorarlas".
Cada una se puede chequear por separado sobre el HTML terminado.

---

## 1. Estructura: columna vertebral fija + bloques condicionales

El formato **no es 100% estándar**: unas recetas vienen de una URL, otras de un
PDF; unas traen foto, otras no; unas tienen narrativa, otras no. Por eso la
regla se parte en dos.

### Columna vertebral — siempre presente

1. Título (`h1.recipe-title`)
2. Barra de metadata full-width (`.meta-bar`)
3. Botón Exportar PDF (`.print-button`)
4. Ingredientes en tarjeta blanca (`.ingredients-section`)
5. Pasos numerados con círculos verdes (`.step`)

### Bloques condicionales — solo si la fuente los tiene

| Bloque | Posición | Se incluye si |
|---|---|---|
| Imagen hero | antes del título | hay foto utilizable (ver regla 10) |
| Bloque de fuente | entre hero y título | hay fuente rastreable |
| Botón de video | entre título y meta bar | hay video |
| Subgrupos de ingredientes | dentro de la tarjeta | la receta original los tiene |
| Notas | después de los pasos | hay notas del autor o de Martín |
| Narrativa | después de las notas | hay algo real que contar |
| Fuente al pie (`.print-source`) | al final del `.recipe-card` | hay fuente |
| Lightbox | al final del `<body>` | la fuente es un libro o PDF sin URL — escaneado o extracto digital, da lo mismo (ver regla 10) |

**Lo que no es negociable es el orden.** Un bloque puede faltar; si está, va en
su lugar. La verificación no es "¿están todos?" sino "¿los que están, están en
orden y bien marcados?".

- [ ] Los bloques de la columna vertebral están todos
- [ ] Los bloques condicionales presentes respetan el orden de la tabla
- [ ] No se inventó ningún bloque que la fuente no tenga

## 2. Una sola columna

Todo apilado. Nada de `display: grid` con columnas lado a lado, ni sidebars
`position: sticky`. **Esta ya se rompió una vez** (el scallion tenía los
ingredientes en una columna sticky de 260px a la izquierda).

- [ ] No hay `grid-template-columns` con más de una columna (la portada de la
      regla 10 es la única excepción, y vive en el CSS)
- [ ] No hay `position: sticky`
- [ ] El HTML no trae `<style>` inline: todo sale de `../assets/recipe.css`

## 3. Idioma

La receta **conserva el idioma de la fuente original**. Si la fuente está en
inglés, ingredientes y pasos van en inglés. No traducir.

Los labels de estructura van **en inglés**, siempre, sea cual sea el idioma del
contenido: `Ingredients`, `Method`, `Notes`, `Time`, `Serves`, `Source`.

El `lang` del `<html>` es el de la fuente, no el de Martín.

- [ ] Contenido en el idioma de la fuente
- [ ] Labels de sección exactamente `Ingredients` / `Method` / `Notes`
- [ ] Labels de meta bar exactamente `Time` / `Serves` / `Source`
- [ ] `<html lang="…">` coincide con el idioma del contenido

## 4. Cantidades

**El métrico manda.** Si la fuente ya es métrica, se deja tal cual — no se
agrega conversión imperial.

Hay tres casos:

**Fuente imperial** → original primero, métrico entre paréntesis:

- `4 lbs (1.8 kg) pork shoulder`
- `1 cup (240 ml) beans`
- `1 x 28 oz (794 g) can tomatoes`

**Fuente métrica** → se deja tal cual, sin agregar imperial:

- `200 g onions, thinly sliced`
- `50 ml extra virgin olive oil`

**Fuente que ya trae los dos** (típico de sitios australianos y británicos, que
escriben `400ml/14oz`) → métrico primero, imperial entre paréntesis. Se pasa la
barra al formato de paréntesis de la casa; no se descarta el imperial:

- `400ml/14oz` → `400 ml (14 oz)`
- `50g / 2oz` → `50 g (2 oz)`

Espacio entre número y unidad siempre: `450 g`, no `450g`.
Fracciones con el carácter, no con barra: `1½`, `½`, `⅔`, `¼`.

- [ ] Fuente imperial → original primero, métrico entre paréntesis
- [ ] Fuente métrica → sin conversiones agregadas
- [ ] Fuente con ambos → métrico primero, imperial entre paréntesis
- [ ] Espacio entre número y unidad en todas
- [ ] Fracciones como carácter

## 5. Notas: dos tipos, nunca mezclados

| Clase | Marca | Qué es |
|---|---|---|
| `author-note` | `→` | nota del autor original |
| `personal-note` | `✦` | nota de Martín |

Toda `<li>` dentro de `.notes-list` lleva una de las dos clases. Una `<li>` sin
clase no muestra ninguna marca — es un error, no una tercera categoría.

Nunca convertir una en otra: si el autor lo dijo, es `author-note`; si sale de
la experiencia de Martín, es `personal-note`.

**Notas que vienen de una tercera fuente** (otra receta del mismo plato que se
usó para complementar): van como `personal-note`, porque `author-note` es del
autor de *esta* receta y atribuírsela sería falso. La atribución real va en el
texto de la nota: *"La versión de Kenji López-Alt (Serious Eats) subcocina el
pollo a propósito…"*. Sin eso se pierde de dónde salió.

Solo entran las que **complementan** el método base. Si la segunda fuente
contradice a la primera (Kenji limita el marinado a 8 horas, Nagi permite 48),
no se mezcla: o se omite, o se le pregunta a Martín cómo resolverlo.

- [ ] Toda `<li>` de notas tiene `author-note` o `personal-note`
- [ ] Ninguna nota del autor quedó marcada como personal ni al revés
- [ ] Las notas de una tercera fuente son `personal-note` y dicen de quién son
- [ ] Ninguna nota agregada contradice el método de la receta base
- [ ] Se usa `personal-note`, no `note-personal`

## 6. Ingredientes opcionales

Van marcados con `<span class="ingredient-optional">`, nunca como texto suelto
entre paréntesis.

```html
<li>1 cup (150 g) pancetta, diced <span class="ingredient-optional">(optional)</span></li>
```

- [ ] Todo ingrediente opcional usa el `<span>`
- [ ] No quedó ningún `(optional)` como texto plano

## 7. Subgrupos de ingredientes

Solo si la receta original los tiene. No inventar agrupaciones "para ordenar".

Se marcan con `<p class="subgroup-label">` seguido de su propia
`<ul class="ingredient-list">`. Sin subgrupos, va una sola `<ul>` sin ningún
`subgroup-label`.

- [ ] Los subgrupos existen en la fuente original
- [ ] Sin subgrupos → una sola `<ul>`, cero `subgroup-label`
- [ ] No hay `<div>` envolviendo los grupos: es `<p>` + `<ul>` directo

## 8. Narrativa final

Un párrafo, en itálica (`.narrative`), sobre de dónde viene el plato o qué lo
hace funcionar. **No es un resumen de los pasos.**

Es un bloque condicional: si no hay nada real que contar, se omite. Mejor sin
narrativa que con una inventada.

- [ ] Es un solo párrafo
- [ ] No repite los pasos
- [ ] Dice algo de origen, contexto o técnica
- [ ] Si no había material, el bloque no está

## 9. Tokens de diseño

`assets/recipe.css` es el único lugar donde vive el diseño. Una receta nueva no
agrega CSS propio ni cambia colores.

Referencia (no tocar): `--green: #3a7d44` · `--green-light: #eef5ef` ·
`--muted: #6b7280` · `--border: #e5e7eb` · fuentes `Inter` + `Playfair Display`.

- [ ] Cero `<style>` en el HTML de la receta
- [ ] Cero atributos `style="…"` inline
- [ ] Los dos `<link>` de CSS apuntan a `../assets/recipe.css` y `../assets/print.css`

## 10. Imagen hero: la variante se mide, no se elige a ojo

Hay dos formas de abrir una receta con foto, y la elige la forma de la foto:

- **Full-bleed** (`.recipe-hero`): franja de 420px a todo el ancho de la
  ventana, con `object-fit: cover`. Recorta la foto a una banda y la estira.
  Funciona **solo** con fotos horizontales grandes.
- **Portada** (`.recipe-opening`): la foto va al lado del título, a su
  proporción real, como abre la receta en el libro; en el celular se apila
  arriba del título. Es la de las fotos verticales — casi todas las que vienen
  de libros — y de las horizontales chicas.

```bash
npm run hero -- <url-de-la-foto>
```

Devuelve las dimensiones y el bloque HTML que corresponde:

| Foto | Variante | Markup |
|---|---|---|
| Horizontal y ≥ 1200px de ancho | full-bleed | `<div class="recipe-hero">` con una `<img>`, antes del `.recipe-header` |
| Vertical, o < 1200px de ancho | portada | `<div class="recipe-opening">` que **envuelve** al `.recipe-header` |

En la portada, el `.recipe-header` completo (fuente, título, video, meta bar y
botón Exportar PDF) va **adentro** del `.recipe-opening`, después de
`<div class="recipe-opening__photo">` con su `<img>`. El `.recipe-opening` se
cierra justo después del `</div><!-- /recipe-header -->`, antes del
`.recipe-card`. Es una sola `<img>`: no hay copia desenfocada de fondo.

La grilla de dos columnas de la portada vive en `assets/recipe.css` y es la
única excepción a la regla 2: abarca solo foto y título, nunca ingredientes
ni pasos, y colapsa a una columna bajo 720px. En el HTML de la receta no se
escribe ninguna grilla.

La variante vieja `recipe-hero--contained` (con `.hero-backdrop`) ya no tiene
CSS: no usarla.

Antes de dar por buena una URL de foto, revisa si el CDN de la fuente entrega
una versión más grande (`?w=`, `?resize=`). Si no la hay, no la fuerces: subir
de tamaño una imagen chica solo la empeora.

**Foto sacada de un libro o PDF (sin URL).** `npm run hero` solo mide URLs
remotas. La foto se extrae del PDF con `pymupdf` (`doc.extract_image(xref)`
sobre las imágenes de `page.get_images()`), se mide con el mismo criterio de la
tabla y se guarda en `assets/heroes/[slug].jpg`, reducida a unos 1100px de
alto (JPEG calidad ~85, menos de 300 KB). La receta la referencia como
`../assets/heroes/[slug].jpg` y el campo `image` del catálogo como
`assets/heroes/[slug].jpg`. Archivo local, no base64 ni CDN ajeno: así el
service worker la cachea y anda offline.

- [ ] Se midió la foto (`npm run hero` si es URL; a mano si es un archivo local)
- [ ] La variante del HTML es la que corresponde según la tabla
- [ ] En la portada, el `.recipe-header` está adentro del `.recipe-opening`
- [ ] No aparece `recipe-hero--contained` ni `hero-backdrop`
- [ ] Foto local: está en `assets/heroes/[slug].jpg` y `image` apunta ahí

**El lightbox (fuente = libro o PDF) no necesita un escaneo fotográfico.** Un
PDF de texto sin ninguna imagen incrustada también califica: se rasterizan sus
páginas a PNG (`pymupdf`, ver `SKILL.md` paso 1) y esas capturas van al
lightbox igual que un escaneo real. Lo que importa es que no hay URL para
enlazar, no de dónde salió la página.

## 11. Catálogo

Toda receta nueva entra en `recipes.json` en el mismo commit que su HTML.

- [ ] Existe la entrada con `slug`, `title`, `image`, `time`, `servings`,
      `source`, `video`, `tags`, `language`, `dateAdded`, `cookSoon`,
      `ingredients`
- [ ] El `slug` es idéntico al nombre del archivo sin `.html`
- [ ] Los tags salen del vocabulario existente; los nuevos se preguntan antes
- [ ] `cookSoon` arranca en `false`
- [ ] `npm run check` pasa

## 12. Ingredientes estructurados

Además del texto en el HTML, cada receta lleva su lista de ingredientes
**estructurada** en `recipes.json`. El HTML es lo que se lee cocinando; el
catálogo es lo que se puede sumar (lista de compras).

Cada ingrediente es un objeto con cuatro campos:

```json
{ "item": "cremini mushrooms", "qty": 455, "unit": "g" }
{ "item": "garlic", "qty": 6, "unit": "clove" }
{ "item": "onion", "qty": 1, "unit": null }
{ "item": "salt", "qty": null, "unit": null }
{ "item": "pancetta", "qty": 150, "unit": "g", "optional": true }
```

- **`item`** — lo que escribirías en la lista de compras, no la línea completa
  de la receta. `"6 cloves garlic, minced"` → `garlic`. Sin cantidades, sin
  preparación (*minced*, *diced*, *thinly sliced*): eso ya vive en el HTML.
- **`qty`** — número o `null`. Nunca string.
- **`unit`** — del vocabulario cerrado de abajo, o `null`.
- **`optional`** — solo cuando va; si no, se omite el campo.

**Las dos combinaciones con `null` significan cosas distintas:**

| `qty` | `unit` | Significa |
|---|---|---|
| `1` | `null` | una unidad entera — *1 onion*, *2 burrata* |
| `null` | `null` | a gusto o sin cantidad — *salt*, *basmati rice* |

Una unidad sin cantidad es un error y `npm run check` lo rechaza.

### Vocabulario de unidades

`g` · `ml` · `cup` · `tbsp` · `tsp` · `clove` · `can` · `pinch` · `handful` ·
`sprig` · `stalk` · `leaf` · `rind`

Es cerrado y vive en `scripts/lib/catalog.mjs`. Para agregar una, se pregunta
primero — igual que con los tags.

### Cómo se traduce la línea del HTML

- **Métrico siempre**, aunque el HTML muestre los dos sistemas:
  `4 lbs (1.8 kg)` → `1800 g`. Pesos en `g`, líquidos en `ml`, para que sumen.
  `cup`/`tbsp`/`tsp` se dejan como están: son medidas de cuchara, convertirlas
  a ml no ayuda a comprar.
- **Los rangos se guardan por el límite superior**: `1–2 carrots` → `2`,
  `150–200 g` → `200 g`. Mejor comprar de más que quedarse corto.
- **Una línea puede dar dos ingredientes**: `Salt and black pepper, to taste`
  son dos entradas. La paridad con los `<li>` **no** tiene por qué ser 1:1;
  `npm run check` avisa cuando difieren, pero como información, no como error.
- Los subgrupos del HTML no se replican: `ingredients` es una lista plana. Si
  un ingrediente aparece en dos subgrupos (típico: aceite en la marinada y en
  la salsa), van **dos entradas** con el mismo `item`. Sumarlas es justamente
  el trabajo de la lista de compras.

- [ ] Toda receta tiene `ingredients` con al menos un elemento
- [ ] Los `item` son nombres de compra, sin cantidad ni preparación
- [ ] Pesos en `g` y líquidos en `ml`; los rangos, por el límite superior
- [ ] Las unidades salen del vocabulario; las nuevas se preguntan antes
- [ ] Ningún ingrediente tiene unidad sin cantidad
- [ ] Los opcionales llevan `"optional": true`
