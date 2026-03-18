$ErrorActionPreference = "Stop"

$repoRoot = "C:\Users\kai99\Desktop\New folder (12)\windhawk"
$sourceRoot = "C:\Users\kai99\AppData\Local\Programs\Windhawk-Custom-Portable"
$targetRoot = "C:\Program Files\Windhawk"
$backupRoot = Join-Path $repoRoot ("artifacts\backups\programfiles-windhawk-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$logPath = Join-Path $repoRoot "artifacts\installer-build\replace_programfiles_windhawk.log"

function Get-IniValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Section,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $currentSection = $null

    foreach ($line in Get-Content -Path $Path) {
        $trimmedLine = $line.Trim()

        if (-not $trimmedLine -or
            $trimmedLine.StartsWith(';') -or
            $trimmedLine.StartsWith('#')) {
            continue
        }

        if ($trimmedLine -match '^\[(.+)\]$') {
            $currentSection = $matches[1]
            continue
        }

        if ($currentSection -and
            $currentSection.Equals($Section, [System.StringComparison]::OrdinalIgnoreCase) -and
            $trimmedLine -match '^(?<key>[^=]+)=(?<value>.*)$') {
            if ($matches['key'].Trim().Equals($Key, [System.StringComparison]::OrdinalIgnoreCase)) {
                return $matches['value'].Trim()
            }
        }
    }

    return $null
}

function Set-InstalledEngineConfig {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WindhawkIniPath,

        [Parameter(Mandatory = $true)]
        [string]$EngineIniPath
    )

    $portableValue = Get-IniValue -Path $WindhawkIniPath -Section 'Storage' -Key 'Portable'
    if ($portableValue -and $portableValue -ne '0') {
        throw "Target windhawk.ini is configured for portable mode: $WindhawkIniPath"
    }

    $appDataPath = Get-IniValue -Path $WindhawkIniPath -Section 'Storage' -Key 'AppDataPath'
    $registryKey = Get-IniValue -Path $WindhawkIniPath -Section 'Storage' -Key 'RegistryKey'

    if (-not $appDataPath) {
        throw "Target windhawk.ini is missing Storage/AppDataPath: $WindhawkIniPath"
    }

    if (-not $registryKey) {
        throw "Target windhawk.ini is missing Storage/RegistryKey: $WindhawkIniPath"
    }

    $engineAppDataPath = $appDataPath.TrimEnd('\') + '\Engine'
    $engineRegistryKey = $registryKey.TrimEnd('\') + '\Engine'
    $engineIniDirectory = Split-Path -Parent $EngineIniPath

    if (-not (Test-Path $engineIniDirectory)) {
        New-Item -ItemType Directory -Path $engineIniDirectory -Force | Out-Null
    }

    @(
        '[Storage]'
        'Portable=0'
        "AppDataPath=$engineAppDataPath"
        "RegistryKey=$engineRegistryKey"
        ''
    ) | Set-Content -Path $EngineIniPath -Encoding ASCII
}

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

    foreach ($file in @("command-line.txt", "windhawk-x64-helper.exe", "windhawk.exe")) {
        $sourceFile = Join-Path $sourceRoot $file
        if (Test-Path $sourceFile) {
            Copy-Item $sourceFile (Join-Path $targetRoot $file) -Force
        }
    }

    $targetWindhawkIniPath = Join-Path $targetRoot "windhawk.ini"
    if (-not (Test-Path $targetWindhawkIniPath)) {
        throw "Installed target config not found after copy: $targetWindhawkIniPath"
    }

    $engineIniPaths = @(Get-ChildItem -Path (Join-Path $targetRoot "Engine") -Filter "engine.ini" -Recurse -File -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty FullName)

    if ($engineIniPaths.Count -eq 0) {
        $activeEnginePath = Get-IniValue -Path $targetWindhawkIniPath -Section 'Storage' -Key 'EnginePath'
        if (-not $activeEnginePath) {
            throw "Target windhawk.ini is missing Storage/EnginePath: $targetWindhawkIniPath"
        }

        $engineIniPaths = @((Join-Path $targetRoot (Join-Path $activeEnginePath "engine.ini")))
    }

    foreach ($engineIniPath in $engineIniPaths) {
        Set-InstalledEngineConfig -WindhawkIniPath $targetWindhawkIniPath -EngineIniPath $engineIniPath
    }

    Start-Process -FilePath (Join-Path $targetRoot "windhawk.exe") -WorkingDirectory $targetRoot
    Write-Host "Replacement completed successfully."
    Write-Host "Backup: $backupRoot"
} finally {
    Stop-Transcript | Out-Null
}
