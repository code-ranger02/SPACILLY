# MongoDB Atlas migration: ReaglexDB (reagle-x) -> SpacillyDB (spacilly)
# Requires MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools
#
# Usage (PowerShell):
#   cd d:\E-COMMERCE
#   .\scripts\migrate-mongodb.ps1

$ErrorActionPreference = "Stop"

function Find-MongoTool {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $roots = @(
        "C:\Program Files\MongoDB\Tools",
        "C:\Program Files (x86)\MongoDB\Tools"
    )
    foreach ($root in $roots) {
        if (-not (Test-Path $root)) { continue }
        Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | ForEach-Object {
            $exe = Join-Path $_.FullName "bin\$Name.exe"
            if (Test-Path $exe) { return $exe }
        }
        $flat = Join-Path $root "bin\$Name.exe"
        if (Test-Path $flat) { return $flat }
    }
    return $null
}

$MongoDump = Find-MongoTool "mongodump"
$MongoRestore = Find-MongoTool "mongorestore"
if (-not $MongoDump -or -not $MongoRestore) {
    throw "MongoDB Database Tools not found. Close this terminal, open a new one, or add Tools\*\bin to PATH."
}
Write-Host "Using: $MongoDump"
Write-Host "Using: $MongoRestore"

$OldUri = "mongodb+srv://reaglex:Loading99.99@reagle-x.uh9s5rn.mongodb.net/ReaglexDB?retryWrites=true&w=majority&appName=Reagle-x"
$NewUri = "mongodb+srv://spacilly:Loading99.99%25@spacilly.phhthbt.mongodb.net/SpacillyDB?retryWrites=true&w=majority&appName=spacilly"

$DumpDir = Join-Path $PSScriptRoot ".." "dump"
$DumpDir = (Resolve-Path $DumpDir -ErrorAction SilentlyContinue) ?? (Join-Path (Split-Path $PSScriptRoot -Parent) "dump")

Write-Host "=== Step 1: Dump old database (ReaglexDB) ===" -ForegroundColor Cyan
& $MongoDump --uri="$OldUri" --out="$DumpDir"

Write-Host "`n=== Step 2: Restore into new cluster (SpacillyDB) ===" -ForegroundColor Cyan
$SourceDump = Join-Path $DumpDir "ReaglexDB"
if (-not (Test-Path $SourceDump)) {
    throw "Expected dump folder not found: $SourceDump"
}
& $MongoRestore --uri="$NewUri" --drop "$SourceDump"

Write-Host "`n=== Step 3: Verify collections and document counts ===" -ForegroundColor Cyan
node (Join-Path $PSScriptRoot "verify-mongodb-migration.mjs") --old-uri="$OldUri" --new-uri="$NewUri"

Write-Host "`nMigration complete." -ForegroundColor Green
