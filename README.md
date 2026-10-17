# FATigaStore

Tienda de PlayStation 2 minimalista, pensada primero para celulares. Sin backend, sin base de datos, sin carrito y sin dependencias JavaScript. Publicación gratuita en GitHub Pages.

## Qué incluye

- Portada con tipografía condensada inspirada en la era PS2 Fat.
- Carrusel de productos táctil, con flechas y contador.
- Tarjetas y páginas individuales de cada producto.
- Botones de consulta por WhatsApp, con mensaje prearmado.
- Tema claro plateado / oscuro grafito, recordado en el dispositivo.
- SEO: títulos y descripciones por producto, metadatos Open Graph, JSON-LD, páginas HTML estáticas, sitemap.xml, robots.txt y URLs legibles.
- Generador con **Python 3 estándar**, sin instalar paquetes.
- GitHub Actions para construir/publicar la tienda en GitHub Pages cada vez que actualizás el repositorio.

## 1. Configurar los datos

Abrí `data/tienda.json`.

En `tienda`:
- `nombre`: FATigaStore.
- `titulo_portada`: título grande. Usá `\n` para separar líneas (ejemplo: `LA SEGUNDA\nGENERACIÓN.`).
- `texto_portada`: subtítulo.
- `whatsapp`: **tu número real** con código de país, sin `+`, guiones, ceros de prefijo ni espacios. Ejemplo ilustrativo: `54911XXXXXXXX` (sustituí las X por números).
- `descripcion`: meta descripción de portada.
- `tema_inicial`: `claro` u `oscuro`.
- `texto_contacto`: mensaje de la sección de contacto.
- `url_publica`: dejar vacío para usar la URL automática de GitHub Pages; si tenés dominio propio, indicá URL completa `https://...` o configurá la variable `SITE_URL` del repositorio.

En cada elemento de `productos`:

| Campo | Para qué sirve |
| --- | --- |
| `id` | URL única, minúsculas y guiones. Evitá cambiarla si ya fue indexada. |
| `nombre` | Nombre visible y SEO. |
| `subtitulo` | Línea corta para la tarjeta. |
| `precio` | Número sin signo `$` (ej. `85000`). |
| `estado` | `disponible` o `agotado`. |
| `destacado` | `true` aparece en el carrusel; `false` conserva página individual pero no aparece en el carrusel. |
| `orden` | Posición en el carrusel, de menor a mayor. |
| `categoria` | Texto libre. |
| `descripcion` | Descripción de la página y SEO. |
| `incluye` | Lista de elementos incluidos (opcional). |
| `imagenes` | Rutas relativas de fotos, primera = foto principal. |

**Importante:** los cuatro productos, las ilustraciones y todos los precios incluidos son **ejemplos ficticios** para mostrar el funcionamiento. Reemplazalos antes de publicar. No pongas en venta artículos que no tengas.

### Imágenes

Guardá tus fotos en `assets/img/`, por ejemplo `assets/img/mi-ps2.webp`, y referencialas en el JSON así:

```json
"imagenes": ["assets/img/mi-ps2.webp", "assets/img/mi-ps2-atras.webp"]
```

Usá fotos propias en WebP, idealmente entre 900 y 1400 px de lado y comprimidas para cargar rápido. Evitá caracteres especiales y espacios en nombres de archivos. La vista de detalle muestra miniaturas si hay más de una foto.

## 2. Previsualizar en la computadora

Necesitás Python 3 instalado. En la raíz del proyecto ejecutá:

```bash
python scripts/build.py
cd dist
python -m http.server 8000
```

Abrí `http://localhost:8000/` en el navegador. Para salir, `Ctrl+C`.

**No abras los HTML directamente como archivos `file://`**: para simular bien el comportamiento de un sitio usá el servidor local.

## 3. Publicar en GitHub Pages (gratis)

1. Creá un repositorio en GitHub, por ejemplo `FATigaStore`.
2. Subí **todos los archivos del proyecto**, incluida la carpeta oculta `.github/workflows/pages.yml`, a la rama `main`.
3. En el repositorio entrá a **Settings → Pages** y elegí **GitHub Actions** como fuente de publicación.
4. Andá a **Actions** y verificá que se complete el flujo **Publicar FATigaStore**.
5. Tu web quedará en `https://TU_USUARIO.github.io/FATigaStore/`. Si el repositorio se llama `TU_USUARIO.github.io`, queda en la raíz.

Cuando modifiques `data/tienda.json` o agregues imágenes y hagas commit a `main`, se vuelve a generar y publicar la web automáticamente.

**Dominio propio:** configurá tu dominio en GitHub Pages y la variable de repositorio `SITE_URL` en **Settings → Secrets and variables → Actions → Variables** con el valor `https://tudominio.com`. Si la web se publica en una subruta, incluí también esa subruta. Si usás un dominio personalizado, configurá además el dominio y DNS en GitHub Pages según sus instrucciones. Para Google Search Console, enviá la URL `https://tudominio.com/sitemap.xml`.

### SEO y alcance

El build genera el HTML de cada producto para que no dependa de renderización JS, así como JSON-LD para los productos, URL canónicas, sitemap y robots cuando se publica con SITE_URL. No garantiza aparecer en los primeros resultados: necesitás textos originales, fotos reales, reputación, contenido útil e indexación. Cambios en buscadores pueden demorar días o semanas.

Si te preocupa que se compartan enlaces en WhatsApp, completá SITE_URL: se usarán enlaces absolutos y metadatos Open Graph. Sin SITE_URL, el modo local no publica sitemap real ni URLs canónicas.

## Estructura

```text
FATigaStore/
├─ data/tienda.json                # Catálogo editable
├─ assets/css/styles.css          # Diseño responsive
├─ assets/js/main.js              # Carrusel, tema, galería
├─ assets/img/                    # Fotos / imágenes
├─ scripts/build.py               # Generador de HTML + SEO
├─ .github/workflows/pages.yml    # Despliegue automático
├─ dist/                           # Sitio compilado, regenerable
└─ README.md
```

`dist/` se crea automáticamente. **Editá el JSON y los archivos fuente, no las páginas generadas dentro de dist**, porque se sobrescriben en el próximo build.

## Consideraciones

- El número de WhatsApp de ejemplo `5491100000000` no es válido para tu negocio. Reemplazalo antes de publicar.
- El sitio no procesa pagos ni guarda datos de clientes.
- El color de fondo se puede alternar con el botón Claro/Oscuro.
- Respetá derechos sobre fotos, marcas, juegos y contenidos que publiques. El sitio es un comercio independiente, no afiliado oficialmente con Sony.
- Para cambiar el diseño usá `assets/css/styles.css`; no hay framework ni compilador de frontend.
