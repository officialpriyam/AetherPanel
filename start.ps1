Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ApiHost = if ($env:AETHERPANEL_API_HOST) { $env:AETHERPANEL_API_HOST } else { 'localhost' }
$ApiPort = if ($env:AETHERPANEL_API_PORT) { $env:AETHERPANEL_API_PORT } else { '8080' }
$FrontendPort = if ($env:AETHERPANEL_FRONTEND_PORT) { $env:AETHERPANEL_FRONTEND_PORT } else { '3000' }

$backendCommand = "Set-Location '$Root\\backend'; php artisan serve --host=$ApiHost --port=$ApiPort"
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCommand | Out-Null

Write-Host "Backend started on http://$ApiHost`:$ApiPort"
Set-Location (Join-Path $Root 'frontend')
yarn dev --port $FrontendPort
