$src = 'F:\Final\temp_clone2'
$dst = 'F:\Final'

# Ensure all destination directories exist (rename on conflict)
Get-ChildItem -Path $src -Directory -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($src.Length).TrimStart('\\')
    $destPath = Join-Path $dst $relative
    if (Test-Path $destPath) {
        $destPath = $destPath + '_temp'
    }
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
}

# Copy files, renaming on conflict
Get-ChildItem -Path $src -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($src.Length).TrimStart('\\')
    $destPath = Join-Path $dst $relative
    if (Test-Path $destPath) {
        $destPath = $destPath + '_temp'
    }
    Copy-Item -LiteralPath $_.FullName -Destination $destPath -Force
}
