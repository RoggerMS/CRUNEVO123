# CRUNEVO - Plataforma Educativa (MVP)

MVP educativo/social en monorepo con **NestJS + Prisma + PostgreSQL** para el backend y **React + Vite + Tailwind CSS** para el frontend. Permite autenticación, gestión de documentos, preguntas/respuestas, feed social, reportes y módulos sociales adicionales (clubs, eventos, mensajes, store) con stubs de IA y cursos.

## Requisitos
- Node.js 18+
- Docker & Docker Compose

## Despliegue rápido con Docker (Windows/WSL)
1. **Arranca Docker Desktop** y espera a que muestre estado **Running** (si ves `open //./pipe/dockerDesktopLinuxEngine`, el engine no está arriba).
2. Copia variables: `cp .env.example .env` (puedes ajustar puertos/URLs si lo necesitas).
3. Construye imágenes: `docker compose build --pull`
4. Levanta servicios: `docker compose up -d`
5. Verifica estado: `docker compose ps` (Postgres debe verse `healthy`).
6. (Opcional) Semilla de datos: `docker compose exec api npx prisma db seed`

Accesos: Web http://localhost • API http://localhost:3000 • Adminer http://localhost:8082 (server: `postgres`, user: `postgres`, pass: `CrunevoSecurePwd2024!`).

## Guía rápida (onboarding)
### 1) Configurar entorno y base de datos
```bash
docker compose up -d                  # PostgreSQL + Adminer
cp .env.example .env                  # Ajusta credenciales y URLs si es necesario
```

### 2) Backend (API)
```bash
cd apps/api
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev                     # API en http://localhost:3000
```

### 3) Frontend (Web)
```bash
cd ../web
npm install
npm run dev                           # Web en http://localhost:5173
```

### 4) Verificación rápida del MVP (opcional)
Desde `apps/api` con la API corriendo:
```bash
npm run verify:mvp
```
Ejecuta flujo de login, subida de documento, feed y Q&A.

## Credenciales por defecto
- **DB (host):** localhost:5433 / user: postgres / pass: CrunevoSecurePwd2024! / db: crunevo
- **Adminer:** http://localhost:8082 (server: postgres, user: postgres, pass: CrunevoSecurePwd2024!)
- **Usuario Admin:** admin@crunevo.local / Admin123!

## Panorama funcional
- **Autenticación y roles:** crea cuenta o usa el admin. Tras login obtienes token JWT.
- **Documentos:** sube archivos desde “Upload” (`/documents/new`); se listan en feed y tienen detalle descargable.
- **Preguntas y respuestas (Aula):** crea preguntas en `/aula/new`, responde desde el detalle (`/aula/:id`) y marca respuesta aceptada.
- **Feed:** vista agregada de actividad (documentos, preguntas recientes).
- **Reportes y admin:** reporta contenido y revísalo/verifícalo en `/admin` (solo roles elevados).
- **Social extra:** clubs (`/clubs`), eventos (`/events`), mensajes (`/messages`), store (`/store`) para catálogo y compras, likes/bookmarks en contenido.
- **Stubs:** módulos de IA y Cursos expuestos como placeholders.

## Estructura
- `/apps/api`: Backend NestJS + Prisma (uploads locales, JWT, módulos sociales y académicos).
- `/apps/web`: Frontend React + Vite + Tailwind CSS, SPA protegida por JWT.
- `/docs`: PRD, arquitectura, roadmap y changelog.
- `/scripts`: utilidades y verificación.
