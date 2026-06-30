/**
 * app.js — Shared utilities: navbar, footer, page tracking, helpers.
 */
(function () {
  'use strict';

  const INTERESTS = [
    'Hiking', 'Swimming', 'Cat', 'Dog', 'Foodie', 'Read book',
    'Cycling', 'Shopping', 'Photography', 'Music',
    'Night markets', 'Cultural festivals', 'Fishing'
  ];

  const CATEGORIES = ['all', 'Eco', 'Adventure', 'Food', 'Culture'];

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatNumber(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  }

  /** Build nxgo logo markup */
  function logoHTML(className) {
    return `<a href="index.html" class="nxgo-logo ${className || ''}" aria-label="Nxgo home">
      <span class="logo-nx">nx<span class="logo-dot-red"></span></span>
      <span class="logo-go">g<span class="logo-dot-blue"></span>o</span>
    </a>`;
  }

  /** Render shared navbar */
  function renderNavbar(activePage) {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    const loggedIn = NxgoAuth.isLoggedIn();
    const session = NxgoAuth.getSession();

    const pages = [
      { id: 'home', label: 'Home', href: 'index.html' },
      { id: 'destinations', label: 'Destinations', href: 'destinations.html' },
      { id: 'gallery', label: 'Gallery', href: 'gallery.html' },
      { id: 'profile', label: 'Profile', href: 'profile.html' }
    ];

    const links = pages.map(p =>
      `<a href="${p.href}" class="nav-link${activePage === p.id ? ' active' : ''}">${p.label}</a>`
    ).join('');

    let authHTML;
    if (loggedIn) {
      authHTML = `
        <a href="dashboard.html" class="nav-link${activePage === 'dashboard' ? ' active' : ''}">Dashboard</a>
        <span class="nav-user">@${session.username}</span>
        <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
      `;
    } else {
      authHTML = `
        <a href="login.html" class="nav-link">Login</a>
        <a href="register.html" class="btn btn-teal btn-sm">Register</a>
      `;
    }

    nav.innerHTML = `
      <div class="nav-inner">
        <div class="nav-left">${links}</div>
        <div class="nav-right">${authHTML}</div>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => NxgoAuth.logout());
  }

  /** Render shared footer */
  function renderFooter(activePage) {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const links = [
      { id: 'about', label: 'About', href: 'about.html' },
      { id: 'pricing', label: 'Pricing', href: 'pricing.html' },
      { id: 'company', label: 'Company', href: 'company.html' },
      { id: 'blog', label: 'Blog', href: 'blog.html' }
    ];

    const footerNav = links.map(l =>
      `<a href="${l.href}" class="${activePage === l.id ? 'active' : ''}">${l.label}</a>`
    ).join('');

    footer.innerHTML = `
      <div class="footer-inner">
        ${logoHTML('footer-logo')}
        <nav class="footer-links">${footerNav}</nav>
        <div class="footer-social">
          <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
          <a href="#" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a href="#" aria-label="Google"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></a>
          <span class="footer-copy">Copyright &copy; 2025</span>
        </div>
      </div>
    `;
  }

  /** Log page view for analytics */
  function trackPage(page, extra) {
    NxgoDB.logActivity({ type: 'page_view', page, ...extra });
  }

  /** Initialize common page elements */
  function initPage(activePage, pageName) {
    renderNavbar(activePage);
    renderFooter(activePage);
    if (typeof NxgoImages !== 'undefined') NxgoImages.setupFallbacks();
    if (pageName) trackPage(pageName);
    if (typeof NxgoEngage !== 'undefined') NxgoEngage.init(activePage || pageName);
  }

  /** Debounce helper for search inputs */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Show toast notification */
  function showToast(message, type) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast toast-${type || 'info'} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /** Escape HTML to prevent XSS */
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  window.NxgoApp = {
    INTERESTS,
    CATEGORIES,
    formatDate,
    formatNumber,
    logoHTML,
    renderNavbar,
    renderFooter,
    trackPage,
    initPage,
    showToast,
    esc,
    debounce
  };
})();
