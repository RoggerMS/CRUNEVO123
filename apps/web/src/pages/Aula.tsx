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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aula</h1>
          <p className="text-gray-600 mt-1">Pregunta, responde y aprende en comunidad</p>
        </div>
        <Link 
          to="/aula/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <span>✏️</span> Hacer una pregunta
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                name="q" 
                defaultValue={query} 
                placeholder="Busca por título, contenido o tags..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium">
              Buscar
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
              <select 
                value={tab} 
                onChange={(e) => {
                  const nextTab = e.target.value as any;
                  setTab(nextTab);
                  const next = new URLSearchParams(searchParams);
                  if (nextTab) next.set('tab', nextTab);
                  setSearchParams(next);
                }}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="recent">Recientes</option>
                <option value="unanswered">Sin responder</option>
                <option value="popular">Populares (24-72h)</option>
              </select>
            </div>

            <input 
              placeholder="Materia (ej. Matemáticas)" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input 
              placeholder="Tags (ej. algebra, geometria)" 
              value={tagFilter} 
              onChange={e => setTagFilter(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input 
              type="date" 
              value={dateFrom} 
              onChange={e => setDateFrom(e.target.value)} 
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-4">
            {[
              { id: 'recent', label: 'Recientes' },
              { id: 'unanswered', label: 'Sin responder' },
              { id: 'popular', label: 'Populares' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id as any);
                  const next = new URLSearchParams(searchParams);
                  next.set('tab', t.id);
                  setSearchParams(next);
                }}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  tab === t.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {questions.map(q => (
            <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2 min-w-[60px] text-gray-500">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-700">{q.score || 0}</span>
                    <span className="text-xs">votos</span>
                  </div>
                  <div className={`text-center px-2 py-1 rounded ${q._count?.answers === 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}>
                    <span className="block text-xl font-bold">{q._count?.answers || 0}</span>
                    <span className="text-xs">respuestas</span>
                  </div>
                  <div className="text-center text-xs mt-1">
                    {q.views || 0} vistas
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link to={`/aula/${q.id}`} className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                      {q.title}
                    </Link>
                    {q.subject && (
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                        {q.subject}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                    {q.excerpt || q.body?.substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex flex-wrap gap-2">
                      {q.tags && q.tags.map((tag: string) => (
                        <button 
                          key={tag}
                          onClick={() => setTagFilter(tag)}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {q.author && (
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {q.author.avatar ? (
                              <img src={q.author.avatar} alt={q.author.username} className="w-full h-full object-cover" />
                            ) : (
                              <span>{q.author.username[0].toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-700">{q.author.username}</span>
                        </div>
                      )}
                      <span>•</span>
                      <span>{formatDate(q.createdAt)}</span>
                    </div>
                  </div>
                  
                  {q._count?.answers === 0 && (
                     <div className="mt-3 flex justify-end">
                        <Link to={`/aula/${q.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                           Sé el primero en responder →
                        </Link>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {questions.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No se encontraron preguntas con estos filtros.</p>
                <button onClick={() => {
                    setSubject(''); setTagFilter(''); setDateFrom('');
                    setSearchParams(new URLSearchParams());
                 }} className="text-blue-600 font-medium mt-2 hover:underline">
                    Limpiar filtros
                 </button>
             </div>
          )}
        </div>

        <div className="lg:col-span-1">
           {popularTags.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔥</span> Tags Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(t => (
                  <button
                    key={t.tag}
                    onClick={() => setTagFilter(t.tag)}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-sm transition-all w-full group"
                  >
                    <span className="text-gray-700 font-medium group-hover:text-blue-600">#{t.tag}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
