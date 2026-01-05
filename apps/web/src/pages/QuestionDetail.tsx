import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

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

  useEffect(() => {
    api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    fetchQuestion();
  }, [id, answersSort]);

  const fetchQuestion = () => {
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
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/aula/questions/${id}/answers`, { body: answerBody, attachments: answerAttachment ? [answerAttachment] : [] });
      setAnswerBody('');
      setAnswerAttachment('');
      fetchQuestion();
    } catch (error) {
      alert('Failed to answer');
    }
  };

  const handleAccept = async (answerId: string) => {
    try {
      await api.post(`/aula/questions/${id}/accept/${answerId}`);
      fetchQuestion();
    } catch (error) {
      alert('Failed to accept');
    }
  };

  const handleVote = async (targetType: 'QUESTION' | 'ANSWER', targetId: string, value: number) => {
    try {
      await api.post('/aula/vote', { targetType, targetId, value });
      fetchQuestion();
    } catch (error) {
      alert('Failed to vote');
    }
  };

  const handleReport = async (targetType: 'QUESTION' | 'ANSWER', targetId: string) => {
    const reason = prompt('Describe el problema', 'Contenido inapropiado');
    if (!reason) return;
    try {
      await api.post('/reports', { targetType, targetId, reason });
      alert('Reporte enviado a moderación');
    } catch (error) {
      alert('No se pudo enviar el reporte');
    }
  };

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tags', tag);
    setSearchParams(params);
    navigate(`/aula?${params.toString()}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!question) return <div>Question not found</div>;

  const answers = question.answers || [];

  return (
    <div className="container">
      <div className="card" style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ textAlign: 'center', minWidth: '50px' }}>
          <button onClick={() => handleVote('QUESTION', question.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>▲</button>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{question.score}</div>
          <button onClick={() => handleVote('QUESTION', question.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>▼</button>
        </div>
        <div style={{ flex: 1 }}>
          <h1>{question.title}</h1>
          <p style={{ whiteSpace: 'pre-wrap' }}>{question.body}</p>
          <div className="meta">
            <Link to={`/users/${question.author.id}/profile`} style={{ color: '#007bff' }}>@{question.author.username}</Link> • {new Date(question.createdAt).toLocaleString()} • {question.viewCount ?? 0} vistas
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {question.subject && <span className="badge">{question.subject}</span>}
            {Array.isArray(question.tags) && question.tags.map((tag: string) => (
              <button key={tag} type="button" onClick={() => handleTagClick(tag)} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.8rem' }}>
                #{tag}
              </button>
            ))}
          </div>
          {Array.isArray(question.attachments) && question.attachments.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {question.attachments.map((att: string) => (
                <a key={att} href={att} target="_blank" rel="noreferrer">
                  <img src={att} alt="Adjunto" style={{ maxWidth: '160px', borderRadius: '6px' }} />
                </a>
              ))}
            </div>
          )}
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => handleReport('QUESTION', question.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Reportar</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{answers.length} Answers</h2>
        <select value={answersSort} onChange={(e) => setAnswersSort(e.target.value as any)}>
          <option value="helpful">Más útiles</option>
          <option value="recent">Más recientes</option>
        </select>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        {answers.map((ans: any) => (
          <div key={ans.id} className="card" style={{ 
            display: 'flex', 
            gap: '1rem', 
            ...(question.acceptedAnswerId === ans.id ? { border: '2px solid #28a745', background: '#e8f5e9' } : {}),
            ...(ans.body.startsWith('🤖') ? { borderLeft: '4px solid #6c5ce7', background: '#f8f9fa' } : {}) 
          }}>
            <div style={{ textAlign: 'center', minWidth: '50px' }}>
              <button onClick={() => handleVote('ANSWER', ans.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>▲</button>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{ans.score}</div>
              <button onClick={() => handleVote('ANSWER', ans.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>▼</button>
            </div>
            <div style={{ flex: 1 }}>
              <p>{ans.body}</p>
              {Array.isArray(ans.attachments) && ans.attachments.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0' }}>
                  {ans.attachments.map((att: string) => (
                    <a key={att} href={att} target="_blank" rel="noreferrer">
                      <img src={att} alt="Adjunto" style={{ maxWidth: '120px', borderRadius: '4px' }} />
                    </a>
                  ))}
                </div>
              )}
              <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <span>@{ans.author.username} • {new Date(ans.createdAt).toLocaleDateString()}</span>
                {currentUser && (currentUser.id === question.authorId || currentUser.role === 'ADMIN') && !question.acceptedAnswerId && (
                   <button onClick={() => handleAccept(ans.id)} className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.8rem' }}>Accept Answer</button>
                )}
                {question.acceptedAnswerId === ans.id && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Solution</span>}
              </div>
              <div style={{ marginTop: '6px' }}>
                <button onClick={() => handleReport('ANSWER', ans.id)} className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.8rem' }}>Reportar respuesta</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAnswer} className="card">
        <h3>Your Answer</h3>
        <textarea 
          placeholder="Write your answer..." 
          value={answerBody} 
          onChange={e => setAnswerBody(e.target.value)} 
          required 
          style={{ minHeight: '100px' }}
        />
        <input placeholder="URL de imagen (opcional)" value={answerAttachment} onChange={e => setAnswerAttachment(e.target.value)} />
        <button className="btn">Submit Answer</button>
      </form>
    </div>
  );
}
