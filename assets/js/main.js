(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  let selectedTheme;
  try { selectedTheme = localStorage.getItem('fatigastore-theme'); } catch (_) {}
  if (selectedTheme === 'claro' || selectedTheme === 'oscuro') root.dataset.theme = selectedTheme;
  const updateThemeLabel = () => {
    if (!toggle) return;
    const dark = root.dataset.theme === 'oscuro';
    toggle.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    toggle.innerHTML = `<span aria-hidden="true">${dark ? '☀' : '◐'}</span> ${dark ? 'Claro' : 'Oscuro'}`;
  };
  updateThemeLabel();
  toggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'oscuro' ? 'claro' : 'oscuro';
    try { localStorage.setItem('fatigastore-theme', root.dataset.theme); } catch (_) {}
    updateThemeLabel();
  });

  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const cards = [...carousel.querySelectorAll('.product-card')];
    const previous = document.querySelector('[data-previous]');
    const next = document.querySelector('[data-next]');
    const counter = document.querySelector('[data-counter]');
    const progress = document.querySelector('[data-progress]');
    const position = () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const index = cards.length ? cards.reduce((closest, card, i) => Math.abs(card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft) < Math.abs(cards[closest].offsetLeft - carousel.offsetLeft - carousel.scrollLeft) ? i : closest, 0) : 0;
      if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      if (progress) progress.style.width = `${maxScroll > 0 ? (carousel.scrollLeft / maxScroll) * 75 + 25 : 100}%`;
      if (previous) previous.disabled = carousel.scrollLeft < 3;
      if (next) next.disabled = carousel.scrollLeft >= maxScroll - 3;
    };
    const move = (direction) => {
      const width = cards[0]?.getBoundingClientRect().width || carousel.clientWidth;
      carousel.scrollBy({ left: direction * (width + 16), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    carousel.addEventListener('scroll', position, { passive: true });
    window.addEventListener('resize', position);
    position();
  }

  const fullImage = document.querySelector('[data-detail-image]');
  document.querySelectorAll('[data-thumbnail]').forEach(button => {
    button.addEventListener('click', () => {
      if (!fullImage) return;
      fullImage.src = button.dataset.image;
      fullImage.alt = button.dataset.alt;
      document.querySelectorAll('[data-thumbnail]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
})();
