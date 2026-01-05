import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadDoc();
  }, [id]);

  const loadDoc = () => {
    api.get(`/documents/${id}`)
      .then(res => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load document');
        setLoading(false);
      });
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      
      try {
          await api.post(`/documents/${id}/version`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setShowUpload(false);
          setFile(null);
          loadDoc();
          alert('New version uploaded!');
      } catch (err) {
          alert('Failed to upload version');
      }
  };

  const handleStatus = (status: string) => {
      if (!window.confirm(`Mark as ${status}?`)) return;
      api.post(`/documents/${id}/status`, { status })
        .then(() => loadDoc())
        .catch(err => alert(err.response?.data?.message || 'Failed'));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!doc) return <div>Document not found</div>;

  const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${doc.filePath}`;
  
  // Assuming we have current user ID in localStorage or context, but for MVP check if "owner" object matches logic
  // Since we don't have easy access to current user ID here without context, let's just show button if token exists 
  // and let backend reject if not owner. Better UX would be to check ID.
  // We can decode token or fetch /me. But for MVP speed:
  
  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {doc.thumbnailUrl && <img src={doc.thumbnailUrl} style={{ width: '50px', height: '50px' }} />}
            <h1>{doc.title} <span style={{ fontSize: '0.6em', color: '#666' }}>(v{doc.version})</span></h1>
            {doc.qualityStatus === 'VERIFIED' && <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Verified</span>}
            {doc.qualityStatus === 'FLAGGED' && <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Flagged</span>}
            {doc.qualityStatus === 'REJECTED' && <span style={{ color: 'darkred', fontWeight: 'bold' }}>❌ Rejected</span>}
        </div>
        
        <p>{doc.description}</p>
        <div className="meta">
          Uploaded by @{doc.owner.username} • {new Date(doc.createdAt).toLocaleDateString()} • {doc.mimeType}
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href={fileUrl} download className="btn">Download File</a>
          
          {currentUser && currentUser.id === doc.owner.id && (
            <button className="btn btn-secondary" onClick={() => setShowUpload(!showUpload)}>Upload New Version</button>
          )}

          {currentUser && currentUser.role === 'ADMIN' && (
              <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn btn-sm" style={{ background: 'green' }} onClick={() => handleStatus('VERIFIED')}>Verify</button>
                  <button className="btn btn-sm" style={{ background: 'orange' }} onClick={() => handleStatus('FLAGGED')}>Flag</button>
                  <button className="btn btn-sm" style={{ background: 'red' }} onClick={() => handleStatus('REJECTED')}>Reject</button>
              </div>
          )}
        </div>

        {showUpload && (
            <form onSubmit={handleUploadVersion} style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
                <h4>Upload new version (v{doc.version + 1})</h4>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                <button className="btn" disabled={!file}>Upload</button>
            </form>
        )}
      </div>
      <div style={{ flex: 1, border: '1px solid #ddd', background: '#eee' }}>
        <iframe src={fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={doc.title} />
      </div>
    </div>
  );
}
