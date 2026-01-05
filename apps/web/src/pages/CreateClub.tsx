import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function CreateClub() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const previewImage = coverImageUrl.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError('');

      const { data } = await api.post('/clubs', {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        coverImageUrl: previewImage || undefined,
      });

      navigate(`/clubs/${data.id}`);
    } catch (err) {
      console.error(err);
      setError('No se pudo crear el club. Inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/clubs"
          style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600 }}
        >
          ← Volver a Clubes
        </Link>

        <h1 style={{ marginBottom: '0.5rem' }}>Crear un nuevo club</h1>

        <p style={{ margin: 0, color: '#4b5563' }}>
          Diseña un espacio para tu comunidad. Agrega una portada 16:9 para que luzca increíble en el listado.
        </p>
      </div>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div>
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Portada del club"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setCoverImageUrl('')}
              />
            ) : (
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>
                Agrega una portada 16:9
              </span>
            )}
          </div>

          <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
            Sugerencia: utiliza imágenes horizontales (16:9) para evitar recortes.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error">{error}</div>}

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>
              Nombre del club
            </label>
            <input
              placeholder="Ej. Investigación en IA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>
              Descripción
            </label>
            <textarea
              placeholder="Cuenta de qué trata tu club, actividades y objetivos."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem' }}>
              URL de portada (opcional)
            </label>
            <input
              placeholder="https://images.example.com/mi-portada.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="isPublic" style={{ color: '#374151' }}>
              Club público (visible y unible por cualquier usuario)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear club'}
            </button>

            <Link to="/clubs" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
