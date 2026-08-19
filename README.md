# Tap Power

Tap Power is a small Solana-funded compute board. Renters describe work, select a Hugging Face model or direct model link, optionally attach a small input file, and fund the job in SOL. Available workers receive the oldest paid job. When a native worker's configured executor finishes, the worker's SOL share becomes claimable.

This is intentionally a coordination and settlement layer. It is not a general-purpose distributed model runtime by itself. A worker needs a local runner that knows how to download/load the requested model and execute the requested work.

## What is live

- Browser workers report a real WebGPU adapter and browser logical-core count while the tab remains open.
- Native workers report an NVIDIA GPU through `nvidia-smi` when possible, otherwise their CPU name.
- Workers heartbeat every three seconds and are visible only while fresh.
- Paid jobs are stored in MongoDB when `MONGODB_URI` is configured; development falls back to `.data/mesh.json`.
- A renter's wallet transfers SOL to escrow before the server creates the job. The server verifies that transfer on Solana.
- On completion, 97.5% of the job budget is entered as claimable SOL for the worker. The remaining 2.5% is the protocol fee.
- Claims are sent from the server's escrow wallet and recorded in the ledger.

## What is not automatic

Sharing a browser tab does **not** execute a Hugging Face model. It makes that browser visible and eligible for work, but there is no browser inference engine included in this repository.

The native worker also does not guess how to run every model. It needs `TAP_POWER_EXECUTOR`, an executable you operate. The worker supplies the full assigned job as JSON in `TAP_POWER_JOB`. That executable must exit with status `0` only when the requested work has completed. Its standard output is retained as the completion proof.

This separation is deliberate: executing arbitrary renter prompts, model links, or shell strings without an operator-controlled runner would be unsafe.

## Start the site

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The required production environment variables are:

```dotenv
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_SOLANA_RPC=https://your-solana-rpc.example
NEXT_PUBLIC_SITE_URL=https://your-domain.example
ESCROW_SECRET_KEY=[...a JSON Solana keypair byte array...]
```

Do not commit `.env.local`. `ESCROW_SECRET_KEY` is a hot-wallet private key. Never name it `NEXT_PUBLIC_ESCROW_SECRET_KEY` or place it in client code.

## Escrow setup

Yes, escrow is needed for the current paid-job flow. Without it, the app could not safely wait for a worker to complete before a payout is authorized.

1. Create a new dedicated Solana keypair for Tap Power. Do not use your personal wallet.
2. Export that keypair as the JSON byte array required by `ESCROW_SECRET_KEY` and place it only in the hosting provider's encrypted server environment.
3. Fund it with a small amount of SOL for outbound transaction fees. Renter job payments will also arrive here.
4. Start the server once and visit `/api/escrow`. It returns the public address used by the Rent page.
5. Use devnet while testing by setting `NEXT_PUBLIC_SOLANA_RPC` to a devnet RPC. Mainnet payments are real SOL.

For local development only, the app can create `.data/escrow.json` if no secret is present. Treat it as a private key: it is convenient for a local test, but it is not a deployment strategy. In production, configure `ESCROW_SECRET_KEY` before accepting jobs and back up the key using your normal secrets process.

The current escrow model is custodial: the server holding `ESCROW_SECRET_KEY` can settle payments. Before public mainnet use, move this logic to an audited Solana program or a multisig-controlled payout service, add job expiry/refunds, authentication for completion proofs, fraud review, and rate limits. Do not market this as trustless escrow yet.

## Rent a worker

1. Go to **Rent** and connect a Solana wallet.
2. Write a plain description of the task.
3. Paste a Hugging Face ID such as `meta-llama/Llama-3.1-8B-Instruct`, or a direct model URL. This field is optional because some executors may use a preinstalled model.
4. Optionally upload a small input file (maximum 1 MB). The file is stored with the job record so a native executor can read it from `TAP_POWER_JOB`.
5. Enter the SOL budget. TP is not a payment option.
6. Click **Pay SOL & post job** and approve the wallet transaction.

The server verifies the transaction destination and amount before inserting the job. The job board updates every two seconds. “Waiting” means no eligible worker has received it; “Working” means a worker owns it; “Complete” means the worker completion endpoint accepted a proof.

Important: if a wallet payment succeeds but the server cannot verify it promptly, do not immediately send another payment. The transaction is on-chain. Check its signature, resolve the server/RPC issue, then contact the operator to recover or post the job against that verified payment.

