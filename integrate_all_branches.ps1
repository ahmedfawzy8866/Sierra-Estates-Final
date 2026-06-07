$targetFrontend = "I:\28-5 Si\frontend-vercel"
$targetBackend = "I:\28-5 Si\firebase-backend"

$sourceRepos = @(
    "I:\Sierra 2031",
    "I:\Identity\Sierra Estatese",
    "I:\sierrs 2030\Sierra 2027",
    "I:\sierrs 2030\Sierra Estatese",
    "I:\sierrs 2030\Sierra-Engine",
    "I:\sierrs 2030\sierrablu-core-engine",
    "H:\sierra-final\Sierra Estatese SaaS Program Locally V2",
    "F:\allll\sierra-estates-unified",
    "F:\allll\Sierra_Blu_Master",
    "F:\allll\project 555\my-sierra-project",
    "C:\Users\sierr\Sierra-Blu-Systm",
    "C:\Users\sierr\i-sierra-2027"
)

$folders = @("app", "components", "lib", "public", "styles", "hooks", "utils", "agents", "services", "store", "context", "config", "types", "documents", "models")

function Merge-Directory {
    param([string]$Source, [string]$Destination)
    if (Test-Path $Source) {
        Write-Host "Copying $Source -> $Destination"
        if (!(Test-Path $Destination)) {
            New-Item -ItemType Directory -Force -Path $Destination | Out-Null
        }
        Copy-Item -Path "$Source\*" -Destination $Destination -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Ingest-Repo-State {
    param([string]$repo)
    Write-Host "Ingesting folders from $repo..."
    # 1. Merge typical Next.js folders
    foreach ($folder in $folders) {
        Merge-Directory -Source "$repo\$folder" -Destination "$targetFrontend\$folder"
    }
    # 2. Merge Firebase backend source code
    Merge-Directory -Source "$repo\functions\src" -Destination "$targetBackend\functions\src"
}

foreach ($repo in $sourceRepos) {
    if (!(Test-Path $repo)) {
        Write-Host "Repo not found: $repo"
        continue
    }

    Write-Host "========================================"
    Write-Host "Processing Repo: $repo"

    $isGit = Test-Path "$repo\.git"
    if ($isGit) {
        # Get active branch
        $activeBranch = (git -C $repo branch --show-current).Trim()
        Write-Host "Active branch is: $activeBranch"

        # Get all local branches
        $branchesOutput = git -C $repo branch | ForEach-Object { $_.Trim().TrimStart('*').Trim() }
        $branches = @($branchesOutput) | Where-Object { $_ -ne "" }

        Write-Host "Found branches: $($branches -join ', ')"

        # Sort branches: non-main branches first, main/master last
        $mainBranches = @("main", "master")
        $nonMainBranches = $branches | Where-Object { $mainBranches -notcontains $_ }
        $mainBranchesToProcess = $branches | Where-Object { $mainBranches -contains $_ }

        # Process experimental/non-main branches first
        foreach ($branch in $nonMainBranches) {
            Write-Host "Switching to experimental branch: $branch"
            git -C $repo checkout $branch -f | Out-Null
            Ingest-Repo-State -repo $repo
        }

        # Process main/master branches last to overwrite with authoritative code
        foreach ($branch in $mainBranchesToProcess) {
            Write-Host "Switching to main branch: $branch"
            git -C $repo checkout $branch -f | Out-Null
            Ingest-Repo-State -repo $repo
        }

        # Restore active branch
        Write-Host "Restoring original branch: $activeBranch"
        git -C $repo checkout $activeBranch -f | Out-Null
    } else {
        # Non-Git directory, just copy directly
        Ingest-Repo-State -repo $repo
    }
}

Write-Host "Branch-aware integration completed successfully!"
