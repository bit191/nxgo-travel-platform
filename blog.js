/**
 * blog.js — Blog page pulling community stories + curated articles.
 */
(function () {
  'use strict';

  const CURATED = [
    {
      title: '48 hours in Jiufen: a local\'s guide',
      excerpt: 'Lanterns, taro balls, and the best photo spots most tourists miss on Old Street.',
      tag: 'Culture',
      key: 'jiufen',
      date: '2025-05-01',
      author: 'Nxgo Editorial'
    },
    {
      title: 'Why Sun Moon Lake is best on two wheels',
      excerpt: 'The full cycling loop, where to rent bikes, and the lakeside stops worth pulling over for.',
      tag: 'Adventure',
      key: 'cycling',
      date: '2025-04-18',
      author: 'Nxgo Editorial'
    },
    {
      title: 'Night market survival guide: Taipei edition',
      excerpt: 'From Shilin to Ningxia — what to eat, when to go, and how to order like a local.',
      tag: 'Food',
      key: 'nightmarket',
      date: '2025-04-05',
      author: 'Nxgo Editorial'
    },
    {
      title: 'Rainbow Village: more than an Instagram spot',
      excerpt: 'The story behind Taichung\'s most colorful alley and how to visit respectfully.',
      tag: 'Culture',
      key: 'rainbow',
      date: '2025-03-22',
      author: 'Nxgo Editorial'
    },
    {
      title: 'Joining your first eco crew in Taiwan',
      excerpt: 'What to expect at a tree-planting day, what to bring, and why it matters.',
      tag: 'Eco',
      key: 'planting',
      date: '2025-03-10',
      author: 'Nxgo Editorial'
    }
  ];

  function postToArticle(post) {
    const user = NxgoDB.getUserById(post.user_id);
    const name = user ? user.username : 'traveler';
    const keys = ['jiufen', 'hotspring', 'nightmarket', 'hiking', 'beach', 'rainbow'];
    const key = keys[post.post_id % keys.length];
    return {
      title: post.content,
      excerpt: post.questions.length > 120 ? post.questions.substring(0, 120) + '…' : post.questions,
      tag: 'Community',
      key,
      date: post.post_date,
      author: '@' + name,
      href: 'profile.html'
    };
  }

  function renderCard(article, featured) {
    const img = NxgoImages.url(article.key, featured ? 900 : 600);
    const date = NxgoApp.formatDate(article.date);
    const href = article.href || '#';
    return `
      <a href="${href}" class="blog-card${featured ? ' featured' : ''}">
        <img src="${img}" alt="${NxgoApp.esc(article.title)}" loading="lazy" decoding="async">
        <div class="blog-card-body">
          <span class="blog-tag">${NxgoApp.esc(article.tag)}</span>
          <h3>${NxgoApp.esc(article.title)}</h3>
          <p>${NxgoApp.esc(article.excerpt)}</p>
          <span class="blog-meta">${date} · ${NxgoApp.esc(article.author)}</span>
        </div>
      </a>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    NxgoApp.initPage('blog', 'blog');

    const communityPosts = NxgoDB.getPosts().map(postToArticle);
    const allArticles = [...communityPosts, ...CURATED].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const featured = allArticles[0];
    const sideArticles = allArticles.slice(1, 3);
    const gridArticles = allArticles.slice(3);

    const featuredEl = document.getElementById('blog-featured');
    if (featured) {
      featuredEl.innerHTML = `
        ${renderCard(featured, true)}
        <div class="blog-side">
          ${sideArticles.map(a => renderCard(a, false)).join('')}
        </div>`;
    }

    document.getElementById('blog-grid').innerHTML =
      gridArticles.map(a => renderCard(a, false)).join('');

    NxgoImages.setupFallbacks(document.querySelector('.info-body'));
  });
})();
