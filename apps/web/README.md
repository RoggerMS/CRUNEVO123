# CRUNEVO Web (Frontend)

SPA construida con **React + Vite + TypeScript + Tailwind CSS**. Usa autenticación basada en JWT y protege la mayoría de rutas tras login.

## Estructura y rutas principales
Las rutas se definen en `App.tsx` mediante `react-router-dom`:
- `/` (landing): bienvenida y CTA a login/registro.
- `/login`, `/register`: páginas públicas de autenticación.
- `/feed`: muro principal de actividad.
- `/documents/new`, `/documents/:id`: subida y detalle de documentos.
- `/aula`, `/aula/new`, `/aula/:id`: listado, creación y detalle de preguntas/respuestas.
- `/apuntes`, `/apuntes/:id`: biblioteca de apuntes.
- `/store`, `/store/new`, `/store/orders/mine`, `/store/:id`: catálogo, creación y compras.
- `/messages`, `/messages/:id`: mensajería.
- `/notifications`: notificaciones.
- `/clubs`, `/clubs/:id`: clubes y detalle.
- `/events`: eventos.
- `/admin`: panel de administración.
- `/ai`, `/courses`: placeholders de módulos futuros.

## Integración con la API
- El `Layout` consulta `GET /users/me` para obtener el usuario actual y mostrar avatar/logout.
- Las llamadas usan el cliente `api` (axios) configurado con `VITE_API_URL`.
- El token JWT se guarda en `localStorage` (`token`) y se envía en los headers.

## Scripts
Ejecutar desde `apps/web`:
- `npm install`: instala dependencias.
- `npm run dev`: modo desarrollo (Vite) en `http://localhost:5173`.
- `npm run build`: build de producción.
- `npm run preview`: previsualización del build.

## Variables de entorno
En `.env` (o `.env.local`), define al menos:
```env
VITE_API_URL=http://localhost:3000
VITE_AI_ENABLED=false
```

## Autenticación y protección de rutas
- Las rutas públicas son landing, login y register.
- El resto usan un componente `PrivateRoute` que redirige a `/login` si no hay token.
- `PublicOnlyRoute` evita que un usuario autenticado vuelva a login/registro.
