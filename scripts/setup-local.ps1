# Sierra Estates — Local Setup Script (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    SIERRA ESTATES — LOCAL SETUP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check for pnpm
Write-Host "[1/5] Checking for pnpm..." -ForegroundColor Yellow
$pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
if ($null -eq $pnpmCheck) {
    Write-Host "❌ pnpm is not installed. Please run: npm install -g pnpm" -ForegroundColor Red
    exit 1
}
Write-Host "✅ pnpm detected: $($pnpmCheck.Source)" -ForegroundColor Green

# 2. Check for Docker
Write-Host ""
Write-Host "[2/5] Checking if Docker Desktop is running..." -ForegroundColor Yellow
$dockerCheck = Get-Process docker -ErrorAction SilentlyContinue
if ($null -eq $dockerCheck) {
    Write-Host "⚠️  Docker is not running. n8n workflow engine won't start automatically." -ForegroundColor Magenta
    Write-Host "👉 Please launch Docker Desktop if you plan to self-host n8n." -ForegroundColor Gray
} else {
    Write-Host "✅ Docker Desktop is running!" -ForegroundColor Green
}

# 3. Environment check
Write-Host ""
Write-Host "[3/5] Verifying environment configurations..." -ForegroundColor Yellow
$envPath = "apps/vercel-app/.env.local"
if (Test-Path $envPath) {
    Write-Host "✅ apps/vercel-app/.env.local found!" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found. Copying from .env.local.example..." -ForegroundColor Magenta
    Copy-Item "apps/vercel-app/.env.local.example" $envPath
    Write-Host "👉 Created apps/vercel-app/.env.local. Please enter your Firebase and API keys." -ForegroundColor Gray
}

# 4. Install dependencies
Write-Host ""
Write-Host "[4/5] Installing monorepo dependencies (pnpm install)..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# 5. Provide launch commands
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " ✅ SIERRA ESTATES IS READY FOR LOCAL DEVELOPMENT!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two-App Architecture:" -ForegroundColor Cyan
Write-Host "  Vercel App (public + dashboard):  pnpm dev:vercel" -ForegroundColor Yellow
Write-Host "  Firebase Admin (bots + workflows): pnpm dev:admin" -ForegroundColor Yellow
Write-Host "  Both at once:                      pnpm dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Self-hosted n8n:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.n8n.yml up -d" -ForegroundColor Yellow
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Public site:    http://localhost:3000" -ForegroundColor Gray
Write-Host "  n8n Dashboard:  http://localhost:5678" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green
