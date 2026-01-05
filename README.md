# CRUNEVO - Plataforma Educativa (MVP)

## Descripción
CRUNEVO es una plataforma educativa con gestión de documentos y sistema de preguntas y respuestas (Q&A).

## Requisitos
- Node.js (v18+)
- Docker & Docker Compose

## Ejecución Rápida (PowerShell Friendly)

Sigue estos pasos en orden. Usa terminales separadas para API y Web.

1. **Configuración Inicial (Solo la primera vez)**
   ```powershell
   # Levantar base de datos
   docker compose up -d
   
   # Instalar dependencias
   cd apps/api; npm install
   cd ../web; npm install
   
   # Configurar DB y usuario Admin
   cd apps/api
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

2. **Iniciar Backend (API)**
   ```powershell
   cd apps/api
   npm run start:dev
   ```
   *API disponible en http://localhost:3000*

3. **Iniciar Frontend (Web)**
   ```powershell
   cd apps/web
   npm run dev
   ```
   *Web disponible en http://localhost:5173*

4. **Verificar MVP (Script)**
   Desde `apps/api` (con el servidor corriendo):
   ```powershell
   npm run verify:mvp
   ```
   *Esto probará Login, Upload, Feed y Q&A automáticamente.*

## Credenciales

### Base de Datos
- **Host:** localhost:5433
- **User:** postgres
- **Pass:** CrunevoSecurePwd2024!
- **DB:** crunevo

### Adminer (Gestor DB)
- **URL:** http://localhost:8082
- **Server:** postgres (interno)
- **User:** postgres
- **Pass:** CrunevoSecurePwd2024!

### Usuario Admin
- **Email:** admin@crunevo.local
- **Password:** Admin123!

## Estructura
- `/apps/api`: Backend NestJS + Prisma.
- `/apps/web`: Frontend React + Vite (Sin Tailwind, CSS puro).
- `/scripts`: Scripts de utilidad y verificación.
