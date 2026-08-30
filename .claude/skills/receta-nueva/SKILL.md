---
name: receta-nueva
description: Convierte una receta desde cualquier fuente (URL de blog o video, PDF, imagen, foto de un libro, o texto pegado) al formato HTML del repositorio, y la agrega al catálogo. Úsalo siempre que Martín pegue un link de cocina o de comida aunque no diga nada más, o cuando mencione convertir, agregar, traspasar, pasar, guardar o sumar una receta a la colección. También cuando adjunte un PDF, una foto o un screenshot de una receta, o cuando pegue el texto de una receta y pida meterla al repo. No usar para editar recetas que ya existen ni para cambiar el diseño compartido.
---

# Receta nueva

Convierte una receta al formato del repo y la agrega al catálogo.

## Antes de empezar

Lee `references/REGLAS.md`. Son 11 reglas de formato, cada una con su checklist.
Están validadas por uso: no las reinterpretes ni las mejores.

Dos que se rompen seguido:
- **El formato no es 100% estándar.** Hay una columna vertebral fija y bloques
  condicionales. Si la fuente no tiene foto, video, notas o narrativa, esos
  bloques no van. No inventes contenido para rellenar.
- **Una sola columna.** Nada de grillas lado a lado ni sidebars sticky.

## Workflow

### 1. Obtener la fuente

| Tipo | Cómo |
|---|---|
| URL de blog o sitio | `WebFetch` pidiendo extracción a markdown |
| Video de YouTube | `WebFetch` de la página; sacar título, canal y descripción |
| PDF | herramienta de lectura de PDF sobre el archivo, o `pdftotext -layout` |
| Imagen o screenshot | `Read` sobre el archivo, que la lee visualmente |
| Texto pegado | usar tal cual |

**Si `pdftotext` saca `�` en vez de fracciones o símbolos** (pasa con PDFs que
usan una fuente con codificación no estándar): no trates de arreglarlo
depurando la codificación a mano, es un agujero de tiempo. En vez de eso,
rasteriza la página y léela visualmente:

```python
import fitz  # pip install pymupdf, si no esta instalado
doc = fitz.open("[ruta_del_pdf]")
for i, page in enumerate(doc):
    page.get_pixmap(matrix=fitz.Matrix(2, 2)).save(f"p{i+1}.png")
```

Después usa `Read` sobre cada PNG — el lector visual entiende ½, ¼, ¾ sin
depender de ninguna tabla de codificación. Esto además te da las imágenes
listas si la fuente es un libro y necesitas el lightbox (paso 4).

**Antes de tratar un PDF como libro (fuente sin URL, con lightbox), revisa si
es una página web impresa.** Un PDF exportado desde un blog o un Substack
conserva los links de la página como anotaciones, y ahí suele estar la URL
del post y la URL pública de las fotos en el CDN:

```python
import fitz
doc = fitz.open("[ruta_del_pdf]")
for i, page in enumerate(doc):
    for l in page.get_links():
        if l.get("uri"): print(i + 1, l["uri"])
```

Si aparece la URL del post, la fuente es **variante A (URL)**, no libro: no va
lightbox, y la foto del hero sale del CDN en vez de ir incrustada en base64.
Los CDN de newsletter sirven el original a tamaño completo (varios MB); busca
la variante redimensionada que ya usa el sitio antes de medirla con
`npm run hero`.

Si la fuente trae una foto del plato utilizable, guarda su URL y **mídela antes
de usarla** (regla 10):

```
npm run hero -- <url-de-la-foto>
```

Te dice si va la variante full-bleed o la contenida, y te imprime el markup.
Una foto vertical metida en el hero por defecto sale con zoom y borrosa. No lo
decidas a ojo.

### 2. Buscar el video, si aplica

Si la receta viene de un blog que tiene video acompañante, busca el ID de
YouTube en el HTML crudo de la página. **`WebFetch` no sirve para esto**: la
conversión a markdown descarta los iframes. Baja el HTML con `curl` y busca:

