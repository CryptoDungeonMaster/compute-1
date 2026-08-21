$ErrorActionPreference = "Stop"
$lemonade = Join-Path $env:LOCALAPPDATA "lemonade_server\bin\lemonade.exe"
$worker = Join-Path $PSScriptRoot "..\public\computefi-worker.mjs"
$executor = Join-Path $PSScriptRoot "..\public\computefi-lemonade-executor.mjs"

& $lemonade load "Qwen3-Coder-Next-GGUF" --pinned
if ($LASTEXITCODE -ne 0) { throw "Lemonade could not load Qwen Coder." }

$env:COMPUTEFI_URL = "https://computefi.fun"
$env:COMPUTEFI_WALLET = "AZuKkVTdQPSTijXXkVA1joX35rDT42dKPeQzaoEiPZ5G"
$env:COMPUTEFI_EXECUTOR = $executor
$env:COMPUTEFI_LEMONADE_MODEL = "Qwen3-Coder-Next-GGUF"
$env:COMPUTEFI_ALLOWED_LEMONADE_MODELS = "Qwen3-Coder-Next-GGUF"
$env:COMPUTEFI_LEMONADE_URL = "http://127.0.0.1:13305"

& node $worker
