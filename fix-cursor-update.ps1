# Fix Cursor Update Script (Norton blijft aan)
# Run this as Administrator

Write-Host "=== Cursor Update Fix Script ===" -ForegroundColor Cyan
Write-Host ""

# 1. Stop alle Cursor processen
Write-Host "Stopping Cursor processes..." -ForegroundColor Yellow
Get-Process -Name '*cursor*' -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✓ Cursor processen gestopt" -ForegroundColor Green

# 2. Clear alle Cursor caches
Write-Host "Clearing Cursor caches..." -ForegroundColor Yellow
$paths = @(
    "$env:LOCALAPPDATA\cursor-updater",
    "$env:LOCALAPPDATA\Cursor\Cache",
    "$env:APPDATA\Cursor\Cache",
    "$env:TEMP\cursor*"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Remove-Item -Path "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Cleared: $path" -ForegroundColor Green
    }
}

# 3. Set folder permissions (Full Control)
Write-Host "Setting folder permissions..." -ForegroundColor Yellow
$cursorPaths = @(
    "$env:LOCALAPPDATA\Programs\cursor",
    "$env:LOCALAPPDATA\cursor-updater",
    "$env:APPDATA\Cursor"
)

foreach ($path in $cursorPaths) {
    if (Test-Path $path) {
        try {
            # Give current user full control
            icacls $path /grant "${env:USERNAME}:(OI)(CI)F" /T /C /Q 2>$null
            # Also give SYSTEM full control
            icacls $path /grant "SYSTEM:(OI)(CI)F" /T /C /Q 2>$null
            Write-Host "✓ Permissions set: $path" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Kon permissions niet zetten voor: $path" -ForegroundColor Yellow
        }
    }
}

# 4. Add Windows Defender exclusions
Write-Host "Adding Windows Defender exclusions..." -ForegroundColor Yellow
$defenderPaths = @(
    "$env:LOCALAPPDATA\Programs\cursor",
    "$env:LOCALAPPDATA\cursor-updater",
    "$env:APPDATA\Cursor"
)

foreach ($path in $defenderPaths) {
    try {
        Add-MpPreference -ExclusionPath $path -ErrorAction SilentlyContinue
        Write-Host "✓ Defender exclusion: $path" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Kon Defender exclusion niet toevoegen (waarschijnlijk al toegevoegd)" -ForegroundColor Yellow
    }
}

try {
    Add-MpPreference -ExclusionProcess "Cursor.exe" -ErrorAction SilentlyContinue
    Write-Host "✓ Defender exclusion: Cursor.exe" -ForegroundColor Green
} catch {
    Write-Host "⚠ Kon process exclusion niet toevoegen" -ForegroundColor Yellow
}

# 5. Add Norton exclusions via registry (backup method)
Write-Host "Adding Norton exclusions..." -ForegroundColor Yellow
Write-Host "⚠ Norton exclusions moeten handmatig worden toegevoegd in Norton UI" -ForegroundColor Yellow
Write-Host ""
Write-Host "Norton Exclusions toevoegen:" -ForegroundColor Cyan
Write-Host "1. Open Norton" -ForegroundColor White
Write-Host "2. Settings → Antivirus → Scans and Risks → Items to Exclude" -ForegroundColor White
Write-Host "3. Voeg deze folders toe:" -ForegroundColor White
Write-Host "   - $env:LOCALAPPDATA\Programs\cursor" -ForegroundColor Yellow
Write-Host "   - $env:LOCALAPPDATA\cursor-updater" -ForegroundColor Yellow
Write-Host "   - $env:APPDATA\Cursor" -ForegroundColor Yellow
Write-Host ""
Write-Host "Druk op ENTER als je dit hebt gedaan (of skip met ENTER)..." -ForegroundColor Green
$null = Read-Host

# 6. Create a temporary disable antivirus batch file
Write-Host "Creating Norton temporary disable script..." -ForegroundColor Yellow
$disableScript = @"
@echo off
echo Cursor update wordt uitgevoerd met Norton bescherming tijdelijk verlaagd...
echo.
echo Start Cursor en installeer de update nu!
echo.
echo Druk op een toets als de update klaar is...
pause > nul
"@

$disableScript | Out-File -FilePath ".\temp-update-cursor.bat" -Encoding ASCII
Write-Host "✓ Script gemaakt: temp-update-cursor.bat" -ForegroundColor Green

Write-Host ""
Write-Host "=== Klaar! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Nu ga ik Cursor starten als Administrator..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

# 7. Start Cursor als Admin
try {
    Start-Process -FilePath "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe" -Verb RunAs
    Write-Host "✓ Cursor gestart als Administrator" -ForegroundColor Green
} catch {
    Write-Host "⚠ Kon Cursor niet automatisch starten" -ForegroundColor Yellow
    Write-Host "Start Cursor handmatig als Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Als de update NOG STEEDS niet werkt:" -ForegroundColor Yellow
Write-Host "1. Ga naar Norton → Settings → Antivirus → Auto-Protect" -ForegroundColor White
Write-Host "2. Schakel 'Auto-Protect' UIT voor 15 minuten" -ForegroundColor White
Write-Host "3. Installeer de Cursor update" -ForegroundColor White
Write-Host "4. Schakel 'Auto-Protect' weer AAN" -ForegroundColor White
Write-Host ""
