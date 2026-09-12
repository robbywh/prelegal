$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

$ImageName = "prelegal"
$ContainerName = "prelegal"

if (-not (Test-Path ".env")) {
    Write-Error "Missing .env file. Copy .env.example to .env and fill in values first."
    exit 1
}

$existing = docker ps -a --format '{{.Names}}' | Select-String -Pattern "^$ContainerName$"
if ($existing) {
    docker rm -f $ContainerName | Out-Null
}

docker build -t $ImageName .
docker run -d --name $ContainerName -p 8000:8000 --env-file .env $ImageName

Write-Host "Prelegal is running at http://localhost:8000"
