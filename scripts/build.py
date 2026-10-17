#!/usr/bin/env python3
"""Genera HTML estático desde data/tienda.json. Solo biblioteca estándar de Python."""
import html
import json
import os
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
DATA = json.loads((ROOT / 'data/tienda.json').read_text(encoding='utf-8'))
STORE = DATA['tienda']
PRODUCTS = DATA['productos']


def esc(value):
    return html.escape(str(value), quote=True)


def validate():
    if not re.fullmatch(r'\d{10,15}', STORE['whatsapp']):
        raise ValueError('tienda.whatsapp debe tener entre 10 y 15 dígitos, sin + ni espacios')
    if STORE.get('tema_inicial') not in ('claro', 'oscuro'):
        raise ValueError('tema_inicial debe ser claro u oscuro')
    seen = set()
    for item in PRODUCTS:
        slug = item['id']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or slug in seen:
            raise ValueError(f'ID repetido o inválido: {slug}')
        seen.add(slug)
        if item['estado'] not in ('disponible', 'agotado'):
            raise ValueError(f'Estado inválido para {slug}')
        if not isinstance(item['precio'], (int, float)) or item['precio'] < 0:
            raise ValueError(f'Precio inválido para {slug}')
        if not item.get('imagenes'):
            raise ValueError(f'{slug}: agregá al menos una imagen')
        for path in item['imagenes']:
            if path.startswith('/') or '..' in Path(path).parts or not (ROOT / path).is_file():
                raise ValueError(f'{slug}: imagen inexistente o insegura: {path}')


def path_to(fragment):
    return BASE + fragment


def full_url(fragment):
    return DOMAIN + path_to(fragment) if DOMAIN else ''


def money(price):
    return '$ ' + f'{price:,.0f}'.replace(',', '.')


def wa(item=None):
    message = f'Hola, te consulto por {item["nombre"]} ({full_url("productos/" + item["id"] + "/") or item["id"]}). ¿Está disponible?' if item else 'Hola, quiero consultar por los productos de FATigaStore.'
    return 'https://wa.me/' + STORE['whatsapp'] + '?text=' + quote(message)


def brand():
    return '<a class="brand" href="'+path_to('')+'" aria-label="FATigaStore, ir al inicio"><span class="brand-name"><span class="fat">FAT</span>igaStore</span><span class="brand-track" aria-hidden="true"><i></i><i></i><i></i><i></i></span></a>'


def layout(body, title, description, canonical='', product=None, image=None):
    title = esc(title)
    description = esc(description)
    canonical_tag = f'<link rel="canonical" href="{esc(canonical)}">' if canonical else ''
    og_url = f'<meta property="og:url" content="{esc(canonical)}">' if canonical else ''
    og_image = f'<meta property="og:image" content="{esc(image)}">' if image else ''
    schema = {'@context': 'https://schema.org', '@type': 'Store', 'name': STORE['nombre'], 'description': STORE['descripcion']}
    if product:
        schema = {'@context': 'https://schema.org', '@type': 'Product', 'name': product['nombre'], 'description': product['descripcion'], 'image': [full_url(i) for i in product['imagenes']] if DOMAIN else [], 'offers': {'@type': 'Offer', 'priceCurrency': STORE['moneda'], 'price': product['precio'], 'availability': 'https://schema.org/InStock' if product['estado'] == 'disponible' else 'https://schema.org/OutOfStock'}}
        if canonical:
            schema['offers']['url'] = canonical
    elif DOMAIN:
        schema['url'] = full_url('')
    structured = json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c')
    return f'''<!doctype html>
<html lang="es" data-theme="{esc(STORE['tema_inicial'])}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{description}">
<meta name="theme-color" content="#e9e9e8">
<meta property="og:type" content="{'product' if product else 'website'}"><meta property="og:site_name" content="{esc(STORE['nombre'])}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{description}">
{canonical_tag}{og_url}{og_image}
<link rel="icon" href="{path_to('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{path_to('assets/css/styles.css')}">
<script type="application/ld+json">{structured}</script>
<script defer src="{path_to('assets/js/main.js')}"></script>
</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="header"><div class="container header-inner">{brand()}<nav class="nav" aria-label="Navegación"><a href="{path_to('')}#productos">Productos</a><a href="{path_to('')}#contacto">Contacto</a><button class="theme-btn" data-theme-toggle type="button" aria-label="Cambiar tema">◐ Oscuro</button></nav></div></header>
<main id="contenido">{body}</main>
<footer class="footer"><div class="container footer-inner"><span>© FATigaStore · Consolas y accesorios PS2</span><span>Hecho para seguir jugando. <a href="{path_to('')}">Volver al inicio</a></span></div></footer>
</body></html>'''


def card(item, position):
    slug = 'productos/' + item['id'] + '/'
    status = item['estado']
    img = path_to(item['imagenes'][0])
    return f'''<article class="product-card"><a href="{path_to(slug)}" class="product-picture" aria-label="Ver {esc(item['nombre'])}"><span class="status">{esc(status)}</span><img src="{img}" alt="{esc(item['nombre'])}" loading="lazy" width="500" height="500"></a><div class="product-info"><span class="product-index">ITEM {position:02d} / {esc(item['categoria']).upper()}</span><h3>{esc(item['nombre'])}</h3><p>{esc(item['subtitulo'])}</p><strong class="product-price">{money(item['precio'])}</strong><div class="product-actions"><a class="button" href="{esc(wa(item))}" target="_blank" rel="noopener noreferrer">Consultar ↗</a><a class="button outline" href="{path_to(slug)}" aria-label="Ver detalle de {esc(item['nombre'])}">Ver +</a></div></div></article>'''


