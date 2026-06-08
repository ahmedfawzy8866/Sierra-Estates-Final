$targetFrontend = "I:\28-5 Si\frontend-vercel"
$targetBackend = "I:\28-5 Si\firebase-backend"

$sourceRepos = @(
    "I:\Sierra 2031",
    "I:\Identity\Sierra Estatese",
    "I:\sierrs 2030\Sierra 2027",
    "I:\sierrs 2030\Sierra Estatese",
    "I:\sierrs 2030\Sierra-Engine",
    "I:\sierrs 2030\sierraestates-core-engine",
    "H:\sierra-final\Sierra Estatese SaaS Program Locally V2",
    "F:\allll\sierra-estates-unified",
    "F:\allll\sierra_estates_Master",
    "F:\allll\project 555\my-sierra-project",
    "C:\Users\sierr\Sierra-Blu-Systm"
)

function Merge-Directory {
    param([string]$Source, [string]$Destination)
    if (Test-Path $Source) {
        Write-Host "Merging $Source -> $Destination"
        if (!(Test-Path $Destination)) {
            New-Item -ItemType Directory -Force -Path $Destination | Out-Null
        }
        Copy-Item -Path "$Source\*" -Destination $Destination -Recurse -Force -ErrorAction SilentlyContinue
    }
}

foreach ($repo in $sourceRepos) {
    if (Test-Path $repo) {
        Write-Host "Processing Repo: $repo"
        
        # 1. Merge Next.js Frontend typical folders
        Merge-Directory -Source "$repo\app" -Destination "$targetFrontend\app"
        Merge-Directory -Source "$repo\components" -Destination "$targetFrontend\components"
        Merge-Directory -Source "$repo\lib" -Destination "$targetFrontend\lib"
        Merge-Directory -Source "$repo\public" -Destination "$targetFrontend\public"
        Merge-Directory -Source "$repo\styles" -Destination "$targetFrontend\styles"
        Merge-Directory -Source "$repo\hooks" -Destination "$targetFrontend\hooks"
        Merge-Directory -Source "$repo\utils" -Destination "$targetFrontend\utils"
        Merge-Directory -Source "$repo\agents" -Destination "$targetFrontend\agents"
        Merge-Directory -Source "$repo\services" -Destination "$targetFrontend\services"
        Merge-Directory -Source "$repo\store" -Destination "$targetFrontend\store"
        Merge-Directory -Source "$repo\context" -Destination "$targetFrontend\context"
        Merge-Directory -Source "$repo\config" -Destination "$targetFrontend\config"
        Merge-Directory -Source "$repo\types" -Destination "$targetFrontend\types"
        Merge-Directory -Source "$repo\documents" -Destination "$targetFrontend\documents"
        Merge-Directory -Source "$repo\models" -Destination "$targetFrontend\models"

        # 2. Merge Backend (Firebase)
        Merge-Directory -Source "$repo\functions\src" -Destination "$targetBackend\functions\src"
    } else {
        Write-Host "Repo not found: $repo"
    }
}

Write-Host "Integration Complete!"
