# TabPower

Browser-native compute network on Solana. Open a tab, share unused CPU/GPU, earn a pump.fun token plus SOL — or rent the mesh to run AI inference, rendering, and data jobs. Everything runs in WebGPU. No downloads.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- Solana Wallet Adapter (Phantom, Solflare, Backpack via Wallet Standard)

Live stats, activity, earnings, and jobs are mocked so the product feels alive without a backend.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional RPC:

```bash
cp .env.example .env.local
```

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Marketing home |
| `/earn` | Provider: share compute, claim rewards |
| `/rent` | Requester: submit jobs, pick workers |
| `/token` | PF utility and tokenomics |
| `/dashboard` | Wallet-gated overview |
