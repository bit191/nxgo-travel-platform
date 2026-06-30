# Nxgo — Your Taiwan Buddy

A multi-page travel companion platform for exploring Taiwan, built as a university Database Management final project. Nxgo connects travelers with local buddies, eco-activities, and a community forum — all powered by the browser's `localStorage` as a client-side database.

---

## 🚀 Features

- **User Authentication** — Register, login, and logout with session management. Profile and Dashboard pages are protected.
- **Data Management (CRUD)** — Create, read, update, and delete travel activities on the Destinations page. All changes persist in `localStorage`.
- **Search & Retrieval** — Keyword search with category and interest-tag filters. Graceful "no results" state.
- **Interactive Forum** — Post stories, ask questions, and reply with comments on the Profile page. Updates appear instantly.
- **Analytics Dashboard** — Admin dashboard with Chart.js visualizations: signups, posts over time, category/interest distribution, and most-viewed destinations. All numbers come from live `localStorage` data.

---

## 🗺️ Page Mapping

| Page | File | Description |
| :--- | :--- | :--- |
| **Home** | `index.html` | Hero, discovery cards, destination grid, interest pills |
| **Destinations** | `destinations.html` | Activity cards, Taichung section, search + CRUD |
| **Gallery** | `gallery.html` | Photo collage and travel quote grid |
| **Profile** | `profile.html` | User profile, memories grid, forum feed (login required) |
| **Dashboard** | `dashboard.html` | Analytics charts (admin login required) |
| **Login** | `login.html` | Split-panel login form |
| **Register** | `register.html` | Split-panel registration form |

---

## 🔒 Demo Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Traveler** | `kim@nxgo.tw` | `password123` |
| **Admin** | `admin@nxgo.tw` | `admin123` |

---

## 💻 How to Run Locally

1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
3. No build step, no server, no npm install required.

> 📝 **Note:** On first load, `js/seed.js` automatically populates `localStorage` with demo users, destinations, forum posts, and activity log data.

To reset all data to factory settings, open your browser console (`F12` -> Console) and run:
```js
localStorage.clear(); location.reload();
