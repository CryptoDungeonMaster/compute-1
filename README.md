# Tap Power

Browser native compute on Solana. Share a tab (WebGPU) or run a native GPU worker on your PC. Post jobs to the board. Idle workers take them.

## Run

```bash
npm install
cp .env.example .env.local
```

Set `MONGODB_URI` to your MongoDB connection string. If it is missing, jobs and workers still save to `.data/mesh.json` locally.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Native GPU worker

```bash
node tap-power-worker.mjs
```

Download it from Earn, or copy `public/tap-power-worker.mjs`. Optional env: `TAP_POWER_URL`, `TAP_POWER_WALLET`.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/earn` | Share a tab or download the PC worker |
| `/rent` | Post jobs and watch the board |
| `/token` | TP utility |
| `/dashboard` | Wallet studio |
