import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ClubDetail() {
  const { id } = useParams();
  const [club, setClub] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');

  const [myClubs, setMyClubs] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clubRes, feedRes, myClubsRes] = await Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/clubs/${id}/feed`),
        api.get('/clubs/my-clubs').catch(() => ({ data: [] }))
      ]);
      setClub(clubRes.data);
      setFeed(feedRes.data);
      setMyClubs(myClubsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load club');
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const isMember = myClubs.some(c => c.id === id);

  const handleJoin = async () => {
    try {
      await api.post(`/clubs/${id}/join`);
      loadData();
    } catch (error) {
      alert('Failed to join');
    }
  };

  const handleLeave = async () => {
    if(!window.confirm('Are you sure you want to leave this club?')) return;
    try {
        await api.post(`/clubs/${id}/leave`);
        loadData();
    } catch (error) {
        alert('Failed to leave (Owner cannot leave)');
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await api.post('/posts', { content: newPost, clubId: id });
      setNewPost('');
      loadData();
    } catch (error) {
      alert('Failed to post');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!club) return <div>Club not found</div>;
  const cover = club.coverImageUrl || 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=60';

  return (
    <div className="container">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ width: '100%', aspectRatio: '16 / 9', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h1>{club.name}</h1>
        <p>{club.description}</p>
        <div className="meta">Created by @{club.owner.username} • {club._count.members} Members</div>
        
        <div style={{ marginTop: '1rem' }}>
            {isMember ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#198754', fontWeight: 'bold' }}>✅ Eres miembro</span>
                    <button onClick={handleLeave} className="btn" style={{ background: '#dc3545', maxWidth: '200px' }}>Abandonar Club</button>
                </div>
            ) : (
                <button onClick={handleJoin} className="btn">Unirse al Club</button>
            )}
        </div>
        </div>
      </div>

      {isMember && (
          <div className="card">
            <h3>Post to Club</h3>
            <form onSubmit={handlePost} style={{ display: 'flex', gap: '10px' }}>
              <input 
                placeholder="Share with club members..." 
                value={newPost} 
                onChange={e => setNewPost(e.target.value)} 
                style={{ marginBottom: 0, flex: 1 }}
              />
              <button className="btn">Post</button>
            </form>
          </div>
      )}

      <h2>Club Feed</h2>
      {feed.length === 0 ? (
        <div className="card">No activity in this club yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {feed.map((item: any) => (
            <div key={item.id} className="card">
              <div className="meta">
                {item.type} • {new Date(item.createdAt).toLocaleDateString()}
              </div>
              
              {item.type === 'POST' && (
                <p style={{ fontSize: '1.1rem' }}>{item.content}</p>
              )}

              {(item.type === 'DOCUMENT' || item.type === 'QUESTION') && (
                <>
                  <Link to={item.type === 'DOCUMENT' ? `/documents/${item.id}` : `/questions/${item.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block', margin: '0.5rem 0' }}>
                    {item.title}
                  </Link>
                  <p>{item.description || item.body?.substring(0, 100)}...</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
