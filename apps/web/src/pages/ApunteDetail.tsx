import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ApunteDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchDoc();
  }, [id]);

  const fetchDoc = () => {
    api.get(`/apuntes/${id}`)
      .then(res => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load document');
        setLoading(false);
      });
  };

  const handleDownload = () => {
    if (!id) return;
    api.get(`/apuntes/${id}/download`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'download';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
        }
        if (fileName === 'download' && doc) {
            let ext = '';
            if (doc.mimeType === 'application/pdf') ext = '.pdf';
            else if (doc.mimeType.includes('image')) ext = '.jpg';
            fileName = doc.title + ext;
        }

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        fetchDoc(); 
      })
      .catch(() => alert('Download failed'));
  };

  if (!id) return <div>Invalid ID</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!doc) return <div>Document not found</div>;

  const isPdf = doc.mimeType === 'application/pdf';
  const isImage = doc.mimeType.startsWith('image/');

  return (
    <div className="container">
      <div className="card">
        <h1>{doc.title}</h1>
        <p>{doc.description}</p>
        <div className="meta">
            Uploaded by @{doc.owner.username} • {doc.downloadsCount} downloads • {doc.size} bytes
        </div>
        <div style={{ marginTop: '1rem' }}>
            <button className="btn" onClick={handleDownload}>Download</button>
        </div>
      </div>

      <div className="card" style={{ minHeight: '400px' }}>
        <h3>Preview</h3>
        {isPdf ? (
            <PdfPreview id={id} />
        ) : isImage ? (
            <ImagePreview id={id} />
        ) : (
            <div>Preview not available for this file type. Please download to view.</div>
        )}
      </div>
    </div>
  );
}

function PdfPreview({ id }: { id: string }) {
    const [url, setUrl] = useState('');
    useEffect(() => {
        api.get(`/documents/${id}/download`, { responseType: 'blob' })
           .then(res => setUrl(window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))))
           .catch(() => {});
    }, [id]);

    if (!url) return <div>Loading preview...</div>;
    return <iframe src={url} width="100%" height="600px" title="Preview" />;
}

function ImagePreview({ id }: { id: string }) {
    const [url, setUrl] = useState('');
    useEffect(() => {
        api.get(`/documents/${id}/download`, { responseType: 'blob' })
           .then(res => setUrl(window.URL.createObjectURL(res.data)))
           .catch(() => {});
    }, [id]);

    if (!url) return <div>Loading preview...</div>;
    return <img src={url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '600px' }} />;
}
