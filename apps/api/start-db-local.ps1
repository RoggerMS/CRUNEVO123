# Instrucciones para usar DB local
Write-Host "Para usar una base de datos local PostgreSQL:"
Write-Host "1. Asegúrate de tener PostgreSQL instalado y corriendo en el puerto 5432."
Write-Host "2. Crea una base de datos llamada 'crunevo'."
Write-Host "3. Verifica tu usuario y contraseña (por defecto suele ser postgres/postgres o postgres/admin)."
Write-Host "4. Edita el archivo apps/api/.env y actualiza DATABASE_URL:"
Write-Host "   Ejemplo: DATABASE_URL='postgresql://postgres:TU_PASSWORD@localhost:5432/crunevo'"
Write-Host ""
Write-Host "Estado actual de conexión (puerto 5432):"
Test-NetConnection -ComputerName localhost -Port 5432
