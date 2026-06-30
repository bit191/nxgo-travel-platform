/**
 * gallery.js — Interactive gallery: carousel, filters, lightbox, shuffle.
 */
(function () {
  'use strict';

  const SLIDES = [
    { key: 'station', alt: 'Tiaoshi station overlooking the Pacific', caption: 'Tiaoshi · East Coast' },
    { key: 'cycling', alt: 'Cycling through a forest tunnel', caption: 'Sun Moon Lake · Cycling' },
    { key: 'jiufen', alt: 'Lantern-lit Jiufen Old Street', caption: 'Jiufen · New Taipei' },
    { key: 'rainbow', alt: 'Rainbow Village painted alley', caption: 'Rainbow Village · Taichung' },
    { key: 'taipei101', alt: 'Taipei 101 skyline at dusk', caption: 'Xinyi · Taipei' },
    { key: 'alishan', alt: 'Misty forest mountains at dawn', caption: 'Alishan · Chiayi' },
    { key: 'taroko', alt: 'Marble canyon at Taroko Gorge', caption: 'Taroko · Hualien' },
    { key: 'harbor', alt: 'Fishing boats in a coastal harbor', caption: 'Keelung · Harbor' },
    { key: 'paraglide', alt: 'Paragliding over green hills', caption: 'Hualien · Sky adventure' },
    { key: 'pingxi', alt: 'Sky lanterns rising over the valley', caption: 'Pingxi · Lantern night' }
  ];

  const MASONRY = [
    { key: 'temple', alt: 'Giant deity statue at a Taiwanese temple', caption: 'Temple guardian · Tainan', tag: 'culture' },
    { key: 'waterfall', alt: 'Mountain waterfall in lush forest', caption: 'Shei-Pa · Waterfall', tag: 'nature' },
    { key: 'streetfood', alt: 'Colorful poke bowl street food', caption: 'Night market finds · Taipei', tag: 'food' },
    { key: 'nightmarket', alt: 'Grilled skewers at a night market', caption: 'Shilin Market · Taipei', tag: 'food' },
    { key: 'taro', alt: 'Traditional taro ball dessert', caption: 'Jiufen · Dessert alley', tag: 'food' },
    { key: 'hotspring', alt: 'Outdoor hot spring bath', caption: 'Jiaoxi · Yilan', tag: 'nature' },
    { key: 'coast', alt: 'Waves crashing on tropical shore', caption: 'East Coast · Taiwan', tag: 'coast' },
    { key: 'lanterns', alt: 'Glowing lanterns at a festival', caption: 'Pingxi · Lantern festival', tag: 'culture' },
    { key: 'cats', alt: 'Cats lounging in Houtong village', caption: 'Houtong · Cat Village', tag: 'culture' },
    { key: 'forest', alt: 'Sunlit path through cedar forest', caption: 'Alishan · Forest trail', tag: 'nature' },
    { key: 'surf', alt: 'Resort pool overlooking the ocean', caption: 'Wai\'ao · Yilan', tag: 'coast' },
    { key: 'tainan', alt: 'Outdoor dining in old Tainan streets', caption: 'Tainan · Old capital', tag: 'culture' },
    { key: 'skyline', alt: 'Upscale restaurant with city views', caption: 'Xinyi · Rooftop dining', tag: 'culture' },
    { key: 'train', alt: 'Scenic railway journey', caption: 'Pingxi line · Railway', tag: 'coast' },
    { key: 'market', alt: 'Brunch spread at a local market', caption: 'Ningxia · Food market', tag: 'food' },
    { key: 'snorkel', alt: 'Swimming in crystal clear water', caption: 'Green Island · Underwater', tag: 'coast' },
    { key: 'shrine', alt: 'Buddha bowl at a hillside shrine', caption: 'Nantou · Mountain shrine', tag: 'culture' },
    { key: 'dumplings', alt: 'Fresh pizza from a street vendor', caption: 'Raohe · Street eats', tag: 'food' },
    { key: 'scooter', alt: 'Scooter riding through city streets', caption: 'Taipei · City ride', tag: 'culture' },
    { key: 'nightcity', alt: 'City lights reflecting on wet streets', caption: 'Taipei · Neon nights', tag: 'culture' },
    { key: 'pottery', alt: 'Handcrafted pottery and ceramics', caption: 'Yingge · Pottery town', tag: 'culture' },
    { key: 'meadow', alt: 'Camping tent in a mountain meadow', caption: 'Hehuanshan · Highlands', tag: 'nature' },
    { key: 'beach', alt: 'Golden sand on the south coast', caption: 'Kenting · Sandy beach', tag: 'coast' },
    { key: 'noodles', alt: 'Stack of fluffy pancakes at brunch', caption: 'Taichung · Brunch spot', tag: 'food' },
    { key: 'dessert', alt: 'Chocolate dessert with berries', caption: 'Dihua Street · Sweet shop', tag: 'food' },
    { key: 'boating', alt: 'Kayaking on a calm mountain lake', caption: 'Sun Moon Lake · Boating', tag: 'nature' }
  ];

  const QUOTES = [
    { type: 'text', content: 'Collect moments, not things.' },
    { type: 'img', key: 'planting', caption: 'Eco crew · Taichung' },
    { type: 'text', content: 'Travel isn\'t an escape from life — it\'s what makes life feel real.' },
    { type: 'img', key: 'teahouse', caption: 'Tea house · Maokong' },
    { type: 'text', content: 'Somewhere between here and there.' },
    { type: 'img', key: 'yushan', caption: 'Mountain peaks · Yushan' },
    { type: 'text', content: 'Don\'t wait for the perfect moment. Pack your bags and create it somewhere new.' },
    { type: 'img', key: 'backpacker', caption: 'Solo explorer · East Taiwan' },
    { type: 'text', content: 'Adventure over comfort.' },
    { type: 'img', key: 'kenting', caption: 'Kenting · South coast' },
    { type: 'text', content: 'Every alley has a story — if you slow down enough to hear it.' },
    { type: 'img', key: 'travelmap', caption: 'Planning the route · Nxgo' }
  ];

  const FILTERS = [
    { id: 'all', label: '✦ All vibes' },
    { id: 'food', label: '🍜 Food' },
    { id: 'nature', label: '🌿 Nature' },
    { id: 'culture', label: '🏮 Culture' },
    { id: 'coast', label: '🌊 Coast' }
  ];

  const REACT_KEY = 'nxgo_gallery_reactions';
  const DUEL_KEY = 'nxgo_duel_wins';

  const ROULETTE_SPOTS = [
    { label: 'Jiufen', q: 'Jiufen', emoji: '🏮' },
    { label: 'Alishan', q: 'Alishan', emoji: '🌲' },
    { label: 'Kenting', q: 'Kenting', emoji: '🏖' },
    { label: 'Taroko', q: 'Taroko', emoji: '⛰' },
    { label: 'Tainan', q: 'Tainan', emoji: '🍜' },
    { label: 'Pingxi', q: 'Pingxi', emoji: '🎈' },
    { label: 'Sun Moon Lake', q: 'Sun Moon Lake', emoji: '🚴' },
    { label: 'Yilan', q: 'Yilan', emoji: '♨️' }
  ];

  let carouselIndex = 0;
  let carouselTimer = null;
  let lightboxItems = [];
  let lightboxIndex = 0;
  let masonryData = [...MASONRY];
  let duelPool = [];
  let duelLeft = null;
  let duelRight = null;
  let rouletteSpinning = false;

  function getReactions() {
    return JSON.parse(localStorage.getItem(REACT_KEY) || '[]');
  }

  function saveReaction(caption, emoji) {
    const list = getReactions();
    list.push({ caption, emoji, date: new Date().toISOString() });
    localStorage.setItem(REACT_KEY, JSON.stringify(list));
    if (typeof NxgoEngage !== 'undefined') NxgoEngage.checkDailyChallenge();
    document.querySelectorAll('.gallery-react-count').forEach(el => {
      if (el.dataset.cap === caption) el.textContent = getReactionCount(caption);
    });
  }

  function getReactionCount(caption) {
    const n = getReactions().filter(r => r.caption === caption).length;
    return n > 0 ? `${n} ✦` : '';
  }

  /* ── Taiwan Roulette ── */
  function initRoulette() {
    const spinner = document.getElementById('roulette-spinner');
    if (!spinner) return;

    const colors = ['#4a9ead', '#f5c518', '#e85d4a', '#5cb85c', '#9b59b6', '#3498db', '#e67e22', '#1abc9c'];
    const stops = ROULETTE_SPOTS.map((_, i) => {
      const start = (i / ROULETTE_SPOTS.length) * 100;
      const end = ((i + 1) / ROULETTE_SPOTS.length) * 100;
      return `${colors[i % colors.length]} ${start}% ${end}%`;
    }).join(', ');
    spinner.style.background = `conic-gradient(${stops})`;

    spinner.innerHTML = ROULETTE_SPOTS.map((s, i) => {
      const angle = (i + 0.5) * (360 / ROULETTE_SPOTS.length);
      return `<span class="roulette-label" style="--angle:${angle}deg">${s.emoji}</span>`;
    }).join('') + '<div class="roulette-center">GO</div>';

    document.getElementById('roulette-spin')?.addEventListener('click', spinRoulette);
  }

  function spinRoulette() {
    if (rouletteSpinning) return;
    rouletteSpinning = true;
    const btn = document.getElementById('roulette-spin');
    const result = document.getElementById('roulette-result');
    const go = document.getElementById('roulette-go');
    const spinner = document.getElementById('roulette-spinner');
    btn.disabled = true;

    const winner = Math.floor(Math.random() * ROULETTE_SPOTS.length);
    const slice = 360 / ROULETTE_SPOTS.length;
    const spins = 5 * 360 + (360 - winner * slice - slice / 2);
    spinner.style.transform = `rotate(${spins}deg)`;

    setTimeout(() => {
      const spot = ROULETTE_SPOTS[winner];
      result.innerHTML = `${spot.emoji} <strong>${spot.label}</strong> — your fate is sealed!`;
      go.href = `destinations.html?q=${encodeURIComponent(spot.q)}`;
      go.hidden = false;
      btn.disabled = false;
      rouletteSpinning = false;
      if (typeof NxgoEngage !== 'undefined') {
        NxgoEngage.addStamp('roulette');
        NxgoEngage.checkDailyChallenge();
      }
      NxgoApp.showToast(`🎲 Taiwan says: ${spot.label}!`, 'success');
    }, 4200);
  }

  /* ── Photo Duel ── */
  function initDuel() {
    duelPool = [...MASONRY].sort(() => Math.random() - 0.5);
    nextDuelRound();
    document.getElementById('duel-left')?.addEventListener('click', () => pickDuelWinner('left'));
    document.getElementById('duel-right')?.addEventListener('click', () => pickDuelWinner('right'));
    document.getElementById('duel-next')?.addEventListener('click', nextDuelRound);
  }

  function renderDuelCard(side, item) {
    const el = document.getElementById(`duel-${side}`);
    if (!el || !item) return;
    el.innerHTML = `
      <img src="${NxgoImages.url(item.key, 500)}" alt="${item.alt}" loading="lazy" decoding="async">
      <span class="duel-cap">${item.caption}</span>`;
    el.disabled = false;
    el.classList.remove('duel-winner');
  }

  function nextDuelRound() {
    if (duelPool.length < 2) duelPool = [...MASONRY].sort(() => Math.random() - 0.5);
    duelLeft = duelPool.shift();
    duelRight = duelPool.shift();
    renderDuelCard('left', duelLeft);
    renderDuelCard('right', duelRight);
    document.getElementById('duel-next').hidden = true;
  }

  function pickDuelWinner(side) {
    const winner = side === 'left' ? duelLeft : duelRight;
    document.getElementById(`duel-${side}`).classList.add('duel-winner');
    document.getElementById('duel-left').disabled = true;
    document.getElementById('duel-right').disabled = true;

    const wins = JSON.parse(localStorage.getItem(DUEL_KEY) || '{"total":0,"fav":null}');
    wins.total = (wins.total || 0) + 1;
    wins.fav = winner.caption;
    localStorage.setItem(DUEL_KEY, JSON.stringify(wins));
    document.getElementById('duel-score').textContent =
      `You picked ${winner.caption}! Total duels: ${wins.total}`;
    document.getElementById('duel-next').hidden = false;

    if (typeof NxgoEngage !== 'undefined') {
      NxgoEngage.addStamp('duel');
      NxgoEngage.checkDailyChallenge();
    }
  }

  /* ── Lightbox reactions ── */
  function setupLightboxReactions() {
    document.getElementById('lightbox-reactions')?.addEventListener('click', e => {
      const btn = e.target.closest('.reaction-btn');
      if (!btn) return;
      const item = lightboxItems[lightboxIndex];
      if (!item) return;
      saveReaction(item.caption, btn.dataset.emoji);
      btn.classList.add('reacted');
      setTimeout(() => btn.classList.remove('reacted'), 600);
      NxgoApp.showToast(`${btn.dataset.emoji} Reacted!`, 'info');
    });
  }

  /* ── Carousel ── */
  function renderCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    track.innerHTML = SLIDES.map((s, i) => `
      <div class="carousel-slide${i === carouselIndex ? ' active' : ''}" data-index="${i}">
        <img src="${NxgoImages.url(s.key, 800)}" alt="${s.alt}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
        <div class="carousel-slide-cap">${s.caption}</div>
      </div>
    `).join('');

    document.getElementById('carousel-dots').innerHTML = SLIDES.map((_, i) =>
      `<button type="button" class="carousel-dot${i === carouselIndex ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');

    NxgoImages.setupFallbacks(track);
  }

  function goToSlide(i) {
    carouselIndex = (i + SLIDES.length) % SLIDES.length;
    renderCarousel();
    resetCarouselTimer();
  }

  function resetCarouselTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => goToSlide(carouselIndex + 1), 4500);
  }

  /* ── Masonry ── */
  function renderMasonry(filter) {
    const grid = document.getElementById('gallery-masonry');
    const items = masonryData.filter(img => filter === 'all' || img.tag === filter);

    grid.innerHTML = items.map((img, i) => `
      <button type="button" class="gallery-item reveal" data-tag="${img.tag}" data-index="${i}" data-cap="${NxgoApp.esc(img.caption)}" style="--reveal-delay:${i * 0.05}s">
        <img src="${NxgoImages.url(img.key, 600)}" alt="${img.alt}" loading="lazy" decoding="async">
        <div class="gallery-item-overlay">
          <span class="gallery-item-tag">${img.tag}</span>
          <span class="gallery-item-cap">${img.caption}</span>
          <span class="gallery-item-hint">Tap to expand ↗</span>
        </div>
        <span class="gallery-react-count" data-cap="${img.caption.replace(/"/g, '&quot;')}">${getReactionCount(img.caption)}</span>
      </button>
    `).join('');

    NxgoImages.setupFallbacks(grid);
    observeReveal(grid.querySelectorAll('.gallery-item'));
    rebuildLightboxPool();
  }

  function shuffleMasonry() {
    const grid = document.getElementById('gallery-masonry');
    grid.classList.add('shuffling');
    for (let i = masonryData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [masonryData[i], masonryData[j]] = [masonryData[j], masonryData[i]];
    }
    const active = document.querySelector('.gallery-filter-chip.active');
    const filter = active ? active.dataset.filter : 'all';
    setTimeout(() => {
      renderMasonry(filter);
      grid.classList.remove('shuffling');
      NxgoApp.showToast('Vibes shuffled! ✦', 'info');
    }, 400);
  }

  /* ── Quote grid ── */
  function renderQuotes() {
    const grid = document.getElementById('quote-grid');
    grid.innerHTML = QUOTES.map((q, i) => {
      if (q.type === 'img') {
        return `
          <button type="button" class="quote-card quote-img reveal" data-lightbox="quote" data-index="${i}" style="--reveal-delay:${i * 0.04}s">
            <img src="${NxgoImages.url(q.key, 400)}" alt="${q.caption}" loading="lazy" decoding="async">
            <span class="quote-img-cap">${q.caption}</span>
          </button>`;
      }
      return `<div class="quote-card text-card reveal" style="--reveal-delay:${i * 0.04}s">${q.content}</div>`;
    }).join('');

    NxgoImages.setupFallbacks(grid);
    observeReveal(grid.querySelectorAll('.reveal'));
  }

  /* ── Lightbox ── */
  function rebuildLightboxPool() {
    lightboxItems = [];
    document.querySelectorAll('.gallery-item').forEach(el => {
      const img = el.querySelector('img');
      lightboxItems.push({ src: img.src, alt: img.alt, caption: el.querySelector('.gallery-item-cap')?.textContent || '' });
    });
    document.querySelectorAll('.quote-card.quote-img').forEach(el => {
      const img = el.querySelector('img');
      lightboxItems.push({ src: img.src, alt: img.alt, caption: el.querySelector('.quote-img-cap')?.textContent || '' });
    });
    document.querySelectorAll('.carousel-slide').forEach(el => {
      const img = el.querySelector('img');
      const cap = el.querySelector('.carousel-slide-cap')?.textContent || '';
      if (!lightboxItems.some(l => l.src === img.src)) {
        lightboxItems.push({ src: img.src.replace(/w=\d+/, 'w=1200'), alt: img.alt, caption: cap });
      }
    });
  }

  function openLightboxFromSrc(src, caption) {
    rebuildLightboxPool();
    const base = src.split('?')[0];
    const idx = lightboxItems.findIndex(l => l.src.split('?')[0] === base);
    openLightbox(idx >= 0 ? idx : 0);
  }

  function openLightbox(index) {
    if (!lightboxItems.length) return;
    lightboxIndex = index;
    const lb = document.getElementById('gallery-lightbox');
    updateLightboxImage();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('gallery-lightbox').hidden = true;
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const item = lightboxItems[lightboxIndex];
    const img = document.getElementById('lightbox-img');
    img.src = item.src.replace(/w=\d+/, 'w=1200');
    img.alt = item.alt;
    document.getElementById('lightbox-caption').textContent = item.caption;
    document.getElementById('lightbox-counter').textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
  }

  function lightboxNav(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
    updateLightboxImage();
  }

  /* ── Scroll reveal ── */
  function observeReveal(elements) {
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(el => obs.observe(el));
  }

  /* ── Init ── */
  function setupFilters() {
    const bar = document.getElementById('gallery-filters');
    bar.innerHTML = FILTERS.map(f =>
      `<button type="button" class="gallery-filter-chip${f.id === 'all' ? ' active' : ''}" data-filter="${f.id}">${f.label}</button>`
    ).join('');

    bar.addEventListener('click', e => {
      const chip = e.target.closest('.gallery-filter-chip');
      if (!chip) return;
      bar.querySelectorAll('.gallery-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderMasonry(chip.dataset.filter);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    NxgoApp.initPage('gallery', 'gallery');
    setupFilters();
    renderCarousel();
    renderMasonry('all');
    renderQuotes();
    initRoulette();
    initDuel();
    setupLightboxReactions();
    resetCarouselTimer();

    document.getElementById('carousel-prev').addEventListener('click', () => goToSlide(carouselIndex - 1));
    document.getElementById('carousel-next').addEventListener('click', () => goToSlide(carouselIndex + 1));
    document.getElementById('carousel-dots').addEventListener('click', e => {
      const dot = e.target.closest('.carousel-dot');
      if (dot) goToSlide(parseInt(dot.dataset.index));
    });
    document.getElementById('carousel-track').addEventListener('click', e => {
      const slide = e.target.closest('.carousel-slide');
      if (!slide) return;
      const s = SLIDES[parseInt(slide.dataset.index)];
      openLightboxFromSrc(NxgoImages.url(s.key, 1200), s.caption);
    });

    document.getElementById('shuffle-btn').addEventListener('click', shuffleMasonry);

    document.getElementById('gallery-masonry').addEventListener('click', e => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;
      const img = item.querySelector('img');
      openLightboxFromSrc(img.src, item.querySelector('.gallery-item-cap')?.textContent || '');
    });

    document.getElementById('quote-grid').addEventListener('click', e => {
      const card = e.target.closest('.quote-img');
      if (!card) return;
      const img = card.querySelector('img');
      openLightboxFromSrc(img.src, card.querySelector('.quote-img-cap')?.textContent || '');
    });

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => lightboxNav(-1));
    document.getElementById('lightbox-next').addEventListener('click', () => lightboxNav(1));
    document.getElementById('gallery-lightbox').addEventListener('click', e => {
      if (e.target.id === 'gallery-lightbox') closeLightbox();
    });

    document.addEventListener('keydown', e => {
      const lb = document.getElementById('gallery-lightbox');
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxNav(-1);
      if (e.key === 'ArrowRight') lightboxNav(1);
    });
  });
})();
