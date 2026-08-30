$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$iconSet = Join-Path $projectRoot 'assets\app-icons'
$pngSource = Join-Path $iconSet 'video_downloader_icon_1024x1024.png'
$icoSource = Join-Path $iconSet 'video_downloader_icon.ico'
$source = Join-Path $projectRoot 'assets\app-icon.png'
$destination = Join-Path $projectRoot 'assets\app-icon.ico'
if (-not (Test-Path -LiteralPath $pngSource)) {
  throw 'The 1024px VidoGo application icon is missing.'
}
if (-not (Test-Path -LiteralPath $icoSource)) {
  throw 'The multi-size Windows VidoGo icon is missing.'
}
Copy-Item -LiteralPath $pngSource -Destination $source -Force
Copy-Item -LiteralPath $icoSource -Destination $destination -Force
$icon = Get-Item -LiteralPath $destination
Write-Output "Prepared official VidoGo icon set: $($icon.FullName) ($($icon.Length) bytes)"
