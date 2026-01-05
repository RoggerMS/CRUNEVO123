# Intenta levantar la infraestructura con Docker
Write-Host "Iniciando Docker Compose..."
docker-compose up -d postgres adminer

if ($?) {
    Write-Host "Docker levantado exitosamente."
    Write-Host "DB en puerto 5433."
    Write-Host "Adminer en http://localhost:8082"
} else {
    Write-Host "Error al levantar Docker. Asegúrate de que Docker Desktop esté corriendo."
    Write-Host "Si Docker no funciona, intenta usar una base de datos local (ver start-db-local.ps1)."
}
