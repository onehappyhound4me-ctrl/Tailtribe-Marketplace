# =========================
# Windows Defender Exclusions + Copy Project + Start
# Voer uit als ADMINISTRATOR
# =========================

Write-Host "==> Adding Windows Defender exclusions..." -ForegroundColor Cyan

# Voeg folders toe
Add-MpPreference -ExclusionPath "C:\Users\steve\OneDrive\Desktop\C dev\TailTribe-Final"
Add-MpPreference -ExclusionPath "C:\dev"
Add-MpPreference -ExclusionPath "C:\Program Files\nodejs"

# Voeg processen toe
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "npm.exe"
Add-MpPreference -ExclusionProcess "npx.exe"

Write-Host "==> Windows Defender exclusions added!" -ForegroundColor Green

# Verifieer
Write-Host "==> Current exclusions:" -ForegroundColor Yellow
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath

Write-Host ""
Write-Host "==> Stopping Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "==> Creating C:\dev..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "C:\dev" -Force | Out-Null

Write-Host "==> Copying project to C:\dev\TailTribe-Final (this will take a few minutes)..." -ForegroundColor Cyan
robocopy "C:\Users\steve\OneDrive\Desktop\C dev\TailTribe-Final" "C:\dev\TailTribe-Final" /E /XD node_modules .next .next-local .git /R:1 /W:1 /NFL /NDL

Write-Host "==> Changing to new directory..." -ForegroundColor Cyan
Set-Location "C:\dev\TailTribe-Final"

Write-Host "==> Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "==> Starting dev server..." -ForegroundColor Green
Write-Host "Opening http://localhost:3000 in 15 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
npm run dev

