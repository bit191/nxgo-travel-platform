/**
 * profile.js — Profile page + interactive forum (posts & comments).
 */
(function () {
  'use strict';

  const MEMORY_IMAGES = [
    { key: 'portrait', alt: 'Travel portrait on the road' },
    { key: 'camera', alt: 'Taking a photo with a vintage camera' },
    { key: 'field', alt: 'Golden field at sunset' },
    { key: 'ximending', alt: 'Busy night street in Ximending' },
    { key: 'cablecar', alt: 'Cable car over green mountains' },
    { key: 'station', alt: 'Scenic coastal train station' },
    { key: 'cycling', alt: 'Cycling through nature trails' },
    { key: 'brunch', alt: 'Weekend brunch spread' },
    { key: 'travelmap', alt: 'Planning the next adventure' },
    { key: 'teahouse', alt: 'Traditional tea house visit' },
    { key: 'food', alt: 'Steaming dumplings at a food stall' },
    { key: 'sunmoonlake', alt: 'Peaceful lake surrounded by mountains' },
    { key: 'hiking', alt: 'Hiking through mountain trails' },
    { key: 'yushan', alt: 'Towering mountain peaks' },
    { key: 'taipei', alt: 'Taipei city street scene' },
    { key: 'planting', alt: 'Eco volunteering tree planting' },
    { key: 'friends', alt: 'Travel buddies on an adventure' },
    { key: 'backpacker', alt: 'Solo backpacking through Taiwan' }
  ];

  const BADGES = [
    { id: 'home', label: 'Explorer', icon: '🏠', desc: 'Visit Home' },
    { id: 'destinations', label: 'Adventurer', icon: '🗺', desc: 'Browse Destinations' },
    { id: 'gallery', label: 'Shutterbug', icon: '📸', desc: 'Open Gallery' },
    { id: 'profile', label: 'Storyteller', icon: '👤', desc: 'Visit Profile' },
    { id: 'quiz', label: 'Vibe Master', icon: '✦', desc: 'Complete Vibe Quiz' },
    { id: 'wishlist', label: 'Dreamer', icon: '♥', desc: 'Save 3 adventures' },
    { id: 'roulette', label: 'Risk Taker', icon: '🎲', desc: 'Spin Taiwan Roulette' },
    { id: 'duel', label: 'Photo Judge', icon: '⚔️', desc: 'Win a Photo Duel' },
    { id: 'challenge', label: 'Daily Hero', icon: '🏆', desc: 'Complete daily challenge' }
  ];

  function renderProfileStats() {
    const user = NxgoAuth.getCurrentUser();
    const memories = NxgoDB.getMemories(user.user_id).length;
    const stories = NxgoDB.getPosts().filter(p => p.user_id === user.user_id).length;
    const wishes = typeof NxgoEngage !== 'undefined' ? NxgoEngage.getWishlist().length : 0;
    const bar = document.querySelector('.profile-stats .stats-bar');
    if (!bar) return;
    bar.innerHTML = `
      <div class="stat-item"><div class="num">${memories}</div><div class="lbl">Memories</div></div>
      <div class="stat-item"><div class="num">${stories}</div><div class="lbl">Stories</div></div>
      <div class="stat-item"><div class="num">${wishes}</div><div class="lbl">Saved</div></div>
    `;
  }

  function renderProfile() {
    const user = NxgoAuth.getCurrentUser();
    const info = document.getElementById('profile-info');
    const displayName = user.username.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    info.innerHTML = `
      <div>
        <h1>Hi, <span class="profile-name">${NxgoApp.esc(displayName)}</span>!</h1>
        <p class="profile-handle">@${NxgoApp.esc(user.username)}</p>
        <div class="profile-social">
          <a href="#" aria-label="TikTok">TT</a>
          <a href="#" aria-label="Instagram">IG</a>
        </div>
        <button type="button" class="btn btn-white btn-sm" id="edit-profile-btn" style="margin-top:16px">Edit profile</button>
      </div>
    `;
  }

  function renderMemories() {
    const user = NxgoAuth.getCurrentUser();
    const uploads = NxgoDB.getMemories(user.user_id);
    const grid = document.getElementById('memories-grid');

    const uploadHTML = uploads.map(m => `
      <div class="memory-thumb memory-uploaded" data-id="${m.memory_id}">
        <img src="${m.src}" alt="${NxgoApp.esc(m.caption)}" loading="lazy" decoding="async" width="300" height="300">
        <button type="button" class="memory-delete" data-id="${m.memory_id}" aria-label="Delete memory">✕</button>
      </div>`).join('');

    const defaultHTML = MEMORY_IMAGES.map(img =>
      `<button type="button" class="memory-thumb memory-default" aria-label="${img.alt}">
        <img src="${NxgoImages.url(img.key, 400)}" alt="${img.alt}" loading="lazy" decoding="async" width="300" height="300">
      </button>`
    ).join('');

    grid.innerHTML = uploadHTML + defaultHTML;
    NxgoImages.setupFallbacks(grid);
  }

  function setupMemoryUpload() {
    const fileInput = document.getElementById('memory-file-input');
    const uploadBtn = document.getElementById('upload-memory-btn');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 500 * 1024) {
        NxgoApp.showToast('Photo must be under 500 KB.', 'error');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const caption = prompt('Add a caption for this memory:', 'My Taiwan trip') || 'Travel memory';
        const user = NxgoAuth.getCurrentUser();
        NxgoDB.addMemory({ user_id: user.user_id, src: reader.result, caption });
        renderMemories();
        renderProfileStats();
        NxgoApp.showToast('Memory uploaded!', 'success');
        fileInput.value = '';
      };
      reader.onerror = () => {
        NxgoApp.showToast('Could not read image file.', 'error');
        fileInput.value = '';
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('memories-grid').addEventListener('click', e => {
      const del = e.target.closest('.memory-delete');
      if (!del) return;
      const id = parseInt(del.dataset.id);
      const user = NxgoAuth.getCurrentUser();
      if (!confirm('Delete this memory?')) return;
      NxgoDB.deleteMemory(id, user.user_id);
      renderMemories();
      renderProfileStats();
      NxgoApp.showToast('Memory deleted.', 'success');
    });
  }

  function setupEditProfile() {
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      const user = NxgoAuth.getCurrentUser();
      const newUsername = prompt('Username:', user.username);
      if (newUsername === null) return;
      const newEmail = prompt('Email:', user.email);
      if (newEmail === null) return;

      const result = NxgoDB.updateUser(user.user_id, {
        username: newUsername.trim(),
        email: newEmail.trim()
      });

      if (result && result.error) {
        NxgoApp.showToast(result.error, 'error');
        return;
      }

      NxgoAuth.refreshSession();
      renderProfile();
      renderProfileStats();
      renderStories();
      NxgoApp.renderNavbar('profile');
      NxgoApp.showToast('Profile updated!', 'success');
    });
  }

  function renderBadges() {
    const grid = document.getElementById('profile-badges');
    if (!grid || typeof NxgoEngage === 'undefined') return;
    const passport = JSON.parse(localStorage.getItem('nxgo_passport') || '{"stamps":[]}');
    const earned = passport.stamps || [];

    grid.innerHTML = BADGES.map(b => {
      const got = earned.includes(b.id);
      return `<div class="badge-card${got ? ' earned' : ''}" title="${b.desc}">
        <span class="badge-icon">${got ? b.icon : '?'}</span>
        <span class="badge-label">${b.label}</span>
      </div>`;
    }).join('');
  }

  function renderWishlist() {
    const container = document.getElementById('profile-wishlist');
    if (!container || typeof NxgoEngage === 'undefined') return;
    const wishes = NxgoEngage.getWishlist();

    if (!wishes.length) {
      container.innerHTML = `
        <p class="wishlist-empty">No saved adventures yet — heart something on Home or Destinations!</p>
        <a href="destinations.html" class="btn btn-teal btn-sm">Explore adventures</a>`;
      return;
    }

    container.innerHTML = wishes.map(w => `
      <a href="destinations.html?q=${encodeURIComponent(w.name)}" class="wishlist-item">
        <span class="wishlist-heart">♥</span>
        <span>${NxgoApp.esc(w.name)}</span>
      </a>`).join('');
  }

  function getInitials(username) {
    return username.substring(0, 2).toUpperCase();
  }

  function renderComment(c) {
    const commenter = NxgoDB.getUserById(c.user_id);
    return `
      <div class="comment">
        <div class="comment-avatar">${getInitials(commenter ? commenter.username : '?')}</div>
        <div>
          <div class="comment-user">@${NxgoApp.esc(commenter ? commenter.username : 'unknown')}</div>
          <div class="comment-text">${NxgoApp.esc(c.text)}</div>
        </div>
      </div>
    `;
  }

  function renderStories() {
    const feed = document.getElementById('stories-feed');
    const currentUser = NxgoAuth.getCurrentUser();
    const posts = NxgoDB.getPosts().filter(p => p.user_id === currentUser.user_id);

    if (posts.length === 0) {
      feed.innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:40px">No stories yet. Tap "+ Add stories" to share your first adventure!</p>';
      return;
    }

    feed.innerHTML = posts.map(post => {
      const author = NxgoDB.getUserById(post.user_id);
      const username = author ? author.username : 'unknown';
      const isOwner = currentUser && currentUser.user_id === post.user_id;
      const isAdmin = NxgoAuth.isAdmin();

      const commentsHTML = (post.comments || []).map(renderComment).join('');

      return `
        <div class="story-card" data-id="${post.post_id}">
          <div class="story-header">
            <div class="story-avatar">${getInitials(username)}</div>
            <span class="story-user">@${NxgoApp.esc(username)}</span>
            <span class="story-date">${NxgoApp.formatDate(post.post_date)}</span>
          </div>
          <h3>${NxgoApp.esc(post.content)}</h3>
          <p class="story-body">${NxgoApp.esc(post.questions)}</p>
          ${(isOwner || isAdmin) ? `
            <div class="story-actions">
              <button class="btn btn-teal btn-sm edit-story-btn" data-id="${post.post_id}">Edit</button>
              <button class="btn btn-danger delete-story-btn" data-id="${post.post_id}">Delete</button>
            </div>
          ` : ''}
          <div class="comments-section" id="comments-${post.post_id}">
            ${commentsHTML}
            <form class="comment-form" data-post-id="${post.post_id}">
              <input type="text" placeholder="Write a comment…" required aria-label="Comment">
              <button type="submit" class="btn btn-teal btn-sm">Reply</button>
            </form>
          </div>
        </div>
      `;
    }).join('');
  }

  function appendComment(postId, comment) {
    const section = document.getElementById(`comments-${postId}`);
    if (!section) return renderStories();
    const form = section.querySelector('.comment-form');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderComment(comment);
    section.insertBefore(wrapper.firstElementChild, form);
  }

  function setupFeedDelegation() {
    const feed = document.getElementById('stories-feed');

    feed.addEventListener('submit', e => {
      const form = e.target.closest('.comment-form');
      if (!form) return;
      e.preventDefault();

      const postId = parseInt(form.dataset.postId);
      const input = form.querySelector('input');
      const text = input.value.trim();
      if (!text) return;

      const user = NxgoAuth.getCurrentUser();
      const comment = NxgoDB.addComment(postId, { user_id: user.user_id, text });
      input.value = '';
      appendComment(postId, comment);
      NxgoApp.showToast('Comment added!', 'success');
    });

    feed.addEventListener('click', e => {
      const delBtn = e.target.closest('.delete-story-btn');
      if (delBtn) {
        if (!confirm('Delete this story?')) return;
        NxgoDB.deletePost(parseInt(delBtn.dataset.id));
        renderStories();
        NxgoApp.showToast('Story deleted.', 'success');
        return;
      }

      const editBtn = e.target.closest('.edit-story-btn');
      if (editBtn) {
        const post = NxgoDB.getPostById(parseInt(editBtn.dataset.id));
        if (!post) return;
        const newTitle = prompt('Edit title:', post.content);
        if (newTitle === null) return;
        const newBody = prompt('Edit content:', post.questions);
        if (newBody === null) return;
        NxgoDB.updatePost(post.post_id, { content: newTitle, questions: newBody });
        renderStories();
        NxgoApp.showToast('Story updated!', 'success');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!NxgoAuth.requireAuth('login.html')) return;

    NxgoApp.initPage('profile', 'profile');
    renderProfile();
    renderProfileStats();
    renderBadges();
    renderWishlist();
    renderMemories();
    setupMemoryUpload();
    setupEditProfile();
    renderStories();
    setupFeedDelegation();

    const storyForm = document.getElementById('story-form');
    document.getElementById('toggle-story-form').addEventListener('click', () => {
      storyForm.style.display = storyForm.style.display === 'none' ? 'block' : 'none';
    });

    storyForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = NxgoAuth.getCurrentUser();
      const content = document.getElementById('story-title').value.trim();
      const questions = document.getElementById('story-content').value.trim();

      NxgoDB.createPost({ user_id: user.user_id, content, questions });
      storyForm.reset();
      storyForm.style.display = 'none';
      renderStories();
      renderProfileStats();
      NxgoApp.showToast('Story posted!', 'success');
    });
  });
})();
