import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MessageCircle, HelpCircle, Flame } from 'lucide-react';

import './Aula.css';

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
  const hasFilters = useMemo(() => Boolean(query || subject || tagFilter || dateFrom), [query, subject, tagFilter, dateFrom]);

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
  const handleClearFilters = () => {
    setSubject('');
    setTagFilter('');
    setDateFrom('');
    setTab('recent');
    setSearchParams(new URLSearchParams());
  };

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

  return (
    <div className="aula-page">
      <div className="aula-header">
        <div>
          <p className="aula-eyebrow">Preguntas y respuestas</p>
          <h1 className="aula-title">Aula</h1>
          <p className="aula-subtitle">Pregunta, responde y aprende en comunidad. Mantén tus ideas ordenadas con filtros rápidos.</p>
        </div>
        <Link to="/aula/new" className="aula-ask-button">
          <span aria-hidden>✏️</span>
          Hacer una pregunta
        </Link>
      </div>

      {error && (
        <div className="aula-alert" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="aula-search-card">
        <form onSubmit={handleSearch} className="aula-search-form">
          <div className="search-row">
            <label className="search-input">
              <Search size={18} className="search-icon" aria-hidden />
              <input
                name="q"
                defaultValue={query}
                placeholder="Busca por título, contenido o tags"
              />
            </label>
            <button className="primary-button" type="submit">Buscar</button>
          </div>

          <div className="filters-row">
            <span className="filters-label">Filtrar por</span>
            <input
              placeholder="Materia (ej. Matemáticas)"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="filter-input"
            />
            <input
              placeholder="Tags (ej. álgebra)"
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value)}
              className="filter-input"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="filter-input"
            />

            {hasFilters && (
              <button type="button" onClick={handleClearFilters} className="clear-filters">
                Limpiar filtros
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="filter-chips">
              {query && (
                <span className="chip chip-blue">
                  Buscando: "{query}"
                  <button type="button" onClick={handleClearFilters} aria-label="Quitar búsqueda">✕</button>
                </span>
              )}
              {subject && (
                <span className="chip">
                  Materia: {subject}
                  <button type="button" onClick={() => setSubject('')} aria-label="Quitar materia">✕</button>
                </span>
              )}
              {tagFilter && (
                <span className="chip">
                  Tag: {tagFilter}
                  <button type="button" onClick={() => setTagFilter('')} aria-label="Quitar tag">✕</button>
                </span>
              )}
              {dateFrom && (
                <span className="chip">
                  Desde: {dateFrom}
                  <button type="button" onClick={() => setDateFrom('')} aria-label="Quitar fecha">✕</button>
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="aula-tabs" role="tablist" aria-label="Ordenar preguntas">
        {[
          { id: 'recent', label: 'Recientes' },
          { id: 'unanswered', label: 'Sin responder' },
          { id: 'popular', label: 'Populares' }
        ].map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id as any);
              const next = new URLSearchParams(searchParams);
              next.set('tab', t.id);
              setSearchParams(next);
            }}
            className={`aula-tab ${tab === t.id ? 'is-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="aula-content">
        <div className="aula-list">
          {loading ? (
            <div className="loading-list">
              {[1, 2, 3].map(s => (
                <div key={s} className="loading-card">
                  <div className="loading-stat" />
                  <div className="loading-main">
                    <div className="loading-line wide" />
                    <div className="loading-line" />
                    <div className="loading-tags">
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {questions.map(q => (
                <article key={q.id} className="question-card">
                  <div className="question-stat">
                    <div>
                      <p className="stat-number">{q.score || 0}</p>
                      <p className="stat-label">votos</p>
                    </div>
                    <div className={`stat-box ${q._count?.answers === 0 ? 'stat-warning' : ''}`}>
                      <p className="stat-number">{q._count?.answers || 0}</p>
                      <p className="stat-label">respuestas</p>
                    </div>
                    <p className="stat-label muted">{q.views || 0} vistas</p>
                  </div>

                  <div className="question-body">
                    <div className="question-head">
                      <div>
                        <Link to={`/aula/${q.id}`} className="question-title">{q.title}</Link>
                        {q.subject && <span className="question-subject">{q.subject}</span>}
                      </div>
                      {q._count?.answers === 0 && <span className="badge-unanswered">Sin responder</span>}
                    </div>

                    <p className="question-excerpt">{q.excerpt || q.body?.substring(0, 160)}...</p>

                    <div className="question-meta">
                      <div className="question-tags">
                        {q.tags && q.tags.map((tag: string) => (
                          <button
                            key={tag}
                            onClick={() => setTagFilter(tag)}
                            className="tag-button"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>

                      <div className="author-block">
                        {q.author && (
                          <div className="author-chip">
                            <div className="author-avatar">
                              {q.author.avatar ? (
                                <img src={q.author.avatar} alt={q.author.username} />
                              ) : (
                                <span>{q.author.username[0].toUpperCase()}</span>
                              )}
                            </div>
                            <span>@{q.author.username}</span>
                          </div>
                        )}
                        <span className="dot" aria-hidden>•</span>
                        <span className="muted">{formatDate(q.createdAt)}</span>
                      </div>
                    </div>

                    {q._count?.answers === 0 && (
                      <div className="question-cta">
                        <Link to={`/aula/${q.id}`} className="link-cta">Sé el primero en responder →</Link>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {questions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <MessageCircle size={32} />
                  </div>
                  <h3>Aún no hay preguntas aquí</h3>
                  <p>Parece que nadie ha preguntado sobre esto. ¡Sé el primero en iniciar la conversación!</p>
                  <div className="empty-actions">
                    <button onClick={handleClearFilters} className="secondary-button">Limpiar filtros</button>
                    <Link to="/aula/new" className="primary-button">Hacer una pregunta</Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="aula-sidebar">
          {popularTags.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title"><Flame size={16} /> Tags populares</h3>
              <div className="popular-tags">
                {popularTags.map(t => (
                  <button
                    key={t.tag}
                    onClick={() => setTagFilter(t.tag)}
                    className="popular-tag-button"
                  >
                    <span>#{t.tag}</span>
                    <span className="tag-count">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-card tips">
            <h3 className="sidebar-title"><HelpCircle size={16} /> Cómo funciona Aula</h3>
            <ul className="guide-list">
              <li><span className="step">1</span>Busca si tu duda ya existe antes de preguntar.</li>
              <li><span className="step">2</span>Pregunta con detalles claros y contexto.</li>
              <li><span className="step">3</span>Recibe respuestas de la comunidad y valida la mejor.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
