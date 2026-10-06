$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$appServerScript = Join-Path $PSScriptRoot 'serve.mjs'
$appLogDirectory = Join-Path $appRoot 'tmp'
New-Item -ItemType Directory -Path $appLogDirectory -Force | Out-Null
function Test-AppReady {
    try {
        $appHealth = Invoke-RestMethod -Uri 'http://127.0.0.1:4173/health.json' -TimeoutSec 1
        return ($appHealth.app -eq 'seu-proprio-chefe' -and $appHealth.version -eq 1)
    } catch { return $false }
}
if (Test-AppReady) {
    Write-Output 'App already running at http://localhost:4173'
    exit 0
}
$appPortListener = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
if ($appPortListener) {
    Write-Error 'Port 4173 is already in use by another server. Close that server before starting this app.'
    exit 1
}
$appNodeExecutable = (Get-Command node).Source
$appServerProcess = Start-Process -FilePath $appNodeExecutable -ArgumentList @('"' + $appServerScript + '"') -WorkingDirectory $appRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $appLogDirectory 'server.stdout.log') -RedirectStandardError (Join-Path $appLogDirectory 'server.stderr.log') -PassThru
for ($appAttempt = 0; $appAttempt -lt 50; $appAttempt++) {
    $appServerProcess.Refresh()
    if ($appServerProcess.HasExited) {
        Write-Error ('App could not start. See ' + (Join-Path $appLogDirectory 'server.stderr.log'))
        exit 1
    }
    if (Test-AppReady) {
        $appServerProcess.Id | Set-Content -LiteralPath (Join-Path $appLogDirectory 'server.pid')
        Write-Output ('App running at http://localhost:4173. PID: ' + $appServerProcess.Id)
        exit 0
    }
    Start-Sleep -Milliseconds 100
}
Write-Error 'The app did not become ready. Check the logs in app/tmp.'
exit 1
