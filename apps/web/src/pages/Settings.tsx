import './Settings.css';

type SettingStatus = 'ready' | 'soon' | 'planned';

type SettingItem = {
  title: string;
  description: string;
  status: SettingStatus;
  detail?: string;
};

type SettingSection = {
  title: string;
  description: string;
  items: SettingItem[];
};

const STATUS_LABELS: Record<SettingStatus, string> = {
  ready: 'Listo para integrar',
  soon: 'Próximamente',
  planned: 'En planificación',
};

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    title: 'Centro de la cuenta',
    description: 'Controla tus datos personales, seguridad y verificación.',
    items: [
      {
        title: 'Datos personales y exportación',
        description: 'Descarga tu información, datos de contacto y actividad personal.',
        status: 'planned',
        detail: 'Se conectará al módulo de datos personales.',
      },
      {
        title: 'Contraseña y seguridad',
        description: 'Cambia tu contraseña, revisa sesiones activas y activa medidas de seguridad.',
        status: 'planned',
      },
      {
        title: 'Solicitud de verificación',
        description: 'Envía la solicitud para obtener el check de verificación.',
        status: 'soon',
        detail: 'Mostrará requisitos y estado de la solicitud.',
      },
      {
        title: 'Preferencias de anuncios',
        description: 'Configura anuncios, intereses y categorías visibles.',
        status: 'soon',
      },
    ],
  },
  {
    title: 'Privacidad y seguridad',
    description: 'Configura cómo se ve tu perfil y cómo se protegen tus interacciones.',
    items: [
      {
        title: 'Centro de privacidad',
        description: 'Panel unificado para revisar permisos, visibilidad y controles rápidos.',
        status: 'planned',
      },
      {
        title: 'Bloqueos y cuentas restringidas',
        description: 'Administra a quién bloqueas o restringes.',
        status: 'planned',
      },
      {
        title: 'Perfil privado',
        description: 'Decide si tu perfil es público o privado.',
        status: 'soon',
      },
      {
        title: 'Visibilidad de seguidores',
        description: 'Define si otros pueden ver tu lista de seguidores.',
        status: 'planned',
      },
      {
        title: 'Visibilidad de seguidos',
        description: 'Controla si se muestra a quién sigues.',
        status: 'planned',
      },
      {
        title: 'Vistas públicas en publicaciones',
        description: 'Elige si el contador de vistas es público o privado.',
        status: 'planned',
        detail: 'Debe conectarse al selector de privacidad en cada post.',
      },
      {
        title: 'Actividad y registros',
        description: 'Historial de posts, comentarios, likes y ediciones.',
        status: 'planned',
      },
      {
        title: 'Publicaciones reportadas',
        description: 'Consulta reportes enviados y su estado.',
        status: 'planned',
      },
      {
        title: 'Contenido oculto',
        description: 'Listado de publicaciones ocultadas manualmente.',
        status: 'planned',
      },
      {
        title: 'No me interesa',
        description: 'Revisa qué temas o publicaciones marcaste como irrelevantes.',
        status: 'planned',
      },
      {
        title: 'Publicaciones guardadas',
        description: 'Gestiona tus guardados y colecciones.',
        status: 'planned',
      },
    ],
  },
  {
    title: 'Feed y contenido',
    description: 'Ajusta cómo se muestran y recomiendan publicaciones.',
    items: [
      {
        title: 'Preferencias del feed',
        description: 'Prioriza temas, comunidades o formatos.',
        status: 'planned',
      },
      {
        title: 'Preferencias de reacciones',
        description: 'Elige reacciones favoritas o desactiva reacciones específicas.',
        status: 'planned',
      },
      {
        title: 'Seguimiento de slides',
        description: 'Controla el tracking de diapositivas o carruseles.',
        status: 'planned',
      },
      {
        title: 'Contenido y multimedia',
        description: 'Autoplay, calidad de video, datos y descargas.',
        status: 'planned',
      },
      {
        title: 'Modo oscuro',
        description: 'Activa o programa el modo oscuro.',
        status: 'soon',
        detail: 'Se añadirá cuando exista tema oscuro global.',
      },
    ],
  },
  {
    title: 'Notificaciones',
    description: 'Define qué alertas recibes y por qué canales.',
    items: [
      {
        title: 'Canales de notificación',
        description: 'Push, correo, SMS o dentro de la app.',
        status: 'planned',
      },
      {
        title: 'Preferencias por tema',
        description: 'Actividad, menciones, mensajes, club y tienda.',
        status: 'planned',
      },
      {
        title: 'Resumen diario',
        description: 'Recibe un digest de actividad.',
        status: 'planned',
      },
    ],
  },
  {
    title: 'Idioma y región',
    description: 'Selecciona idioma, zona horaria y formato regional.',
    items: [
      {
        title: 'Idioma de la interfaz',
        description: 'Define el idioma principal y secundario.',
        status: 'planned',
      },
      {
        title: 'Región y zona horaria',
        description: 'Formato de fecha, hora y moneda.',
        status: 'planned',
      },
    ],
  },
  {
    title: 'Herramientas y accesos',
    description: 'Atajos para herramientas internas y accesibilidad.',
    items: [
      {
        title: 'Preferencias de accesibilidad',
        description: 'Tamaño de texto, contraste y ayudas visuales.',
        status: 'planned',
      },
      {
        title: 'Herramientas de moderación personal',
        description: 'Filtros de palabras, ocultar contenido sensible o spam.',
        status: 'planned',
      },
    ],
  },
  {
    title: 'Módulos del ecosistema',
    description: 'Configuración específica por producto o módulo.',
    items: [
      {
        title: 'Aula',
        description: 'Preferencias de preguntas, respuestas y seguimiento de temas.',
        status: 'planned',
      },
      {
        title: 'Tienda',
        description: 'Direcciones, facturación, historial y seguridad de compras.',
        status: 'planned',
      },
      {
        title: 'Chat',
        description: 'Privacidad de mensajes, bloqueo y solicitudes.',
        status: 'planned',
      },
      {
        title: 'Eventos',
        description: 'Recordatorios, calendarios y visibilidad de eventos.',
        status: 'planned',
      },
      {
        title: 'Clubes',
        description: 'Notificaciones, membresías y roles.',
        status: 'planned',
      },
    ],
  },
  {
    title: 'Normas y legal',
    description: 'Información legal y normas de comunidad.',
    items: [
      {
        title: 'Términos del servicio',
        description: 'Condiciones generales de uso.',
        status: 'planned',
      },
      {
        title: 'Política de privacidad',
        description: 'Cómo se almacenan y usan los datos.',
        status: 'planned',
      },
      {
        title: 'Política de cookies',
        description: 'Preferencias y gestión de cookies.',
        status: 'planned',
      },
      {
        title: 'Normas de la comunidad',
        description: 'Reglas y prácticas recomendadas.',
        status: 'planned',
      },
    ],
  },
];