```
curl -sL "[URL]" -A "Mozilla/5.0" -o page.html
grep -oE '(youtube(-nocookie)?\.com/(watch\?v=|embed/)|youtu\.be/)[A-Za-z0-9_-]{11}' page.html
grep -oE 'data-[a-z-]*src="[^"]*youtube[^"]*"' page.html
```

El segundo grep importa: muchos sitios cargan el iframe con lazy-loading, así
que el `src` real dice `about:blank` y el ID vive en un atributo `data-*`
(`data-cmp-src`, `data-src`, `data-lazy-src`) apuntando a `youtube-nocookie.com`.
Buscar solo `youtube.com` y solo `src=` deja el video fuera.

El link que se guarda es siempre la forma canónica
`https://www.youtube.com/watch?v=[ID]`, no la de embed.

Si no hay video, se omite el bloque — no lo busques por fuera del sitio de la
fuente.

### 3. Definir el slug

Minúsculas, con guiones, sin tildes ni artículos: `courgette-caviar-rigatoni`,
`mexican-pork-black-bean-stew`. Se usa igual para el archivo y para el `slug`
del catálogo.

### 4. Copiar el template y rellenarlo

```
cp .claude/skills/receta-nueva/assets/template.html recipes/[slug].html
```

**Se copia y se edita. Nunca se regenera desde cero.** El template trae
comentarios `OPCIONAL` marcando qué bloques se borran cuando no aplican, y las
tres variantes del bloque de fuente (URL / libro-PDF / ninguna): se deja una y
se borran las otras.

Al rellenar, ojo con:
- Hero: dejar la variante que dijo `npm run hero`, borrar la otra (regla 10)
- Cantidades: tres casos según cómo venga la fuente (regla 4)
- Ingredientes: lee los pasos y compáralos con la lista. Si el método usa
  algo que la lista no declara (vino blanco, un caldo alternativo), va a la
  lista igual — con `ingredient-optional` si es alternativa a otro ingrediente
  ya listado. La lista de la fuente suele estar incompleta; los pasos no.
- Notas: `author-note` para el autor, `personal-note` para Martín (regla 5)
- Subgrupos: solo si la fuente los tiene (regla 7)
- Narrativa: solo si hay algo real que contar (regla 8)

### 5. Actualizar el catálogo

Agrega la entrada en `recipes.json`. Los tags de `tipo` y `base` salen del
vocabulario que ya existe en el bloque `tags` del mismo archivo.

**Si ninguna etiqueta existente de `tipo` o `base` calza, pregúntale a Martín
antes de crear una.** Sin eso, en seis meses hay `rapido`, `express` y `veloz`
significando lo mismo.

**El eje `ingrediente` se pregunta siempre, en toda receta.** Es el único que
crece receta a receta, y Martín lo decide caso a caso. Antes de escribir la
entrada, propónle uno o dos candidatos con su razón y espera respuesta — no lo
completes por tu cuenta ni lo dejes vacío en silencio. Ejemplo:

> Para el eje `ingrediente` propongo `esparragos` (es el protagonista y da
> nombre al plato) y `ricotta` (500 g, sostiene el relleno). ¿Los dejo así,
> agrego otro o lo dejo sin ingrediente?

Las reglas del eje están en el CLAUDE.md del repo. Las cuatro que más se
olvidan al proponer:

- Solo protagonistas: uno o dos, tres si el plato de verdad los tiene, y
  "ninguno" es una respuesta válida.
- Nada de despensa básica. El criterio es si hay que salir a comprarlo: la
  harissa entra, el comino no.
- Nombre en español sin tildes aunque la fuente esté en inglés: `asparagus`
  entra al catálogo como `esparragos`. Antes de inventar un término, revisa si
  el concepto ya está en el vocabulario con otro nombre.
