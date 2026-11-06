param(
    [string]$OutputPath = (Join-Path $PSScriptRoot 'LongMarchServer.exe')
)

$ErrorActionPreference = 'Stop'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$source = Join-Path $PSScriptRoot 'LongMarchServer.cs'
$manifest = Join-Path $PSScriptRoot 'LongMarchServer.manifest'

if (-not (Test-Path -LiteralPath $csc)) { throw '.NET Framework C# compiler not found.' }
if (-not (Test-Path -LiteralPath $source)) { throw 'Missing tools/LongMarchServer.cs' }
if (-not (Test-Path -LiteralPath $manifest)) { throw 'Missing tools/LongMarchServer.manifest' }

& $csc /nologo /target:winexe /platform:anycpu /optimize+ `
    "/out:$OutputPath" "/win32manifest:$manifest" `
    /r:System.Web.Extensions.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll `
    $source

if ($LASTEXITCODE -ne 0) { throw "Server build failed: $LASTEXITCODE" }
Write-Host "Build completed: $OutputPath"
