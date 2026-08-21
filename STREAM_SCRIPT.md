# ComputeFi Stream Script

## Opening — 30 seconds

“What you are looking at is ComputeFi. It is a way to send a compute job to an available machine and pay for completed work in SOL.

The simple idea is: someone needs work done, they post the job and fund it. A worker machine takes the job, runs an approved local tool, and earns SOL after it finishes.

This is not a magic website that turns every browser into a supercomputer. It is a real job board, worker system, and payment flow. I am building it step by step, and I will show you exactly what works today.”

## Show the home page

“There are two sides to ComputeFi.

Rent is for people who want something done. Earn is for machines that want to do work and earn SOL.

The important word is approved. A worker owner chooses which tools and models are allowed to run. That prevents random job text from becoming random code running on somebody’s computer.”

## Explain Rent

Open the Rent page.

“This is where a renter creates a job. They explain what they need, choose a model or worker type, optionally add a small input file, and choose a SOL budget.

When they click Pay SOL and post job, their wallet sends the budget to escrow. The job only gets posted after the server verifies that the SOL transfer really happened.

Then the job board waits for an available worker.”

Point to the worker list.

“These are live workers. A worker has a unique name, its hardware details, and a status. Available means it can take work. Working means it already has an assigned job.”

## Explain the job board and progress

“Every job appears here with a simple progress state.

Zero percent means the job is waiting. Five percent means a worker has accepted it. One hundred percent means the worker finished and submitted a completion proof.

Right now this is lifecycle progress. It is honest status tracking, not a fake percentage that guesses how much of an AI model is done. Later, individual executors can report real generation steps.”

## Code Creator demo

Open Code Creator.

“This is the first specialized worker type: Code Creator. It routes a focused coding task to Qwen Coder running locally through Lemonade.

For example, I can ask it to create a TypeScript utility, write tests, explain a bug, or build a small React component.

The model returns code and instructions. It does not secretly edit a renter’s files. That is an important difference.”

Use this prompt:

```text
Make a TypeScript function called isValidSolanaAddress.
It should return true or false.
Also write five tests for it.
```

“I set the budget, approve the wallet payment, and the job enters the board. My managed worker sees it, runs the local Qwen Coder model, and returns the result.”

## Explain the worker machine

Open Earn or show the worker terminal/log.

“This machine is the worker. It is my PC, so I control what it can run. It is connected outward to the ComputeFi site; I do not need to open my home PC to the internet.

The worker sends a heartbeat every few seconds. That is why it appears as available on Rent.

When it gets a job, it passes the job to the approved local executor. For coding, that is Lemonade with Qwen Coder. For lightweight text tasks, I can use a small Qwen model. For future images, it will use ComfyUI.”

## Explain payment and escrow

Open Studio or the claim section.

“The payment side has three steps.

First, the renter pays SOL into the escrow wallet. Second, after verified completion, the worker receives an internal SOL credit. Third, the worker clicks Claim and escrow sends the SOL to the worker’s wallet.

The transaction list shows signatures when they actually happen. Until there is a real payment and claim, it correctly says there are no transactions. I always verify real money movement with the Solana signature, not with a message on a webpage.”

## Image generation — coming soon

Point to Image Generation.

“Image Generation is coming soon. ComfyUI is installed on my worker machine and its local API is online. I am finishing the image model and approved workflow before I accept paid image jobs.

Once it is ready, people will send an image prompt. The ComfyUI worker will generate the image locally, report the result, and the job can be settled the same way as a coding job.”

## Explain what can be built next

“The same pattern can support several worker types.

- Code Creator for code and technical tasks.
- Quick AI for summaries, extraction, rewriting, and JSON formatting.
- Image Creator for ComfyUI generations.
- Later, rendering, video conversion, transcription, embeddings, and data processing.

Each type needs its own safe local executor. That is what keeps the system useful without giving arbitrary internet jobs unrestricted access to a machine.”

## Honest limitations

“A few things are still being built.

Browser sharing currently makes a WebGPU machine visible, but it is not yet a browser model runtime.

One PC can run several job categories, but large local models compete for memory. Right now Lemonade loads one main LLM at a time, so switching from Qwen Coder to a smaller general model takes a moment.

Multiple workers on a single job will come after we add real sharding. We do not want three machines accidentally doing the same task and all expecting payment.”

## Close

“That is ComputeFi: a transparent way to turn approved local compute into paid work.

Renters can see jobs and workers. Worker owners control their hardware and allowed tools. Payments are in SOL, backed by escrow, and verified with real transaction signatures.

I am starting with code and local AI, then expanding to images and other worker types as each path is tested properly.”
