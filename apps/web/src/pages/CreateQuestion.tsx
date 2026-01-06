import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, HelpCircle } from 'lucide-react';

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
  const titleMax = 120;
  const bodyMax = 1500;

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
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (parsedTags.length > 5) {
      setError('Máximo 5 tags para mantener la pregunta clara.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/aula/questions', {
        title,
        body,
        subject,
        tags: parsedTags,
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
      <Link to="/aula" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Volver al Aula
      </Link>
      
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hacer una pregunta</h1>
        <p className="text-gray-600 text-lg">Recibe ayuda de la comunidad en minutos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Título de tu pregunta
              </label>
              <p className="text-sm text-gray-500 mb-2">Un buen título resume el problema en una frase corta y directa.</p>
              <input
                placeholder="Ej: ¿Cómo resuelvo esta ecuación cuadrática?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                minLength={8}
                maxLength={titleMax}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                <span className="text-gray-500">Sé concreto y directo.</span>
                <span>
                  {title.length}/{titleMax} <span className="text-gray-300">|</span> mínimo 8
                </span>
              </p>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Detalles y contexto
              </label>
              <p className="text-sm text-gray-500 mb-2">Explica qué intentaste y dónde te atascaste. Cuantos más detalles, mejor respuesta.</p>
              <textarea
                placeholder="Explica tu problema con el mayor detalle posible..."
                value={body}
                onChange={e => setBody(e.target.value)}
                required
                minLength={20}
                maxLength={bodyMax}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[180px] transition-all"
              />
              <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                <span className="text-gray-500">Incluye pasos, código o capturas para contextualizar.</span>
                <span>
                  {body.length}/{bodyMax} <span className="text-gray-300">|</span> mínimo 20
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Materia</label>
                <input
                  placeholder="Ej: Matemáticas"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <input
                  placeholder="Ej: algebra, ecuaciones"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Separados por coma (máx. 5 tags).</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon size={16} />
                Imágenes de referencia (Opcional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Pega la URL de tu imagen (ej. subida a Imgur o Drive público). Máximo 5 imágenes.
              </p>
              <div className="space-y-3">
                {attachments.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      placeholder="https://..." 
                      value={url} 
                      onChange={e => {
                        const newAtts = [...attachments];
                        newAtts[idx] = e.target.value;
                        setAttachments(newAtts);
                      }} 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    />
                    {attachments.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500 px-2 transition-colors"
                        title="Eliminar campo"
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
                    className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 mt-2 transition-colors"
                  >
                    + Añadir otra imagen
                  </button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <Link to="/aula" className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                Cancelar y volver
              </Link>
              <button 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                disabled={loading || title.length < 8 || body.length < 20 || !subject || !tags}
              >
                {loading ? 'Publicando...' : 'Publicar Pregunta'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {similar.length > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 sticky top-4 animate-fade-in">
              <h3 className="font-bold text-yellow-800 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <HelpCircle size={16} />
                ¿Tu pregunta ya existe?
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
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800 sticky top-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Consejos pro
              </h3>
              <ul className="space-y-2 text-blue-700/90">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Sé específico: "¿Cómo derivo x^2?" es mejor que "Ayuda mates".</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Muestra lo que has intentado.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Revisa la ortografía para que sea fácil de leer.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
