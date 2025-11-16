# TailTribe Auto-Deploy Script
# Controleert en pusht automatisch wijzigingen naar GitHub

param(
    [string]$Message = "Auto-deploy: Code changes",
    [switch]$SkipBuild = $false
)

Write-Host "=== TAILTRIBE AUTO-DEPLOY ===" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Geen Git repository gevonden!" -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Huidige branch: $currentBranch" -ForegroundColor Cyan

# Check for uncommitted changes
Write-Host "`n1. Controleren op uncommitted wijzigingen..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "   ✓ Uncommitted wijzigingen gevonden" -ForegroundColor Green
    Write-Host "   Bestanden:" -ForegroundColor Gray
    $status | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    
    # Stage all changes
    Write-Host "`n2. Wijzigingen stagen..." -ForegroundColor Yellow
    git add .
    
    # Commit changes
    Write-Host "3. Committen naar Git..." -ForegroundColor Yellow
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ Commit gefaald!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ Gecommit" -ForegroundColor Green
} else {
    Write-Host "   ✓ Geen uncommitted wijzigingen" -ForegroundColor Green
}

# Check for unpushed commits
Write-Host "`n4. Controleren op unpushed commits..." -ForegroundColor Yellow
$unpushed = git log origin/$currentBranch..HEAD --oneline
if ($unpushed) {
    Write-Host "   ✓ Unpushed commits gevonden" -ForegroundColor Green
    Write-Host "   Commits:" -ForegroundColor Gray
    $unpushed | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    
    # Push to GitHub
    Write-Host "`n5. Pushen naar GitHub..." -ForegroundColor Yellow
    git push origin $currentBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ Push gefaald!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ Gepusht naar GitHub" -ForegroundColor Green
    Write-Host "`n   🚀 Vercel zal automatisch deployen..." -ForegroundColor Cyan
    Write-Host "   Check status: https://vercel.com/dashboard" -ForegroundColor Gray
} else {
    Write-Host "   ✓ Geen unpushed commits" -ForegroundColor Green
}

# Optional: Run build check
if (-not $SkipBuild) {
    Write-Host "`n6. Build check uitvoeren..." -ForegroundColor Yellow
    npm run build 2>&1 | Select-String -Pattern "error|Error|failed|Failed" -CaseSensitive:$false | Select-Object -First 5
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Build succesvol" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Build heeft warnings/errors (check output hierboven)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== KLAAR ===" -ForegroundColor Green
Write-Host "Alle wijzigingen zijn gecommit en gepusht naar GitHub." -ForegroundColor Cyan
Write-Host "Vercel zal automatisch een nieuwe deployment starten." -ForegroundColor Cyan


