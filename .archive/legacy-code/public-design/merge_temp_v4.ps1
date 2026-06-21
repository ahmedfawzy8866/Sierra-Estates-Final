$src = 'F:\Final\temp_clone2'
$dst = 'F:\Final'

# Copy files, creating parent directories as needed and renaming on conflict
Get-ChildItem -Path $src -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($src.Length).TrimStart('\\')
    $destPath = Join-Path $dst $relative
    if (Test-Path $destPath) {
        $destPath = $destPath + '_temp'
    }
    # Ensure the parent directory exists
    $parent = Split-Path $destPath -Parent
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    Copy-Item -LiteralPath $_.FullName -Destination $destPath -Force
}
