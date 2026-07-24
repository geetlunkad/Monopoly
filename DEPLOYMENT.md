# 🚀 1-Click Free Deployment Guide ($0 Cost)

This web app is 100% client-side (built with Vite + WebRTC PeerJS P2P multiplayer). You can deploy it to any free hosting provider in 2 minutes for **$0 forever**.

---

## 🏆 Recommended Choice: **Vercel** (Fastest & Easiest)

Vercel is the best option because it automatically detects Vite, builds your project, and hosts it on a free global CDN edge network.

### Option A: Deploy via GitHub (Recommended)
1. Push your project folder to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial Monopoly release"
   git remote add origin https://github.com/YOUR_USERNAME/monopoly.git
   git push -u origin main
   ```
2. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
3. Click **"Add New Project"** ➔ Select your `monopoly` repository.
4. Click **"Deploy"** (Vercel automatically detects Vite and builds `dist/`).
5. 🎉 Your game is live at `https://monopoly-xxxx.vercel.app`!

---

### Option B: Deploy via Vercel CLI (No GitHub required)
If you don't want to use GitHub, you can deploy directly from your terminal:
```bash
npm install -g vercel
vercel login
vercel
```
Follow the prompts (accept defaults) and your site will be live instantly!

---

## 🥈 Alternative Choice 1: **Cloudflare Pages** ($0 Unlimited)
1. Log in to [Cloudflare Pages](https://pages.cloudflare.com).
2. Connect your GitHub repository.
3. Set Build Command to `npx vite build` and Build Output Directory to `dist`.
4. Click **Deploy**.

---

## 🥉 Alternative Choice 2: **Netlify** ($0 Free Tier)
1. Log in to [Netlify.com](https://netlify.com).
2. Drag and drop the `dist/` folder directly onto the Netlify dashboard!
3. Your site is instantly published.

---

## 🎮 How Online Multiplayer & Login Works After Deployment
- **Login**: Account database is stored in LocalStorage DB. Master **GE** logs in with password `geetelectric` to configure rules and start the game.
- **Simultaneous Playing**: WebRTC PeerJS connects players' browsers directly P2P. No expensive backend servers required!
