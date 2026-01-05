import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';

export default function Store() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';

  useEffect(() => {
    fetchProducts();
  }, [q, type]);

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (type) params.append('type', type);

    api.get(`/store/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Store</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/store/orders/mine" className="btn btn-secondary">My Purchases</Link>
          <Link to="/store/new" className="btn">Sell Product</Link>
        </div>
      </div>
      
      <div className="card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          placeholder="Search products..." 
          value={q} 
          onChange={e => updateFilter('q', e.target.value)} 
          style={{ marginBottom: 0, flex: 1 }}
        />
        <select value={type} onChange={e => updateFilter('type', e.target.value)} style={{ marginBottom: 0 }}>
          <option value="">All Types</option>
          <option value="DIGITAL_RESOURCE">Digital Resource</option>
          <option value="COURSE">Course</option>
          <option value="SERVICE">Service</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {loading ? <div>Loading...</div> : products.length === 0 ? (
          <div className="card">No products found.</div>
        ) : (
          products.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '150px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', borderRadius: '4px' }}>
                <span style={{ color: '#888' }}>{p.type}</span>
              </div>
              <h3 style={{ margin: '0 0 5px 0' }}>{p.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>By @{p.owner.username}</p>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>S/ {p.price}</span>
                <Link to={`/store/${p.id}`} className="btn btn-sm">View</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