export default function Settings() {
  return (
    <div className="container settings-page">
      <header className="settings-header">
        <div>
          <h2>Configuración</h2>
          <p className="meta">
            Este panel centraliza todas las opciones que se irán activando en próximas iteraciones.
          </p>
        </div>
        <span className="badge settings-badge">Borrador funcional</span>
      </header>

      <div className="card settings-note">
        <h3>Notas rápidas</h3>
        <ul>
          <li>La ruta principal es <strong>/settings</strong> y también existe <strong>/configuracion</strong>.</li>
          <li>No hay botón de acceso directo; se ingresa manualmente desde la URL.</li>
          <li>Las acciones reales se activarán gradualmente y deben enlazarse a módulos existentes.</li>
          <li>La edición de perfil debe mantenerse en la pantalla de perfil para evitar duplicidad.</li>
        </ul>
      </div>

      <div className="settings-grid">
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.title} className="card settings-section">
            <div className="settings-section-header">
              <h3>{section.title}</h3>
              <p className="meta">{section.description}</p>
            </div>
            <div className="settings-section-list">
              {section.items.map((item) => (
                <div key={item.title} className="settings-item">
                  <div>
                    <div className="settings-item-title">{item.title}</div>
                    <p className="meta settings-item-description">{item.description}</p>
                    {item.detail ? <p className="settings-item-detail">{item.detail}</p> : null}
                  </div>
                  <span className={`badge settings-status settings-status-${item.status}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
