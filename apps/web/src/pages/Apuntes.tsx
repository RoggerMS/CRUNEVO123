import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';

export default function Apuntes() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'newest';
  const mine = searchParams.get('mine') === 'true';

  const fetchDocs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (type) params.append('type', type);
    if (sort) params.append('sort', sort);
    if (mine) params.append('mine', 'true');

    api.get(`/apuntes?${params.toString()}`)
      .then(res => {
        setDocs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [q, type, sort, mine]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Apuntes</h1>
          <Link to="/documents/new" className="btn">Subir Apunte</Link>
      </div>
      
      <div className="card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          placeholder="Search..." 
          value={q} 
          onChange={e => updateFilter('q', e.target.value)} 
          style={{ marginBottom: 0, flex: 1 }}
        />
        <select value={type} onChange={e => updateFilter('type', e.target.value)} style={{ marginBottom: 0 }}>
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="img">Images</option>
          <option value="other">Other</option>
        </select>
        <select value={sort} onChange={e => updateFilter('sort', e.target.value)} style={{ marginBottom: 0 }}>
          <option value="newest">Newest</option>
          <option value="top">Top Downloads</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={mine} 
            onChange={e => updateFilter('mine', e.target.checked ? 'true' : '')} 
          />
          My Docs
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {loading ? <div>Loading...</div> : docs.length === 0 ? (
          <div className="card">No documents found.</div>
        ) : (
          docs.map(doc => (
            <div key={doc.id} className="card">
              <div style={{ display: 'flex', gap: '1rem' }}>
                {doc.thumbnailUrl && (
                    <img src={doc.thumbnailUrl} alt="Thumbnail" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <Link to={`/apuntes/${doc.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {doc.title}
                        </Link>
                        {doc.version > 1 && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '5px' }}>(v{doc.version})</span>}
                        {doc.qualityStatus === 'VERIFIED' && <span style={{ marginLeft: '5px' }}>✅</span>}
                    </div>
                    <Link to={`/apuntes/${doc.id}`} className="btn btn-secondary">View</Link>
                  </div>
                  
                  <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                    {doc.mimeType} • {doc.downloadsCount} downloads • {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    By @{doc.owner.username}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
