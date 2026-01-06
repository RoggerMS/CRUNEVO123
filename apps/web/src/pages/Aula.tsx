import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MessageCircle, HelpCircle, Flame } from 'lucide-react';

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aula</h1>
          <p className="text-gray-600 mt-1 text-lg">Pregunta, responde y aprende en comunidad</p>
        </div>
        <Link 
          to="/aula/new" 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
        >
          <span>✏️</span> Hacer una pregunta
        </Link>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </span>
              <input 
                name="q" 
                defaultValue={query} 
                placeholder="Busca por título, contenido o tags..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <button className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors">
              Buscar
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-gray-50">
            <span className="text-sm font-semibold text-gray-700 mr-2">Filtrar por:</span>
            
            <input 
              placeholder="Materia (ej. Matemáticas)" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
            />
            <input 
              placeholder="Tags (ej. algebra)" 
              value={tagFilter} 
              onChange={e => setTagFilter(e.target.value)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
            />
            <input 
              type="date" 
              value={dateFrom} 
              onChange={e => setDateFrom(e.target.value)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            
            {(subject || tagFilter || dateFrom) && (
              <button 
                type="button"
                onClick={() => { setSubject(''); setTagFilter(''); setDateFrom(''); }}
                className="text-sm text-red-500 hover:text-red-700 font-medium ml-auto"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
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
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-all ${
                  tab === t.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {questions.map(q => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-3 min-w-[70px] text-gray-500">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-700">{q.score || 0}</span>
                    <span className="text-xs font-medium">votos</span>
                  </div>
                  <div className={`text-center px-3 py-1.5 rounded-lg w-full ${q._count?.answers === 0 ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-gray-50 border border-gray-100'}`}>
                    <span className="block text-xl font-bold">{q._count?.answers || 0}</span>
                    <span className="text-xs font-medium">respu.</span>
                  </div>
                  <div className="text-center text-xs mt-1 text-gray-400">
                    {q.views || 0} vistas
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Link to={`/aula/${q.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 hover:underline leading-snug">
                      {q.title}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {q._count?.answers === 0 && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                          Sin responder
                        </span>
                      )}
                      {q.subject && (
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-indigo-100">
                          {q.subject}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                    {q.excerpt || q.body?.substring(0, 160)}...
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {q.tags && q.tags.map((tag: string) => (
                        <button 
                          key={tag}
                          onClick={() => setTagFilter(tag)}
                          className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors font-medium"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {q.author && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100">
                            {q.author.avatar ? (
                              <img src={q.author.avatar} alt={q.author.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-gray-500">{q.author.username[0].toUpperCase()}</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-700">@{q.author.username}</span>
                        </div>
                      )}
                      <span className="text-gray-300">•</span>
                      <span>{formatDate(q.createdAt)}</span>
                    </div>
                  </div>
                  
                  {q._count?.answers === 0 && (
                     <div className="mt-4 flex justify-end">
                        <Link to={`/aula/${q.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                           Sé el primero en responder →
                        </Link>
                     </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {questions.length === 0 && (
             <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay preguntas aquí</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Parece que nadie ha preguntado sobre esto. ¡Sé el primero en iniciar la conversación!
                </p>
                <div className="flex gap-4">
                   <button 
                      onClick={() => {
                        setSubject(''); setTagFilter(''); setDateFrom('');
                        setSearchParams(new URLSearchParams());
                      }} 
                      className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                      Limpiar filtros
                   </button>
                   <Link 
                      to="/aula/new" 
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                   >
                      Hacer una pregunta
                   </Link>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
           {popularTags.length > 0 && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Flame size={18} className="text-orange-500" /> Tags Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(t => (
                  <button
                    key={t.tag}
                    onClick={() => setTagFilter(t.tag)}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-sm transition-all w-full group"
                  >
                    <span className="text-gray-700 font-medium group-hover:text-blue-600">#{t.tag}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
           )}

           <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
               <HelpCircle size={18} />
               Cómo funciona Aula
             </h3>
             <ul className="space-y-4 text-sm text-blue-900/80">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">1</span> 
                  <span>Busca si tu duda ya existe antes de preguntar.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">2</span> 
                  <span>Pregunta con detalles claros y contexto.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">3</span> 
                  <span>Recibe respuestas de la comunidad y valida la mejor.</span>
                </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