def homepage():
    selected = sorted([p for p in PRODUCTS if p.get('destacado', True)], key=lambda p: p.get('orden', 999))
    product_html = ''.join(card(p, i) for i, p in enumerate(selected, 1)) if selected else '<p class="empty">Pronto vas a encontrar productos acá.</p>'
    title_fragments = STORE['titulo_portada'].split('\\n') if '\\n' in STORE['titulo_portada'] else STORE['titulo_portada'].split('\n')
    hero_title = '<br>'.join(esc(x) if i == 0 else '<span class="color">'+esc(x)+'</span>' for i, x in enumerate(title_fragments))
    body = f'''<section class="hero"><div class="container"><p class="eyebrow">FATigaStore / Retro gaming / PS2</p><h1>{hero_title}</h1><div class="hero-bottom"><p>{esc(STORE['texto_portada'])}</p><a class="button" href="#productos">Explorar productos &nbsp; ↓</a></div></div></section>
<section id="productos" class="section"><div class="container"><div class="section-head"><div><p class="eyebrow"><span class="section-index">01 /</span> CATÁLOGO</p><h2 class="section-title">Productos</h2></div><div class="carousel-controls"><button class="arrow" type="button" data-previous aria-label="Producto anterior">←</button><button class="arrow" type="button" data-next aria-label="Producto siguiente">→</button></div></div><div class="carousel-shell"><div class="carousel" data-carousel aria-label="Carrusel de productos" tabindex="0">{product_html}</div></div><div class="carousel-footer"><div class="track" aria-hidden="true"><div class="track-progress" data-progress></div></div><span class="counter" data-counter>01 / {len(selected):02d}</span></div></div></section>
<section id="contacto" class="section contact"><div class="container contact-inner"><div><p class="eyebrow"><span class="section-index">02 /</span> CONTACTO</p><h2 class="section-title">¿Hablamos?</h2><p>{esc(STORE['texto_contacto'])}</p></div><a class="button" target="_blank" rel="noopener noreferrer" href="{esc(wa())}">Escribir por WhatsApp ↗</a></div></section>'''
    return layout(body, STORE['nombre'] + ' | Consolas y accesorios PS2', STORE['descripcion'], full_url(''))


def detail(item):
    images = item['imagenes']
    thumbs = ''.join(f'<button type="button" class="detail-thumb" data-thumbnail data-image="{path_to(i)}" data-alt="{esc(item["nombre"])} - imagen {n}" aria-label="Ver foto {n}" aria-pressed="{str(n == 1).lower()}"><img src="{path_to(i)}" alt="" loading="lazy"></button>' for n, i in enumerate(images, 1)) if len(images) > 1 else ''
    includes = '<ul class="include">'+''.join('<li>'+esc(s)+'</li>' for s in item.get('incluye', []))+'</ul>' if item.get('incluye') else ''
    body = f'''<div class="container detail-layout"><div><div class="detail-picture"><img data-detail-image src="{path_to(images[0])}" alt="{esc(item['nombre'])}" width="650" height="650"></div><div class="detail-thumbs">{thumbs}</div></div><div><nav class="breadcrumb" aria-label="Ruta"><a href="{path_to('')}">Inicio</a> / <a href="{path_to('')}#productos">Productos</a> / {esc(item['nombre'])}</nav><p class="eyebrow">{esc(item['categoria'])} / {esc(item['estado'])}</p><h1 class="detail-name">{esc(item['nombre'])}</h1><p>{esc(item['subtitulo'])}</p><p class="detail-description">{esc(item['descripcion'])}</p><p class="detail-price">{money(item['precio'])}</p><a class="button" href="{esc(wa(item))}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp ↗</a>{'<h2>¿Qué incluye?</h2>'+includes if includes else ''}<a class="back-link" href="{path_to('')}#productos">← Volver a productos</a></div></div>'''
    return layout(body, item['nombre']+' | '+STORE['nombre'], item['descripcion'], full_url('productos/'+item['id']+'/'), item, full_url(images[0]))


def write(filepath, contents):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text(contents, encoding='utf-8')


def main():
    global BASE, DOMAIN
    validate()
    public = (os.environ.get('SITE_URL') or STORE.get('url_publica') or '').strip().rstrip('/')
    if public and not re.fullmatch(r'https://[^\s]+', public):
        raise ValueError('SITE_URL/url_publica debe ser una URL https válida')
    from urllib.parse import urlsplit
    url = urlsplit(public)
    DOMAIN = url.scheme+'://'+url.netloc if public else ''
    BASE = (url.path.rstrip('/')+'/' if url.path else '/') if public else './'
    # En la vista previa local la raíz es ./; los detalles usan ../../ para recursos.
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT/'assets', OUT/'assets')
    write(OUT/'index.html', homepage())
    for item in PRODUCTS:
        if not public:
            BASE = '../../'
        write(OUT/'productos'/item['id']/'index.html', detail(item))
    BASE = (url.path.rstrip('/')+'/' if url.path else '/') if public else './'
    if public:
        urls = [full_url('')] + [full_url('productos/'+p['id']+'/') for p in PRODUCTS]
        write(OUT/'sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+esc(u)+'</loc></url>' for u in urls)+'</urlset>')
        write(OUT/'robots.txt', 'User-agent: *\nAllow: /\nSitemap: '+full_url('sitemap.xml')+'\n')
    else:
        write(OUT/'robots.txt', 'User-agent: *\nDisallow: /\n')
    write(OUT/'.nojekyll', '')
    print(f'OK: {len(PRODUCTS)} productos generados en {OUT}. SITE_URL={public or "(vista previa local)"}')

if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError) as e:
        sys.exit(f'ERROR: {e}')
