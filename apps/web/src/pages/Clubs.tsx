import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';

export default function Clubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;
    try {
      const { data } = await api.post('/clubs', { name: newClubName, description: newClubDesc });
      navigate(`/clubs/${data.id}`);
    } catch (error) {
      alert('Failed to create club');
    }
  };

  const isMember = (clubId: string) => myClubs.some(c => c.id === clubId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Clubes</h1>
          <button className="btn" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '➕ Crear Club'}
          </button>
      </div>
      
      {showCreate && (
          <div className="card" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <h3>Create New Club</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                placeholder="Club Name" 
                value={newClubName} 
                onChange={e => setNewClubName(e.target.value)} 
                required 
              />
              <input 
                placeholder="Description (optional)" 
                value={newClubDesc} 
                onChange={e => setNewClubDesc(e.target.value)} 
              />
              <button className="btn">Create Club</button>
            </form>
          </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {clubs.map(club => {
          const amMember = isMember(club.id);
          return (
            <div key={club.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                <h3>{club.name}</h3>
                <p style={{ flex: 1 }}>{club.description}</p>
                <div className="meta" style={{ marginBottom: '1rem' }}>{club._count.members} Members</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {amMember ? (
                        <Link to={`/clubs/${club.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                            View Club
                        </Link>
                    ) : (
                        <Link to={`/clubs/${club.id}`} className="btn" style={{ flex: 1, textAlign: 'center' }}>
                            Join Club
                        </Link>
                    )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
