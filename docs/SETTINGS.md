# Centro de configuración (borrador)

Este documento describe el diseño base de la pestaña de **Configuración**. Se incluye un mapa de secciones y su propósito, junto con notas para futuras implementaciones.

## Rutas

- `/settings` (principal)
- `/setting` y `/configuracion` redirigen a `/settings`.
- No existe botón de acceso directo en el UI actual.

## Secciones y objetivos

### Centro de la cuenta
- Datos personales y exportación.
- Contraseña y seguridad.
- Solicitud de verificación.
- Preferencias de anuncios.

### Privacidad y seguridad
- Centro de privacidad (panel consolidado).
- Bloqueos y cuentas restringidas.
- Perfil privado.
- Visibilidad de seguidores y seguidos.
- Vistas públicas en publicaciones (contador visible/privado).
- Actividad e historial (posts, comentarios, likes).
- Publicaciones reportadas.
- Contenido oculto.
- "No me interesa" (afecta recomendaciones).
- Publicaciones guardadas.

### Feed y contenido
- Preferencias del feed y priorización de temas.
- Preferencias de reacciones.
- Seguimiento de slides/carruseles.
- Contenido y multimedia (autoplay, calidad, descargas).
- Modo oscuro (placeholder hasta que exista tema global).

### Notificaciones
- Canales (push, correo, SMS).
- Preferencias por tema.
- Resumen diario.

### Idioma y región
- Idioma de la interfaz.
- Región y zona horaria.

### Herramientas y accesos
- Accesibilidad (texto, contraste, ayudas).
- Herramientas de moderación personal (filtros, contenido sensible).

### Módulos del ecosistema
- Aula (preferencias de preguntas, seguimiento).
- Tienda (direcciones, compras, seguridad).
- Chat (privacidad, solicitudes).
- Eventos (recordatorios, visibilidad).
- Clubes (membresías, roles).

### Normas y legal
- Términos del servicio.
- Política de privacidad.
- Política de cookies.
- Normas de la comunidad.

## Notas de implementación

- La configuración de privacidad por publicación debe enlazar al control de "Vistas públicas en publicaciones".
- La edición del perfil se mantiene en la pantalla de perfil para evitar duplicar formularios en Configuración.
- Los módulos pueden crecer con subpáginas (por ejemplo, `/settings/chat`, `/settings/store`) una vez que existan APIs.

## Prompt sugerido para futuras IAs

> Prioriza convertir cada item en subpágina y conecta la configuración con APIs reales. Usa `/settings` como hub, agrega enlaces por sección y reemplaza los badges "Próximamente" por controles reales (toggles, selects, tablas).
