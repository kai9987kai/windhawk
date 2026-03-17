param(
    [string]$RepoRoot = "C:\Users\kai99\Desktop\New folder (12)\windhawk",
    [string]$BasePortableRoot = "$env:LOCALAPPDATA\Programs\Windhawk-Custom-Portable",
    [string]$OutputInstallerPath = (Join-Path "C:\Users\kai99\Desktop\New folder (12)\windhawk" "artifacts\windhawk-custom-portable-installer.exe"),
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    Write-Host "==> $Message"
    & $Action
}

function Invoke-RobocopyMirror {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Source,

        [Parameter(Mandatory = $true)]
        [string]$Destination
    )

    if (-not (Test-Path $Source)) {
        throw "Missing source path: $Source"
    }

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    & robocopy $Source $Destination /MIR /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy mirror failed for $Source -> $Destination with exit code $LASTEXITCODE"
    }
}

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

function Set-PortableAppConfig {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WindhawkIniPath,

        [Parameter(Mandatory = $true)]
        [string]$EngineRelativePath
    )

    @(
        '[Storage]'
        'Portable=1'
        'CompilerPath=Compiler'
        "EnginePath=$EngineRelativePath"
        'UIPath=UI'
        'AppDataPath=Data'
        ''
    ) | Set-Content -Path $WindhawkIniPath -Encoding ASCII
}

function Set-PortableEngineConfig {
    param(
        [Parameter(Mandatory = $true)]
        [string]$StagingRoot,

        [Parameter(Mandatory = $true)]
        [string]$EngineRelativePath
    )

    $engineRootPath = Join-Path $StagingRoot $EngineRelativePath
    $engineIniPath = Join-Path $engineRootPath "engine.ini"
    $engineDataPath = Join-Path $StagingRoot "Data\Engine"
    $relativeEngineDataPath = Get-RelativePath -FromPath $engineRootPath -ToPath $engineDataPath

    New-Item -ItemType Directory -Path $engineRootPath -Force | Out-Null
    New-Item -ItemType Directory -Path $engineDataPath -Force | Out-Null

    @(
        '[Storage]'
        'Portable=1'
        "AppDataPath=$relativeEngineDataPath"
        ''
    ) | Set-Content -Path $engineIniPath -Encoding ASCII
}

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FromPath,

        [Parameter(Mandatory = $true)]
        [string]$ToPath
    )

    $normalizedFromPath = [System.IO.Path]::GetFullPath($FromPath).TrimEnd('\') + '\'
    $normalizedToPath = [System.IO.Path]::GetFullPath($ToPath)
    $fromUri = New-Object System.Uri($normalizedFromPath)
    $toUri = New-Object System.Uri($normalizedToPath)
    $relativeUri = $fromUri.MakeRelativeUri($toUri)

    return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace('/', '\')
}

function Get-CSharpCompilerPath {
    $command = Get-Command csc.exe -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $candidates = @(
        (Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'),
        (Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe')
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw "csc.exe not found"
}

function Copy-OptionalFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Source,

        [Parameter(Mandatory = $true)]
        [string]$Destination
    )

    if (-not (Test-Path $Source)) {
        return $false
    }

    $destinationDirectory = Split-Path -Parent $Destination
    if ($destinationDirectory) {
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    }

    Copy-Item -Path $Source -Destination $Destination -Force
    return $true
}

$stagingRoot = Join-Path $RepoRoot "artifacts\portable-build\staging"
$payloadZipPath = Join-Path $RepoRoot "artifacts\portable-build\windhawk-custom-portable.zip"
$installerBuildRoot = Join-Path $RepoRoot "artifacts\portable-build"
$extensionRepoRoot = Join-Path $RepoRoot "src\vscode-windhawk"
$webviewRepoRoot = Join-Path $RepoRoot "src\vscode-windhawk-ui"
$portableAppConfigPath = Join-Path $BasePortableRoot "windhawk.ini"
$extensionTargetRoot = Join-Path $stagingRoot "UI\resources\app\extensions\windhawk"

if (-not (Test-Path $BasePortableRoot)) {
    throw "Portable baseline not found: $BasePortableRoot"
}

if (-not (Test-Path $portableAppConfigPath)) {
    throw "Portable baseline config not found: $portableAppConfigPath"
}

$engineRelativePath = Get-IniValue -Path $portableAppConfigPath -Section 'Storage' -Key 'EnginePath'
if (-not $engineRelativePath) {
    throw "Portable baseline is missing Storage/EnginePath: $portableAppConfigPath"
}

if (Test-Path $installerBuildRoot) {
    Remove-Item -Path $installerBuildRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $installerBuildRoot -Force | Out-Null

if (-not $SkipBuild) {
    Invoke-Step -Message "Build webview UI" -Action {
        Push-Location $webviewRepoRoot
        try {
            & npx nx build vscode-windhawk-ui
            if ($LASTEXITCODE -ne 0) {
                throw "nx build failed with exit code $LASTEXITCODE"
            }

            Invoke-RobocopyMirror `
                -Source (Join-Path $webviewRepoRoot "dist\apps\vscode-windhawk-ui") `
                -Destination (Join-Path $extensionRepoRoot "webview")
        } finally {
            Pop-Location
        }
    }

    Invoke-Step -Message "Bundle VS Code extension" -Action {
        Push-Location $extensionRepoRoot
        try {
            & npx webpack --mode production
            if ($LASTEXITCODE -ne 0) {
                throw "webpack build failed with exit code $LASTEXITCODE"
            }
        } finally {
            Pop-Location
        }
    }
}

Invoke-Step -Message "Stage portable baseline" -Action {
    Invoke-RobocopyMirror -Source $BasePortableRoot -Destination $stagingRoot
}

Invoke-Step -Message "Overlay updated extension assets" -Action {
    foreach ($directory in @('assets', 'dist', 'files', 'prebuilds', 'syntaxes', 'webview')) {
        Invoke-RobocopyMirror `
            -Source (Join-Path $extensionRepoRoot $directory) `
            -Destination (Join-Path $extensionTargetRoot $directory)
    }

    foreach ($file in @('package.json', 'package.nls.json', 'README.md')) {
        $sourceFile = Join-Path $extensionRepoRoot $file
        $destinationFile = Join-Path $extensionTargetRoot $file
        Copy-OptionalFile -Source $sourceFile -Destination $destinationFile | Out-Null
    }
}

Invoke-Step -Message "Overlay built native binaries when available" -Action {
    $nativeCopies = @(
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\windhawk.exe')
            Destination = (Join-Path $stagingRoot 'windhawk.exe')
        }
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\32\windhawk.dll')
            Destination = (Join-Path $stagingRoot (Join-Path $engineRelativePath '32\windhawk.dll'))
        }
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\32\windhawk.lib')
            Destination = (Join-Path $stagingRoot (Join-Path $engineRelativePath '32\windhawk.lib'))
        }
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\64\windhawk.dll')
            Destination = (Join-Path $stagingRoot (Join-Path $engineRelativePath '64\windhawk.dll'))
        }
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\64\windhawk.lib')
            Destination = (Join-Path $stagingRoot (Join-Path $engineRelativePath '64\windhawk.lib'))
        }
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\arm64\windhawk.dll')
            Destination = (Join-Path $stagingRoot (Join-Path $engineRelativePath 'arm64\windhawk.dll'))
        }
        @{
            Source = (Join-Path $RepoRoot 'src\windhawk\Release\arm64\windhawk.lib')
            Destination = (Join-Path $stagingRoot (Join-Path $engineRelativePath 'arm64\windhawk.lib'))
        }
    )

    foreach ($nativeCopy in $nativeCopies) {
        $copied = Copy-OptionalFile -Source $nativeCopy.Source -Destination $nativeCopy.Destination
        if ($copied) {
            Write-Host ("   copied {0}" -f $nativeCopy.Source)
        }
    }
}

