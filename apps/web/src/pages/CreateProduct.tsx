import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'DIGITAL_RESOURCE',
    fileUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    api.post('/store/products', {
      ...formData,
      price: parseFloat(formData.price)
    })
      .then(res => {
        alert('Product created!');
        navigate(`/store/${res.data.id}`);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to create product');
        setLoading(false);
      });
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h1>Sell a Product</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Title</label>
            <input 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          <div>
            <label>Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Price (S/)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                required
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Type</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="DIGITAL_RESOURCE">Digital Resource</option>
                <option value="COURSE">Course (Admin only)</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
          </div>
          <div>
            <label>File URL (Optional)</label>
            <input 
              placeholder="https://..."
              value={formData.fileUrl} 
              onChange={e => setFormData({...formData, fileUrl: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
