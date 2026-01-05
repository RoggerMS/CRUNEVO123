import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';

export default function Sidebar() {
  const location = useLocation();
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch User Profile
    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(() => {});

    api.get('/clubs/my-clubs')
      .then(res => setMyClubs(res.data.slice(0, 5)))
      .catch(() => {}); // Ignore if not logged in
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div style={{ 
        width: '250px', 
        height: '100vh', 
        position: 'sticky', 
        top: 0, 
        borderRight: '1px solid #e5e7eb', // Gris muy suave
        padding: '2rem 1rem',
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#ffffff', // Forzado con backgroundColor
        background: '#ffffff', // Redundante por si acaso
        color: '#333333' // Gris oscuro
    }}>
      <Link to="/feed" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#2563eb', textDecoration: 'none' }}>
        CRUNEVO
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'transparent' }}>
        <NavItem to="/feed" icon="🏠" label="Feed" active={isActive('/feed')} />
        <NavItem to="/aula" icon="🎓" label="Aula" active={isActive('/aula')} />
        <NavItem to="/apuntes" icon="📚" label="Apuntes" active={isActive('/apuntes')} />
        <NavItem to="/clubs" icon="👥" label="Clubes" active={isActive('/clubs')} />
        <NavItem to="/events" icon="📅" label="Eventos" active={isActive('/events')} />
        <NavItem to="/store" icon="🛒" label="Tienda" active={isActive('/store')} />
        <NavItem to="/messages" icon="💬" label="Chat" active={isActive('/messages')} />
        {user?.role === 'ADMIN' && (
            <div style={{ marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                <NavItem to="/admin" icon="🛡️" label="Admin Panel" active={isActive('/admin')} />
            </div>
        )}
      </nav>

      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            marginBottom: '1rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            fontWeight: 'bold'
        }}>Mis Clubes</h4>
        {myClubs.length === 0 ? (
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Únete a un club para verlo aquí.</div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {myClubs.map(club => (
                    <Link 
                        key={club.id} 
                        to={`/clubs/${club.id}`}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            textDecoration: 'none', 
                            color: '#4b5563',
                            fontSize: '0.95rem',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ width: '24px', height: '24px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#374151' }}>{club.name}</span>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: any) {
    return (
        <Link 
            to={to} 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                color: active ? '#2563eb' : '#374151', 
                background: active ? '#eff6ff' : 'transparent',
                fontWeight: active ? '600' : 'normal',
                transition: 'background 0.2s, color 0.2s'
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#000000';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                }
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            {label}
        </Link>
    );
}
