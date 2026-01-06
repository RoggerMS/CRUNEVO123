import { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import { formatApiErrorMessage } from '../api/error';
import { Eye, Settings } from 'lucide-react';
import FeedMenu from '../components/FeedMenu';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Feed() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CLUB'>('PUBLIC');
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [views, setViews] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});
  const [newCommentBody, setNewCommentBody] = useState<Record<string, string>>({});
  const [sidebarItems, setSidebarItems] = useState<any[]>([]);
  const [viewVisibility, setViewVisibility] = useState<Record<string, boolean>>({});
  const [globalViewPublic, setGlobalViewPublic] = useState(false);

  useEffect(() => {
    const storedPref = localStorage.getItem('globalViewPublic');
    if (storedPref) {
      setGlobalViewPublic(storedPref === 'true');
    }
  }, []);

  const toggleGlobalViewPublic = () => {
    const newValue = !globalViewPublic;
    setGlobalViewPublic(newValue);
    localStorage.setItem('globalViewPublic', String(newValue));
    alert(`Preferencia global actualizada: Vistas ${newValue ? 'públicas' : 'privadas'} por defecto.`);
  };

  const loadFeed = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/feed'),
      api.get('/feed/sidebar-items').catch(() => ({ data: [] }))
    ])
      .then((res) => {
        const data = res[0].data;
        setItems(data);
        const v: Record<string, number> = {};
        
        // Mock views count since backend doesn't provide it yet
        // TODO: Replace with real view count from API
        data.forEach((it: any) => { 
            if (!views[it.id]) {
                v[it.id] = Math.floor(Math.random() * 50) + 1; 
            } else {
                v[it.id] = views[it.id];
            }
        });
        
        setViews(prev => ({ ...prev, ...v }));
        setSidebarItems(Array.isArray(res[1].data) ? res[1].data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        } else {
          setError('Failed to load feed: ' + formatApiErrorMessage(err));
        }
        setLoading(false);
      });
  };

  useEffect(() => { 
    loadFeed(); 
    api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    api.get('/clubs/my-clubs').then(res => setClubs(res.data)).catch(() => {});
    api.get('/vitality/notifications').then(res => setNotifications(res.data)).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !image) return;

    const formData = new FormData();
    formData.append('content', newPost);
    if (visibility === 'CLUB' && selectedClub) {
      formData.append('clubId', selectedClub);
    }
    if (image) {
      formData.append('image', image);
    }

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewPost('');
      setImage(null);
      setPreview(null);
      setSelectedClub('');
      loadFeed();
    } catch (error: any) {
      alert(formatApiErrorMessage(error));
    }
  };

  const typeToPath = (t: 'POST' | 'DOCUMENT' | 'QUESTION') => {
    if (t === 'POST') return 'post';
    if (t === 'DOCUMENT') return 'document';
    return 'question';
  };

  const handleToggleLike = async (item: any) => {
    try {
      const res = await api.post(`/likes/${typeToPath(item.type)}/${item.id}/toggle`);
      const newItems = items.map(it => it.id === item.id ? { ...it, _count: { ...(it._count || {}), likes: res.data.count } } : it);
      setItems(newItems);
    } catch {
      alert('No se pudo registrar el like');
    }
  };

  const toggleComments = async (item: any) => {
    const key = item.id;
    const nowExpanded = !expandedComments[key];
    setExpandedComments({ ...expandedComments, [key]: nowExpanded });
    if (nowExpanded && !commentsData[key]) {
      try {
        const res = await api.get(`/comments/${typeToPath(item.type)}/${item.id}`);
        setCommentsData({ ...commentsData, [key]: res.data });
      } catch {
        setCommentsData({ ...commentsData, [key]: [] });
      }
    }
  };

  const submitComment = async (item: any) => {
    const key = item.id;
    const body = (newCommentBody[key] || '').trim();
    if (!body) return;
    try {
      await api.post(`/comments/${typeToPath(item.type)}/${item.id}`, { body });
      const res = await api.get(`/comments/${typeToPath(item.type)}/${item.id}`);
      setCommentsData({ ...commentsData, [key]: res.data });
      const newItems = items.map(it => it.id === item.id ? { ...it, _count: { ...(it._count || {}), comments: (it._count?.comments || 0) + 1 } } : it);
      setItems(newItems);
      setNewCommentBody({ ...newCommentBody, [key]: '' });
    } catch {
      alert('No se pudo publicar el comentario');
    }
  };

  const toggleViewVisibility = (item: any) => {
    const isAuth = isAuthor(item);
    const current = viewVisibility[item.id] ?? (isAuth ? globalViewPublic : false);
    setViewVisibility(prev => ({ ...prev, [item.id]: !current }));
  };

  const handleHideItem = (itemId: string) => {
    setItems(items.filter(it => it.id !== itemId));
  };

  const isAuthor = (item: any) => {
    const itemOwnerId = item.owner?.id || item.author?.id;
    return currentUser && itemOwnerId && currentUser.id === itemOwnerId;
  };

  // Only authors see view counts by default; they can optionally share counts publicly per post.
  const shouldShowViews = (item: any) => {
    if (isAuthor(item)) return true;
    return viewVisibility[item.id] === true;
  };

  if (loading && items.length === 0) return <div>Loading...</div>;
  if (error) {
      return (
          <div className="error" style={{ margin: '2rem', textAlign: 'center' }}>
              <h3>Error</h3>
              <p>{error}</p>
              <button className="btn" onClick={loadFeed}>Reintentar</button>
          </div>
      );
  }

  return (
    <div className="feed-container">
 

      <div className="feed-grid">
        <div>
          <div className="card" style={{ padding: '1rem', marginBottom: '2rem' }}>
            <form onSubmit={handlePost}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {currentUser ? (
                   <img 
                      src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} 
                      alt="Avatar" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                    />
                ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eee' }} />
                )}
                
                <textarea
                  placeholder={`¿Qué quieres compartir hoy${currentUser ? ', ' + currentUser.username : ''}?`}
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    fontSize: '1.1rem',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    padding: '10px 0'
                  }}
                />
              </div>

              {preview && (
                <div style={{ position: 'relative', marginBottom: '1rem', display: 'inline-block' }}>
                  <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                  <button 
                    type="button"
                    onClick={() => { setImage(null); setPreview(null); }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px solid #eee',
                  paddingTop: '0.8rem'
                }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <Link to="/documents/new" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        📄 Documento
                     </Link>
                     <Link to="/aula/new" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ❓ Pregunta
                     </Link>
                     <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                     />
                     <span 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                     >
                      📷 Foto
                     </span>
                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#666' }}>Visibilidad</span>
                        <select value={visibility} onChange={e => setVisibility(e.target.value as any)} style={{ padding: '6px' }}>
                          <option value="PUBLIC">Público</option>
                          <option value="CLUB">Club</option>
                        </select>
                        {visibility === 'CLUB' && (
                          <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)} style={{ padding: '6px' }}>
                            <option value="">Selecciona club</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        )}
                     </div>
                  </div>
                  <button 
                    className="btn" 
                    disabled={!newPost.trim() && !image || (visibility === 'CLUB' && !selectedClub)}
                    style={{ 
                        opacity: (!newPost.trim() && !image) || (visibility === 'CLUB' && !selectedClub) ? 0.6 : 1, 
                        cursor: (!newPost.trim() && !image) || (visibility === 'CLUB' && !selectedClub) ? 'default' : 'pointer' 
                    }}
                  >
                    Publicar
                  </button>
              </div>
            </form>
          </div>
          
          {items.length === 0 ? (
            <div className="card">No content yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div key={item.id} className="card feed-card">
                  <div className="feed-card-actions">
                    {shouldShowViews(item) && (
                      <div className="feed-view-counter" aria-label={`Visto ${views[item.id] || 0} veces`}>
                        <Eye size={16} />
                        <span>{views[item.id] || 0}</span>
                      </div>
                    )}
                    <FeedMenu
                      isAuthor={isAuthor(item)}
                      viewVisibility={viewVisibility[item.id] ?? (isAuthor(item) ? globalViewPublic : false)}
                      onToggleViewVisibility={() => toggleViewVisibility(item)}
                      onHide={() => handleHideItem(item.id)}
                      onReport={() => alert('Reporte enviado. Gracias por ayudar a mantener la comunidad segura.')}
                      onNotInterested={() => alert('Entendido. Mostraremos menos contenido como este.')}
                      onBookmark={() => {
                        if (item.type === 'POST') {
                            alert('Guardado (simulado) - API pendiente para posts');
                        } else {
                            const type = item.type === 'DOCUMENT' ? 'document' : 'question';
                            api.post(`/bookmarks/${type}/${item.id}`)
                               .then(() => alert('Guardado en marcadores'))
                               .catch(() => alert('Error al guardar'));
                        }
                      }}
                      onExplain={() => alert('Ves esta publicación porque es popular en tu red o sigues al autor.')}
                      onPrivacy={() => alert('Configuración de privacidad del post (Placeholder)')}
                    />
                  </div>
                  <div className="meta">
                    {item.type} • 
                    <span style={{ fontWeight: 'bold', color: '#333' }}> @{item.owner?.username || item.author?.username} </span>
                    • {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  
                  {item.type === 'POST' && (
                    <>
                      <p style={{ fontSize: '1.1rem', marginBottom: item.imageUrl ? '1rem' : 0 }}>{item.content}</p>
                      {item.imageUrl && (
                        <img 
                          src={`${API_URL}/uploads/${item.imageUrl}`} 
                          alt="Post content" 
                          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '0.5rem' }} 
                        />
                      )}
                    </>
                  )}

                  {(item.type === 'DOCUMENT' || item.type === 'QUESTION') && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', position: 'relative' }}>
                      {item.type === 'DOCUMENT' && item.thumbnailUrl && (
                          <img src={item.thumbnailUrl} alt="Thumbnail" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      )}
                      <div style={{ flex: 1 }}>
                          <Link to={item.type === 'DOCUMENT' ? `/documents/${item.id}` : `/aula/${item.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block', margin: '0 0 0.5rem 0' }}>
                            {item.title} 
                            {item.version > 1 && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '5px' }}>Actualizado</span>}
                            {item.qualityStatus === 'VERIFIED' && <span style={{ marginLeft: '5px' }}>✅</span>}
                          </Link>
                          <p style={{ margin: 0 }}>{item.description || item.body?.substring(0, 100)}...</p>
                      </div>
                      <button 
                        onClick={() => {
                            const type = item.type === 'DOCUMENT' ? 'document' : 'question';
                            api.post(`/bookmarks/${type}/${item.id}`)
                               .then(() => alert('Marcador actualizado'))
                               .catch(() => alert('Error al marcar'));
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                            color: '#bbb'
                        }}
                        title="Guardar"
                      >
                        🔖
                      </button>
                    </div>
                  )}

                  {item.tags && (
                    <div style={{ fontSize: '0.9rem', color: '#007bff' }}>
                      Tags: {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <button onClick={() => handleToggleLike(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>👍 {item._count?.likes || 0}</button>
                      <button onClick={() => toggleComments(item)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>💬 {item._count?.comments || 0}</button>
                      {currentUser?.role === 'ADMIN' && <button disabled style={{ background: 'transparent', border: 'none', cursor: 'not-allowed' }}>📌</button>}
                    </div>
                    {item.type === 'QUESTION' && <span>Respuestas: {item._count?.answers || 0}</span>}
                  </div>

                  {expandedComments[item.id] && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(commentsData[item.id] || []).map((c: any) => (
                          <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <img src={`https://ui-avatars.com/api/?name=${c.author.username}&background=random`} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>@{c.author.username}</div>
                              <div>{c.body}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <input 
                          value={newCommentBody[item.id] || ''} 
                          onChange={e => setNewCommentBody({ ...newCommentBody, [item.id]: e.target.value })} 
                          placeholder="Escribe un comentario" 
                          style={{ flex: 1, padding: '8px' }} 
                        />
                        <button className="btn btn-sm" onClick={() => submitComment(item)}>Enviar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>Avisos importantes</h3>
                <button 
                    className="btn" 
                    onClick={toggleGlobalViewPublic}
                    title="Configuración de privacidad de vistas"
                    style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                >
                    <Settings size={14} />
                    {globalViewPublic ? 'Vistas Públicas' : 'Vistas Privadas'}
                </button>
            </div>
            {notifications.length === 0 ? (
              <div>No hay avisos</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.slice(0, 6).map(n => (
                  <div key={n.id} style={{ borderLeft: '4px solid #2563eb', paddingLeft: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontWeight: 'bold' }}>{n.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card sidebar-card">
            <div className="sidebar-header">
              <div>
                <p className="feed-eyebrow">Sección destacada</p>
                <h3>Publicidad y recursos</h3>
              </div>
              <span className="badge">Feed</span>
            </div>
            {sidebarItems.length === 0 ? (
              <div className="sidebar-empty">Aún no hay elementos configurados.</div>
            ) : (
              <div className="sidebar-grid">
                {sidebarItems.map((item) => (
                  <div key={item.id} className="sidebar-item">
                    <div className="sidebar-item-top">
                      <div>
                        <p className="sidebar-type">{item.type?.replace('_', ' ')}</p>
                        <h4>{item.title}</h4>
                      </div>
                      {item.badge && <span className="badge">{item.badge}</span>}
                    </div>
                    {item.imageUrl && (
                      <div className="sidebar-thumb">
                        <img src={item.imageUrl} alt={item.title} />
                      </div>
                    )}
                    {item.description && <p className="sidebar-description">{item.description}</p>}
                    <div className="sidebar-actions">
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-outline">
                          {item.ctaLabel || 'Ver más'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3>Actividad reciente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.slice(0, 6).map(it => (
                <div key={it.id} style={{ fontSize: '0.95rem' }}>
                  {it.type === 'POST' && <span>@{it.author?.username} publicó un post</span>}
                  {it.type === 'DOCUMENT' && <span>@{it.owner?.username} subió un documento</span>}
                  {it.type === 'QUESTION' && <span>@{it.author?.username} publicó una pregunta</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
