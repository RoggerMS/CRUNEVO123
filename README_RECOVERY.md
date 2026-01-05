# Guía de Recuperación CRUNEVO

## Problema Detectado
El entorno de desarrollo falló debido a problemas con Docker ("The system cannot find the file specified"), lo que dejó inaccesible la base de datos en el puerto 5433.

## Pasos para Restaurar

### Opción A: Si puedes arreglar Docker
1. Reinicia Docker Desktop.
2. Ejecuta: `.\apps\api\start-db-docker.ps1`
3. Si funciona, la API conectará automáticamente al puerto 5433.

### Opción B: Usar Postgres Local
1. Asegúrate de tener PostgreSQL corriendo (parece que tienes uno en el puerto 5432).
2. Averigua la contraseña de tu usuario `postgres`.
3. Edita `apps/api/.env`:
   Cambia: `DATABASE_URL="postgresql://postgres:CrunevoSecurePwd2024!@localhost:5433/crunevo"`
   Por: `DATABASE_URL="postgresql://postgres:TU_CLAVE@localhost:5432/crunevo"`
4. Reinicia la API.

## Mejoras Implementadas
1. **Frontend Resiliente**: El Login y Feed ya no se quedan cargando infinitamente si la API o DB fallan. Muestran mensajes de error claros.
2. **Health Check**: La API tiene un endpoint `/health` (cuando logre arrancar).
3. **Arranque Robusto**: La API intentará arrancar incluso si la DB falla inicialmente, para permitir diagnósticos.

## Verificación
Ve a http://localhost:5173/login. Si ves "API offline", es que el servidor backend no está corriendo (puerto 3000 cerrado). Revisa la consola de la API para errores de arranque.
