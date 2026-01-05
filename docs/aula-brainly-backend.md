# Aula tipo Brainly - Notas backend

## Novedades principales
- **Nuevo modelo de Pregunta**: añade `subject`, `tags` (array de strings), `attachments` (URLs), `viewCount`, `lastActivityAt` y `updatedAt`.
- **Respuestas**: ahora soportan `attachments`, manejan `status` (`ACTIVE/HIDDEN/DELETED`) y quedan asociadas a comentarios.
- **Comentarios en respuestas**: `Comment` puede vincularse a `answerId`.
- **Orden y métricas del feed**: vistas y actividad actualizada en votos/respuestas; popularidad basada en vistas + respuestas + votos.
- **Notificaciones**: se envían al autor de la pregunta cuando recibe una respuesta y al autor de la respuesta cuando es aceptada.
- **Rate limit y anti-spam**: 4 preguntas/minuto y 8 respuestas/minuto por usuario. Se bloquea contenido con insultos, abuso de mayúsculas o enlaces sospechosos.

## Endpoints clave
- `GET /aula/questions`  
  Parámetros:  
  - `q`: búsqueda en título/cuerpo/tags.  
  - `tab`: `recent` | `unanswered` | `popular`.  
  - `subject`, `tags` (CSV), `dateFrom` (YYYY-MM-DD), `clubId`, `authorId`, `page`, `pageSize`.  
  Retorna votos, conteo de respuestas, vistas, tags, subject y puntuación de popularidad.

- `GET /aula/questions/:id?answersSort=helpful|recent`  
  Incrementa `viewCount`, ordena respuestas, incluye comentarios, adjuntos y score por voto.

- `POST /aula/questions` (auth)  
  Payload: `{ title, body, subject?, tags: string[], attachments?: string[], clubId? }`.

- `POST /aula/questions/:id/answers` (auth)  
  Payload: `{ body, attachments?: string[] }`.

- `POST /aula/questions/:id/accept/:answerId` (auth autor/admin).
- `POST /aula/vote` (auth) para preguntas/respuestas.
- `GET /aula/questions/tags/popular?q?` popularidad de tags (para autocomplete).
- `GET /aula/questions/suggest?q` sugerencias para anti-duplicados.
- `GET /aula/questions/subjects` listado de materias registradas.
- `GET /aula/questions/mine` y `GET /answers/mine` (auth) para “Mis preguntas/respuestas”.
- `PATCH /aula/questions/:id/status` y `PATCH /answers/:id/status` (ADMIN) para ocultar/eliminar.

## Moderación y reportes
- Reportes via `POST /reports` con `targetType` `QUESTION|ANSWER`.
- Auto-filtro de lenguaje/links; contenido no se crea si es sospechoso.
- Moderación centralizada: `admin.service.updateContentStatus` ahora soporta `answer`.

## Esquema y migraciones
Cambios en `prisma/schema.prisma`:
- `Question`: `subject String?`, `tags String[]`, `attachments String[] @default([])`, `viewCount Int @default(0)`, `updatedAt @updatedAt`, `lastActivityAt DateTime @default(now())`.
- `Answer`: `attachments String[] @default([])`, `status ContentStatus @default(ACTIVE)`, `updatedAt @updatedAt`, `comments Comment[]`.
- `Comment`: nuevo `answerId` y relación.

> Ejecutar `npx prisma migrate dev --name aula_brainly` tras actualizar el repositorio.

## UX/Frontend (referencia rápida)
- Feed `/aula`: tabs Recientes/Sin responder/Populares, filtros por materia, tags, fecha y tags populares. Cards muestran vistas, respuestas, subject, tags y CTA “Responder”.
- Crear pregunta: obliga título, descripción, materia y tags; permite adjuntar imagen y muestra sugerencias de duplicados.
- Detalle: vistas totales, tags clicables (filtran feed), orden de respuestas (útiles/recientes), adjuntos en pregunta/respuestas, reportes rápidos.

Estas notas están pensadas para que cualquier implementador de frontend pueda consumir rápidamente el nuevo backend de Aula estilo Brainly.
