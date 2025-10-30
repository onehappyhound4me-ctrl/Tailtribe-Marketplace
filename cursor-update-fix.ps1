# ============================================
# CURSOR UPDATE FIX SCRIPT
# ============================================
# Dit script stopt alle Cursor processen en bereidt de update voor

Write-Host "=== CURSOR UPDATE FIX ===" -ForegroundColor Cyan
Write-Host ""

# Stap 1: Stop alle Cursor processen
Write-Host "[1/4] Stoppen van alle Cursor processen..." -ForegroundColor Yellow
try {
    Get-Process -Name "Cursor" -ErrorAction Stop | Stop-Process -Force
    Write-Host "[OK] Cursor processen gestopt" -ForegroundColor Green
}
catch {
    Write-Host "[INFO] Geen Cursor processen gevonden (dit is OK)" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Stap 2: Verwijder update cache
Write-Host "[2/4] Verwijderen van update cache..." -ForegroundColor Yellow
$updateCache = "$env:LOCALAPPDATA\cursor-updater"
if (Test-Path $updateCache) {
    Remove-Item -Recurse -Force $updateCache
    Write-Host "[OK] Update cache verwijderd" -ForegroundColor Green
}
else {
    Write-Host "[INFO] Geen update cache gevonden" -ForegroundColor Gray
}

# Stap 3: Maak exclusies voor Windows Defender
Write-Host "[3/4] Toevoegen van Windows Defender exclusies..." -ForegroundColor Yellow
try {
    Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\Programs\cursor" -ErrorAction Stop
    Add-MpPreference -ExclusionProcess "Cursor.exe" -ErrorAction Stop
    Write-Host "[OK] Windows Defender exclusies toegevoegd" -ForegroundColor Green
}
catch {
    Write-Host "[WAARSCHUWING] Kon geen Windows Defender exclusies toevoegen" -ForegroundColor Yellow
    Write-Host "  Mogelijk niet voldoende rechten of Norton neemt over" -ForegroundColor Gray
}

# Stap 4: Instructies voor Norton
Write-Host "[4/4] Norton instructies..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  BELANGRIJK: SCHAKEL NORTON UIT" -ForegroundColor Red
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Klik rechts onderaan op het Norton icoon" -ForegroundColor White
Write-Host "2. Ga naar Settings (tandwiel)" -ForegroundColor White
Write-Host "3. Ga naar Antivirus" -ForegroundColor White
Write-Host "4. Zet Auto-Protect op OFF voor 15 minuten" -ForegroundColor White
Write-Host ""
Write-Host "5. Start daarna Cursor opnieuw op" -ForegroundColor Green
Write-Host "6. De update zou nu moeten werken!" -ForegroundColor Green
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Wacht op gebruiker
Write-Host "Druk op een toets als je Norton hebt uitgeschakeld..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "[OK] Klaar! Start nu Cursor opnieuw op." -ForegroundColor Green
Write-Host ""
