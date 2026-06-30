/**
 * home.js — Featured adventures, dest cards with unique photos, interest pills.
 */
(function () {
  'use strict';

  const DEST_CARDS = [
    { name: 'Ximending', key: 'ximending', alt: 'Crowded Ximending shopping district in Taipei at night' },
    { name: 'Xinyi District', key: 'taipei101', alt: 'Taipei 101 towering over Xinyi District skyline' },
    { name: 'Jiufen Old Street', key: 'jiufen', alt: 'Lantern-lit Jiufen Old Street buildings at dusk' },
    { name: 'Houtong Cat Village', key: 'cats', alt: 'Cats lounging in Houtong Cat Village near railway tracks' },
    { name: 'Formosan Aboriginal Culture Village', key: 'cablecar', alt: 'Cable cars over forest at Formosan Aboriginal Culture Village' },
    { name: 'Xitou Monster Village', key: 'temple', alt: 'Traditional red architecture at Xitou Monster Village' },
    { name: 'Alishan Forest', key: 'alishan', alt: 'Misty cedar forest at Alishan sunrise' },
    { name: 'Taroko Gorge', key: 'taroko', alt: 'Marble canyon waterfall at Taroko Gorge' },
    { name: 'Sun Moon Lake', key: 'sunmoonlake', alt: 'Serene mountain lake at Sun Moon Lake' },
    { name: 'Kenting Beach', key: 'kenting', alt: 'Turquoise waves rolling onto Kenting beach' }
  ];

  function renderDestCards() {
    const grid = document.getElementById('dest-grid');
    if (!grid) return;

    grid.innerHTML = DEST_CARDS.map(d => `
      <div class="dest-card" data-name="${d.name}">
        <img src="${NxgoImages.url(d.key, 700)}" alt="${d.alt}" loading="lazy" decoding="async" width="700" height="400">
        <div class="dest-overlay"><span class="dest-name">${NxgoApp.esc(d.name)}</span></div>
      </div>
    `).join('');

    NxgoImages.setupFallbacks(grid);

    grid.querySelectorAll('.dest-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `destinations.html?q=${encodeURIComponent(card.dataset.name)}`;
      });
    });

    if (typeof NxgoEngage !== 'undefined') {
      grid.querySelectorAll('.dest-card').forEach(card => {
        if (card.querySelector('.wish-btn')) return;
        const name = card.dataset.name;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wish-btn' + (NxgoEngage.isWished(name) ? ' active' : '');
        btn.dataset.wishId = name;
        btn.textContent = NxgoEngage.isWished(name) ? '♥' : '♡';
        btn.setAttribute('aria-label', 'Save to wishlist');
        btn.addEventListener('click', e => {
          e.stopPropagation();
          NxgoEngage.toggleWishlist(name, name);
          btn.classList.toggle('active', NxgoEngage.isWished(name));
          btn.textContent = NxgoEngage.isWished(name) ? '♥' : '♡';
        });
        card.style.position = 'relative';
        card.appendChild(btn);
      });
    }
  }

  function renderCtaImage() {
    const ctaImg = document.querySelector('.cta-image img');
    if (ctaImg) {
      ctaImg.src = NxgoImages.url('nightcity', 1200);
      ctaImg.alt = 'Neon-lit Taipei street at night';
      NxgoImages.setupFallbacks(ctaImg.parentElement);
    }
  }

  function renderFeatured() {
    const container = document.getElementById('featured-adventures');
    if (!container) return;

    const pkgs = NxgoDB.getPackages().filter(p => p.status === 'active');
    const featured = [...pkgs].sort(() => Math.random() - 0.5).slice(0, 10);

    container.innerHTML = featured.map(p => {
      const img = NxgoImages.getPackageImage(p, 400);
      const title = NxgoApp.esc(p.prog_name.split('—')[0].trim());
      const cat = p.category || 'Adventure';
      return `
        <a href="destinations.html?q=${encodeURIComponent(p.location || p.prog_name)}" class="featured-card" data-id="${p.prog_id}">
          <img src="${img}" alt="${NxgoApp.esc(p.prog_name)}" loading="lazy" decoding="async">
          <div class="featured-card-body">
            <span class="featured-cat">${cat}</span>
            <h3>${title}</h3>
            <p>${NxgoApp.esc(p.location)}</p>
          </div>
        </a>`;
    }).join('');

    NxgoImages.setupFallbacks(container);
  }

  function renderInterestPills() {
    const container = document.getElementById('interest-pills');
    if (!container) return;
    NxgoApp.INTERESTS.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'interest-pill';
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        window.location.href = `destinations.html?interest=${encodeURIComponent(tag)}`;
      });
      container.appendChild(btn);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    NxgoApp.initPage('home', 'home');
    renderDestCards();
    renderCtaImage();
    renderFeatured();
    renderInterestPills();
    if (typeof NxgoEngage !== 'undefined') NxgoEngage.renderDailyChallenge('daily-challenge-card');

    document.getElementById('hero-search-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const q = document.getElementById('hero-search').value.trim();
      NxgoDB.logActivity({ type: 'search', query: q });
      window.location.href = `destinations.html?q=${encodeURIComponent(q)}`;
    });
  });
})();
