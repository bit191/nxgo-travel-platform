/**
 * dashboard.js — Chart.js analytics dashboard (admin).
 */
(function () {
  'use strict';

  function initDashboard() {
    if (!NxgoAuth.requireAuth('login.html')) return;

    NxgoApp.initPage('dashboard', 'dashboard');

    const analytics = NxgoDB.getAnalytics();
    const users = NxgoDB.getUsers();
    const packages = NxgoDB.getPackages();

    document.getElementById('stat-users').textContent = analytics.totalUsers;
    document.getElementById('stat-packages').textContent = analytics.totalPackages;
    document.getElementById('stat-posts').textContent = analytics.totalPosts;
    document.getElementById('stat-searches').textContent = analytics.totalSearches;

    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { labels: { color: '#ccc', font: { family: 'Outfit' } } }
      },
      scales: {
        x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
      }
    };

    /* Signups over time (line) */
    const signupMonths = Object.keys(analytics.signupsByMonth).sort();
    new Chart(document.getElementById('chart-signups'), {
      type: 'line',
      data: {
        labels: signupMonths,
        datasets: [{
          label: 'New Signups',
          data: signupMonths.map(m => analytics.signupsByMonth[m]),
          borderColor: '#4a9ead',
          backgroundColor: 'rgba(74,158,173,0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f5c518'
        }]
      },
      options: { ...chartDefaults }
    });

    /* Posts over time (bar) */
    const postMonths = Object.keys(analytics.postsByMonth).sort();
    new Chart(document.getElementById('chart-posts'), {
      type: 'bar',
      data: {
        labels: postMonths,
        datasets: [{
          label: 'Forum Posts',
          data: postMonths.map(m => analytics.postsByMonth[m]),
          backgroundColor: 'rgba(245,197,24,0.7)',
          borderRadius: 8
        }]
      },
      options: { ...chartDefaults }
    });

    /* Category distribution (pie) */
    const cats = Object.keys(analytics.categoryDist);
    new Chart(document.getElementById('chart-categories'), {
      type: 'pie',
      data: {
        labels: cats,
        datasets: [{
          data: cats.map(c => analytics.categoryDist[c]),
          backgroundColor: ['#4a9ead', '#f5c518', '#e85d4a', '#7b6cf6', '#5cb85c']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#ccc', font: { family: 'Outfit' } } } }
      }
    });

    /* Most-viewed destinations (bar) */
    const destNames = Object.keys(analytics.destinationViews);
    const destCounts = destNames.map(n => analytics.destinationViews[n]);
    new Chart(document.getElementById('chart-destinations'), {
      type: 'bar',
      data: {
        labels: destNames.map(n => n.length > 25 ? n.substring(0, 22) + '…' : n),
        datasets: [{
          label: 'Page Views',
          data: destCounts,
          backgroundColor: 'rgba(74,158,173,0.8)',
          borderRadius: 8
        }]
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y'
      }
    });

    /* Interest tag distribution from packages */
    const interestDist = {};
    packages.forEach(p => {
      (p.interests || []).forEach(i => {
        interestDist[i] = (interestDist[i] || 0) + 1;
      });
    });
    const interests = Object.keys(interestDist);
    new Chart(document.getElementById('chart-interests'), {
      type: 'doughnut',
      data: {
        labels: interests,
        datasets: [{
          data: interests.map(i => interestDist[i]),
          backgroundColor: [
            '#4a9ead', '#f5c518', '#e85d4a', '#7b6cf6', '#5cb85c',
            '#ff8c42', '#d4a5a5', '#9ed2be', '#c9b1ff', '#ffd166'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { position: 'right', labels: { color: '#ccc', font: { family: 'Outfit', size: 11 } } } }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'dashboard') initDashboard();
  });
})();
