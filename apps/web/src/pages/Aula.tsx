import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';

export default function Aula() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'recent';
  const initialTags = searchParams.get('tags') || '';

  const [tab, setTab] = useState<'recent' | 'unanswered' | 'popular'>(initialTab as any);
  const [subject, setSubject] = useState('');
  const [tagFilter, setTagFilter] = useState(initialTags);
  const [dateFrom, setDateFrom] = useState('');
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (tab) params.append('tab', tab);
    if (subject) params.append('subject', subject);
    if (tagFilter) params.append('tags', tagFilter);
    if (dateFrom) params.append('dateFrom', dateFrom);

    api
      .get(`/aula/questions?${params.toString()}`)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load questions');
        setLoading(false);
      });
  }, [query, tab, subject, tagFilter, dateFrom]);

  useEffect(() => {
    api.get('/aula/questions/tags/popular')
      .then(res => setPopularTags(res.data))
      .catch(() => setPopularTags([]));
  }, []);

  const formatDate = useMemo(() => (iso: string) => new Date(iso).toLocaleString(), []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem('q') as HTMLInputElement).value;
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (tagFilter) next.set('tags', tagFilter);
    if (tab) next.set('tab', tab);
    setSearchParams(next);
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
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="q" defaultValue={query} placeholder="Busca por título, descripción o tag..." style={{ marginBottom: 0, flex: 1 }} />
            <button className="btn">Search</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={tab} onChange={(e) => {
              const nextTab = e.target.value as any;
              setTab(nextTab);
              const next = new URLSearchParams(searchParams);
              if (nextTab) next.set('tab', nextTab);
              setSearchParams(next);
            }}>
              <option value="recent">Recientes</option>
              <option value="unanswered">Sin responder</option>
              <option value="popular">Populares (24-72h)</option>
            </select>
            <input placeholder="Materia" value={subject} onChange={e => setSubject(e.target.value)} />
            <input placeholder="Filtrar tags (CSV)" value={tagFilter} onChange={e => setTagFilter(e.target.value)} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          {popularTags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Tags populares:</span>
              {popularTags.map(tag => (
                <button
                  key={tag.tag}
                  type="button"
                  onClick={() => setTagFilter(tag.tag)}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px' }}
                >
                  #{tag.tag} ({tag.count})
                </button>
              ))}
            </div>
          )}
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
                  {(() => {
                    const answers = q.answerCount ?? q._count?.answers ?? 0;
                    const views = typeof q.viewCount === 'number' ? q.viewCount : (q.views ?? 0);
                    return (
                      <>
                        <Link to={`/aula/${q.id}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                          {q.title}
                        </Link>
                        <p>{q.body.substring(0, 120)}...</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                          {q.subject && <span className="badge">{q.subject}</span>}
                          {Array.isArray(q.tags) && q.tags.map((tag: string) => (
                            <span key={tag} className="badge">#{tag}</span>
                          ))}
                        </div>
                        <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <Link to={`/users/${q.author.id}/profile`} style={{ textDecoration: 'none', color: '#007bff' }}>@{q.author.username}</Link>
                          <span>• {answers} respuestas</span>
                          <span style={{ color: answers === 0 ? '#c0392b' : undefined }}>{answers === 0 ? '0 respuestas (¡ayuda!)' : null}</span>
                          <span>• {views} vistas</span>
                          <span>• {formatDate(q.createdAt)}</span>
                          {q.acceptedAnswerId && <span style={{ marginLeft: '10px', color: '#28a745' }}>✓ Solved</span>}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <Link to={`/aula/${q.id}`} className="btn btn-secondary">Responder</Link>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
