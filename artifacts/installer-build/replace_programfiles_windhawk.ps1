$ErrorActionPreference = "Stop"

$repoRoot = "C:\Users\kai99\Desktop\New folder (12)\windhawk"
$sourceRoot = "C:\Users\kai99\AppData\Local\Programs\Windhawk-Custom-Portable"
$targetRoot = "C:\Program Files\Windhawk"
$backupRoot = Join-Path $repoRoot ("artifacts\backups\programfiles-windhawk-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$logPath = Join-Path $repoRoot "artifacts\installer-build\replace_programfiles_windhawk.log"

Start-Transcript -Path $logPath -Force | Out-Null

try {
    if (-not (Test-Path $sourceRoot)) {
        throw "Source install not found: $sourceRoot"
    }

    if (-not (Test-Path $targetRoot)) {
        throw "Target install not found: $targetRoot"
    }

    Get-Process windhawk -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Write-Warning ("Could not stop PID {0}: {1}" -f $_.Id, $_.Exception.Message)
        }
    }

    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

    & robocopy $targetRoot $backupRoot /E /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "Backup robocopy failed with exit code $LASTEXITCODE"
    }

    foreach ($dir in @("Compiler", "Engine", "UI")) {
        & robocopy (Join-Path $sourceRoot $dir) (Join-Path $targetRoot $dir) /MIR /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
        if ($LASTEXITCODE -ge 8) {
            throw "Mirror robocopy failed for $dir with exit code $LASTEXITCODE"
        }
    }

    foreach ($file in @("command-line.txt", "windhawk-x64-helper.exe", "windhawk.exe", "windhawk.ini")) {
        Copy-Item (Join-Path $sourceRoot $file) (Join-Path $targetRoot $file) -Force
    }

    Start-Process -FilePath (Join-Path $targetRoot "windhawk.exe") -WorkingDirectory $targetRoot
    Write-Host "Replacement completed successfully."
    Write-Host "Backup: $backupRoot"
} finally {
    Stop-Transcript | Out-Null
}
