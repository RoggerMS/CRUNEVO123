import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/store/orders/mine')
      .then(res => {
        setPurchases(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>My Purchases</h1>
      {loading ? <div>Loading...</div> : purchases.length === 0 ? (
        <div className="card">You haven't purchased anything yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {purchases.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{p.product.title}</h3>
                <p>Purchased on {new Date(p.createdAt).toLocaleDateString()}</p>
                <p>Price: S/ {p.amount}</p>
              </div>
              <Link to={`/store/${p.product.id}`} className="btn btn-secondary">View Product</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
