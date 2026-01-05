import { useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function CreateQuestion() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/aula/questions', { title, body, tags });
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
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Body" value={body} onChange={e => setBody(e.target.value)} required style={{ minHeight: '150px' }} />
        <input placeholder="Tags" value={tags} onChange={e => setTags(e.target.value)} />
        <button className="btn" disabled={loading} style={{ width: '100%' }}>{loading ? 'Posting...' : 'Post Question'}</button>
      </form>
    </div>
  );
}
