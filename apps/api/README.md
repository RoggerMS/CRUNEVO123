# CRUNEVO API (Backend)

API REST modular construida con **NestJS**, **Prisma** y **PostgreSQL** para soportar el MVP educativo/social de CRUNEVO. Expone autenticación JWT, gestión de usuarios, documentos, Q&A, feed y módulos sociales adicionales.

## Arquitectura rápida
- **NestJS + EventEmitter** para modularizar dominios.
- **Prisma** como ORM hacia PostgreSQL.
- **Multer** para manejo de uploads locales en `uploads/` (servidos bajo `/uploads/*`).
- **JWT** para autenticación; guardas de rol para admin/profesor.

## Módulos incluidos
- **Auth**: registro/login con JWT y expiración configurable.
- **Users**: perfil del usuario autenticado y roles (Student/Teacher/Admin).
- **Documents**: subida y metadatos de archivos; archivos servidos desde disco.
- **Feed**: agregación de actividad reciente.
- **Questions & Answers (Aula)**: preguntas, respuestas y aceptación de respuesta.
- **Reports**: reportes de contenido y guard de roles.
- **Admin**: ver reportes y verificar profesores.
- **Social**: posts, comentarios, likes, bookmarks, clubs, eventos, mensajes, store, vitality.
- **Stubs**: placeholders de IA (`ai`, `ai_stub`) y cursos (`courses_stub`).

## Requisitos previos
- Node.js 18+
- Docker y Docker Compose

## Configuración y ejecución
1. Copia el archivo de entorno y ajusta credenciales:
   ```bash
   cp ../../.env.example .env
   # actualiza DATABASE_URL, JWT_SECRET, etc.
   ```
2. Levanta la base de datos (desde la raíz del repo):
   ```bash
   docker compose up -d
   ```
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Ejecuta migraciones y seed:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Inicia la API en modo watch:
   ```bash
   npm run start:dev
   ```
   La API quedará en `http://localhost:3000`.

## Variables de entorno
Ejemplo de `.env` (valores de ejemplo, ajusta a tu entorno):
```env
DATABASE_URL=postgresql://postgres:CHANGE_ME_IN_DEV@localhost:5433/crunevo
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=24h
PORT=3000
UPLOAD_DIR=uploads
AI_ENABLED=false
```

## Scripts útiles
- `npm run start:dev`: modo desarrollo con watch.
- `npm run start`: modo producción (requiere build previo).
- `npm run test` / `npm run test:e2e`: pruebas unitarias y end-to-end.

## Notas
- Las rutas de archivos subidos se sirven desde `uploads/` y se exponen bajo `/uploads/*`.
- Asegura que el frontend consuma la API usando el mismo `JWT_SECRET` y `PORT` configurado aquí.