## Run a worker

### Browser worker

1. Open **Earn**.
2. Connect the wallet that should receive claims.
3. Click **Share this tab**.
4. Keep the tab open.

This creates a WebGPU worker heartbeat. It is useful for presence testing and for a future browser executor, but it does not execute models in this version.

### Native PC worker

Download `tap-power-worker.mjs`, install Node 18+, and run:

```powershell
$env:TAP_POWER_URL="https://your-domain.example"
$env:TAP_POWER_WALLET="YourSolanaAddress"
node .\tap-power-worker.mjs
```

The console prints the worker ID, detected adapter, site address, and whether an executor is configured. Keep it open; press Ctrl+C to unregister.

For an NVIDIA machine, ensure `nvidia-smi` is on the path. Its presence is used for detection only—it does not make inference happen on its own.

### Make the native worker execute work

Create or install a local executable that performs the model-specific work. Set its path as `TAP_POWER_EXECUTOR`:

```powershell
$env:TAP_POWER_URL="https://your-domain.example"
$env:TAP_POWER_WALLET="YourSolanaAddress"
$env:TAP_POWER_EXECUTOR="C:\workers\run-tap-job.exe"
node .\tap-power-worker.mjs
```

For every assigned job, Tap Power launches that executable with an environment variable:

```text
TAP_POWER_JOB={"id":"...","prompt":"...","modelSource":"...","fileName":"...","fileData":"...",...}
```

Your runner should parse that JSON, enforce its own allowed-model and resource policy, execute the task, print a short result/proof to standard output, and exit `0`. A nonzero exit code leaves the job assigned and logs the failure; it does not pay the worker. The default timeout is 30 minutes and can be changed with `TAP_POWER_TIMEOUT_MS`.

Keep the runner narrow. Good runners accept a fixed approved set of model IDs and a structured prompt format. Do not turn arbitrary job text into a shell command. Treat model URLs and attached files as untrusted input.

## Settlement and claims

When the configured native executor succeeds, the worker script calls the completion endpoint. The server verifies that the job is currently assigned to that worker and that its private per-worker token matches the token registered at heartbeat time, records the proof, returns the worker to available, and credits the worker wallet in the database.

The Earn screen updates the following values from that ledger:

- **Available**: SOL that is ready to claim, plus a displayed TP balance of `0 TP` because TP is not used for settlement.
- **Earned today**: SOL credits created since local midnight.
- **Lifetime**: all SOL credits and completed-job count.
- **Claim**: sends available SOL from escrow to the connected worker address and stores the transaction signature as a payout record.

If a claim fails, check the server escrow key, the escrow balance, outbound RPC access, and that the worker connected the same wallet address it used when registering.

## Persistence

With MongoDB configured, the app stores workers, jobs, and ledger records in the configured database. Mongo indexes worker IDs and job creation order. In a local no-Mongo environment, it writes the same records to `.data/mesh.json` so development still works across server restarts.

Job records include the text, model source, optional uploaded file data, SOL budget, payment signature, assignment, completion proof, and timestamps. The database is the source of truth for the board and claimable balances; browser local storage is used only for the current tab's sharing preference and dashboard display settings.

For public deployment, use MongoDB rather than the file fallback. The fallback is single-process and cannot safely coordinate multiple application instances.

## API overview

| Route | Purpose |
| --- | --- |
| `GET /api/escrow` | Returns the server escrow public address. |
| `GET/POST /api/jobs` | Lists jobs / verifies a SOL transfer and posts a paid job. |
| `POST /api/jobs/complete` | Marks a job complete after assigned-worker validation. |
| `GET /api/workers` | Lists fresh worker heartbeats. |
| `POST /api/workers/heartbeat` | Registers or refreshes a worker and receives its assigned job. |
| `POST /api/workers/leave` | Removes a worker and reopens its job. |
| `GET/POST /api/earnings` | Reads a wallet ledger / sends its claimable SOL. |

## Validate before release

```bash
npm run build
```

Then test the full path on devnet: configure devnet RPC and a devnet escrow key, start one native worker with a harmless fixed runner, fund a job from a devnet wallet, confirm the job changes to working then complete, verify the Earn balance changes, and claim to the same worker wallet. Review the Mongo documents and on-chain signatures as part of that test.
