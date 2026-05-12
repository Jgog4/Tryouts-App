# ⚾ Minors Allstars 2026 Tryout Manager

Real-time tryout management app for multiple coaches. Built with Node.js, Express, WebSockets, and SQLite.

## Features
- Check in players with search
- Track All Stars vs Select 9 tryout preference
- Toggle Pitcher / Catcher interest
- Concurrent notes from multiple coaches (append-only, no overwriting)
- Filter by group, check-in status, pitcher, catcher
- Add walk-up players on the fly
- Live sync across all connected devices via WebSocket

---

## Deploy to Railway (step by step)

### 1. Push to GitHub
```bash
cd tryouts-app
git init
git add .
git commit -m "Initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project → Deploy from GitHub repo**
3. Select your new repo
4. Railway auto-detects Node.js and runs `npm start`
5. Click **Settings → Networking → Generate Domain** to get your public URL
6. Share the URL with your coaches!

### 3. That's it!
Railway will build and deploy automatically. The app will be live at your Railway URL within ~2 minutes.

---

## Run locally (optional)
```bash
npm install
npm start
# Open http://localhost:3000
```

## Notes
- Player data is stored in `tryouts.db` (SQLite) on the Railway server
- Data persists as long as the Railway deployment is running
- If you redeploy, the database resets (players are re-seeded from the code)
