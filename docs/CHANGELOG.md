# Changelog

## [Unreleased]
### Added
- Modelo y endpoints de administración para gestionar elementos destacados del sidebar del feed.
- Soporte en el feed para mostrar ítems dinámicos de publicidad, cursos, eventos y productos.
- Nueva sección en el panel de administración para crear, editar y ordenar elementos del sidebar.
- Menú de perfil estilo Facebook con accesos rápidos, enlaces legales y panel "Más".
### Changed
- Diseño del feed actualizado para mejor respuesta en móviles y métricas rápidas.
- Renovado el diseño del listado de Aula para alinearlo con la experiencia de creación y detalle (tarjetas, filtros y tabs unificados).
- Página de creación y detalle de preguntas en Aula rediseñadas para alinearse visualmente y corregir estilos rotos.
- Limpieza de importaciones sin uso en App para evitar fallos de build en web.

## [Iteración 5] - 2026-01-03
### Added
- Stubs para IA (`ai_stub`) y Cursos (`courses_stub`).
- Frontend: Placeholders para IA y Cursos.
- Documentación Final y README con instrucciones de ejecución.

## [Iteración 4] - 2026-01-03
### Added
- Módulo de Preguntas (`Questions`) y Respuestas (`Answers`).
- Funcionalidad de aceptar respuesta (Accepted Answer).
- Módulo de Reportes (`Reports`) y Guard de Roles.
- Módulo de Admin (`Admin`) para verificar profesores y ver reportes.
- Frontend: Crear Pregunta, Detalle de Pregunta, Panel de Admin.

## [Iteración 3] - 2026-01-03
### Added
- Módulo de Documentos (`Documents`) con subida de archivos (Multer).
- Módulo de Feed (`Feed`) agregando documentos recientes.
- Frontend: Login, Register, Feed, Upload Document, Document Detail.
- Configuración de TailwindCSS y Axios.

## [Iteración 2] - 2026-01-03
### Added
- Setup de Prisma (Schema, Migraciones).
- Script de Seed (Admin user).
- Módulo de Autenticación (`Auth`) con JWT.
- Módulo de Usuarios (`Users`).

## [Iteración 1] - 2026-01-03
### Added
- Estructura de directorios `/apps` y `/docs`.
- Documentación inicial: PRD, ARCH, ROADMAP, CHANGELOG.
- `docker-compose.yml` para PostgreSQL y Adminer.
- `.env.example` raíz.
- Inicialización de proyectos NestJS (API) y React (Web).
