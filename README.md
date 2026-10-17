# FatBoxSlim — versión final estática y simple

**Sin instalar nada, sin Python, sin npm, sin `.yml`, sin Jekyll y sin GitHub Actions.**

## Publicación (una sola vez)

1. Descomprimí el ZIP.
2. Subí **el contenido**, no la carpeta contenedora, a la raíz de tu repositorio `fatboxslim-ps2.github.io`.
3. En el repositorio, andá a **Settings → Pages**.
4. Elegí **Deploy from a branch → main → /(root)** y guardá.
5. Abrí https://fatboxslim-ps2.github.io/ . GitHub Pages abrirá `index.html` automáticamente.

**Si subiste una versión vieja, borrá antes las carpetas `.github/workflows/`, `_data/`, `_includes/`, `_layouts/`, `scripts/`, `dist/` y cualquier `_config.yml` o `.nojekyll` de la versión anterior.** La presente versión NO los utiliza. GitHub NO elimina archivos viejos por subir un ZIP nuevo: verificá que no quede un workflow anterior.

## Qué se edita

**Todo lo variable se edita en `productos.json`**, un archivo de texto normal.

- `sitio.whatsapp`: agregá tu número de WhatsApp en formato internacional, solo dígitos, por ejemplo `54911...` (con tu número verdadero). Si está vacío, los botones avisan que falta configurarlo.
- `hero.videoDesktop`: video horizontal (tu MP4 real de 720p en `assets/hero/desktop.mp4`. El ZIP **no incluye ni sobrescribe tu video real**: incluye un clip de respaldo llamado `desktop-demo.mp4` que se usa hasta que subas el tuyo.
- `hero.velocidadVideo`: `2` es reproducción acelerada a 2×; `1` es velocidad normal. Solo aplica a PC. El video va silenciado y en loop.
- `hero.imagenesMobile`: poné todas las imágenes que quieras, por ejemplo `assets/hero/1.jpg` a `6.jpg`. **No hay límite de tres.** El ZIP **no incluye ni sobrescribe tus fotos `1.jpg` a `6.jpg`**: contiene fondos de respaldo con nombres `demo-1.jpg` a `demo-6.jpg`. Cuando subas tus JPG reales, se mostrarán automáticamente.
- `hero.intervaloMobileMs`: `5000` = 5 segundos. Mínimo 2500 ms.
- `productos`: agregá, quitá y ordená productos; `visible:false` lo oculta; `destacado:true` lo muestra en la selección inicial; `disponible:false` marca agotado.
- `precio`: un número sin comillas como `125000`; con `null` se muestra “Consultar precio”.
- `imagenes`: una o más rutas a archivos de `assets/productos/` (JPG, PNG, WebP, AVIF, SVG).
- `incluye`: opcional, lista de accesorios incluidos que aparecerá en la ficha.

**Ejemplo de producto:**

```json
{
  "id": "ps2-slim-negra",
  "nombre": "PlayStation 2 Slim Negra",
  "descripcionCorta": "Consola probada con joystick.",
  "descripcion": "Descripción larga real del producto y su estado.",
  "precio": 125000,
  "visible": true,
  "destacado": true,
  "disponible": true,
  "orden": 4,
  "imagenes": ["assets/productos/ps2-slim-1.webp", "assets/productos/ps2-slim-2.webp"],
  "incluye": ["Consola", "Cable de video", "Joystick"]
}
```

Acordate de ponerlo **adentro del array** `productos` y separar los objetos con comas. El JSON no admite comentarios ni comas finales.

## ¿Qué hace cada archivo?

```text
index.html       Página principal (SEO y contenido importante en HTML)
producto.html    Una única plantilla de detalle para todos los productos
style.css        Diseño blanco plateado / negro grafito y responsive
script.js        Lee JSON, cambia fondos, maneja tema y genera tarjetas
productos.json   Único archivo de contenido que editás
assets/hero/     Poster, 6 JPG y MP4 de respaldo (prefijo demo-); conservá acá tus medios reales
assets/productos/Imágenes de productos de muestra
assets/favicon.svg
robots.txt       Permite indexación y referencia al sitemap
sitemap.xml      URL de la portada
404.html         Página de error
README.md        Estas instrucciones
```

## SEO: alcance real, sin generadores

La **Home** tiene título, descripción, canonical, encabezados visibles en el HTML, Open Graph, datos estructurados WebSite, sitemap, robots.txt y carga responsive. Google puede ejecutar JavaScript e indexar el catálogo, pero los productos se insertan desde JSON luego de cargar.

**Limitación técnica importante:** `producto.html?id=...` muestra una ficha individual y ajusta título, canonical y datos `Product` en JavaScript; **no es equivalente a tener un archivo HTML prerenderizado por producto**. Los motores de búsqueda pueden renderizar JavaScript, pero no garantizamos indexación de cada ficha, y el sitemap solo incluye la Home. Para SEO óptimo de cada producto, haría falta crear manualmente archivos HTML propios o agregar una generación automática. Elegimos lo primero que pediste: cero pasos de compilación y administración solo desde JSON. No es posible garantizar ambas cosas al 100 % con estas restricciones.

Antes de vender: reemplazá los datos de demostración por tus productos y fotos reales. No publiques precios, características o disponibilidad sin verificarlos. Subí las fotos reales con nombres descriptivos para mejorar su SEO.

## Cómo probar

**En GitHub Pages:** funciona inmediatamente después del despliegue.

**Doble clic en `index.html` desde el escritorio:** se ve el diseño, pero Chrome y otros navegadores normalmente bloquean `fetch('productos.json')` en URLs `file://` por seguridad. No es un error del sitio ni hace falta instalar nada: probalo en tu dirección de GitHub Pages.

## Rendimiento

El MP4 no recibe dirección `src` en mobile; no se descarga en celular. En conexiones con ahorro de datos y en equipos con movimiento reducido se muestra la imagen de respaldo, sin autoplay. En mobile, las imágenes se leen del JSON y se precarga solo la siguiente antes del fade. Sin librerías externas ni fuentes remotas.
