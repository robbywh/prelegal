$ContainerName = "prelegal"

docker stop $ContainerName 2>$null | Out-Null
docker rm $ContainerName 2>$null | Out-Null

Write-Host "Prelegal stopped."
