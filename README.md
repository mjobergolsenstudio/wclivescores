# ⚽ World Cup 2026 Livescore

Live scores, standings and match events for all 48 teams — powered by API-Football, hosted on Vercel.

---

## 🚀 Deploy in 5 steps

### 1. Get a free API-Football key

1. Go to [api-football.com](https://www.api-football.com/) (or rapidapi.com → API-Football)
2. Sign up for the **free tier** (100 req/day — enough to prototype)
3. For production traffic, upgrade to the **Starter plan (~$19/month)**
4. Copy your API key

---

### 2. Clone and install

```bash
git clone https://github.com/yourusername/wclivescores.git
cd wclivescores
npm install
```

---

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```
API_FOOTBALL_KEY=your_api_key_here
```

> ⚠️ Never commit this file. It's already in `.gitignore`.

---

### 4. Run locally

You need both Vite (frontend) and Vercel Dev (for the API routes) running:

```bash
npm install -g vercel     # install Vercel CLI once
vercel dev                # runs both frontend and /api routes on localhost:3000
```

Or just the frontend with simulated data:
```bash
npm run dev
```

---

### 5. Deploy to Vercel

```bash
vercel --prod
```

Then in the **Vercel dashboard → Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `API_FOOTBALL_KEY` | `your_api_key_here` |

Redeploy after adding the variable.

---

## 📁 Project structure

```
wc2026/
├── api/
│   ├── matches.js     ← Serverless: fetches + caches all fixtures (60s TTL)
│   └── events.js      ← Serverless: fetches match events per fixture (30s TTL)
├── public/
│   ├── robots.txt
│   └── sitemap.xml    ← Update <loc> with your real domain
├── src/
│   ├── main.jsx
│   └── App.jsx        ← Main React app
├── index.html         ← SEO meta, OG tags, structured data — update domain!
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 🔧 Before going live — checklist

- [ ] Replace `https://wclivescores.com/` in `index.html` and `sitemap.xml` with your real domain
- [ ] Add `API_FOOTBALL_KEY` in Vercel environment variables
- [ ] Generate an OG image (`og-image.png`, 1200×630px) and add to `/public/`
- [ ] Verify domain in Google Search Console
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Add Vercel Analytics: `npm i @vercel/analytics` → `import { inject } from '@vercel/analytics'; inject();` in `main.jsx`
- [ ] Update the footer "Data powered by API-Football" link

---

## 💡 API caching strategy

The `/api/matches` serverless function caches responses **in memory for 60 seconds**.
This means 10,000 users hitting the site in the same minute → **1 API call**, not 10,000.

With 100 free req/day that gives you:
- 1 call/minute during active hours = 1440 req/day (needs paid plan)
- 1 call/5 min = 288 req/day (fits free tier for dev/testing)

To adjust the cache TTL, change `CACHE_TTL` in `api/matches.js`.

---

## 📊 Recommended API plan for production

| Traffic | Plan | Cost |
|---------|------|------|
| Dev/testing | Free | $0 |
| Up to ~5k users/day | Starter | ~$19/mo |
| High traffic | Pro | ~$49/mo |

---

## 📝 Notes

- Before June 11, 2026 the app shows **simulated data** automatically — no API calls are made
- After June 11, it switches to **live API data** and shows a disclaimer if the API is unreachable
- All times are shown in the **user's local timezone** using the browser's `Intl` API
- Favourites are stored in `localStorage` — no login required
