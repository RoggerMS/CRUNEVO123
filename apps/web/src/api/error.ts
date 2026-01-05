export function formatApiErrorMessage(err: any): string {
  if (!err) return 'Error desconocido';

  if (err.message === 'Network Error' || !err.response) {
    return 'No se puede conectar con la API (revisa VITE_API_URL o si API está levantada en :3000)';
  }

  const data = err.response?.data;
  const raw = data?.message ?? data ?? err.message;
  return normalizeMessage(raw);
}

function normalizeMessage(value: any): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value.map(normalizeMessage).filter(Boolean);
    return parts.length ? parts.join(', ') : 'Error desconocido';
  }
  if (value && typeof value === 'object') {
    if ('message' in value) return normalizeMessage((value as any).message);
    if ('error' in value && typeof (value as any).error === 'string') return (value as any).error;
    try {
      return JSON.stringify(value);
    } catch {
      return 'Error desconocido';
    }
  }
  return 'Error desconocido';
}

