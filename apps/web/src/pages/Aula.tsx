import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';

export default function Aula() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    api.get(`/aula/questions?q=${query}`)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load questions');
        setLoading(false);
      });
  }, [query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem('q') as HTMLInputElement).value;
    setSearchParams({ q });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Aula</h1>
        <Link to="/aula/new" className="btn">Ask Question</Link>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input name="q" defaultValue={query} placeholder="Search questions..." style={{ marginBottom: 0, flex: 1 }} />
          <button className="btn">Search</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {questions.length === 0 ? (
          <div className="card">No questions found.</div>
        ) : (
          questions.map(q => (
            <div key={q.id} className="card">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{q.score}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>votes</div>
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/aula/${q.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                    {q.title}
                  </Link>
                  <p>{q.body.substring(0, 100)}...</p>
                  <div className="meta">
                    Asked by @{q.author.username} • {q._count.answers} answers • {new Date(q.createdAt).toLocaleDateString()}
                    {q.acceptedAnswerId && <span style={{ marginLeft: '10px', color: '#28a745' }}>✓ Solved</span>}
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
