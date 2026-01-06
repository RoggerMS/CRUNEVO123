# Menú superior de aplicaciones

El botón de 9 puntos en el encabezado abre un menú rápido con todas las secciones visibles de la app (mensajes, notificaciones, clubes, marketplace, etc.). El menú está preparado para que agregar o reorganizar accesos sea solo cuestión de actualizar una lista.

## Dónde vive el menú
- **Componente:** `apps/web/src/components/AppMenu.tsx`
- **Configuración de secciones:** `menuSections` dentro de `apps/web/src/App.tsx` (componente `Layout`).
- **Estilos:** clases `.topbar*` y `.app-menu*` en `apps/web/src/index.css`.

## Cómo agregar o editar accesos
1. Abre `apps/web/src/App.tsx` y ubica `const menuSections = useMemo<AppMenuSection[]>(...)`.
2. Cada sección del menú es un objeto con `title` y un arreglo `items`. Cada `item` requiere:
   - `label`: texto visible del enlace.
   - `description`: breve explicación que aparece debajo.
   - `to`: ruta del `react-router` que debe abrirse.
   - `icon`: componente de ícono (idealmente de `lucide-react` para mantener consistencia).
3. Agrega el nuevo `item` en la sección que corresponda o crea una nueva sección añadiendo otro objeto al arreglo `sections`.
4. Guarda el archivo; no se necesitan más cambios para que aparezca en el menú y en el buscador interno del menú.

## Tips rápidos
- Usa íconos de `lucide-react` importándolos al inicio de `App.tsx` para mantener el mismo estilo.
- El menú incluye un buscador; cualquier nueva entrada será indexada automáticamente porque la búsqueda recorre `label` y `description`.
- Si agregas rutas protegidas por rol (ej. admin), puedes condicionar las secciones igual que el bloque existente que solo se muestra para `currentUser?.role === 'ADMIN'.`
- En pantallas chicas (<768px) el sidebar lateral se oculta; el lanzador superior queda como navegación principal, así que asegúrate de que todo lo esencial esté listado ahí.