Invoke-Step -Message "Rewrite portable runtime config" -Action {
    Set-PortableAppConfig -WindhawkIniPath (Join-Path $stagingRoot "windhawk.ini") -EngineRelativePath $engineRelativePath
    Set-PortableEngineConfig -StagingRoot $stagingRoot -EngineRelativePath $engineRelativePath
}

Invoke-Step -Message "Create portable payload zip" -Action {
    if (Test-Path $payloadZipPath) {
        Remove-Item -Path $payloadZipPath -Force
    }

    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        $stagingRoot,
        $payloadZipPath,
        [System.IO.Compression.CompressionLevel]::Optimal,
        $false
    )
}

Invoke-Step -Message "Compile installer stub" -Action {
    $cscPath = Get-CSharpCompilerPath
    $installerSourcePath = Join-Path $RepoRoot "artifacts\installer-build\InstallerStub.cs"
    $outputDirectory = Split-Path -Parent $OutputInstallerPath

    if ($outputDirectory) {
        New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    }

    & $cscPath `
        /nologo `
        /target:winexe `
        /out:$OutputInstallerPath `
        /resource:"$payloadZipPath,WindhawkPortablePayload.zip" `
        /r:System.Windows.Forms.dll `
        /r:System.IO.Compression.dll `
        /r:System.IO.Compression.FileSystem.dll `
        $installerSourcePath

    if ($LASTEXITCODE -ne 0) {
        throw "Installer stub compilation failed with exit code $LASTEXITCODE"
    }
}

Write-Host "Portable installer created:"
Write-Host $OutputInstallerPath
