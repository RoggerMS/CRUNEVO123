import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState<any>(null);
  const [answerBody, setAnswerBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    fetchQuestion();
  }, [id]);

  const fetchQuestion = () => {
    api.get(`/aula/questions/${id}`)
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
      await api.post(`/aula/questions/${id}/answers`, { body: answerBody });
      setAnswerBody('');
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!question) return <div>Question not found</div>;

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
            Asked by @{question.author.username} • {new Date(question.createdAt).toLocaleDateString()}
          </div>
          {question.tags && <div style={{ fontSize: '0.9rem', color: '#007bff', marginTop: '0.5rem' }}>Tags: {question.tags}</div>}
        </div>
      </div>

      <h2>{question.answers.length} Answers</h2>
      <div style={{ marginBottom: '2rem' }}>
        {question.answers.map((ans: any) => (
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
              <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <span>@{ans.author.username} • {new Date(ans.createdAt).toLocaleDateString()}</span>
                {currentUser && (currentUser.id === question.authorId || currentUser.role === 'ADMIN') && !question.acceptedAnswerId && (
                   <button onClick={() => handleAccept(ans.id)} className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.8rem' }}>Accept Answer</button>
                )}
                {question.acceptedAnswerId === ans.id && <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Solution</span>}
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
        <button className="btn">Submit Answer</button>
      </form>
    </div>
  );
}
