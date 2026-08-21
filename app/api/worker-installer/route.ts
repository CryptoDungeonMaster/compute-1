import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const script = [
    "@echo off",
    "setlocal",
    "title ComputeFi Worker",
    "where node >nul 2>nul || (echo Node.js 18 or newer is required. Install it from https://nodejs.org then run this file again.& pause & exit /b 1)",
    `set \"COMPUTEFI_URL=${origin}\"`,
    "set /p \"COMPUTEFI_WALLET=Solana wallet to receive earnings: \"",
    "if \"%COMPUTEFI_WALLET%\"==\"\" (echo A wallet address is required.& pause & exit /b 1)",
    "set /p \"COMPUTEFI_OLLAMA_MODEL=Ollama model to run (example: llama3.2:3b; leave blank to only join): \"",
    "set \"COMPUTEFI_WORKER_DIR=%LOCALAPPDATA%\\ComputeFi\"",
    "if not exist \"%COMPUTEFI_WORKER_DIR%\" mkdir \"%COMPUTEFI_WORKER_DIR%\"",
    `powershell -NoProfile -ExecutionPolicy Bypass -Command \"Invoke-WebRequest -UseBasicParsing '${origin}/computefi-worker.mjs' -OutFile '%COMPUTEFI_WORKER_DIR%\\computefi-worker.mjs'\"`,
    `if not \"%COMPUTEFI_OLLAMA_MODEL%\"==\"\" powershell -NoProfile -ExecutionPolicy Bypass -Command \"Invoke-WebRequest -UseBasicParsing '${origin}/computefi-ollama-executor.mjs' -OutFile '%COMPUTEFI_WORKER_DIR%\\computefi-ollama-executor.mjs'\"`,
    "if errorlevel 1 (echo Could not download the worker. Check your connection.& pause & exit /b 1)",
    "cd /d \"%COMPUTEFI_WORKER_DIR%\"",
    "if not \"%COMPUTEFI_OLLAMA_MODEL%\"==\"\" set \"COMPUTEFI_ALLOWED_MODELS=%COMPUTEFI_OLLAMA_MODEL%\"",
    "if not \"%COMPUTEFI_OLLAMA_MODEL%\"==\"\" set \"COMPUTEFI_EXECUTOR=%COMPUTEFI_WORKER_DIR%\\computefi-ollama-executor.mjs\"",
    "echo.",
    "echo ComputeFi worker is starting. Keep this window open while sharing.",
    "node computefi-worker.mjs",
    "pause",
    "",
  ].join("\r\n");
  return new NextResponse(script, { headers: { "Content-Type": "application/octet-stream; charset=utf-8", "Content-Disposition": "attachment; filename=ComputeFi-Worker.cmd", "Cache-Control": "no-store" } });
}
