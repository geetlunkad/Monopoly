# 🎲 Monopoly - Glassmorphism Edition (Production Ready & 100% Free Hosting)

A modern, glassmorphic, browser-based multiplayer property trading board game built with Vanilla JavaScript, Vite, and custom CSS design system. Features real-time gameplay, AI bot players, live auctions, flexible multi-property trades, customizable house rules, account management, secret player luck factor control, and zero-cost Vercel deployment.

---

## 🌟 Key Features

1. **Real-Time Cross-Device WebRTC Multiplayer ($0 Cost)**:
   - Powered by PeerJS WebRTC P2P networking.
   - When hosted on Vercel, players can create a room, copy the 4-digit **Invite Code** (e.g. `MONO-X7K2`), and friends anywhere in the world on mobile, tablet, or desktop can click **"🌐 Join Game"** to play together in real-time with zero latency and $0 server cost!

2. **Core Game Mechanics**:
   - 40 Monopoly board spaces (Properties, Railroads, Utilities, Taxes, Jail, Free Parking, Cards).
   - Property buying, building houses and hotels, color group monopolies, rent collection.
   - Data-driven Chance & Community Chest card decks.
   - Live property auctions with real-time bidding timer.
   - Multi-property, cash, and Get Out of Jail card trading between players.
   - 3x doubles to jail rule, bail payment, get out of jail cards.

3. **Configurable House Rules**:
   - Starting cash adjustment.
   - Free Parking Jackpot toggle and tax money pool.
   - Rent in jail toggle.
   - Property auction enable/disable.

4. **Secret Player Luck Factor (Requested Feature)**:
   - Built-in customizable luck modifier algorithm (Enabled by default for username `GE`).
   - Gives `GE` a subtle probabilistic advantage to land on empty high-value properties (e.g. Boardwalk, Dark Blue, Orange/Red sets) faster, avoid opponent high-rent tiles, and subtly nudges opponents to land on `GE`'s properties.
   - Fully toggleable in the Web Admin Panel!

5. **Web Admin Panel & Accounts System**:
   - Manage user accounts, view active status, ban/unban users, reset passwords.
   - Monitor server & database metrics.
   - Toggle house rules and player luck factor on the fly.

---

## 🛠️ Step-by-Step Beginner Guide: How to Run Locally & Deploy for $0

If you have never built or hosted a website before, follow these exact beginner steps!

### 1. Prerequisites (Free Download)
1. Download & Install **Node.js** (LTS version) from [nodejs.org](https://nodejs.org/).
2. Node.js comes with `npm` (Node Package Manager) automatically.

---

### 2. How to Run Locally on Your Computer

1. Open your Terminal (Mac) or Command Prompt (Windows).
2. Navigate to the project folder:
   ```bash
   cd "/Users/geet/Desktop/Monopoly?"
   ```
3. Install dependencies (Vite):
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3000`. The game will launch immediately with 2 AI bots ready to play!

---

### 3. How the Database Works ($0 Cost)

- **Database Architecture**: The app uses a high-speed, local browser-persistent database (`localStorage`).
- **Default Pre-created Accounts**:
  - **Admin User**:
    - **Username**: `admin`
    - **Password**: `adminpassword`
  - **GE User (Luck Advantage Enabled)**:
    - **Username**: `GE`
    - **Password**: `gepassword`
  - **Player 1**:
    - **Username**: `PlayerOne`
    - **Password**: `123`

You do **NOT** need to set up MySQL, PostgreSQL, or pay for any database server. It works out of the box for free!

---

### 4. How to Deploy to Vercel for 100% FREE ($0/month)

[Vercel](https://vercel.com) provides free hosting for static websites and web applications with infinite global CDN distribution.

#### Option A: Deploy via Vercel CLI (Easiest & Fastest)
1. In your Terminal, run:
   ```bash
   npx vercel
   ```
2. If prompted to log in or create an account, follow the browser link (you can sign up using your GitHub or Google account for free).
3. Answer the terminal prompts:
   - *Set up and deploy?* -> `y`
   - *Which scope?* -> Select your account.
   - *Link to existing project?* -> `n`
   - *What's your project's name?* -> Press Enter (or type `monopoly-game`).
   - *In which directory is your code located?* -> `./`
   - *Want to modify settings?* -> `n`
4. Vercel will build and publish your game in less than 30 seconds! You will receive a live URL like:
   `https://monopoly-game.vercel.app`

#### Option B: Deploy via GitHub + Vercel Web Dashboard
1. Upload this project folder to your GitHub account repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New" -> "Project"**.
3. Select your GitHub repository.
4. Click **"Deploy"**. Vercel will automatically host it for free!

---

### 5. How to Manage Users & GE Luck in the Admin Panel

1. Open your deployed website or `http://localhost:3000`.
2. Click **"👤 Login"** in the top header bar.
3. Log in with:
   - **Username**: `admin`
   - **Password**: `adminpassword`
4. Click the **"🛡️ Admin Panel"** button in the header bar.
5. In the Admin Panel, you can:
   - **Users Tab**: View user accounts, ban/unban players, or reset their passwords.
   - **Player Luck (GE) Tab**: Toggle the subtle luck advantage on or off for `GE`.
   - **Server Status Tab**: Monitor live system health and confirm $0 cost metrics.

---

## 🎨 File Structure

```
Monopoly/
├── index.html               # Main HTML structure, Google fonts & modals
├── package.json             # Project dependencies & Vite scripts
├── vite.config.js           # Vite dev server configuration
├── README.md                # This beginner deployment guide
└── src/
    ├── css/
    │   ├── main.css         # Glassmorphism design tokens, variables & animations
    │   ├── board.css        # 40-tile 11x11 grid layout & 3D dice styling
    │   ├── modal.css        # Modals for deeds, auctions, trades, and rules
    │   └── admin.css        # Admin dashboard layout & user tables
    ├── game/
    │   ├── boardData.js     # 40 board space definitions, rents, and prices
    │   ├── cardsData.js     # Data-driven Chance and Community Chest decks
    │   ├── luckEngine.js    # Unbiased dice engine & GE subtle luck modifier
    │   ├── engine.js        # Core Monopoly game rules & state engine
    │   ├── auctionManager.js# Live property auction bidding countdown
    │   ├── tradeManager.js  # Cash, property & card trade proposals
    │   └── multiplayer.js  # Room lobbies, state sync & invite codes
    ├── store/
    │   ├── authStore.js     # Persistent user accounts DB ($0 local storage)
    │   └── adminStore.js    # Admin user management & luck toggles
    ├── ui/
    │   ├── boardUI.js       # Dynamic board & 3D dice roll animator
    │   ├── controlsUI.js    # Action buttons & real-time log feed
    │   ├── modalUI.js       # Deed inspector, rules settings & auctions
    │   └── adminUI.js       # Admin panel UI & user manager
    └── main.js              # Application entry point & event wiring
```
