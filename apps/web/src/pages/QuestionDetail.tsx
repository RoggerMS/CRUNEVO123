import { useEffect, useState, useCallback } from 'react';
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

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando pregunta...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded m-4">{error}</div>;
  if (!question) return <div className="p-8 text-center">Pregunta no encontrada</div>;

  const answers = question.answers || [];
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/aula" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        ← Volver al Aula
      </Link>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-1 min-w-[50px]">
            <button 
              onClick={() => handleVote('QUESTION', question.id, 1)} 
              className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors text-xl font-bold flex items-center justify-center"
            >
              ▲
            </button>
            <div className="text-xl font-bold text-gray-700">{question.score}</div>
            <button 
              onClick={() => handleVote('QUESTION', question.id, -1)} 
              className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors text-xl font-bold flex items-center justify-center"
            >
              ▼
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap mb-6">
              {question.body}
            </div>

            {Array.isArray(question.attachments) && question.attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {question.attachments.map((att: string) => (
                  <a key={att} href={att} target="_blank" rel="noreferrer" className="block group">
                    <img 
                      src={att} 
                      alt="Adjunto" 
                      className="h-32 w-auto rounded-lg border border-gray-200 object-cover group-hover:border-blue-400 transition-colors" 
                    />
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              {question.subject && (
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {question.subject}
                </span>
              )}
              {Array.isArray(question.tags) && question.tags.map((tag: string) => (
                <button 
                  key={tag} 
                  onClick={() => handleTagClick(tag)} 
                  className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full text-xs transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <Link to={`/users/${question.author?.id}/profile`} className="flex items-center gap-2 hover:text-blue-600 font-medium text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                     {question.author?.avatar ? <img src={question.author.avatar} className="w-full h-full object-cover" /> : question.author?.username?.[0]}
                  </div>
                  {question.author?.username}
                </Link>
                <span>{new Date(question.createdAt).toLocaleString()}</span>
                <span>👁 {question.viewCount ?? question.views ?? 0} vistas</span>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => handleReport('QUESTION', question.id)} className="text-gray-400 hover:text-red-500 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">
                  Reportar
                </button>
                {isAdmin && (
                  <div className="flex gap-1 ml-2 border-l pl-2 border-gray-200">
                    <button onClick={() => handleStatusChange('QUESTION', question.id, 'HIDDEN')} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">Ocultar</button>
                    <button onClick={() => handleStatusChange('QUESTION', question.id, 'DELETED')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Borrar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{answers.length} Respuestas</h2>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-500">Ordenar por:</span>
           <select 
            value={answersSort} 
            onChange={(e) => setAnswersSort(e.target.value as any)}
            className="border-gray-300 border rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
           >
            <option value="helpful">Más útiles</option>
            <option value="recent">Más recientes</option>
           </select>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        {answers.map((ans: any) => (
          <div 
            key={ans.id} 
            className={`rounded-xl p-6 border transition-all ${
              question.acceptedAnswerId === ans.id 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : ans.body.startsWith('🤖')
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-gray-100 shadow-sm'
            } ${ans.status === 'HIDDEN' ? 'opacity-50 grayscale' : ''}`}
          >
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-1 min-w-[50px]">
                <button onClick={() => handleVote('ANSWER', ans.id, 1)} className="text-gray-400 hover:text-orange-500 text-xl font-bold">▲</button>
                <div className="text-lg font-bold text-gray-700">{ans.score}</div>
                <button onClick={() => handleVote('ANSWER', ans.id, -1)} className="text-gray-400 hover:text-blue-500 text-xl font-bold">▼</button>
                
                {question.acceptedAnswerId === ans.id && (
                  <div className="mt-2 text-green-600 text-2xl" title="Respuesta aceptada">✓</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="prose max-w-none text-gray-800 mb-4 whitespace-pre-wrap">
                  {ans.body}
                </div>

                {Array.isArray(ans.attachments) && ans.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ans.attachments.map((att: string) => (
                      <a key={att} href={att} target="_blank" rel="noreferrer">
                        <img src={att} alt="Adjunto" className="h-20 w-auto rounded border border-gray-200" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100/50 pt-3 mt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      {ans.body.startsWith('🤖') && <span>🤖</span>}
                      @{ans.author.username}
                    </span>
                    <span className="text-gray-500">{new Date(ans.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                     {currentUser && (currentUser.id === question.authorId || isAdmin) && !question.acceptedAnswerId && (
                        <button 
                          onClick={() => handleAccept(ans.id)} 
                          className="text-green-600 hover:text-green-700 text-sm font-medium hover:bg-green-50 px-3 py-1 rounded transition-colors"
                        >
                          ✓ Aceptar como solución
                        </button>
                     )}
                     
                     <button onClick={() => handleReport('ANSWER', ans.id)} className="text-gray-400 hover:text-red-500 text-xs font-medium">
                        Reportar
                     </button>
                     
                     {isAdmin && (
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => handleStatusChange('ANSWER', ans.id, 'HIDDEN')} className="text-xs text-yellow-600 hover:underline">Ocultar</button>
                          <button onClick={() => handleStatusChange('ANSWER', ans.id, 'DELETED')} className="text-xs text-red-600 hover:underline">Borrar</button>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {answers.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
            Aún no hay respuestas. ¡Sé el primero en ayudar!
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tu respuesta</h3>
        <form onSubmit={handleAnswer}>
          <textarea 
            placeholder="Escribe tu solución aquí... (Sé amable y claro)" 
            value={answerBody} 
            onChange={e => setAnswerBody(e.target.value)} 
            required 
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] mb-4"
          />
          
          <div className="flex items-center gap-4">
             <input 
              placeholder="URL de imagen de apoyo (opcional)" 
              value={answerAttachment} 
              onChange={e => setAnswerAttachment(e.target.value)} 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
             />
             <button className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
               Publicar respuesta
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
