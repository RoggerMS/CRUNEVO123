import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

import './QuestionDetail.css';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState<any>(null);
  const [answerBody, setAnswerBody] = useState('');
  const [answerAttachment, setAnswerAttachment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [answersSort, setAnswersSort] = useState<'helpful' | 'recent'>('helpful');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchQuestion = useCallback(() => {
    const params = answersSort ? `?answersSort=${answersSort}` : '';
    api.get(`/aula/questions/${id}${params}`)
      .then(res => {
        setQuestion(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load question');
        setLoading(false);
      });
  }, [id, answersSort]);

  useEffect(() => {
    api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    fetchQuestion();
  }, [id, answersSort, fetchQuestion]);

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/aula/questions/${id}/answers`, { body: answerBody, attachments: answerAttachment ? [answerAttachment] : [] });
      setAnswerBody('');
      setAnswerAttachment('');
      fetchQuestion();
    } catch {
      alert('Failed to answer');
    }
  };

  const handleAccept = async (answerId: string) => {
    try {
      await api.post(`/aula/questions/${id}/accept/${answerId}`);
      fetchQuestion();
    } catch {
      alert('Failed to accept');
    }
  };

  const handleVote = async (targetType: 'QUESTION' | 'ANSWER', targetId: string, value: number) => {
    try {
      await api.post('/aula/vote', { targetType, targetId, value });
      fetchQuestion();
    } catch {
      alert('Failed to vote');
    }
  };

  const handleReport = async (targetType: 'QUESTION' | 'ANSWER', targetId: string) => {
    const reason = prompt('Describe el problema', 'Contenido inapropiado');
    if (!reason) return;
    try {
      await api.post('/reports', { targetType, targetId, reason });
      alert('Reporte enviado a moderación');
    } catch {
      alert('No se pudo enviar el reporte');
    }
  };

  const handleStatusChange = async (targetType: 'QUESTION' | 'ANSWER', targetId: string, status: 'ACTIVE' | 'HIDDEN' | 'DELETED') => {
    if (!confirm(`¿Cambiar estado a ${status}?`)) return;
    try {
      const endpoint = targetType === 'QUESTION'
        ? `/aula/questions/${targetId}/status`
        : `/answers/${targetId}/status`;
      await api.patch(endpoint, { status });
      fetchQuestion();
    } catch {
      alert('Error actualizando estado');
    }
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tags', tag);
    setSearchParams(params);
    navigate(`/aula?${params.toString()}`);
  };

  if (loading) return <div className="detail-loading">Cargando pregunta...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!question) return <div className="detail-loading">Pregunta no encontrada</div>;

  const answers = question.answers || [];
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="detail-page">
      <div className="detail-shell">
        <Link to="/aula" className="detail-back">← Volver al Aula</Link>

        <header className="detail-hero">
          <div className="detail-hero-text">
            <span className="detail-eyebrow">Aula</span>
            <h1>{question.title}</h1>
            <div className="detail-chips">
              {question.subject && <span className="detail-chip detail-chip-subject">{question.subject}</span>}
              {Array.isArray(question.tags) && question.tags.map((tag: string) => (
                <button key={tag} onClick={() => handleTagClick(tag)} className="detail-chip">#{tag}</button>
              ))}
            </div>
          </div>
          <div className="detail-hero-stats">
            <div className="detail-stat">
              <span>{question.score}</span>
              <small>votos</small>
            </div>
            <div className="detail-stat">
              <span>{answers.length}</span>
              <small>respuestas</small>
            </div>
            <div className="detail-stat">
              <span>{question.viewCount ?? question.views ?? 0}</span>
              <small>vistas</small>
            </div>
          </div>
        </header>

        <section className="detail-card question-block">
          <div className="question-vote">
            <button onClick={() => handleVote('QUESTION', question.id, 1)} aria-label="Votar a favor">▲</button>
            <div className="question-score">{question.score}</div>
            <button onClick={() => handleVote('QUESTION', question.id, -1)} aria-label="Votar en contra">▼</button>
          </div>
          <div className="question-body-wrap">
            <div className="question-body-text">{question.body}</div>

            {Array.isArray(question.attachments) && question.attachments.length > 0 && (
              <div className="question-attachments">
                {question.attachments.map((att: string) => (
                  <a key={att} href={att} target="_blank" rel="noreferrer">
                    <img src={att} alt="Adjunto" />
                  </a>
                ))}
              </div>
            )}

            <div className="question-footer">
              <div className="question-author">
                <Link to={`/users/${question.author?.id}/profile`} className="question-author-chip">
                  <div className="question-avatar">
                    {question.author?.avatar ? <img src={question.author.avatar} alt={question.author.username} /> : question.author?.username?.[0]}
                  </div>
                  @{question.author?.username}
                </Link>
                <span className="dot">•</span>
                <span>{new Date(question.createdAt).toLocaleString()}</span>
              </div>
              <div className="question-actions">
                <button onClick={() => handleReport('QUESTION', question.id)} className="link-ghost">Reportar</button>
                {isAdmin && (
                  <div className="admin-actions">
                    <button onClick={() => handleStatusChange('QUESTION', question.id, 'HIDDEN')}>Ocultar</button>
                    <button onClick={() => handleStatusChange('QUESTION', question.id, 'DELETED')}>Borrar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="detail-card answers-header">
          <h2>{answers.length} Respuestas</h2>
          <div className="answers-sort">
            <span>Ordenar por:</span>
            <select
              value={answersSort}
              onChange={(e) => setAnswersSort(e.target.value as any)}
            >
              <option value="helpful">Más útiles</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>
        </section>

        <section className="answers-list">
          {answers.map((ans: any) => (
            <article
              key={ans.id}
              className={`answer-card ${question.acceptedAnswerId === ans.id ? 'is-accepted' : ''} ${ans.status === 'HIDDEN' ? 'is-hidden' : ''}`}
            >
              <div className="answer-vote">
                <button onClick={() => handleVote('ANSWER', ans.id, 1)} aria-label="Votar a favor">▲</button>
                <div className="answer-score">{ans.score}</div>
                <button onClick={() => handleVote('ANSWER', ans.id, -1)} aria-label="Votar en contra">▼</button>
                {question.acceptedAnswerId === ans.id && <span className="accepted-mark" title="Respuesta aceptada">✓</span>}
              </div>

              <div className="answer-body">
                <div className="answer-text">
                  {ans.body}
                </div>

                {Array.isArray(ans.attachments) && ans.attachments.length > 0 && (
                  <div className="answer-attachments">
                    {ans.attachments.map((att: string) => (
                      <a key={att} href={att} target="_blank" rel="noreferrer">
                        <img src={att} alt="Adjunto" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="answer-footer">
                  <div className="answer-author">
                    {ans.body.startsWith('🤖') && <span className="bot">🤖</span>}
                    <span>@{ans.author.username}</span>
                    <span className="dot">•</span>
                    <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="answer-actions">
                    {currentUser && (currentUser.id === question.authorId || isAdmin) && !question.acceptedAnswerId && (
                      <button onClick={() => handleAccept(ans.id)} className="link-cta">Aceptar como solución</button>
                    )}
                    <button onClick={() => handleReport('ANSWER', ans.id)} className="link-ghost">Reportar</button>
                    {isAdmin && (
                      <div className="admin-actions">
                        <button onClick={() => handleStatusChange('ANSWER', ans.id, 'HIDDEN')}>Ocultar</button>
                        <button onClick={() => handleStatusChange('ANSWER', ans.id, 'DELETED')}>Borrar</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}

          {answers.length === 0 && (
            <div className="answer-empty">
              Aún no hay respuestas. ¡Sé el primero en ayudar!
            </div>
          )}
        </section>

        <section className="detail-card answer-form">
          <h3>Tu respuesta</h3>
          <form onSubmit={handleAnswer}>
            <textarea
              placeholder="Escribe tu solución aquí... (Sé amable y claro)"
              value={answerBody}
              onChange={e => setAnswerBody(e.target.value)}
              required
            />

            <div className="answer-form-actions">
              <input
                placeholder="URL de imagen de apoyo (opcional)"
                value={answerAttachment}
                onChange={e => setAnswerAttachment(e.target.value)}
              />
              <button className="detail-primary">
                Publicar respuesta
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
