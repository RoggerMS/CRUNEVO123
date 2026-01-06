import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, MessageCircle, Share2, MessageSquare, BookOpen, FileText, HelpCircle } from 'lucide-react';
import FeedMenu from './FeedMenu';
import { api } from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FeedItemProps {
  item: any;
  currentUser: any;
  views: number;
  isLiked: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  isCommentsExpanded: boolean;
  comments: any[];
  newCommentBody: string;
  onCommentChange: (val: string) => void;
  onSubmitComment: () => void;
  viewVisibility: boolean;
  onToggleViewVisibility: () => void;
  onHide: () => void;
  isAuthor: boolean;
  shouldShowViews: boolean;
}

export default function FeedItem({
  item,
  currentUser,
  views,
  isLiked,
  onToggleLike,
  onToggleComments,
  isCommentsExpanded,
  comments,
  newCommentBody,
  onCommentChange,
  onSubmitComment,
  viewVisibility,
  onToggleViewVisibility,
  onHide,
  isAuthor,
  shouldShowViews
}: FeedItemProps) {

  const renderBadge = (type: string) => {
    switch (type) {
      case 'POST':
        return <span className="post-type-badge post"><MessageSquare size={12} style={{ marginRight: 4, verticalAlign: 'text-top' }} /> Post</span>;
      case 'DOCUMENT':
        return <span className="post-type-badge document"><FileText size={12} style={{ marginRight: 4, verticalAlign: 'text-top' }} /> Documento</span>;
      case 'QUESTION':
        return <span className="post-type-badge question"><HelpCircle size={12} style={{ marginRight: 4, verticalAlign: 'text-top' }} /> Pregunta</span>;
      default:
        return null;
    }
  };

  const handleBookmark = () => {
    if (item.type === 'POST') {
        alert('Guardado (simulado) - API pendiente para posts');
    } else {
        const type = item.type === 'DOCUMENT' ? 'document' : 'question';
        api.post(`/bookmarks/${type}/${item.id}`)
           .then(() => alert('Guardado en marcadores'))
           .catch(() => alert('Error al guardar'));
    }
  };

  return (
    <div className="card feed-card">
      <div className="feed-card-actions">
        {shouldShowViews && (
          <div className="feed-view-counter" aria-label={`Visto ${views || 0} veces`}>
            <Eye size={16} />
            <span>{views || 0}</span>
          </div>
        )}
        <FeedMenu
          isAuthor={isAuthor}
          viewVisibility={viewVisibility}
          onToggleViewVisibility={onToggleViewVisibility}
          onHide={onHide}
          onReport={() => alert('Reporte enviado. Gracias por ayudar a mantener la comunidad segura.')}
          onNotInterested={() => alert('Entendido. Mostraremos menos contenido como este.')}
          onBookmark={handleBookmark}
          onExplain={() => alert('Ves esta publicación porque es popular en tu red o sigues al autor.')}
          onPrivacy={() => alert('Configuración de privacidad del post (Placeholder)')}
        />
      </div>

      <div className="meta" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
        {renderBadge(item.type)}
        <span style={{ fontWeight: 'bold', color: '#333', marginRight: '0.5rem' }}> @{item.owner?.username || item.author?.username} </span>
        • <span style={{ marginLeft: '0.5rem' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      
      {item.type === 'POST' && (
        <>
          <p style={{ fontSize: '1.1rem', marginBottom: item.imageUrl ? '1rem' : 0, lineHeight: 1.6 }}>{item.content}</p>
          {item.imageUrl && (
            <img 
              src={`${API_URL}/uploads/${item.imageUrl}`} 
              alt="Post content" 
              style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '0.5rem', marginTop: '0.5rem' }} 
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
              <Link to={item.type === 'DOCUMENT' ? `/documents/${item.id}` : `/aula/${item.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block', margin: '0 0 0.5rem 0', color: '#111827', textDecoration: 'none' }}>
                {item.title} 
                {item.version > 1 && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '5px' }}>v{item.version}</span>}
                {item.qualityStatus === 'VERIFIED' && <span style={{ marginLeft: '5px' }} title="Verificado">✅</span>}
              </Link>
              <p style={{ margin: 0, color: '#4b5563' }}>{item.description || item.body?.substring(0, 100)}...</p>
          </div>
          <button 
            onClick={handleBookmark}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '4px'
            }}
            title="Guardar"
          >
            <BookOpen size={20} />
          </button>
        </div>
      )}

      {item.tags && (
        <div style={{ fontSize: '0.9rem', color: '#007bff', marginTop: '0.5rem' }}>
          {(Array.isArray(item.tags) ? item.tags : [item.tags]).map((tag: string, i: number) => (
             <span key={i} style={{ marginRight: '8px' }}>#{tag}</span>
          ))}
        </div>
      )}

      <div className="interaction-bar">
        <div className="interaction-group">
          <button 
            onClick={onToggleLike} 
            className={`interaction-btn ${isLiked ? 'active' : ''}`}
            aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
            aria-pressed={isLiked}
          >
            <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} /> 
            <span>{item._count?.likes || 0}</span>
          </button>
          
          <button 
            onClick={onToggleComments} 
            className="interaction-btn"
            aria-label="Comentarios"
          >
            <MessageCircle size={18} />
            <span>{item._count?.comments || 0}</span>
          </button>
          
          <button className="interaction-btn">
             <Share2 size={18} />
             <span style={{ display: 'none' }}>Compartir</span>
          </button>
        </div>
        
        {item.type === 'QUESTION' && <span style={{ fontSize: '0.9rem', color: '#666' }}>{item._count?.answers || 0} Respuestas</span>}
      </div>
      
      {/* Comments Logic */}
      {(item._count?.comments > 0 || isCommentsExpanded) && (
        <div style={{ marginTop: '0.5rem' }}>
            {!isCommentsExpanded ? (
                 <button className="comments-toggle" onClick={onToggleComments}>
                    Ver los {item._count?.comments} comentarios
                 </button>
            ) : (
                <div className="comments-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Comentarios</h4>
                        <button className="comments-toggle" onClick={onToggleComments} style={{ padding: 0 }}>Ocultar</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                        {comments.length === 0 ? <p style={{ color: '#666', fontStyle: 'italic' }}>Cargando comentarios...</p> : 
                            comments.map((c: any) => (
                            <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <img src={`https://ui-avatars.com/api/?name=${c.author.username}&background=random`} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                <div style={{ background: '#fff', padding: '0.8rem', borderRadius: '8px', border: '1px solid #eee', flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>@{c.author.username}</div>
                                    <div style={{ fontSize: '0.95rem' }}>{c.body}</div>
                                </div>
                            </div>
                            ))
                        }
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <img 
                            src={currentUser ? `https://ui-avatars.com/api/?name=${currentUser.username}&background=random` : ''} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', opacity: currentUser ? 1 : 0 }}
                            alt=""
                        />
                        <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                            <input 
                                value={newCommentBody} 
                                onChange={e => onCommentChange(e.target.value)} 
                                placeholder="Escribe un comentario..." 
                                style={{ flex: 1, padding: '8px', borderRadius: '20px', margin: 0 }} 
                                onKeyDown={(e) => { if (e.key === 'Enter') onSubmitComment(); }}
                            />
                            <button 
                                className="btn btn-sm" 
                                onClick={onSubmitComment}
                                disabled={!newCommentBody.trim()}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
