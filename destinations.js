/**
 * destinations.js — Adventure Hub: search, chips, CRUD with smart images.
 */
(function () {
  'use strict';

  let editingId = null;
  let pendingImageData = null;

  const CAT_COLORS = {
    Eco: '#5cb85c',
    Adventure: '#f5c518',
    Food: '#e85d4a',
    Culture: '#4a9ead'
  };

  function getPreviewData() {
    return {
      prog_name: document.getElementById('pkg-name').value.trim(),
      location: document.getElementById('pkg-location').value.trim(),
      category: document.getElementById('pkg-category').value,
      events: document.getElementById('pkg-events').value.trim(),
      interests: document.getElementById('pkg-interests').value.split(',').map(s => s.trim()).filter(Boolean)
    };
  }

  function updateImagePreview() {
    const data = getPreviewData();
    const panel = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');
    const urlInput = document.getElementById('pkg-image-url').value.trim();

    if (!data.location && !data.prog_name && !urlInput && !pendingImageData) {
      panel.hidden = true;
      return;
    }

    if (pendingImageData) {
      img.src = pendingImageData;
    } else if (urlInput) {
      img.src = urlInput;
    } else {
      img.src = NxgoImages.matchForPackage(data);
    }
    panel.hidden = false;
    NxgoImages.setupFallbacks(panel);
  }

  function readImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (file.size > 500 * 1024) {
        reject(new Error('Image must be under 500 KB.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read image file.'));
      reader.readAsDataURL(file);
    });
  }

  function renderActivityCards() {
    const packages = NxgoDB.getPackages().slice(0, 6);
    const row = document.getElementById('activity-row');
    if (!row) return;

    row.innerHTML = packages.map(p => {
      const img = NxgoImages.getPackageImage(p, 500);
      const title = NxgoApp.esc(p.prog_name.split('—')[0].trim());
      return `
        <div class="activity-card" data-id="${p.prog_id}">
          <img src="${img}" alt="${NxgoApp.esc(p.prog_name)}" loading="lazy" decoding="async" width="400" height="320">
          <div class="activity-text">
            <h3>${title} <span class="heart-icon">♥</span></h3>
            <p>${NxgoApp.esc(p.events)}</p>
          </div>
        </div>`;
    }).join('');

    NxgoImages.setupFallbacks(row);
    row.querySelectorAll('.activity-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const pkg = NxgoDB.getPackageById(id);
        NxgoDB.logActivity({ type: 'page_view', page: 'destinations', destination_id: id });
        document.getElementById('search-keyword').value = pkg.location || pkg.prog_name;
        runSearch(false);
        document.querySelector('.hub-section').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function updateStats() {
    const analytics = NxgoDB.getAnalytics();
    document.getElementById('stat-travellers').textContent = NxgoApp.formatNumber(analytics.totalUsers * 3250);
    document.getElementById('stat-activities').textContent = analytics.totalPackages * 83 + 5;
  }

  function setupChipFilters() {
    const interestChips = document.getElementById('interest-chips');
    NxgoApp.INTERESTS.forEach(tag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip';
      btn.dataset.value = tag;
      btn.textContent = tag;
      interestChips.appendChild(btn);

      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag;
      document.getElementById('search-interest').appendChild(opt);
    });

    document.getElementById('category-chips').addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      document.querySelectorAll('#category-chips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('search-category').value = chip.dataset.value;
      runSearch(false);
    });

    document.getElementById('interest-chips').addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      document.querySelectorAll('#interest-chips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('search-interest').value = chip.dataset.value;
      runSearch(false);
    });
  }

  function syncChipsFromSelects() {
    const cat = document.getElementById('search-category').value;
    const interest = document.getElementById('search-interest').value;
    document.querySelectorAll('#category-chips .filter-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.value === cat);
    });
    document.querySelectorAll('#interest-chips .filter-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.value === interest);
    });
  }

  function renderResults(results) {
    const grid = document.getElementById('results-grid');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('results-count');

    countEl.textContent = results.length === 0
      ? 'No signals found'
      : `${results.length} adventure${results.length > 1 ? 's' : ''} on your radar`;

    if (results.length === 0) {
      grid.innerHTML = '';
      noResults.hidden = false;
      return;
    }

    noResults.hidden = true;
    grid.innerHTML = results.map((p, i) => {
      const img = NxgoImages.getPackageImage(p, 700);
      const accent = CAT_COLORS[p.category] || '#4a9ead';
      const tags = (p.interests || []).map(t =>
        `<span class="adventure-tag">${NxgoApp.esc(t)}</span>`
      ).join('');

      return `
        <article class="adventure-card" data-id="${p.prog_id}" style="--card-accent:${accent};--card-delay:${i * 0.06}s">
          <div class="adventure-card-img">
            <img src="${img}" alt="${NxgoApp.esc(p.prog_name)} — ${NxgoApp.esc(p.location)}" loading="lazy" decoding="async">
            <button type="button" class="wish-btn${(typeof NxgoEngage !== 'undefined' && NxgoEngage.isWished(p.prog_id)) ? ' active' : ''}" data-wish-id="${p.prog_id}" data-wish-name="${NxgoApp.esc(p.prog_name)}" aria-label="Save to wishlist">${(typeof NxgoEngage !== 'undefined' && NxgoEngage.isWished(p.prog_id)) ? '♥' : '♡'}</button>
            <div class="adventure-card-badge">${NxgoApp.esc(p.category)}</div>
            <div class="adventure-card-loc">📍 ${NxgoApp.esc(p.location)}</div>
          </div>
          <div class="adventure-card-body">
            <h4>${NxgoApp.esc(p.prog_name)}</h4>
            <p>${NxgoApp.esc(p.events)}</p>
            <div class="adventure-tags">${tags}</div>
            <div class="adventure-card-foot">
              <span class="adventure-date">${NxgoApp.formatDate(p.date)}</span>
              <span class="adventure-status ${p.status}">${p.status === 'active' ? '● Live' : '○ Paused'}</span>
            </div>
            <div class="adventure-card-actions">
              <button type="button" class="adventure-btn edit-btn" data-id="${p.prog_id}">Edit</button>
              <button type="button" class="adventure-btn adventure-btn-danger delete-btn" data-id="${p.prog_id}">Remove</button>
            </div>
          </div>
        </article>`;
    }).join('');

    NxgoImages.setupFallbacks(grid);
  }

  function runSearch(logActivity) {
    const keyword = document.getElementById('search-keyword').value.trim();
    const category = document.getElementById('search-category').value;
    const interest = document.getElementById('search-interest').value;

    if (logActivity && (keyword || category !== 'all' || interest !== 'all')) {
      NxgoDB.logActivity({ type: 'search', query: keyword, category: category !== 'all' ? category : '' });
    }

    renderResults(NxgoDB.searchPackages({ keyword, category, interest }));
  }

  function openForm(editing) {
    const panel = document.getElementById('hub-form-panel');
    panel.hidden = false;
    document.getElementById('form-title').textContent = editing ? '✦ Edit Mission Brief' : '✦ New Mission Brief';
    document.getElementById('crud-submit').textContent = editing ? '💾 Save changes' : '🚀 Launch adventure';
    document.getElementById('crud-cancel').hidden = !editing;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeForm() {
    document.getElementById('hub-form-panel').hidden = true;
    resetForm();
  }

  function resetForm() {
    editingId = null;
    pendingImageData = null;
    document.getElementById('crud-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('pkg-image-file').value = '';
    document.getElementById('crud-submit').textContent = '🚀 Launch adventure';
    document.getElementById('crud-cancel').hidden = true;
    document.getElementById('image-preview').hidden = true;
    document.getElementById('form-title').textContent = '✦ New Mission Brief';
  }

  function startEdit(id) {
    const pkg = NxgoDB.getPackageById(id);
    if (!pkg) return;
    editingId = id;
    pendingImageData = null;
    document.getElementById('edit-id').value = id;
    document.getElementById('pkg-name').value = pkg.prog_name;
    document.getElementById('pkg-category').value = pkg.category;
    document.getElementById('pkg-location').value = pkg.location;
    document.getElementById('pkg-date').value = pkg.date;
    document.getElementById('pkg-status').value = pkg.status;
    document.getElementById('pkg-interests').value = (pkg.interests || []).join(', ');
    document.getElementById('pkg-events').value = pkg.events;
    document.getElementById('pkg-image-url').value = pkg.image_custom && !pkg.image.startsWith('data:')
      ? pkg.image.split('?')[0]
      : '';
    if (pkg.image_custom && pkg.image.startsWith('data:')) {
      pendingImageData = pkg.image;
    }
    updateImagePreview();
    openForm(true);
  }

  function deletePackage(id) {
    if (!confirm('Remove this adventure from the radar?')) return;
    NxgoDB.deletePackage(id);
    NxgoApp.showToast('Adventure removed.', 'success');
    runSearch(false);
    renderActivityCards();
    updateStats();
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const preview = getPreviewData();
    const urlInput = document.getElementById('pkg-image-url').value.trim();
    const fileInput = document.getElementById('pkg-image-file');

    let image = NxgoImages.matchForPackage(preview);
    let image_custom = false;

    try {
      if (fileInput.files[0]) {
        const dataUrl = await readImageFile(fileInput.files[0]);
        if (dataUrl) {
          image = dataUrl;
          image_custom = true;
        }
      } else if (urlInput) {
        image = urlInput;
        image_custom = true;
      } else if (editingId) {
        const existing = NxgoDB.getPackageById(editingId);
        if (existing && existing.image_custom) {
          image = existing.image;
          image_custom = true;
        }
      }
    } catch (err) {
      NxgoApp.showToast(err.message, 'error');
      return;
    }

    const data = {
      ...preview,
      date: document.getElementById('pkg-date').value,
      status: document.getElementById('pkg-status').value,
      image,
      image_custom
    };

    if (editingId) {
      NxgoDB.updatePackage(editingId, data);
      NxgoApp.showToast('Adventure updated!', 'success');
    } else {
      NxgoDB.createPackage(data);
      NxgoApp.showToast('New adventure launched!', 'success');
    }

    closeForm();
    runSearch(false);
    renderActivityCards();
    updateStats();
  }

  function initFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) document.getElementById('search-keyword').value = params.get('q');
    if (params.get('category')) document.getElementById('search-category').value = params.get('category');
    if (params.get('interest')) document.getElementById('search-interest').value = params.get('interest');
    syncChipsFromSelects();
  }

  document.addEventListener('DOMContentLoaded', () => {
    NxgoApp.initPage('destinations', 'destinations');
    setupChipFilters();
    initFromURL();
    renderActivityCards();
    updateStats();
    runSearch(false);

    document.getElementById('search-btn').addEventListener('click', () => runSearch(true));
    document.getElementById('search-keyword').addEventListener('keyup', e => {
      if (e.key === 'Enter') runSearch(true);
    });
    document.getElementById('search-keyword').addEventListener('input', NxgoApp.debounce(() => runSearch(false), 300));

    document.getElementById('toggle-form-btn').addEventListener('click', () => {
      const panel = document.getElementById('hub-form-panel');
      if (panel.hidden) {
        resetForm();
        openForm(false);
      } else {
        closeForm();
      }
    });

    document.getElementById('surprise-btn')?.addEventListener('click', () => {
      const pkgs = NxgoDB.getPackages().filter(p => p.status === 'active');
      if (!pkgs.length) return;
      const pick = pkgs[Math.floor(Math.random() * pkgs.length)];
      document.getElementById('search-keyword').value = pick.location || pick.prog_name;
      document.getElementById('search-category').value = 'all';
      document.getElementById('search-interest').value = 'all';
      syncChipsFromSelects();
      runSearch(false);
      NxgoApp.showToast(`🎲 Surprise: ${pick.prog_name.split('—')[0].trim()}!`, 'success');
      document.querySelector('.hub-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    ['pkg-name', 'pkg-location', 'pkg-category', 'pkg-interests', 'pkg-events'].forEach(id => {
      document.getElementById(id).addEventListener('input', NxgoApp.debounce(updateImagePreview, 200));
      document.getElementById(id).addEventListener('change', updateImagePreview);
    });

    document.getElementById('pkg-image-url').addEventListener('input', NxgoApp.debounce(() => {
      pendingImageData = null;
      updateImagePreview();
    }, 200));

    document.getElementById('pkg-image-file').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) {
        pendingImageData = null;
        updateImagePreview();
        return;
      }
      try {
        pendingImageData = await readImageFile(file);
        document.getElementById('pkg-image-url').value = '';
        updateImagePreview();
      } catch (err) {
        e.target.value = '';
        pendingImageData = null;
        NxgoApp.showToast(err.message, 'error');
      }
    });

    document.getElementById('crud-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('crud-cancel').addEventListener('click', closeForm);

    document.getElementById('results-grid').addEventListener('click', e => {
      const wishBtn = e.target.closest('.wish-btn');
      if (wishBtn) {
        e.stopPropagation();
        const id = parseInt(wishBtn.dataset.wishId);
        const name = wishBtn.dataset.wishName;
        NxgoEngage.toggleWishlist(id, name);
        wishBtn.classList.toggle('active', NxgoEngage.isWished(id));
        wishBtn.textContent = NxgoEngage.isWished(id) ? '♥' : '♡';
        return;
      }
      const editBtn = e.target.closest('.edit-btn');
      const delBtn = e.target.closest('.delete-btn');
      if (editBtn) startEdit(parseInt(editBtn.dataset.id));
      if (delBtn) deletePackage(parseInt(delBtn.dataset.id));
    });
  });
})();
