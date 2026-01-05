import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

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
    setLoading(true);
    setError('');
    try {
      await api.post('/aula/questions', { 
        title, 
        body, 
        subject,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hacer una pregunta</h1>
        <p className="text-gray-600">Recibe ayuda de la comunidad en minutos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input 
                placeholder="Ej: ¿Cómo resuelvo esta ecuación cuadrática?" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{title.length}/8 min</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalles de tu duda</label>
              <textarea 
                placeholder="Explica tu problema con el mayor detalle posible..." 
                value={body} 
                onChange={e => setBody(e.target.value)} 
                required 
                minLength={20} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{body.length}/20 min</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                <input 
                  placeholder="Ej: Matemáticas" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input 
                  placeholder="Ej: algebra, ecuaciones (separados por coma)" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes de referencia (URLs)</label>
              <div className="space-y-2">
                {attachments.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      placeholder={`https://ejemplo.com/imagen-${idx + 1}.jpg`} 
                      value={url} 
                      onChange={e => {
                        const newAtts = [...attachments];
                        newAtts[idx] = e.target.value;
                        setAttachments(newAtts);
                      }} 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    {attachments.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {attachments.length < 5 && (
                  <button 
                    type="button" 
                    onClick={() => setAttachments([...attachments, ''])}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    + Agregar otra imagen
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || title.length < 8 || body.length < 20 || !subject || !tags}
              >
                {loading ? 'Publicando...' : 'Publicar Pregunta'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          {similar.length > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 sticky top-4">
              <h3 className="font-bold text-yellow-800 mb-3 text-sm uppercase tracking-wide">
                🤔 ¿Tu pregunta ya existe?
              </h3>
              <ul className="space-y-3">
                {similar.map(s => (
                  <li key={s.id}>
                    <a 
                      href={`/aula/${s.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <span className="text-gray-900 font-medium group-hover:text-blue-600 text-sm leading-snug block mb-1">
                        {s.title}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {s._count?.answers || 0} respuestas • {s.subject}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800">
              <h3 className="font-bold mb-2">Consejos para preguntar</h3>
              <ul className="list-disc pl-4 space-y-1 text-blue-700/80">
                <li>Sé específico en el título.</li>
                <li>Incluye detalles y contexto.</li>
                <li>Agrega imágenes si ayuda a explicar.</li>
                <li>Usa tags correctos para que te encuentren.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
