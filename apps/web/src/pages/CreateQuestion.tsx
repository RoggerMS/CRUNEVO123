import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, HelpCircle, Lightbulb } from 'lucide-react';

import './CreateQuestion.css';

export default function CreateQuestion() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [attachments, setAttachments] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similar, setSimilar] = useState<any[]>([]);
  const navigate = useNavigate();
  const titleMax = 120;
  const bodyMax = 1500;

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
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (parsedTags.length > 5) {
      setError('Máximo 5 tags para mantener la pregunta clara.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/aula/questions', {
        title,
        body,
        subject,
        tags: parsedTags,
        attachments: attachments.filter(Boolean),
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
    <div className="ask-page">
      <div className="ask-shell">
        <Link to="/aula" className="ask-back">
          <ArrowLeft size={16} />
          Volver al Aula
        </Link>

        <header className="ask-hero">
          <span className="ask-hero-eyebrow">Aula</span>
          <div>
            <h1>Hacer una pregunta</h1>
            <p>Recibe ayuda de la comunidad en minutos.</p>
          </div>
        </header>

        <div className="ask-grid">
          <form onSubmit={handleSubmit} className="ask-card ask-form">
            {error && (
              <div className="ask-alert" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="ask-field">
              <div className="ask-field-head">
                <label>Título de tu pregunta</label>
                <span className="ask-helper">Un buen título resume el problema en una frase corta y directa.</span>
              </div>
              <input
                placeholder="Ej: ¿Cómo resuelvo esta ecuación cuadrática?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                minLength={8}
                maxLength={titleMax}
                className="ask-input"
              />
              <p className="ask-meta">
                <span>Sé concreto y directo.</span>
                <span>{title.length}/{titleMax} | mínimo 8</span>
              </p>
            </div>

            <div className="ask-field">
              <div className="ask-field-head">
                <label>Detalles y contexto</label>
                <span className="ask-helper">Explica qué intentaste y dónde te atascaste. Cuantos más detalles, mejor respuesta.</span>
              </div>
              <textarea
                placeholder="Explica tu problema con el mayor detalle posible..."
                value={body}
                onChange={e => setBody(e.target.value)}
                required
                minLength={20}
                maxLength={bodyMax}
                className="ask-textarea"
              />
              <p className="ask-meta">
                <span>Incluye pasos, código o capturas para contextualizar.</span>
                <span>{body.length}/{bodyMax} | mínimo 20</span>
              </p>
            </div>

            <div className="ask-field-grid">
              <div className="ask-field">
                <div className="ask-field-head">
                  <label>Materia</label>
                  <span className="ask-helper">Dónde encaja mejor tu duda.</span>
                </div>
                <input
                  placeholder="Ej: Matemáticas"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="ask-input"
                />
              </div>
              <div className="ask-field">
                <div className="ask-field-head">
                  <label>Tags</label>
                  <span className="ask-helper">Separa por coma (máx. 5 tags).</span>
                </div>
                <input
                  placeholder="Ej: algebra, ecuaciones"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  required
                  className="ask-input"
                />
              </div>
            </div>

            <div className="ask-field ask-attachments">
              <div className="ask-field-head">
                <label><ImageIcon size={16} /> Imágenes de referencia (Opcional)</label>
                <span className="ask-helper">Pega la URL (Imgur o Drive público). Máximo 5 imágenes.</span>
              </div>
              <div className="ask-attachment-list">
                {attachments.map((url, idx) => (
                  <div key={idx} className="ask-attachment-row">
                    <input
                      placeholder="https://..."
                      value={url}
                      onChange={e => {
                        const newAtts = [...attachments];
                        newAtts[idx] = e.target.value;
                        setAttachments(newAtts);
                      }}
                      className="ask-input"
                    />
                    {attachments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="ask-remove"
                        title="Eliminar campo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {attachments.length < 5 && (
                <button
                  type="button"
                  onClick={() => setAttachments([...attachments, ''])}
                  className="ask-add"
                >
                  + Añadir otra imagen
                </button>
              )}
            </div>

            <div className="ask-actions">
              <Link to="/aula" className="ask-secondary">Cancelar y volver</Link>
              <button
                className="ask-primary"
                disabled={loading || title.length < 8 || body.length < 20 || !subject || !tags}
              >
                {loading ? 'Publicando...' : 'Publicar Pregunta'}
              </button>
            </div>
          </form>

          <div className="ask-aside">
            {similar.length > 0 ? (
              <div className="ask-card ask-similar">
                <div className="ask-aside-title">
                  <HelpCircle size={16} />
                  ¿Tu pregunta ya existe?
                </div>
                <ul>
                  {similar.map(s => (
                    <li key={s.id}>
                      <a
                        href={`/aula/${s.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="ask-similar-title">{s.title}</span>
                        <span className="ask-similar-meta">{s._count?.answers || 0} respuestas • {s.subject}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="ask-card ask-tips">
                <div className="ask-aside-title">
                  <Lightbulb size={16} />
                  Consejos pro
                </div>
                <ul>
                  <li>Sé específico: "¿Cómo derivo x^2?" es mejor que "Ayuda mates".</li>
                  <li>Muestra lo que has intentado.</li>
                  <li>Revisa la ortografía para que sea fácil de leer.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
