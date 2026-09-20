$ErrorActionPreference = 'Stop'

if (-not $env:CSC_LINK -or -not $env:CSC_KEY_PASSWORD) {
  throw 'Set CSC_LINK and CSC_KEY_PASSWORD to a trusted Windows code-signing PFX before building a release.'
}

if (-not $env:VIDOGO_ACCOUNT_API_ORIGIN) {
  throw 'Set VIDOGO_ACCOUNT_API_ORIGIN to the production HTTPS account and analytics service origin.'
}
try {
  $serviceUri = [Uri]$env:VIDOGO_ACCOUNT_API_ORIGIN
} catch {
  throw 'VIDOGO_ACCOUNT_API_ORIGIN is not a valid absolute URL.'
}
if (-not $serviceUri.IsAbsoluteUri -or $serviceUri.Scheme -ne 'https' -or $serviceUri.IsLoopback -or $serviceUri.UserInfo) {
  throw 'VIDOGO_ACCOUNT_API_ORIGIN must be a non-loopback HTTPS origin without embedded credentials.'
}

$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$accountConfigPath = Join-Path $root 'config\account-service.json'
$originalAccountConfig = [IO.File]::ReadAllText($accountConfigPath)
$utf8WithoutBom = [Text.UTF8Encoding]::new($false)
$productionAccountConfig = @{ apiOrigin = $serviceUri.GetLeftPart([UriPartial]::Authority) } | ConvertTo-Json

try {
  [IO.File]::WriteAllText($accountConfigPath, "$productionAccountConfig`n", $utf8WithoutBom)
  npm run dist:win -- --publish never
  if ($LASTEXITCODE -ne 0) { throw 'Signed installer build failed.' }

  $version = (Get-Content -LiteralPath (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
  $targets = @(
    (Join-Path $root 'dist\win-unpacked\VidoGo Basic.exe'),
    (Join-Path $root "dist\VidoGo-Basic-$version-x64-Setup.exe")
  )
  foreach ($target in $targets) {
    $resolved = (Resolve-Path -LiteralPath $target).Path
    $signature = Get-AuthenticodeSignature -LiteralPath $resolved
    if ($signature.Status -ne 'Valid') { throw "Invalid or missing Authenticode signature: $resolved ($($signature.Status))" }
  }

  Write-Host "Signed VidoGo Basic $version release verified with account service $($serviceUri.GetLeftPart([UriPartial]::Authority))."
} finally {
  [IO.File]::WriteAllText($accountConfigPath, $originalAccountConfig, $utf8WithoutBom)
}
