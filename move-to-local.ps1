# =========================
# TailTribe OneDrive → Local: Copy + Install + Run + Verify
# =========================

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# --- Config ---
$Src      = 'C:\Users\steve\OneDrive\Desktop\C dev\TailTribe-Final'
$DstRoot  = 'C:\dev'
$Dst      = Join-Path $DstRoot 'TailTribe-Final'
$LogPath  = Join-Path $env:TEMP ("robocopy_tailtribe_{0}.log" -f (Get-Date -Format 'yyyyMMdd_HHmmss'))
$MaxWait  = 120  # seconds to wait for http://localhost:3000
$PollInt  = 3    # seconds between checks

Write-Host "==> Stopping any running Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "==> Ensuring destination root exists: $DstRoot" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $DstRoot -Force | Out-Null

# If destination exists, rotate it to a timestamped backup to avoid MIR deleting local work
if (Test-Path $Dst) {
  $Backup = "${Dst}.bak_{0}" -f (Get-Date -Format 'yyyyMMdd_HHmmss')
  Write-Host "==> Destination already exists. Renaming to: $Backup" -ForegroundColor Yellow
  Rename-Item -Path $Dst -NewName (Split-Path $Backup -Leaf)
}

# Try to "pin" all files in the OneDrive source (best-effort; ignore failures)
Write-Host "==> Pinning source files in OneDrive to reduce timeouts (best effort)..." -ForegroundColor Cyan
try { attrib +P -U "$Src\*" /S /D 2>$null } catch { }

Write-Host "==> Copying project OUT of OneDrive → $Dst  (this may take a few minutes)..." -ForegroundColor Cyan
# /MIR mirror; exclude build & VCS dirs; /ZB restartable with backup fallback; /R:3 /W:2 fast retries
# /MT:8 multithread; /XJ skip junctions; /SL copy symlinks as links; /FFT tolerant timestamps
$rc = 0
& robocopy $Src $Dst /MIR /XD node_modules .next .next-local .git `
  /ZB /R:3 /W:2 /MT:8 /XJ /SL /FFT /NFL /NDL /NP /LOG:$LogPath
$rc = $LASTEXITCODE

# Robocopy exit codes: 0-7 are OK/acceptable changes; 8+ is failure
if ($rc -ge 8) {
  Write-Host "Robocopy FAILED with exit code $rc. See log: $LogPath" -ForegroundColor Red
  exit 1
} else {
  Write-Host "==> Copy completed with exit code $rc (OK). Log: $LogPath" -ForegroundColor Green
}

# Clean any stale build artifacts at destination
Write-Host "==> Cleaning build artifacts at destination..." -ForegroundColor Cyan
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue `
  (Join-Path $Dst 'node_modules'),
  (Join-Path $Dst '.next'),
  (Join-Path $Dst '.next-local')

# Install dependencies (prefer npm ci if lockfile is present)
Set-Location $Dst
if (Test-Path (Join-Path $Dst 'package-lock.json')) {
  Write-Host "==> Running npm ci (lockfile present)..." -ForegroundColor Cyan
  npm ci
} else {
  Write-Host "==> Running npm install..." -ForegroundColor Cyan
  npm install
}

# Start dev server in a NEW terminal window so this script can continue to verify
Write-Host "==> Starting dev server in a new window (npm run dev)..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -WorkingDirectory $Dst -ArgumentList "/k","npm run dev" | Out-Null

# Wait for the server to respond on http://localhost:3000
Write-Host "==> Waiting for http://localhost:3000 to respond (up to $MaxWait seconds)..." -ForegroundColor Cyan
$ok = $false
$elapsed = 0
while (-not $ok -and $elapsed -lt $MaxWait) {
  Start-Sleep -Seconds $PollInt
  $elapsed += $PollInt
  try {
    $resp = Invoke-WebRequest 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
      $ok = $true
      break
    }
  } catch {
    # ignore until timeout
  }
}

if ($ok) {
  Write-Host "==> SUCCESS: Dev server is responding. Opening browser..." -ForegroundColor Green
  Start-Process "http://localhost:3000"
  Write-Host "All set. You are now running OUTSIDE OneDrive: $Dst" -ForegroundColor Green
  Write-Host "Tip: work only here going forward to avoid OneDrive locks." -ForegroundColor DarkGray
} else {
  Write-Host "!! WARNING: Dev server did not respond within $MaxWait seconds." -ForegroundColor Yellow
  Write-Host "   - Check the new terminal window for build output/errors." -ForegroundColor Yellow
  Write-Host "   - Then manually open: http://localhost:3000" -ForegroundColor Yellow
  exit 2
}

