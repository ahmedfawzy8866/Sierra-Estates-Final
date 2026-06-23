$src = 'F:\\Final\\temp_clone2\\apps'
$dst = 'F:\\Final\\apps'

# Ensure destination root exists
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

Get-ChildItem -Path $src -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($src.Length).TrimStart('\\')
    $destPath = Join-Path $dst $relative
    if (Test-Path $destPath) {
        $destPath = $destPath + '_temp'
    }
    $parent = Split-Path $destPath -Parent
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    Copy-Item -LiteralPath $_.FullName -Destination $destPath -Force
}
