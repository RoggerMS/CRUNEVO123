import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function CreateQuestion() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similar, setSimilar] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title.trim().length < 6) {
        setSimilar([]);
        return;
      }
      api.get(`/aula/questions/suggest?q=${encodeURIComponent(title)}`)
        .then(res => setSimilar(res.data))
        .catch(() => setSimilar([]));
    }, 400);
    return () => clearTimeout(handler);
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/aula/questions', { 
        title, 
        body, 
        subject,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        attachments: attachment ? [attachment] : [],
      });
      navigate('/aula');
    } catch (err) {
      console.error(err);
      setError('Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Ask a Question</h1>
      <form onSubmit={handleSubmit} className="card">
        {error && <div className="error">{error}</div>}
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required minLength={8} />
        <textarea placeholder="Describe tu duda con contexto..." value={body} onChange={e => setBody(e.target.value)} required minLength={20} style={{ minHeight: '150px' }} />
        <input placeholder="Materia (obligatorio)" value={subject} onChange={e => setSubject(e.target.value)} required />
        <input placeholder="Tags separados por coma" value={tags} onChange={e => setTags(e.target.value)} required />
        <input placeholder="URL de imagen (opcional)" value={attachment} onChange={e => setAttachment(e.target.value)} />
        {similar.length > 0 && (
          <div className="info" style={{ fontSize: '0.9rem', background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>¿Se parece a estas?</div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
              {similar.map(s => (
                <li key={s.id}>
                  <a href={`/aula/${s.id}`} style={{ color: '#007bff' }}>{s.title}</a> {s.subject ? `(${s.subject})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="btn" disabled={loading} style={{ width: '100%' }}>{loading ? 'Posting...' : 'Post Question'}</button>
      </form>
    </div>
  );
}