- Precisa donde `base` generaliza: si `base` dice `legumbres`, el ingrediente
  dice cuál (`garbanzos`, `porotos-negros`); si dice `pollo`, dice en qué
  formato se compra (`carne-molida`). Una etiqueta puede vivir en los dos ejes
  —`cerdo` es base e ingrediente— y en la receta se escribe una sola vez.

La etiqueta nueva se agrega al array `tags.ingrediente` en el mismo commit, o
`npm run check` falla.

`dateAdded` es la fecha de hoy en `YYYY-MM-DD`. `cookSoon` arranca en `false`
(lo marca Martín desde la app con la estrella).

La entrada lleva además `ingredients`: la misma lista del HTML pero
estructurada, que es la que alimenta la lista de compras. Las reglas de
traducción están en la regla 12 — item de compra sin preparación, métrico,
rangos por el límite superior, vocabulario cerrado de unidades. **No es opcional:
`npm run check` falla si falta.**

### 6. Regenerar y validar

```
npm run catalog
npm run check
```

`catalog` inyecta el JSON en `index.html` (sin eso la receta no aparece en el
índice). `check` verifica que el slug, el archivo y los tags estén en sincronía.

### 7. Checklist de validación

Recórrelo entero sobre el archivo terminado. Si algo falla, arréglalo antes de
dar la receta por lista.

**Estructura**
- [ ] Los bloques presentes van en el orden de la tabla de la regla 1
- [ ] No se inventó ningún bloque que la fuente no tenga
- [ ] Cero `<style>` y cero `style="…"` inline
- [ ] Los dos `<link>` apuntan a `../assets/recipe.css` y `../assets/print.css`
- [ ] No hay `grid-template-columns` de más de una columna ni `position: sticky`
- [ ] Quedó el botón `.print-button` con `window.print()`

**Contenido**
- [ ] Labels exactamente `Ingredients` / `Method` / `Notes`
- [ ] Meta bar con `Time` / `Serves` / `Source` (sin fuente: solo los dos primeros)
- [ ] `<html lang>` es el idioma de la fuente y el contenido no se tradujo
- [ ] Cantidades según los tres casos de la regla 4 (imperial / métrica / ambas)
- [ ] Espacio entre número y unidad (`450 g`, no `450g`) y fracciones como carácter
- [ ] Si hay hero: se corrió `npm run hero` y se usó la variante que indicó
- [ ] Toda `<li>` de notas tiene `author-note` o `personal-note`
- [ ] Opcionales con `<span class="ingredient-optional">`
- [ ] Todo ingrediente que aparece en los pasos está en la lista de ingredientes
- [ ] Subgrupos solo si existen en la fuente
- [ ] Narrativa de un párrafo que no resume los pasos, o ausente

**Catálogo**
- [ ] Entrada en `recipes.json` con todos los campos
- [ ] `slug` idéntico al nombre del archivo
- [ ] Tags de `tipo` y `base` del vocabulario existente, o consultados con Martín
- [ ] El eje `ingrediente` se le preguntó a Martín y él respondió (incluso si
      la respuesta fue "ninguno")
- [ ] `cookSoon` en `false`
- [ ] `ingredients` completo, según la regla 12
- [ ] Los `item` son nombres de compra, sin cantidad ni preparación
- [ ] Unidades del vocabulario cerrado; ninguna unidad sin cantidad
- [ ] `npm run catalog` corrido
- [ ] `npm run check` en verde, y el aviso de ingredientes que no calzan 1:1
      con el HTML está justificado (una línea con dos ítems) o no aparece

**Placeholders**
- [ ] No quedó ningún `[CORCHETE]` sin reemplazar
- [ ] No quedaron los comentarios `OPCIONAL` ni las variantes descartadas

### 8. Cerrar

Dile a Martín qué quedó fuera y por qué: sin foto, sin video, sin notas, sin
narrativa. Es información, no un problema a resolver inventando.

## Si el resultado sale desviado

El arreglo va en `references/REGLAS.md` o en este checklist — **no** en una
corrección manual del HTML. Si se corrige a mano, el mismo error se repite en
la receta siguiente.
