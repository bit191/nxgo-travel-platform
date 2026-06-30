/**
 * engage.js — Engagement layer: passport, live ticker, vibe quiz, wishlist.
 */
const NxgoEngage = (function () {
  'use strict';

  const WISH_KEY = 'nxgo_wishlist';
  const PASSPORT_KEY = 'nxgo_passport';

  const STAMPS = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'destinations', label: 'Destinations', icon: '🗺' },
    { id: 'gallery', label: 'Gallery', icon: '📸' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'blog', label: 'Blog', icon: '📝' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'quiz', label: 'Vibe Quiz', icon: '✦' },
    { id: 'wishlist', label: '3 Saves', icon: '♥' },
    { id: 'roulette', label: 'Roulette', icon: '🎲' },
    { id: 'duel', label: 'Photo Duel', icon: '⚔️' },
    { id: 'challenge', label: 'Daily Quest', icon: '🏆' }
  ];

  const CHALLENGE_KEY = 'nxgo_daily_challenge';

  const TICKER_MSGS = [
    () => `🌿 ${rand(12, 48)} travelers exploring Taiwan right now`,
    () => `📍 Trending: ${pick(['Jiufen', 'Taichung', 'Kenting', 'Sun Moon Lake', 'Ximending'])}`,
    () => `♥ ${getWishlist().length} adventures saved by the community today`,
    () => `🚀 Someone just joined Eco Crew in Taichung`,
    () => `🏮 ${rand(3, 15)} new stories posted this hour`,
    () => `⏰ Taipei local time: ${taipeiTime()}`,
    () => `🍜 Night market season is LIVE in Taipei`,
    () => `🎲 ${rand(8, 34)} spins on Taiwan Roulette today`,
    () => `⚔️ Photo Duel champion: ${pick(['Jiufen', 'Taroko', 'Kenting', 'Alishan'])}`,
  ];

  const QUIZ = [
    {
      q: 'What\'s your travel energy?',
      opts: [
        { label: '🧘 Chill & slow', vibe: 'culture' },
        { label: '⚡ High adventure', vibe: 'adventure' },
        { label: '🍜 Food-first', vibe: 'food' }
      ]
    },
    {
      q: 'Pick your landscape',
      opts: [
        { label: '🌊 Coast & beaches', vibe: 'coast' },
        { label: '🏔 Mountains & trails', vibe: 'mountain' },
        { label: '🏮 Cities & night markets', vibe: 'city' }
      ]
    },
    {
      q: 'How do you travel?',
      opts: [
        { label: '🧍 Solo explorer', vibe: 'solo' },
        { label: '👯 With buddies', vibe: 'buddy' },
        { label: '🌱 Eco volunteer', vibe: 'eco' }
      ]
    }
  ];

  const QUIZ_RESULTS = {
    culture: { title: 'Jiufen Lantern Walk', q: 'Jiufen', cat: 'Culture', msg: 'Lanterns, tea houses, and magic at dusk — this is your vibe.' },
    adventure: { title: 'Hike Buddies', q: 'Yushan', cat: 'Adventure', msg: 'Mountain trails and new heights await you.' },
    food: { title: 'Ximending Night Market', q: 'Ximending', cat: 'Food', msg: 'Your perfect match: street food heaven in Taipei.' },
    coast: { title: 'Ocean Helpers', q: 'Kenting', cat: 'Eco', msg: 'Sun, sea, and making a difference on the coast.' },
    mountain: { title: 'Hike Buddies', q: 'Yushan', cat: 'Adventure', msg: 'Peaks, forests, and epic views — go climb.' },
    city: { title: 'Ximending Night Market', q: 'Taipei', cat: 'Food', msg: 'Neon streets and night markets are calling.' },
    solo: { title: 'Jiufen Lantern Walk', q: 'Jiufen', cat: 'Culture', msg: 'A soulful solo walk through lantern-lit streets.' },
    buddy: { title: 'Ride Buddies', q: 'Sun Moon Lake', cat: 'Adventure', msg: 'Grab a bike, find your crew, explore together.' },
    eco: { title: 'Eco Crew', q: 'Taichung', cat: 'Eco', msg: 'Plant trees, restore nature, travel with purpose.' }
  };

  let quizStep = 0;
  let quizVibes = [];

  function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function taipeiTime() {
    return new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit' });
  }

  function getWishlist() {
    return JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
  }

  function saveWishlist(list) {
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
    updateWishlistUI();
    checkWishlistBadge(list.length);
  }

  function getPassport() {
    return JSON.parse(localStorage.getItem(PASSPORT_KEY) || '{"stamps":[]}');
  }

  function addStamp(id) {
    const p = getPassport();
    if (!p.stamps.includes(id)) {
      p.stamps.push(id);
      localStorage.setItem(PASSPORT_KEY, JSON.stringify(p));
      renderPassport();
      if (p.stamps.length === STAMPS.length) {
        NxgoApp.showToast('🏆 Taiwan Passport complete! You\'re a true explorer.', 'success');
      } else {
        NxgoApp.showToast(`✦ Passport stamp: ${STAMPS.find(s => s.id === id)?.label || id}`, 'info');
      }
    }
  }

  function checkWishlistBadge(count) {
    if (count >= 3) addStamp('wishlist');
  }

  function isWished(id) {
    return getWishlist().some(w => w.id === id);
  }

  function toggleWishlist(id, name) {
    let list = getWishlist();
    const key = id || name;
    const idx = list.findIndex(w => w.id === key);
    if (idx >= 0) {
      list.splice(idx, 1);
      NxgoApp.showToast('Removed from wishlist', 'info');
    } else {
      list.push({ id: key, name: name || key, date: new Date().toISOString() });
      NxgoApp.showToast('♥ Saved to your wishlist!', 'success');
      NxgoDB.logActivity({ type: 'wishlist_add', item: key });
    }
    saveWishlist(list);
    checkDailyChallenge();
    return idx < 0;
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDailyChallenge() {
    const stored = JSON.parse(localStorage.getItem(CHALLENGE_KEY) || 'null');
    if (stored && stored.date === getTodayKey()) return stored;
    const pool = [
      { id: 'wishlist2', text: 'Save 2 adventures to your wishlist', icon: '♥' },
      { id: 'react3', text: 'React to 3 photos in the Gallery', icon: '📸' },
      { id: 'roulette', text: 'Spin the Taiwan Roulette wheel', icon: '🎲' },
      { id: 'duel3', text: 'Win 3 Photo Duels in the Gallery', icon: '⚔️' },
      { id: 'quiz', text: 'Complete the Vibe Quiz', icon: '✦' }
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const challenge = { date: getTodayKey(), ...pick, done: false };
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
    return challenge;
  }

  function checkChallengeDone(ch) {
    if (ch.id === 'wishlist2') return getWishlist().length >= 2;
    if (ch.id === 'react3') {
      return JSON.parse(localStorage.getItem('nxgo_gallery_reactions') || '[]').length >= 3;
    }
    if (ch.id === 'roulette') return getPassport().stamps.includes('roulette');
    if (ch.id === 'duel3') {
      return (JSON.parse(localStorage.getItem('nxgo_duel_wins') || '{}').total || 0) >= 3;
    }
    if (ch.id === 'quiz') return getPassport().stamps.includes('quiz');
    return false;
  }

  function checkDailyChallenge() {
    const ch = getDailyChallenge();
    if (!ch.done && checkChallengeDone(ch)) {
      ch.done = true;
      localStorage.setItem(CHALLENGE_KEY, JSON.stringify(ch));
      addStamp('challenge');
      NxgoApp.showToast('🏆 Daily challenge complete!', 'success');
      document.querySelectorAll('#daily-challenge-card').forEach(el => renderDailyChallenge(el));
    }
  }

  function renderDailyChallenge(target) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    const ch = getDailyChallenge();
    const done = ch.done || checkChallengeDone(ch);
    if (done && !ch.done) {
      ch.done = true;
      localStorage.setItem(CHALLENGE_KEY, JSON.stringify(ch));
    }
    const link = ch.id === 'quiz' ? '#' : ch.id.includes('wishlist') ? 'destinations.html' : 'gallery.html';
    el.innerHTML = `
      <div class="challenge-inner${done ? ' done' : ''}">
        <span class="challenge-icon">${ch.icon}</span>
        <div class="challenge-body">
          <p class="challenge-label">Daily Challenge</p>
          <h3>${ch.text}</h3>
          <p class="challenge-status">${done ? '✅ Completed today — nice work!' : 'Complete it to earn a passport stamp 🛂'}</p>
        </div>
        ${!done ? `<a href="${link}" class="btn btn-teal btn-sm challenge-go">${ch.id === 'quiz' ? 'Take quiz' : 'Let\'s go!'}</a>` : ''}
      </div>`;
    if (!done && ch.id === 'quiz') {
      el.querySelector('.challenge-go')?.addEventListener('click', e => {
        e.preventDefault();
        openQuiz();
      });
    }
  }

  /* ── Inject global UI ── */
  function injectUI() {
    if (document.getElementById('engage-root')) return;

    const root = document.createElement('div');
    root.id = 'engage-root';
    root.innerHTML = `
      <div class="pulse-ticker" id="pulse-ticker">
        <span class="pulse-dot"></span>
        <span class="pulse-text" id="pulse-text">Live from Taiwan…</span>
      </div>
      <div class="scroll-progress" id="scroll-progress"></div>
      <button type="button" class="passport-fab" id="passport-fab" aria-label="Taiwan Passport">
        <span class="passport-fab-icon">🛂</span>
        <span class="passport-fab-count" id="passport-count">0</span>
      </button>
      <div class="passport-panel" id="passport-panel" hidden>
        <div class="passport-panel-inner">
          <button type="button" class="passport-close" id="passport-close">✕</button>
          <h3>🛂 Taiwan Passport</h3>
          <p class="passport-sub">Collect stamps as you explore Nxgo</p>
          <div class="passport-stamps" id="passport-stamps"></div>
          <div class="passport-progress-wrap">
            <div class="passport-progress-bar" id="passport-bar"></div>
          </div>
          <p class="passport-pct" id="passport-pct">0% explored</p>
          <div class="passport-wishlist" id="passport-wishlist"></div>
          <button type="button" class="btn btn-gold btn-sm" id="open-quiz-btn" style="width:100%;margin-top:12px">✦ Take the vibe quiz</button>
        </div>
      </div>
      <div class="vibe-modal" id="vibe-modal" hidden>
        <div class="vibe-modal-inner">
          <button type="button" class="vibe-close" id="vibe-close">✕</button>
          <p class="vibe-eyebrow">Nxgo Vibe Scanner</p>
          <h2 id="vibe-question">What's your travel energy?</h2>
          <div class="vibe-options" id="vibe-options"></div>
          <div class="vibe-result" id="vibe-result" hidden></div>
        </div>
      </div>
    `;
    document.body.prepend(root);

    document.getElementById('passport-fab').addEventListener('click', () => {
      const panel = document.getElementById('passport-panel');
      panel.hidden = !panel.hidden;
      renderPassport();
    });
    document.getElementById('passport-close').addEventListener('click', () => {
      document.getElementById('passport-panel').hidden = true;
    });
    document.getElementById('open-quiz-btn').addEventListener('click', () => {
      document.getElementById('passport-panel').hidden = true;
      openQuiz();
    });
    document.getElementById('vibe-close').addEventListener('click', closeQuiz);
    document.getElementById('vibe-modal').addEventListener('click', e => {
      if (e.target.id === 'vibe-modal') closeQuiz();
    });

    window.addEventListener('scroll', () => {
      const el = document.getElementById('scroll-progress');
      if (!el) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      el.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
    }, { passive: true });

    startTicker();
    renderPassport();
    updateWishlistUI();
  }

  function startTicker() {
    let i = 0;
    const el = document.getElementById('pulse-text');
    function tick() {
      if (el) el.textContent = TICKER_MSGS[i % TICKER_MSGS.length]();
      i++;
    }
    tick();
    setInterval(tick, 4000);
  }

  function renderPassport() {
    const p = getPassport();
    const grid = document.getElementById('passport-stamps');
    if (!grid) return;

    grid.innerHTML = STAMPS.map(s => {
      const got = p.stamps.includes(s.id);
      return `<div class="passport-stamp${got ? ' earned' : ''}" title="${s.label}">
        <span class="stamp-icon">${got ? s.icon : '?'}</span>
        <span class="stamp-label">${s.label}</span>
      </div>`;
    }).join('');

    const pct = Math.round(p.stamps.length / STAMPS.length * 100);
    document.getElementById('passport-count').textContent = p.stamps.length;
    document.getElementById('passport-bar').style.width = pct + '%';
    document.getElementById('passport-pct').textContent = pct + '% explored';

    const wishes = getWishlist();
    const wl = document.getElementById('passport-wishlist');
    if (wishes.length === 0) {
      wl.innerHTML = '<p class="passport-wl-empty">♥ No saved adventures yet — heart something!</p>';
    } else {
      wl.innerHTML = '<p class="passport-wl-title">Your wishlist</p>' +
        wishes.map(w => `<a href="destinations.html?q=${encodeURIComponent(w.name)}" class="passport-wl-item">${NxgoApp.esc(w.name)}</a>`).join('');
    }
  }

  function updateWishlistUI() {
    document.querySelectorAll('.wish-btn').forEach(btn => {
      const id = btn.dataset.wishId;
      const active = isWished(id);
      btn.classList.toggle('active', active);
      btn.textContent = active ? '♥' : '♡';
    });
  }

  /* ── Vibe Quiz ── */
  function openQuiz() {
    quizStep = 0;
    quizVibes = [];
    document.getElementById('vibe-result').hidden = true;
    document.getElementById('vibe-options').hidden = false;
    document.getElementById('vibe-modal').hidden = false;
    renderQuizStep();
  }

  function closeQuiz() {
    document.getElementById('vibe-modal').hidden = true;
  }

  function renderQuizStep() {
    const step = QUIZ[quizStep];
    document.getElementById('vibe-question').textContent = step.q;
    document.getElementById('vibe-options').innerHTML = step.opts.map((o, i) =>
      `<button type="button" class="vibe-opt" data-idx="${i}">${o.label}</button>`
    ).join('');

    document.getElementById('vibe-options').querySelectorAll('.vibe-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        quizVibes.push(step.opts[parseInt(btn.dataset.idx)].vibe);
        quizStep++;
        if (quizStep < QUIZ.length) renderQuizStep();
        else showQuizResult();
      });
    });
  }

  function showQuizResult() {
    addStamp('quiz');
    const counts = {};
    quizVibes.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const result = QUIZ_RESULTS[top] || QUIZ_RESULTS.culture;

    document.getElementById('vibe-options').hidden = true;
    document.getElementById('vibe-question').textContent = 'Your Taiwan match ✦';
    const res = document.getElementById('vibe-result');
    res.hidden = false;
    res.innerHTML = `
      <p class="vibe-match-msg">${result.msg}</p>
      <h3 class="vibe-match-title">${NxgoApp.esc(result.title)}</h3>
      <a href="destinations.html?q=${encodeURIComponent(result.q)}&category=${result.cat}" class="btn btn-teal">Explore now →</a>
      <button type="button" class="btn btn-ghost btn-sm vibe-retake" id="vibe-retake">Retake quiz</button>
    `;
    document.getElementById('vibe-retake').addEventListener('click', openQuiz);
    NxgoDB.logActivity({ type: 'quiz_complete', result: top });
  }

  /* ── Home extras ── */
  function initHome() {
    const tagline = document.querySelector('.hero-tagline');
    if (tagline && !tagline.dataset.typed) {
      const text = tagline.textContent;
      tagline.textContent = '';
      tagline.dataset.typed = '1';
      let i = 0;
      const type = () => {
        if (i < text.length) {
          tagline.textContent += text[i++];
          setTimeout(type, 28);
        }
      };
      setTimeout(type, 600);
    }

    if (!document.getElementById('trending-marquee')) {
      const pkgs = NxgoDB.getPackages();
      const marquee = document.createElement('div');
      marquee.className = 'trending-marquee';
      marquee.id = 'trending-marquee';
      const items = pkgs.map(p =>
        `<a href="destinations.html?q=${encodeURIComponent(p.location)}" class="trending-item">🔥 ${NxgoApp.esc(p.prog_name.split('—')[0].trim())} · ${NxgoApp.esc(p.location)}</a>`
      ).join('');
      marquee.innerHTML = `<div class="trending-track">${items}${items}</div>`;
      const hero = document.querySelector('.hero-home');
      if (hero) hero.after(marquee);
    }

    if (!document.getElementById('vibe-cta')) {
      const cta = document.createElement('button');
      cta.type = 'button';
      cta.className = 'vibe-cta';
      cta.id = 'vibe-cta';
      cta.innerHTML = '✦ What\'s your Taiwan vibe?';
      cta.addEventListener('click', openQuiz);
      const hero = document.querySelector('.hero-home');
      if (hero) {
        const search = hero.querySelector('.search-bar');
        if (search) search.after(cta);
      }
    }

    document.querySelectorAll('.dest-card').forEach(card => {
      if (card.querySelector('.wish-btn')) return;
      const name = card.dataset.name;
      if (!name) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wish-btn' + (isWished(name) ? ' active' : '');
      btn.dataset.wishId = name;
      btn.textContent = isWished(name) ? '♥' : '♡';
      btn.setAttribute('aria-label', 'Save to wishlist');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleWishlist(name, name);
        btn.classList.toggle('active', isWished(name));
        btn.textContent = isWished(name) ? '♥' : '♡';
      });
      card.style.position = 'relative';
      card.appendChild(btn);
    });

    if (!localStorage.getItem('nxgo_quiz_shown')) {
      setTimeout(() => {
        if (!document.getElementById('vibe-modal') || document.getElementById('vibe-modal').hidden) {
          openQuiz();
          localStorage.setItem('nxgo_quiz_shown', '1');
        }
      }, 2500);
    }
  }

  function init(page) {
    if (page === 'login' || page === 'register') return;
    injectUI();
    if (page && page !== 'login' && page !== 'register') addStamp(page);
    if (page === 'home') initHome();
    if (page === 'gallery') checkDailyChallenge();
    document.body.classList.add('has-ticker');
  }

  return {
    init,
    toggleWishlist,
    isWished,
    openQuiz,
    addStamp,
    getWishlist,
    checkDailyChallenge,
    renderDailyChallenge,
    wishlistButton(id, name) {
      const active = isWished(id);
      return `<button type="button" class="wish-btn${active ? ' active' : ''}" data-wish-id="${NxgoApp.esc(String(id))}" aria-label="Save to wishlist">${active ? '♥' : '♡'}</button>`;
    }
  };
})();
