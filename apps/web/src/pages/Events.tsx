import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  
  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');

  useEffect(() => {
    fetchUserAndEvents();
  }, []);

  const fetchUserAndEvents = async () => {
    setLoading(true);
    try {
        const userRes = await api.get('/users/me');
        setUser(userRes.data);
        
        let eventsRes;
        if (userRes.data.role === 'ADMIN') {
            eventsRes = await api.get('/events/admin');
        } else {
            eventsRes = await api.get('/events');
        }
        
        // Transform events for calendar
        const rawEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
        const mappedEvents = rawEvents
          .map((ev: any) => {
            const start = new Date(ev.date);
            if (Number.isNaN(start.getTime())) return null;

            const end = new Date(start.getTime() + 60 * 60 * 1000);

            return {
              ...ev,
              start,
              end,
              title: ev.title,
              resource: ev
            };
          })
          .filter(Boolean);
        
        setEvents(mappedEvents);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/events', { 
            title, 
            description: desc, 
            date, 
            location,
            visibility: user?.role === 'ADMIN' ? visibility : 'PUBLIC'
        });
        setShowCreate(false);
        setTitle(''); setDesc(''); setDate(''); setLocation('');
        alert(user?.role === 'ADMIN' ? 'Event created!' : 'Request sent successfully!');
        fetchUserAndEvents();
    } catch (e) {
        alert('Failed to create event');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
      try {
          await api.patch(`/events/${id}/status`, { status });
          fetchUserAndEvents();
      } catch (e) {
          alert('Error updating status');
      }
  };

  if (loading) return <div>Loading...</div>;

  const isAdmin = user?.role === 'ADMIN';
  const pendingEvents = events.filter(e => e.status === 'PENDING');
  // Admins see all in calendar/list (except rejected usually, but let's filter rejected for list)
  // Calendar should show approved + pending? Or just approved? 
  // Let's show Approved + Pending (in yellow) for Admins.
  // For users, events only contains Approved.
  const displayEvents = events.filter(e => e.status !== 'REJECTED');

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>📅 Eventos y Actividades</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setShowCalendar(!showCalendar)}>
                {showCalendar ? '🔽 Ocultar Calendario' : '🔼 Ver Calendario'}
            </button>
            <button className="btn" onClick={() => setShowCreate(!showCreate)}>
                {showCreate ? 'Cancelar' : (isAdmin ? '➕ Crear Evento' : '➕ Solicitar Evento')}
            </button>
          </div>
      </div>

      {showCalendar && (
          <div style={{ height: '500px', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <Calendar
                localizer={localizer}
                events={displayEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                culture='es'
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                view={view}
                onView={(newView) => setView(newView)}
                messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "No hay eventos en este rango"
                }}
                eventPropGetter={(event) => {
                    let backgroundColor = '#3174ad';
                    if (event.status === 'PENDING') backgroundColor = '#f59e0b';
                    if (event.visibility === 'ADMIN') backgroundColor = '#dc2626';
                    return { style: { backgroundColor } };
                }}
              />
          </div>
      )}

      {showCreate && (
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #2563eb' }}>
              <h3>{isAdmin ? 'Nuevo Evento' : 'Solicitar Nuevo Evento'}</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required />
                  <textarea placeholder="Descripción" value={desc} onChange={e => setDesc(e.target.value)} />
                  <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                  <input placeholder="Ubicación" value={location} onChange={e => setLocation(e.target.value)} />
                  
                  {isAdmin && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <label>Visibilidad:</label>
                          <select value={visibility} onChange={e => setVisibility(e.target.value)} style={{ padding: '5px' }}>
                              <option value="PUBLIC">Público</option>
                              <option value="ADMIN">Solo Administradores</option>
                          </select>
                      </div>
                  )}
                  
                  <button className="btn">{isAdmin ? 'Publicar' : 'Enviar Solicitud'}</button>
              </form>
          </div>
      )}

      {isAdmin && pendingEvents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
              <h3>⚠️ Solicitudes Pendientes</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                  {pendingEvents.map(ev => (
                      <div key={ev.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', borderLeft: '4px solid #f59e0b' }}>
                          <div>
                              <h4>{ev.title}</h4>
                              <p>{ev.description}</p>
                              <small>Por: @{ev.organizer?.username} | {new Date(ev.date).toLocaleString()}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <button className="btn" style={{ background: '#10b981' }} onClick={() => handleStatusUpdate(ev.id, 'APPROVED')}>Aprobar</button>
                              <button className="btn" style={{ background: '#ef4444' }} onClick={() => handleStatusUpdate(ev.id, 'REJECTED')}>Rechazar</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Banners / Cards Section */}
      <h3>✨ Próximas Actividades</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Static Banners for now as requested */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h3>🎓 Cursos Disponibles</h3>
              <p>Mejora tus habilidades con nuestros cursos exclusivos.</p>
              <button className="btn" style={{ background: 'white', color: '#764ba2', marginTop: '10px' }}>Ver Cursos</button>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', color: '#333' }}>
              <h3>🎮 Torneos de Juegos</h3>
              <p>Participa en los torneos universitarios de E-Sports.</p>
              <button className="btn" style={{ background: '#333', color: 'white', marginTop: '10px' }}>Inscribirse</button>
          </div>

          {/* Actual Events */}
          {displayEvents.filter(ev => ev.status === 'APPROVED').map(ev => (
              <div key={ev.id} className="card">
                  <div className="meta" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                      {new Date(ev.date).toLocaleString()}
                      {ev.visibility === 'ADMIN' && <span style={{ marginLeft: '10px', color: 'white', background: '#dc2626', padding: '2px 5px', borderRadius: '4px', fontSize: '0.8rem' }}>ADMIN ONLY</span>}
                  </div>
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                      <span>📍 {ev.location || 'Online'}</span>
                      <span>•</span>
                      <span>@{ev.organizer?.username}</span>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
