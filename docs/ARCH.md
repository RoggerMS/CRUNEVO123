# Arquitectura y Decisiones Técnicas (ARCH)

## Stack Tecnológico
- **Monorepo:** Estructura simple `/apps/api` y `/apps/web`.
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL.
- **Frontend:** React + TypeScript + Vite + Tailwind.
- **Base de Datos:** PostgreSQL (Dockerizado).
- **Panel DB:** Adminer (Dockerizado).

## Configuración de Entorno (Desarrollo)
### Puertos
- **PostgreSQL:** Host `5433` -> Container `5432`.
- **Adminer:** Host `8082` -> Container `8080`.
- **API:** Host `3000`.
- **Web:** Host `5173`.

### Base de Datos
- **Conexión API:** `postgresql://USER:PASSWORD@localhost:5433/DB` (La API corre en el host, por lo que se conecta al puerto mapeado 5433).
- **Conexión Adminer:** Servidor `postgres`, Puerto `5432` (Adminer corre en la red de Docker).

### Uploads
- **Estrategia:** Almacenamiento local en disco (File System).
- **Directorio:** `/apps/api/uploads`.
- **Serving:** Archivos estáticos servidos bajo ruta `/uploads/*`.
- **Persistencia DB:** Se guarda `filePath`, `mimeType`, `size`.
- **Límite:** 25MB por archivo.

### Seguridad
- **Auth:** JWT (Access Token).
- **Passwords:** Hashing con Argon2 o Bcrypt.
- **CORS:** Permitir origen `http://localhost:5173`.
- **Seed:** Usuario Admin inicial (`admin@crunevo.local`) creado vía `prisma/seed.ts`.

## Assumptions
- No se usa Redis en el MVP.
- Tags se manejan como string CSV simple.
- No hay validación de email real (envío de correos).
