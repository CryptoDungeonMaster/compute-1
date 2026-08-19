$ErrorActionPreference = "Stop"
$lemonade = Join-Path $env:LOCALAPPDATA "lemonade_server\bin\lemonade.exe"
$worker = Join-Path $PSScriptRoot "..\public\tap-power-worker.mjs"
$executor = Join-Path $PSScriptRoot "..\public\tap-power-lemonade-executor.mjs"

& $lemonade load "Qwen3-Coder-Next-GGUF" --pinned
if ($LASTEXITCODE -ne 0) { throw "Lemonade could not load Qwen Coder." }

$env:TAP_POWER_URL = "https://tappower.fun"
$env:TAP_POWER_WALLET = "AZuKkVTdQPSTijXXkVA1joX35rDT42dKPeQzaoEiPZ5G"
$env:TAP_POWER_EXECUTOR = $executor
$env:TAP_POWER_LEMONADE_MODEL = "Qwen3-Coder-Next-GGUF"
$env:TAP_POWER_ALLOWED_LEMONADE_MODELS = "Qwen3-Coder-Next-GGUF"
$env:TAP_POWER_LEMONADE_URL = "http://127.0.0.1:13305"

& node $worker
