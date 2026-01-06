import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  const fetchProduct = useCallback(() => {
    api.get(`/store/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id, fetchProduct]);

  const handleBuy = () => {
    if (!confirm(`Confirm purchase for S/ ${product.price}?`)) return;
    setBuying(true);
    api.post(`/store/products/${id}/buy`)
      .then(() => {
        alert('Purchase successful!');
        navigate('/store/orders/mine');
      })
      .catch(err => {
        console.error(err);
        alert('Purchase failed');
        setBuying(false);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ width: '300px', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.5rem', color: '#888' }}>{product.type}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h1>{product.title}</h1>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>S/ {product.price}</p>
            <p>Sold by <strong>@{product.owner.username}</strong></p>
            <div style={{ margin: '1rem 0', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
              <p>{product.description || 'No description provided.'}</p>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button 
                className="btn" 
                onClick={handleBuy} 
                disabled={buying}
                style={{ fontSize: '1.2rem', padding: '10px 30px' }}
              >
                {buying ? 'Processing...' : `Buy Now for S/ ${product.price}`}
              </button>
              <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                {product._count?.purchases || 0} purchases so far.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
