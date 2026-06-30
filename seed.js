/**
 * seed.js — Pre-populates localStorage with demo data on first load.
 * Run once; subsequent visits skip seeding if data already exists.
 */
(function () {
  'use strict';

  const SEED_KEY = 'nxgo_seeded';

  if (localStorage.getItem(SEED_KEY)) return;

  /* ── Users (2 demo accounts: 1 admin, 1 traveler) ── */
  const users = [
    {
      user_id: 1,
      username: 'kim_taee',
      email: 'kim@nxgo.tw',
      password: 'password123',
      role: 'traveler'
    },
    {
      user_id: 2,
      username: 'admin',
      email: 'admin@nxgo.tw',
      password: 'admin123',
      role: 'admin'
    }
  ];

  /* ── Travel Packages / Destinations ── */
  const travel_packages = [
    {
      prog_id: 1,
      prog_name: 'Eco Crew — Tree Planting',
      events: 'Join us in planting trees and restoring nature. Small actions, big impact for our planet.',
      date: '2025-07-15',
      status: 'active',
      category: 'Eco',
      location: 'Taichung',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=75',
      interests: ['Hiking', 'Cycling']
    },
    {
      prog_id: 2,
      prog_name: 'Ride Buddies — Taiwan Cycling',
      events: 'Hop on your bike, explore Taiwan, and enjoy the ride with new friends.',
      date: '2025-08-01',
      status: 'active',
      category: 'Adventure',
      location: 'Sun Moon Lake',
      image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=75',
      interests: ['Cycling', 'Photography']
    },
    {
      prog_id: 3,
      prog_name: 'Hike Buddies — Mountain Trails',
      events: 'Explore nature, reach new heights, and enjoy the journey with new friends.',
      date: '2025-09-10',
      status: 'active',
      category: 'Adventure',
      location: 'Yushan',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=75',
      interests: ['Hiking', 'Photography']
    },
    {
      prog_id: 4,
      prog_name: 'Ocean Helpers — Beach Cleanup',
      events: 'Be part of the change. Remove waste, protect marine life, and create a cleaner future.',
      date: '2025-06-20',
      status: 'active',
      category: 'Eco',
      location: 'Kenting',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=75',
      interests: ['Swimming', 'Fishing']
    },
    {
      prog_id: 5,
      prog_name: 'Ximending Night Market Tour',
      events: 'Discover Taipei\'s most vibrant shopping and food district with a local buddy.',
      date: '2025-10-05',
      status: 'active',
      category: 'Food',
      location: 'Taipei',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=75',
      interests: ['Foodie', 'Night markets', 'Shopping']
    },
    {
      prog_id: 6,
      prog_name: 'Jiufen Lantern Walk',
      events: 'Wander through the magical lantern-lit streets of Jiufen Old Street at dusk.',
      date: '2025-11-12',
      status: 'active',
      category: 'Culture',
      location: 'New Taipei',
      image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=800&q=75',
      interests: ['Photography', 'Cultural festivals', 'Foodie']
    },
    ...(typeof NXGO_EXTRA_PACKAGES !== 'undefined' ? NXGO_EXTRA_PACKAGES : [])
  ];

  /* ── Forum Posts with Comments ── */
  const posts = [
    {
      post_id: 1,
      user_id: 1,
      post_date: '2025-05-10T14:30:00',
      content: 'Yilan public bath house',
      questions: 'Has anyone been to the Jiaoxi hot springs in Yilan? I\'m planning a weekend trip and would love tips on the best public bath houses nearby. Any recommendations for good local food after soaking?',
      comments: [
        {
          comment_id: 1,
          user_id: 2,
          date: '2025-05-11T09:15:00',
          text: 'Jiaoxi Hot Spring Park is amazing! Try the foot bath area first, then head to Tangweigou for the full experience.'
        },
        {
          comment_id: 2,
          user_id: 1,
          date: '2025-05-11T16:40:00',
          text: 'Thanks! I\'ll check out Tangweigou. Any food spots you recommend nearby?'
        }
      ]
    },
    {
      post_id: 2,
      user_id: 1,
      post_date: '2025-04-22T10:00:00',
      content: 'Best night market in Taipei?',
      questions: 'I\'ve been to Shilin and Raohe — both incredible. But I keep hearing about Ningxia and Huaxi. Which one should I prioritize for my last night in Taipei?',
      comments: [
        {
          comment_id: 3,
          user_id: 2,
          date: '2025-04-23T08:30:00',
          text: 'Ningxia is smaller but has the best stinky tofu and oyster omelette. Huaxi is more touristy but fun for the snake alley experience!'
        }
      ]
    },
    {
      post_id: 3,
      user_id: 2,
      post_date: '2025-03-15T18:20:00',
      content: 'Sun Moon Lake cycling route',
      questions: 'Looking for the best cycling route around Sun Moon Lake. Is the full loop doable in one day for a moderate cyclist?',
      comments: []
    },
    {
      post_id: 4,
      user_id: 1,
      post_date: '2025-02-08T11:45:00',
      content: 'Rainbow Village photo tips',
      questions: 'Planning a visit to Rainbow Village in Taichung. What time of day gives the best light for photography? And how crowded does it get on weekends?',
      comments: [
        {
          comment_id: 4,
          user_id: 2,
          date: '2025-02-09T07:00:00',
          text: 'Early morning (before 9 AM) is golden. Weekends get packed after 10 — go on a weekday if you can!'
        }
      ]
    }
  ];

  /* ── Activity Log (analytics source) ── */
  const activity_log = [
  { id: 1, type: 'page_view', page: 'home', timestamp: '2025-01-05T10:00:00' },
  { id: 2, type: 'page_view', page: 'destinations', timestamp: '2025-01-05T10:05:00' },
  { id: 3, type: 'page_view', page: 'gallery', timestamp: '2025-01-06T14:00:00' },
  { id: 4, type: 'page_view', page: 'destinations', timestamp: '2025-01-07T09:30:00' },
  { id: 5, type: 'page_view', page: 'home', timestamp: '2025-01-08T16:00:00' },
  { id: 6, type: 'page_view', page: 'profile', timestamp: '2025-01-09T11:00:00' },
  { id: 7, type: 'search', query: 'Taichung', category: 'Eco', timestamp: '2025-01-10T08:00:00' },
  { id: 8, type: 'search', query: 'night market', category: 'Food', timestamp: '2025-01-11T19:00:00' },
  { id: 9, type: 'search', query: 'hiking', category: 'Adventure', timestamp: '2025-01-12T07:30:00' },
  { id: 10, type: 'page_view', page: 'destinations', timestamp: '2025-01-13T13:00:00' },
  { id: 11, type: 'page_view', page: 'destinations', timestamp: '2025-01-14T10:00:00' },
  { id: 12, type: 'page_view', page: 'gallery', timestamp: '2025-01-15T15:00:00' },
  { id: 13, type: 'page_view', page: 'home', timestamp: '2025-01-16T12:00:00' },
  { id: 14, type: 'page_view', page: 'destinations', timestamp: '2025-01-17T09:00:00' },
  { id: 15, type: 'signup', user_id: 1, timestamp: '2025-01-01T08:00:00' },
  { id: 16, type: 'signup', user_id: 2, timestamp: '2025-01-02T10:00:00' },
  { id: 17, type: 'page_view', page: 'destinations', destination_id: 1, timestamp: '2025-02-01T10:00:00' },
  { id: 18, type: 'page_view', page: 'destinations', destination_id: 2, timestamp: '2025-02-02T11:00:00' },
  { id: 19, type: 'page_view', page: 'destinations', destination_id: 1, timestamp: '2025-02-03T12:00:00' },
  { id: 20, type: 'page_view', page: 'destinations', destination_id: 3, timestamp: '2025-02-04T13:00:00' },
  { id: 21, type: 'page_view', page: 'destinations', destination_id: 1, timestamp: '2025-02-05T14:00:00' },
  { id: 22, type: 'page_view', page: 'destinations', destination_id: 5, timestamp: '2025-02-06T15:00:00' },
  { id: 23, type: 'page_view', page: 'destinations', destination_id: 2, timestamp: '2025-02-07T16:00:00' },
  { id: 24, type: 'page_view', page: 'destinations', destination_id: 4, timestamp: '2025-02-08T17:00:00' },
  { id: 25, type: 'page_view', page: 'destinations', destination_id: 6, timestamp: '2025-02-09T18:00:00' }
  ];

  /* ── Counters for auto-increment IDs ── */
  const counters = {
    user_id: 3,
    post_id: 5,
    prog_id: 15,
    comment_id: 5,
    activity_id: 26,
    memory_id: 1
  };

  localStorage.setItem('nxgo_users', JSON.stringify(users));
  localStorage.setItem('nxgo_posts', JSON.stringify(posts));
  localStorage.setItem('nxgo_travel_packages', JSON.stringify(travel_packages));
  localStorage.setItem('nxgo_activity_log', JSON.stringify(activity_log));
  localStorage.setItem('nxgo_counters', JSON.stringify(counters));
  localStorage.setItem(SEED_KEY, 'true');
})();
