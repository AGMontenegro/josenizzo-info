import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function SiteSettings() {
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/admin/login'); return; }
    fetchCurrentVideo();
  }, [navigate]);

  const fetchCurrentVideo = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/editor-video`);
      const data = await res.json();
      setVideoUrl(data.editorVideoUrl || '');
    } catch {
      // sin video configurado
    }
  };

  const getYoutubeEmbedUrl = (input) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
      /youtube\.com\/playlist\?list=([\w-]+)/,
    ];
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        if (input.includes('playlist')) return `https://www.youtube.com/embed/videoseries?list=${match[1]}`;
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    if (input.includes('youtube.com/embed')) return input;
    return null;
  };

  const handleYoutubeSave = async () => {
    const embedUrl = getYoutubeEmbedUrl(youtubeInput.trim());
    if (!embedUrl) {
      setMessage('❌ URL de YouTube inválida');
      return;
    }
    await saveVideoUrl(embedUrl);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setMessage('❌ Solo se permiten archivos de video');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setMessage('❌ El video no puede superar los 100MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      const presignRes = await fetch(`${API_URL}/upload/video/presign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || 'Error al preparar la subida');
      }

      const { uploadUrl, fileUrl } = await presignRes.json();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`HTTP ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Error de red al subir el video'));
        xhr.send(file);
      });

      await saveVideoUrl(fileUrl);
    } catch (error) {
      setMessage('❌ Error al subir el video: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveVideoUrl = async (url) => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/settings/editor-video`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ editorVideoUrl: url }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setVideoUrl(url);
      setYoutubeInput('');
      setMessage('✅ Video guardado correctamente');
    } catch {
      setMessage('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('¿Eliminar el video actual de la sección Editor?')) return;
    await saveVideoUrl('');
  };

  const isYoutubeEmbed = videoUrl.includes('youtube.com/embed');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Configuración del sitio</h1>
            <p className="text-sm text-gray-500">Sección Editor - Video destacado</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al panel
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Video actual */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Video actual en el home</h2>
          {videoUrl ? (
            <div className="space-y-4">
              <div className="relative w-full bg-black rounded overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                {isYoutubeEmbed ? (
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={videoUrl}
                    title="Video editor actual"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="absolute top-0 left-0 w-full h-full"
                    src={videoUrl}
                    controls
                  />
                )}
              </div>
              <button
                onClick={handleClear}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Eliminar video actual
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Sin video configurado — la sección no se mostrará en el home.</p>
          )}
        </div>

        {/* Opción 1: YouTube */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Opción 1 — Video de YouTube</h2>
          <p className="text-sm text-gray-500 mb-4">Pegá la URL del video o playlist de YouTube.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={handleYoutubeSave}
              disabled={saving || !youtubeInput.trim()}
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Opción 2: Subir desde PC */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Opción 2 — Subir video desde la PC</h2>
          <p className="text-sm text-gray-500 mb-4">MP4, MOV, AVI — máximo 100MB.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-700 file:cursor-pointer disabled:opacity-50"
          />
          {uploading && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {message && (
          <p className="text-sm font-medium text-center">{message}</p>
        )}
      </main>
    </div>
  );
}

export default SiteSettings;
