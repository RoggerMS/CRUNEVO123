Write-Host "Iniciando redespliegue..."
docker compose up --build -d
if ($?) {
    Write-Host "Despliegue completado."
    docker compose ps
} else {
    Write-Host "Error durante el despliegue."
}
