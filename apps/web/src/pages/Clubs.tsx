import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';

export default function Clubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
        api.get('/clubs'),
        api.get('/clubs/my-clubs').catch(() => ({ data: [] }))
    ])
      .then(([resAll, resMy]) => {
        setClubs(resAll.data);
        setMyClubs(resMy.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load clubs');
        setLoading(false);
      });
  }, []);

  const isMember = (clubId: string) => myClubs.some(c => c.id === clubId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ maxWidth: '650px' }}>
          <p className="badge" style={{ marginBottom: '0.75rem' }}>Comunidades</p>
          <h1 style={{ margin: 0 }}>Clubes</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#4b5563' }}>
            Explora comunidades temáticas, comparte recursos y colabora con personas con tus mismos intereses.
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/clubs/new')}>
          ➕ Crear Club
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {clubs.map(club => {
          const amMember = isMember(club.id);
          const cover = club.coverImageUrl || 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=60';
          return (
            <div key={club.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{club.name}</h3>
                  {amMember && <span className="badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>Miembro</span>}
                </div>
                <p style={{ flex: 1, margin: '0.5rem 0 0.75rem', color: '#4b5563' }}>{club.description || 'Sin descripción disponible.'}</p>
                <div className="meta" style={{ marginBottom: '1rem' }}>{club._count.members} miembros</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to={`/clubs/${club.id}`} className={amMember ? 'btn btn-secondary' : 'btn'} style={{ flex: 1, textAlign: 'center' }}>
                    {amMember ? 'Ver Club' : 'Unirse'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
