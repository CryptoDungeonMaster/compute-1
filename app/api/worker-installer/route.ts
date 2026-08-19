import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const script = [
    "@echo off",
    "setlocal",
    "title Tap Power Worker",
    "where node >nul 2>nul || (echo Node.js 18 or newer is required. Install it from https://nodejs.org then run this file again.& pause & exit /b 1)",
    `set \"TAP_POWER_URL=${origin}\"`,
    "set /p \"TAP_POWER_WALLET=Solana wallet to receive earnings: \"",
    "if \"%TAP_POWER_WALLET%\"==\"\" (echo A wallet address is required.& pause & exit /b 1)",
    "set /p \"TAP_POWER_EXECUTOR=Optional local runner path (leave blank to only join the board): \"",
    "set \"TAP_WORKER_DIR=%LOCALAPPDATA%\\TapPower\"",
    "if not exist \"%TAP_WORKER_DIR%\" mkdir \"%TAP_WORKER_DIR%\"",
    `powershell -NoProfile -ExecutionPolicy Bypass -Command \"Invoke-WebRequest -UseBasicParsing '${origin}/tap-power-worker.mjs' -OutFile '%TAP_WORKER_DIR%\\tap-power-worker.mjs'\"`,
    "if errorlevel 1 (echo Could not download the worker. Check your connection.& pause & exit /b 1)",
    "cd /d \"%TAP_WORKER_DIR%\"",
    "echo.",
    "echo Tap Power worker is starting. Keep this window open while sharing.",
    "node tap-power-worker.mjs",
    "pause",
    "",
  ].join("\r\n");
  return new NextResponse(script, { headers: { "Content-Type": "application/octet-stream; charset=utf-8", "Content-Disposition": "attachment; filename=Tap-Power-Worker.cmd", "Cache-Control": "no-store" } });
}
