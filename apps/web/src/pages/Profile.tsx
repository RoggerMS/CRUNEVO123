import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState<'feed' | 'clubs' | 'bookmarks'>('feed');
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    // Get current user to check "isMe"
    const token = localStorage.getItem('token');
    if (token) {
        api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const promises = [
        api.get(`/users/${id}/profile`),
        api.get(`/clubs/user/${id}`)
    ];
    
    // Only fetch bookmarks if viewing own profile
    // Note: In real app we compare id with currentUser.id but currentUser is async.
    // For now we will try fetching bookmarks and if 403/401 just ignore or empty.
    // Actually we can just fetch it inside the .then if it's me.
    
    Promise.all(promises)
      .then(([resProfile, resClubs]) => {
        setProfile(resProfile.data);
        setClubs(resClubs.data);
        
        // Fetch bookmarks if me
        api.get('/bookmarks').then(res => setBookmarks(res.data)).catch(() => {});
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load profile');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Cargando perfil...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="p-8 text-center text-red-500" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Error: No se pudo cargar el usuario.</div>;

  const { user, feed } = profile;
  const isMe = currentUser && currentUser.id === user.id;
  // Mock following state for MVP or fetch it
  const isFollowing = false; 

  const handleFollow = () => {
    // Stub
    alert('Follow logic stub');
  };

  const handleMessage = () => {
    api.post('/messages/conversations', { toUserId: user.id })
      .then(res => {
        navigate(`/messages/${res.data.id}`);
      })
      .catch(console.error);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditBio(user.bio || '');
  };

  const saveProfile = async () => {
    try {
        await api.patch('/users/me', { bio: editBio });
        setIsEditing(false);
        // Reload
        window.location.reload();
    } catch (e) {
        alert('Failed to update profile');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1>
                @{user.username} 
                <span style={{ fontSize: '0.6em', background: '#ffc107', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px', color: '#333' }}>
                    Lvl {user.level || 1}
                </span>
            </h1>
            
            {isEditing ? (
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <textarea 
                        value={editBio} 
                        onChange={e => setEditBio(e.target.value)}
                        style={{ width: '100%', minHeight: '60px', padding: '5px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <button className="btn" onClick={saveProfile}>Save</button>
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <p>{user.bio || 'No bio yet.'}</p>
            )}

            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                ⭐ {user.points || 0} Points
            </div>
            {user.role === 'TEACHER' && <span className="badge">Teacher</span>}
            {isMe && !isEditing && (
                <button className="btn btn-secondary" style={{ marginTop: '10px' }} onClick={handleEdit}>Edit Profile</button>
            )}
            {!isMe && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn" onClick={handleFollow}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleMessage}>
                        Message
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #ddd' }}>
          <button 
            style={{ 
                padding: '10px 20px', 
                border: 'none', 
                background: 'transparent', 
                borderBottom: tab === 'feed' ? '2px solid #007bff' : 'none',
                fontWeight: tab === 'feed' ? 'bold' : 'normal',
                cursor: 'pointer'
            }}
            onClick={() => setTab('feed')}
          >
            Activity
          </button>
          <button 
            style={{ 
                padding: '10px 20px', 
                border: 'none', 
                background: 'transparent', 
                borderBottom: tab === 'clubs' ? '2px solid #007bff' : 'none',
                fontWeight: tab === 'clubs' ? 'bold' : 'normal',
                cursor: 'pointer'
            }}
            onClick={() => setTab('clubs')}
          >
            Clubes ({clubs.length})
          </button>
      </div>

      {tab === 'feed' && (
        <>
            {feed.length === 0 ? (
                <div className="card">No recent activity.</div>
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

                    {item.tags && <div style={{ fontSize: '0.9rem', color: '#007bff' }}>Tags: {item.tags}</div>}
                    </div>
                ))}
                </div>
            )}
        </>
      )}

      {tab === 'clubs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {clubs.map((club: any) => (
                  <Link to={`/clubs/${club.id}`} key={club.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{club.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{club._count?.members || 0} members</div>
                  </Link>
              ))}
              {clubs.length === 0 && <div>No clubs joined.</div>}
          </div>
      )}

      {tab === 'bookmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookmarks.map((b: any) => {
                const item = b.document || b.question;
                const type = b.document ? 'DOCUMENT' : 'QUESTION';
                return (
                    <div key={b.id} className="card">
                         <div className="meta">
                            Saved {type} • {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                        <Link to={type === 'DOCUMENT' ? `/documents/${item.id}` : `/questions/${item.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block', margin: '0.5rem 0' }}>
                            {item.title}
                        </Link>
                    </div>
                );
            })}
            {bookmarks.length === 0 && <div>No bookmarks yet.</div>}
        </div>
      )}
    </div>
  );
}
