/**
 * data.js — localStorage CRUD layer mirroring a relational schema.
 * Tables: users, posts, travel_packages, activity_log
 */
const NxgoDB = (function () {
  'use strict';

  const TABLES = {
    users: 'nxgo_users',
    posts: 'nxgo_posts',
    travel_packages: 'nxgo_travel_packages',
    activity_log: 'nxgo_activity_log',
    counters: 'nxgo_counters',
    memories: 'nxgo_memories'
  };

  function read(table) {
    return JSON.parse(localStorage.getItem(TABLES[table]) || '[]');
  }

  function write(table, data) {
    localStorage.setItem(TABLES[table], JSON.stringify(data));
  }

  function nextId(counterKey) {
    const counters = JSON.parse(localStorage.getItem(TABLES.counters) || '{}');
    const id = counters[counterKey] || 1;
    counters[counterKey] = id + 1;
    localStorage.setItem(TABLES.counters, JSON.stringify(counters));
    return id;
  }

  /* ── Users ── */
  function getUsers() { return read('users'); }

  function getUserById(id) {
    return getUsers().find(u => u.user_id === id);
  }

  function getUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  function createUser({ username, email, password, role }) {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Email already registered.' };
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { error: 'Username already taken.' };
    }
    const user = {
      user_id: nextId('user_id'),
      username,
      email,
      password,
      role: role || 'traveler'
    };
    users.push(user);
    write('users', users);
    logActivity({ type: 'signup', user_id: user.user_id });
    return { user };
  }

  function updateUser(id, data) {
    const users = getUsers();
    const idx = users.findIndex(u => u.user_id === id);
    if (idx === -1) return null;
    if (data.email && users.some(u => u.user_id !== id && u.email.toLowerCase() === data.email.toLowerCase())) {
      return { error: 'Email already in use.' };
    }
    if (data.username && users.some(u => u.user_id !== id && u.username.toLowerCase() === data.username.toLowerCase())) {
      return { error: 'Username already taken.' };
    }
    users[idx] = { ...users[idx], ...data, user_id: id };
    write('users', users);
    return { user: users[idx] };
  }

  /* ── Travel Packages ── */
  function getPackages() { return read('travel_packages'); }

  function getPackageById(id) {
    return getPackages().find(p => p.prog_id === id);
  }

  function createPackage(data) {
    const packages = getPackages();
    const pkg = {
      prog_id: nextId('prog_id'),
      prog_name: data.prog_name,
      events: data.events,
      date: data.date,
      status: data.status || 'active',
      category: data.category,
      location: data.location,
      image: data.image || 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=75',
      image_custom: !!data.image_custom,
      interests: data.interests || []
    };
    packages.push(pkg);
    write('travel_packages', packages);
    return pkg;
  }

  function updatePackage(id, data) {
    const packages = getPackages();
    const idx = packages.findIndex(p => p.prog_id === id);
    if (idx === -1) return null;
    packages[idx] = { ...packages[idx], ...data, prog_id: id };
    write('travel_packages', packages);
    return packages[idx];
  }

  function deletePackage(id) {
    const packages = getPackages().filter(p => p.prog_id !== id);
    write('travel_packages', packages);
  }

  /* ── Posts / Forum ── */
  function getPosts() {
    return read('posts').sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
  }

  function getPostById(id) {
    return getPosts().find(p => p.post_id === id);
  }

  function createPost({ user_id, content, questions }) {
    const posts = read('posts');
    const post = {
      post_id: nextId('post_id'),
      user_id,
      post_date: new Date().toISOString(),
      content,
      questions,
      comments: []
    };
    posts.push(post);
    write('posts', posts);
    return post;
  }

  function updatePost(id, data) {
    const posts = read('posts');
    const idx = posts.findIndex(p => p.post_id === id);
    if (idx === -1) return null;
    posts[idx] = { ...posts[idx], ...data, post_id: id };
    write('posts', posts);
    return posts[idx];
  }

  function deletePost(id) {
    const posts = read('posts').filter(p => p.post_id !== id);
    write('posts', posts);
  }

  function addComment(postId, { user_id, text }) {
    const posts = read('posts');
    const idx = posts.findIndex(p => p.post_id === postId);
    if (idx === -1) return null;
    const comment = {
      comment_id: nextId('comment_id'),
      user_id,
      date: new Date().toISOString(),
      text
    };
    posts[idx].comments.push(comment);
    write('posts', posts);
    return comment;
  }

  /* ── User Memories (photos) ── */
  function getMemories(userId) {
    return read('memories')
      .filter(m => m.user_id === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function addMemory({ user_id, src, caption }) {
    const memories = read('memories');
    const memory = {
      memory_id: nextId('memory_id'),
      user_id,
      src,
      caption: caption || 'Travel memory',
      date: new Date().toISOString()
    };
    memories.push(memory);
    write('memories', memories);
    return memory;
  }

  function deleteMemory(id, userId) {
    const memories = read('memories').filter(m => !(m.memory_id === id && m.user_id === userId));
    write('memories', memories);
  }

  /* ── Search ── */
  function searchPackages({ keyword, category, interest }) {
    let results = getPackages();
    if (keyword) {
      const q = keyword.toLowerCase();
      results = results.filter(p =>
        p.prog_name.toLowerCase().includes(q) ||
        p.events.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.interests && p.interests.some(i => i.toLowerCase().includes(q)))
      );
    }
    if (category && category !== 'all') {
      results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (interest && interest !== 'all') {
      results = results.filter(p =>
        p.interests && p.interests.some(i => i.toLowerCase() === interest.toLowerCase())
      );
    }
    return results;
  }

  /* ── Activity Log ── */
  function getActivityLog() { return read('activity_log'); }

  function logActivity(entry) {
    const log = getActivityLog();
    log.push({
      id: nextId('activity_id'),
      timestamp: new Date().toISOString(),
      ...entry
    });
    write('activity_log', log);
  }

  /* ── Analytics helpers ── */
  function getAnalytics() {
    const users = getUsers();
    const packages = getPackages();
    const posts = read('posts');
    const log = getActivityLog();

    const signups = log.filter(e => e.type === 'signup');
    const pageViews = log.filter(e => e.type === 'page_view');
    const searches = log.filter(e => e.type === 'search');

    const destinationViews = {};
    pageViews.forEach(e => {
      if (e.destination_id) {
        const pkg = getPackageById(e.destination_id);
        const name = pkg ? pkg.prog_name : `ID ${e.destination_id}`;
        destinationViews[name] = (destinationViews[name] || 0) + 1;
      }
    });

    const categoryDist = {};
    packages.forEach(p => {
      categoryDist[p.category] = (categoryDist[p.category] || 0) + 1;
    });

    const postsByMonth = {};
    posts.forEach(p => {
      const month = p.post_date.substring(0, 7);
      postsByMonth[month] = (postsByMonth[month] || 0) + 1;
    });

    const signupsByMonth = {};
    signups.forEach(s => {
      const month = s.timestamp.substring(0, 7);
      signupsByMonth[month] = (signupsByMonth[month] || 0) + 1;
    });

    return {
      totalUsers: users.length,
      totalPackages: packages.length,
      totalPosts: posts.length,
      totalSearches: searches.length,
      totalPageViews: pageViews.length,
      destinationViews,
      categoryDist,
      postsByMonth,
      signupsByMonth
    };
  }

  return {
    getUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    getPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    addComment,
    getMemories,
    addMemory,
    deleteMemory,
    searchPackages,
    getActivityLog,
    logActivity,
    getAnalytics
  };
})();
