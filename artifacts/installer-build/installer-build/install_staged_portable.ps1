param(
    [Parameter(Mandatory = $true)]
    [string]$StagingRoot,

    [Parameter(Mandatory = $true)]
    [string]$TargetRoot,

    [string]$ShortcutName = 'Windhawk Custom Portable',

    [switch]$Move
)

$ErrorActionPreference = 'Stop'

function New-Shortcut {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ShortcutPath,

        [Parameter(Mandatory = $true)]
        [string]$TargetPath,

        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory
    )

    $shortcutDirectory = Split-Path -Parent $ShortcutPath
    if ($shortcutDirectory) {
        New-Item -ItemType Directory -Path $shortcutDirectory -Force | Out-Null
    }

    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($ShortcutPath)
    $shortcut.TargetPath = $TargetPath
    $shortcut.WorkingDirectory = $WorkingDirectory
    $shortcut.IconLocation = "$TargetPath,0"
    $shortcut.Save()
}

if (-not (Test-Path $StagingRoot)) {
    throw "Staging root not found: $StagingRoot"
}

$resolvedStagingRoot = (Resolve-Path $StagingRoot).ProviderPath
$resolvedTargetRoot = [System.IO.Path]::GetFullPath($TargetRoot)

if (Test-Path $resolvedTargetRoot) {
    Remove-Item -Path $resolvedTargetRoot -Recurse -Force
}

New-Item -ItemType Directory -Path (Split-Path -Parent $resolvedTargetRoot) -Force | Out-Null

if ($Move) {
    Move-Item -Path $resolvedStagingRoot -Destination $resolvedTargetRoot -Force
} else {
    Copy-Item -Path $resolvedStagingRoot -Destination $resolvedTargetRoot -Recurse -Force
}

$installedExePath = Join-Path $resolvedTargetRoot 'windhawk.exe'
if (-not (Test-Path $installedExePath)) {
    throw "Installed executable not found: $installedExePath"
}

$desktopShortcutPath = Join-Path (
    [Environment]::GetFolderPath([Environment+SpecialFolder]::DesktopDirectory)
) "$ShortcutName.lnk"
$startMenuShortcutPath = Join-Path (
    [Environment]::GetFolderPath([Environment+SpecialFolder]::Programs)
) "$ShortcutName.lnk"

New-Shortcut -ShortcutPath $desktopShortcutPath -TargetPath $installedExePath -WorkingDirectory $resolvedTargetRoot
New-Shortcut -ShortcutPath $startMenuShortcutPath -TargetPath $installedExePath -WorkingDirectory $resolvedTargetRoot

Write-Output "Installed staged portable build to $resolvedTargetRoot"
