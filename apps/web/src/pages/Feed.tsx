import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { formatApiErrorMessage } from '../api/error';
import { Settings } from 'lucide-react';
import FeedItem from '../components/FeedItem';

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
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [activeType, setActiveType] = useState<'DOCUMENT' | 'QUESTION' | 'PHOTO'>('DOCUMENT');
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const visibilityRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const loadFeed = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/feed'),
      api.get('/feed/sidebar-items').catch(() => ({ data: [] }))
    ])
      .then((res) => {
        const data = res[0].data;
        setItems(data);
        
        // Mock views count since backend doesn't provide it yet
        // TODO: Replace with real view count from API
        setViews(prevViews => {
            const newViews = { ...prevViews };
            const v: Record<string, number> = {};
            data.forEach((it: any) => { 
                if (!newViews[it.id]) {
                    v[it.id] = Math.floor(Math.random() * 50) + 1; 
                } else {
                    v[it.id] = newViews[it.id];
                }
            });
            return { ...newViews, ...v };
        });
        
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
  }, []); // No dependencies needed as setters are stable

  useEffect(() => { 
    loadFeed(); 
    api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    api.get('/clubs/my-clubs').then(res => setClubs(res.data)).catch(() => {});
    api.get('/vitality/notifications').then(res => setNotifications(res.data)).catch(() => {});
  }, [loadFeed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setActiveType('PHOTO');
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
    const wasLiked = likedItems[item.id] || false;
    // Optimistic update
    setLikedItems(prev => ({ ...prev, [item.id]: !wasLiked }));

    try {
      const res = await api.post(`/likes/${typeToPath(item.type)}/${item.id}/toggle`);
      const newItems = items.map(it => it.id === item.id ? { ...it, _count: { ...(it._count || {}), likes: res.data.count } } : it);
      setItems(newItems);

      // Confirm with backend state
      if (res.data && typeof res.data.liked === 'boolean') {
        setLikedItems(prev => ({ ...prev, [item.id]: res.data.liked }));
      }
    } catch {
      alert('No se pudo registrar el like');
      // Revert
      setLikedItems(prev => ({ ...prev, [item.id]: wasLiked }));
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

  const handleSelectType = (type: 'DOCUMENT' | 'QUESTION' | 'PHOTO') => {
    setActiveType(type);
    if (type === 'DOCUMENT') navigate('/documents/new');
    if (type === 'QUESTION') navigate('/aula/new');
    if (type === 'PHOTO') fileInputRef.current?.click();
  };

  const visibilityLabel = () => {
    if (visibility === 'PUBLIC') return 'Público';
    const selectedClubName = clubs.find((c) => c.id === selectedClub)?.name;
    return selectedClubName ? `Club: ${selectedClubName}` : 'Club (elige)';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visibilityRef.current && !visibilityRef.current.contains(event.target as Node)) {
        setIsVisibilityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              
              <div className="composer-footer">
                <div className="composer-type-toggle" role="group" aria-label="Tipo de publicación">
                  <button
                    type="button"
                    className="composer-type-segment"
                    data-active={activeType === 'DOCUMENT'}
                    onClick={() => handleSelectType('DOCUMENT')}
                  >
                    <span aria-hidden>📄</span> Documento
                  </button>
                  <button
                    type="button"
                    className="composer-type-segment"
                    data-active={activeType === 'QUESTION'}
                    onClick={() => handleSelectType('QUESTION')}
                  >
                    <span aria-hidden>❓</span> Pregunta
                  </button>
                  <button
                    type="button"
                    className="composer-type-segment"
                    data-active={activeType === 'PHOTO'}
                    onClick={() => handleSelectType('PHOTO')}
                  >
                    <span aria-hidden>📷</span> Foto
                  </button>
                </div>

                <div className="composer-visibility" ref={visibilityRef}>
                  <button
                    type="button"
                    className="composer-visibility-chip"
                    aria-expanded={isVisibilityMenuOpen}
                    onClick={() => setIsVisibilityMenuOpen((prev) => !prev)}
                  >
                    <span className="composer-visibility-label">Visibilidad</span>
                    <span className="composer-visibility-value">{visibilityLabel()}</span>
                    <span className="composer-visibility-caret" aria-hidden>▾</span>
                  </button>
                  {isVisibilityMenuOpen && (
                    <div className="composer-visibility-menu">
                      <button
                        type="button"
                        className="composer-visibility-option"
                        data-active={visibility === 'PUBLIC'}
                        onClick={() => {
                          setVisibility('PUBLIC');
                          setSelectedClub('');
                          setIsVisibilityMenuOpen(false);
                        }}
                      >
                        Público
                      </button>
                      <button
                        type="button"
                        className="composer-visibility-option"
                        data-active={visibility === 'CLUB'}
                        onClick={() => {
                          setVisibility('CLUB');
                          setIsVisibilityMenuOpen(true);
                        }}
                      >
                        Club
                      </button>
                      {visibility === 'CLUB' && (
                        <div className="composer-visibility-select">
                          <label htmlFor="club-select">Alcance</label>
                          <select
                            id="club-select"
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                          >
                            <option value="">Selecciona club</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="composer-spacer" aria-hidden />

                <button 
                  className="btn composer-publish-btn" 
                  disabled={!newPost.trim() && !image || (visibility === 'CLUB' && !selectedClub)}
                >
                  Publicar
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </form>
          </div>
          
          {items.length === 0 ? (
            <div className="card">No content yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <FeedItem
                  key={item.id}
                  item={item}
                  currentUser={currentUser}
                  views={views[item.id]}
                  isLiked={likedItems[item.id] || false}
                  onToggleLike={() => handleToggleLike(item)}
                  onToggleComments={() => toggleComments(item)}
                  isCommentsExpanded={expandedComments[item.id]}
                  comments={commentsData[item.id] || []}
                  newCommentBody={newCommentBody[item.id] || ''}
                  onCommentChange={(val) => setNewCommentBody({ ...newCommentBody, [item.id]: val })}
                  onSubmitComment={() => submitComment(item)}
                  viewVisibility={viewVisibility[item.id] ?? (isAuthor(item) ? globalViewPublic : false)}
                  onToggleViewVisibility={() => toggleViewVisibility(item)}
                  onHide={() => handleHideItem(item.id)}
                  isAuthor={isAuthor(item)}
                  shouldShowViews={shouldShowViews(item)}
                />
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
