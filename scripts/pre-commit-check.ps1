# TailTribe Pre-Commit Check Script
# Controleert of alles in sync is voordat wijzigingen worden gemaakt

Write-Host "=== PRE-COMMIT CHECK ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Geen Git repository gevonden!" -ForegroundColor Red
    exit 1
}

$hasIssues = $false

# Check for uncommitted changes
Write-Host "1. Controleren op uncommitted wijzigingen..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "   ⚠ Uncommitted wijzigingen gevonden!" -ForegroundColor Yellow
    Write-Host "   Deze moeten eerst gecommit worden:" -ForegroundColor Gray
    $status | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    $hasIssues = $true
} else {
    Write-Host "   ✓ Geen uncommitted wijzigingen" -ForegroundColor Green
}

# Check for unpushed commits
Write-Host "`n2. Controleren op unpushed commits..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
$unpushed = git log origin/$currentBranch..HEAD --oneline
if ($unpushed) {
    Write-Host "   ⚠ Unpushed commits gevonden!" -ForegroundColor Yellow
    Write-Host "   Deze moeten eerst gepusht worden:" -ForegroundColor Gray
    $unpushed | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    $hasIssues = $true
} else {
    Write-Host "   ✓ Geen unpushed commits" -ForegroundColor Green
}

# Check if branch is up to date
Write-Host "`n3. Controleren of branch up-to-date is..." -ForegroundColor Yellow
git fetch origin $currentBranch --quiet 2>&1 | Out-Null
$behind = git rev-list --count HEAD..origin/$currentBranch 2>&1
if ($behind -and $behind -ne "0") {
    Write-Host "   ⚠ Branch is achter op remote!" -ForegroundColor Yellow
    Write-Host "   Pull eerst: git pull origin $currentBranch" -ForegroundColor Gray
    $hasIssues = $true
} else {
    Write-Host "   ✓ Branch is up-to-date" -ForegroundColor Green
}

Write-Host ""

if ($hasIssues) {
    Write-Host "⚠ WAARSCHUWING: Er zijn uncommitted/unpushed wijzigingen!" -ForegroundColor Yellow
    Write-Host "Run 'npm run deploy' om alles automatisch te committen en pushen." -ForegroundColor Cyan
    Write-Host ""
    exit 1
} else {
    Write-Host "✓ Alles is in sync - klaar voor nieuwe wijzigingen!" -ForegroundColor Green
    Write-Host ""
    exit 0
}

