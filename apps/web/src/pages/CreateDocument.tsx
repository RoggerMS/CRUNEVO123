import { useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function CreateDocument() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Select a file');

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('file', file);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/feed');
    } catch (err: any) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Upload Document</h1>
      <form onSubmit={handleSubmit} className="card">
        {error && <div className="error">{error}</div>}
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required style={{ border: 'none', padding: '0.5rem 0' }} />
        <button className="btn" disabled={loading} style={{ width: '100%' }}>{loading ? 'Uploading...' : 'Upload'}</button>
      </form>
    </div>
  );
}
