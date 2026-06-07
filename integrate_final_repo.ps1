$targetFrontend = "I:\28-5 Si\frontend-vercel"
$targetBackend = "I:\28-5 Si\firebase-backend"

$sourceRepos = @(
    "C:\Users\sierr\i-sierra-2027"
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
