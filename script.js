/*
 * FatBoxSlim — sin frameworks, sin generadores y sin dependencias.
 * UNICO lugar para editar el catálogo y el hero: productos.json
 * Se ejecuta directamente en GitHub Pages. Navegadores no permiten fetch JSON desde file://.
 */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const bodyPage = document.body.dataset.page;
  const mediaMobile = window.matchMedia('(max-width: 767px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dataSaver = navigator.connection?.saveData === true;
  const FALLBACK_IMAGE = 'assets/hero/poster.webp';
  const formatter = (currency) => new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 });
  const str = (value) => String(value ?? '').trim();
  const imagePath = (path, fallback = 'assets/productos/ps2-fat.svg') => {
    const p = str(path);
    // Solo archivos internos de assets, no HTML ni javascript: desde datos externos.
    return /^assets\/[\w\-./% ]+\.(jpg|jpeg|png|webp|avif|svg)$/i.test(p) && !p.includes('..') ? p : fallback;
  };
  const videoPath = (path) => {
    const p = str(path);
    return /^assets\/[\w\-./% ]+\.(mp4|webm)$/i.test(p) && !p.includes('..') ? p : '';
  };
  const phoneNumber = (input) => {
    const p = str(input).replace(/\D/g, '');
    return p.length >= 10 && p.length <= 15 && !/^0+$/.test(p) ? p : '';
  };
  const waUrl = (phone, message) => phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : '';
  const productPrice = (product, currency) => {
    const p = product.precio;
    if (p === null || p === undefined || p === '' || !Number.isFinite(Number(p))) return 'Consultar precio';
    try { return formatter(currency).format(Number(p)); } catch { return `${p} ${currency}`; }
  };
  const visibleProducts = (items) => (Array.isArray(items) ? items : [])
    .filter(p => p && p.visible !== false && typeof p.id === 'string' && p.id && typeof p.nombre === 'string')
    .sort((a, b) => Number(a.orden ?? 999) - Number(b.orden ?? 999));
  const setLink = (element, phone, message) => {
    if (!element) return;
    if (phone) {
      element.href = waUrl(phone, message);
      element.target = '_blank'; element.rel = 'noopener noreferrer';
      element.removeAttribute('aria-disabled');
    } else {
      element.href = '#contacto';
      element.setAttribute('aria-disabled', 'true');
      element.removeAttribute('target');
      element.addEventListener('click', e => e.preventDefault(), { once: true });
      element.title = 'Agregá tu número en productos.json';
    }
  };
  const el = (tag, className, content) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (content !== undefined) item.textContent = str(content);
    return item;
  };

  // Tema claro/oscuro sin fuentes o scripts externos.
  try {
    if (localStorage.getItem('fatboxslim-tema') === 'dark') document.documentElement.dataset.theme = 'dark';
  } catch { /* almacenamiento deshabilitado: se usa tema claro */ }
  const themeButton = $('#theme-toggle');
  function updateThemeLabel() {
    if (!themeButton) return;
    themeButton.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Cambiar al tema claro' : 'Cambiar al tema oscuro');
  }
  updateThemeLabel();
  themeButton?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('fatboxslim-tema', next); } catch { /* opcional */ }
    updateThemeLabel();
  });
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  // Hero desktop: no se asigna ningún src al video si la pantalla es mobile.
  function setupHero(hero) {
    const h = hero || {};
    const title1 = $('#hero-titulo1'), title2 = $('#hero-titulo2'), subtitle = $('#hero-description');
    if (title1 && str(h.titulo1)) title1.textContent = str(h.titulo1);
    if (title2 && str(h.titulo2)) title2.textContent = str(h.titulo2);
    if (subtitle && str(h.subtitulo)) subtitle.textContent = str(h.subtitulo);
    const video = $('#hero-video');
    const poster = imagePath(h.posterDesktop, FALLBACK_IMAGE);
    if (video) video.poster = poster;
    const heroMedia = $('.hero-media');
    if (heroMedia) heroMedia.style.backgroundImage = `url("${poster}")`;
    // YouTube opcional como fondo del hero
    const youtubeId = String(h.videoYoutube || '')
      .match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/))([\w-]{11})/i)?.[1] || '';

    const url = youtubeId ? '' : videoPath(h.videoDesktop);

    if (youtubeId) {

      function actualizarYoutube() {
        const actual = document.getElementById('hero-youtube');

        // Nunca cargar YouTube en mobile o con movimiento reducido
        if (mediaMobile.matches || reducedMotion.matches || dataSaver) {
          actual?.remove();
          return;
        }

        if (actual) return;

        const iframe = document.createElement('iframe');

        iframe.id = 'hero-youtube';
        iframe.className = 'hero-youtube';
        iframe.title = 'Video de fondo FatBoxSlim';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;

        iframe.allow = 'autoplay; encrypted-media';

        iframe.src =
          `https://www.youtube-nocookie.com/embed/${youtubeId}` +
          `?autoplay=1&mute=1&controls=0&loop=1` +
          `&playlist=${youtubeId}&playsinline=1&rel=0`;

        heroMedia?.append(iframe);
      }

      actualizarYoutube();

      mediaMobile.addEventListener('change', actualizarYoutube);
      reducedMotion.addEventListener('change', actualizarYoutube);
    }
    let attached = false;
    if (video) video.addEventListener('error', () => {
      // Si todavía no subiste tu MP4, reproducimos el clip de muestra sin tocar tu archivo real.
      if (video.src.endsWith('/desktop-demo.mp4') || mediaMobile.matches) return;
      video.src = 'assets/hero/desktop-demo.mp4';
      video.load(); video.play().catch(() => { });
    });
    function updateVideo() {
      if (!video || !url) return;
      if (mediaMobile.matches || reducedMotion.matches || dataSaver) {
        video.pause();
        if (attached) { video.removeAttribute('src'); video.load(); attached = false; }
        return;
      }
      if (!attached) { video.src = url; video.load(); attached = true; }
      const playbackRate = Number(h.velocidadVideo);
      video.playbackRate = Number.isFinite(playbackRate) ? Math.min(4, Math.max(.5, playbackRate)) : 1;
      video.play().catch(() => { /* poster visible si autoplay se bloquea */ });
    }
    updateVideo();
    mediaMobile.addEventListener('change', updateVideo);
    reducedMotion.addEventListener('change', updateVideo);

    // Carrusel mobile: admite 1, 3, 6, 20... imágenes desde el JSON.
    const base = $('#slide-base'), top = $('#slide-top');
    if (!base || !top) return;
    const paths = Array.isArray(h.imagenesMobile)
      ? h.imagenesMobile.map(path => imagePath(path, '')).filter(Boolean)
      : [];
    if (!paths.length) return;
    let current = 0, pending = false, timer;
    base.onerror = () => { base.onerror = null; base.src = 'assets/hero/demo-1.jpg'; };
    top.onerror = () => { top.onerror = null; top.src = 'assets/hero/demo-1.jpg'; };
    base.src = paths[0];
    top.src = paths[0];
    const ms = Math.max(2500, Number(h.intervaloMobileMs) || 5000);
    const schedule = () => { clearTimeout(timer); timer = setTimeout(nextImage, ms); };
    function nextImage() {
      if (pending || !mediaMobile.matches || reducedMotion.matches || document.hidden || paths.length < 2) { schedule(); return; }
      pending = true;
      const next = (current + 1) % paths.length;
      const loader = new Image();
      loader.onload = () => {
        top.src = loader.src;
        // Prevent transition before image is ready.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          top.classList.add('visible');
          setTimeout(() => {
            base.src = loader.src;
            top.classList.remove('visible');
            current = next;
            pending = false;
            schedule();
          }, 1150);
        }));
      };
      let fallbackTried = false;
      loader.onerror = () => {
        if (!fallbackTried) {
          fallbackTried = true;
          loader.src = `assets/hero/demo-${(next % 6) + 1}.jpg`;
          return;
        }
        // Saltear una imagen rota si ni siquiera está el respaldo.
        current = next; pending = false; schedule();
      };
      loader.src = paths[next];
    }
    if (paths.length > 1 && !reducedMotion.matches) schedule();
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !pending && !reducedMotion.matches) schedule(); });
  }

  function createCard(product, phone, currency) {
    const card = el('article', 'product-card');
    const photo = el('a', 'product-photo');
    photo.href = `producto.html?id=${encodeURIComponent(product.id)}`;
    photo.setAttribute('aria-label', `Ver detalles de ${product.nombre}`);
    const img = el('img'); img.src = imagePath(product.imagenes?.[0]); img.alt = str(product.nombre); img.loading = 'lazy'; img.width = 500; img.height = 440;
    img.onerror = () => { img.onerror = null; img.src = 'assets/productos/ps2-fat.svg'; };
    photo.append(img);
    const content = el('div', 'product-card-body');
    const status = el('span', product.disponible === false ? 'status sold' : 'status', product.disponible === false ? 'Agotado' : 'Consultar disponibilidad');
    const heading = el('h3', '', product.nombre);
    const desc = el('p', '', product.descripcionCorta || product.descripcion || 'Consultá los detalles del producto.');
    const price = el('div', 'price', productPrice(product, currency));
    const actions = el('div', 'card-actions');
    const detail = el('a', 'button button-outline', 'VER DETALLES'); detail.href = photo.href;
    const contact = el('a', 'button button-dark', phone ? 'WHATSAPP ↗' : 'WHATSAPP');
    setLink(contact, phone, `¡Hola! Quiero consultar por ${product.nombre} en FatBoxSlim.`);
    actions.append(detail, contact);
    content.append(status, heading, desc, price, actions);
    card.append(photo, content);
    return card;
  }

  function setupHome(data, phone, currency) {
    setupHero(data.hero);
    const contact = $('#contact-whatsapp');
    setLink(contact, phone, '¡Hola! Quiero consultar por los productos de FatBoxSlim.');
    if (phone) $('#contact-hint')?.remove();
    const track = $('#productos-lista'); if (!track) return;
    const items = visibleProducts(data.productos);
    const favorites = items.filter(p => p.destacado !== false);
    const showAllButton = $('#show-all');
    let all = false;
    function display() {
      const chosen = !all && favorites.length ? favorites : items;
      if (!chosen.length) { track.replaceChildren(el('p', 'loading-message', 'Todavía no hay productos publicados.')); return; }
      const fragment = document.createDocumentFragment();
      chosen.forEach(p => fragment.append(createCard(p, phone, currency)));
      track.replaceChildren(fragment); track.scrollLeft = 0;
    }
    display();
    if (showAllButton && favorites.length < items.length) {
      showAllButton.hidden = false;
      showAllButton.addEventListener('click', () => { all = !all; showAllButton.textContent = all ? 'VER SOLO DESTACADOS ↑' : 'VER TODOS LOS PRODUCTOS ↗'; display(); });
    }
    $('#products-prev')?.addEventListener('click', () => track.scrollBy({ left: -(track.querySelector('.product-card')?.clientWidth || 280) - 15, behavior: 'smooth' }));
    $('#products-next')?.addEventListener('click', () => track.scrollBy({ left: (track.querySelector('.product-card')?.clientWidth || 280) + 15, behavior: 'smooth' }));
  }

  function upsertMeta(selector, attr, value) {
    const targetSelector = attr === 'name' ? `meta[name="${selector}"]` : `meta[property="${selector}"]`;
    let item = $(targetSelector);
    if (!item) { item = document.createElement('meta'); if (attr === 'name') item.name = selector; else item.setAttribute('property', selector); document.head.append(item); }
    item.content = value;
  }
  function setupDetail(data, phone, currency) {
    const id = new URLSearchParams(location.search).get('id');
    const item = visibleProducts(data.productos).find(p => p.id === id);
    const wrapper = $('#product-detail');
    if (!item) {
      document.title = 'Producto no encontrado | FatBoxSlim';
      upsertMeta('robots', 'name', 'noindex,follow');
      wrapper.replaceChildren(el('p', 'loading-message', 'No encontramos ese producto. Volvé al catálogo desde el menú.'));
      return;
    }
    const pageUrl = new URL(`producto.html?id=${encodeURIComponent(item.id)}`, location.href).href;
    document.title = `${item.nombre} | FatBoxSlim`;
    upsertMeta('description', 'name', `${item.nombre}: ${str(item.descripcionCorta || item.descripcion).slice(0, 145)} Consultá en FatBoxSlim.`);
    upsertMeta('og:title', 'property', `${item.nombre} | FatBoxSlim`);
    upsertMeta('og:description', 'property', str(item.descripcionCorta || item.descripcion));
    upsertMeta('og:type', 'property', 'product');
    upsertMeta('og:url', 'property', pageUrl);
    const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = pageUrl; document.head.append(canonical);
    const images = (Array.isArray(item.imagenes) ? item.imagenes : []).map(v => imagePath(v, '')).filter(Boolean);
    const useImages = images.length ? images : ['assets/productos/ps2-fat.svg'];
    upsertMeta('og:image', 'property', new URL(useImages[0], location.href).href);
    const productSchema = { '@context': 'https://schema.org', '@type': 'Product', name: item.nombre, description: item.descripcion || item.descripcionCorta || '', image: useImages.map(path => new URL(path, location.href).href), url: pageUrl, sku: item.id };
    if (item.precio !== null && item.precio !== undefined && item.precio !== '' && Number.isFinite(Number(item.precio)) && Number(item.precio) >= 0) {
      productSchema.offers = { '@type': 'Offer', price: Number(item.precio), priceCurrency: currency, availability: `https://schema.org/${item.disponible === false ? 'OutOfStock' : 'InStock'}`, url: pageUrl };
    }
    const schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.textContent = JSON.stringify(productSchema); document.head.append(schema);
    $('#crumb-name').textContent = item.nombre;
    const gallery = el('div', 'detail-gallery');
    const img = el('img', 'detail-cover'); img.src = useImages[0]; img.alt = item.nombre; img.width = 800; img.height = 720;
    img.onerror = () => { img.onerror = null; img.src = 'assets/productos/ps2-fat.svg'; };
    gallery.append(img);
    if (useImages.length > 1) {
      const thumbs = el('div', 'detail-thumbs');
      useImages.forEach((src, index) => {
        const btn = el('button', 'detail-thumb'); btn.type = 'button'; btn.setAttribute('aria-label', `Ver foto ${index + 1}`); btn.setAttribute('aria-pressed', String(index === 0));
        const thumbImg = el('img'); thumbImg.src = src; thumbImg.alt = ''; thumbImg.loading = 'lazy'; btn.append(thumbImg);
        btn.addEventListener('click', () => { img.src = src; thumbs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false')); btn.setAttribute('aria-pressed', 'true'); }); thumbs.append(btn);
      }); gallery.append(thumbs);
    }
    const info = el('div', 'detail-info');
    info.append(el('p', 'eyebrow', 'CATÁLOGO / PLAYSTATION 2'), el('span', item.disponible === false ? 'status sold' : 'status', item.disponible === false ? 'Agotado' : 'Consultar disponibilidad'), el('h1', '', item.nombre), el('p', 'detail-description', item.descripcion || item.descripcionCorta || ''), el('div', 'price', productPrice(item, currency)));
    if (Array.isArray(item.incluye) && item.incluye.length) { info.append(el('h2', '', 'Incluye')); const list = el('ul'); item.incluye.forEach(s => list.append(el('li', '', s))); info.append(list); }
    const link = el('a', 'button button-dark', phone ? 'CONSULTAR POR WHATSAPP ↗' : 'WHATSAPP SIN CONFIGURAR');
    setLink(link, phone, `¡Hola! Me interesa ${item.nombre} de FatBoxSlim. ¿Me pasás más información?`);
    info.append(link); wrapper.replaceChildren(gallery, info);
  }

  // GitHub Pages sirve archivos estáticos. Nada necesita compilarse.
  fetch('productos.json', { cache: 'no-cache' })
    .then(response => { if (!response.ok) throw new Error(`No se pudo leer productos.json (${response.status})`); return response.json(); })
    .then(data => {
      const phone = phoneNumber(data?.sitio?.whatsapp);
      const currency = /^[A-Z]{3}$/.test(str(data?.sitio?.moneda)) ? data.sitio.moneda : 'ARS';
      if (bodyPage === 'inicio') setupHome(data, phone, currency);
      if (bodyPage === 'producto') setupDetail(data, phone, currency);
    })
    .catch(error => {
      console.error('FatBoxSlim:', error);
      const target = bodyPage === 'producto' ? $('#product-detail') : $('#productos-lista');
      if (target) target.replaceChildren(el('p', 'loading-message', 'No se pudo cargar el catálogo. Revisá productos.json y volvé a actualizar la página.'));
    });
})();
