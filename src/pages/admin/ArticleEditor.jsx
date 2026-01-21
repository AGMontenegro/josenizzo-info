import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { articlesAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'Economía',
    author_name: '',
    featured: false,
    breaking: false,
    badge: '',
    read_time: 5,
    published: true
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (isEditing) {
      loadArticle();
    }
  }, [id, isEditing, navigate]);

  const loadArticle = async () => {
    try {
      const article = await articlesAPI.getById(id);
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        image: article.image || '',
        category: article.category || 'Economía',
        author_name: article.author_name || '',
        featured: !!article.featured,
        breaking: !!article.breaking,
        badge: article.badge || '',
        read_time: article.read_time || 5,
        published: !!article.published
      });
    } catch (err) {
      setError('Error al cargar el artículo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generar slug desde el título
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const insertElement = (type) => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const beforeText = formData.content.substring(0, start);
    const afterText = formData.content.substring(end);

    let insertedText = '';

    switch (type) {
      case 'h3':
        insertedText = `<h3>${selectedText || 'Título del subtítulo'}</h3>\n\n`;
        break;
      case 'p':
        insertedText = `<p>${selectedText || 'Texto del párrafo...'}</p>\n\n`;
        break;
      case 'bold':
        insertedText = `<strong>${selectedText || 'texto en negrita'}</strong>`;
        break;
      case 'italic':
        insertedText = `<em>${selectedText || 'texto en cursiva'}</em>`;
        break;
      case 'link':
        const url = prompt('Ingresa la URL:');
        if (url) {
          insertedText = `<a href="${url}" target="_blank">${selectedText || 'texto del enlace'}</a>`;
        } else {
          return;
        }
        break;
      case 'image':
        // Crear input temporal para subir imagen
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.onchange = async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          if (!file.type.startsWith('image/')) {
            alert('Solo se permiten archivos de imagen');
            return;
          }

          if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no puede superar los 5MB');
            return;
          }

          try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_URL}/upload`, {
              method: 'POST',
              body: formDataUpload
            });

            if (!response.ok) {
              throw new Error('Error al subir la imagen');
            }

            const data = await response.json();
            const imageUrl = `http://localhost:3001${data.url}`;

            // Insertar la imagen en el contenido
            const currentContent = formData.content;
            const textarea = document.getElementById('content');
            const cursorPos = textarea.selectionStart;
            const beforeText = currentContent.substring(0, cursorPos);
            const afterText = currentContent.substring(cursorPos);
            const insertText = `\n<figure><img src="${imageUrl}" alt="${selectedText || ''}" /></figure>\n\n`;

            setFormData(prev => ({
              ...prev,
              content: beforeText + insertText + afterText
            }));

            setTimeout(() => {
              textarea.focus();
              const newPos = cursorPos + insertText.length;
              textarea.setSelectionRange(newPos, newPos);
            }, 100);
          } catch (error) {
            alert('Error al subir la imagen: ' + error.message);
          }
        };
        imageInput.click();
        return;
      case 'hr':
        insertedText = `\n<hr />\n\n`;
        break;
      case 'highlight':
        insertedText = `<mark>${selectedText || 'texto destacado'}</mark>`;
        break;
      case 'note':
        insertedText = `\n<div class="nota-editor"><strong>Nota del editor:</strong> ${selectedText || 'Texto de la nota...'}</div>\n\n`;
        break;
      case 'related':
        const relatedTitle = prompt('Título del artículo relacionado:');
        const relatedUrl = prompt('URL del artículo relacionado:');
        if (relatedTitle && relatedUrl) {
          insertedText = `\n<div class="articulo-relacionado">📰 <a href="${relatedUrl}">${relatedTitle}</a></div>\n\n`;
        } else {
          return;
        }
        break;
      case 'blockquote':
        insertedText = `<blockquote><p>${selectedText || 'Texto de la cita...'}</p></blockquote>\n\n`;
        break;
      case 'ul':
        insertedText = `<ul>\n  <li>${selectedText || 'Elemento 1'}</li>\n  <li>Elemento 2</li>\n  <li>Elemento 3</li>\n</ul>\n\n`;
        break;
      case 'ol':
        insertedText = `<ol>\n  <li>${selectedText || 'Elemento 1'}</li>\n  <li>Elemento 2</li>\n  <li>Elemento 3</li>\n</ol>\n\n`;
        break;
      case 'video':
        const videoUrl = prompt('Ingresa el enlace del video (YouTube, Twitter, etc.):');
        if (!videoUrl) return;

        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
          if (videoId) {
            insertedText = `\n<figure><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></figure>\n\n`;
          }
        } else if (videoUrl.includes('twitter.com') || videoUrl.includes('x.com')) {
          // Extract clean tweet URL (remove tracking parameters)
          let cleanUrl = videoUrl;
          if (videoUrl.includes('?')) {
            cleanUrl = videoUrl.split('?')[0];
          }
          // Convert x.com to twitter.com for better compatibility
          cleanUrl = cleanUrl.replace('x.com', 'twitter.com');

          insertedText = `\n<blockquote class="twitter-tweet"><p lang="es" dir="ltr"></p>&mdash; <a href="${cleanUrl}">${cleanUrl}</a></blockquote>\n\n`;
        } else {
          insertedText = `\n<figure><video controls src="${videoUrl}"></video></figure>\n\n`;
        }
        break;
      case 'twitter':
        const tweetUrl = prompt('Ingresa la URL del tweet completa de Twitter/X:');
        if (tweetUrl) {
          // Extract tweet ID from URL
          const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
          const tweetId = tweetIdMatch ? tweetIdMatch[1] : '';

          if (!tweetId) {
            alert('URL de tweet inválida. Debe contener /status/[ID]');
            return;
          }

          // Clean URL - convert x.com to twitter.com and remove parameters
          let cleanUrl = tweetUrl.replace('x.com', 'twitter.com').split('?')[0];

          insertedText = `\n<blockquote class="twitter-tweet" data-lang="es" data-theme="light" data-width="550">
  <p>Cargando tweet...</p>
  <a href="${cleanUrl}">Ver en Twitter</a>
</blockquote>\n\n`;
        } else {
          return;
        }
        break;
      case 'table':
        insertedText = `\n<table>
  <thead>
    <tr>
      <th>Columna 1</th>
      <th>Columna 2</th>
      <th>Columna 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dato 1</td>
      <td>Dato 2</td>
      <td>Dato 3</td>
    </tr>
    <tr>
      <td>Dato 4</td>
      <td>Dato 5</td>
      <td>Dato 6</td>
    </tr>
  </tbody>
</table>\n\n`;
        break;
      case 'quote-source':
        const source = prompt('Nombre de la fuente (persona/organización):');
        if (source) {
          insertedText = `\n<div class="declaracion"><p>"${selectedText || 'Texto de la declaración...'}"</p><cite>— ${source}</cite></div>\n\n`;
        } else {
          return;
        }
        break;
      case 'alert':
        insertedText = `\n<div class="alerta"><strong>⚠️ Importante:</strong> ${selectedText || 'Información urgente o advertencia...'}</div>\n\n`;
        break;
      case 'location':
        const locationName = prompt('Nombre de la ubicación:');
        if (locationName) {
          insertedText = `<span class="ubicacion">📍 ${locationName}</span>`;
        } else {
          return;
        }
        break;
      default:
        return;
    }

    const newContent = beforeText + insertedText + afterText;
    setFormData(prev => ({ ...prev, content: newContent }));

    // Restaurar el foco al textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + insertedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      const data = await response.json();

      // Actualizar el campo de imagen con la URL completa
      const imageUrl = `http://localhost:3001${data.url}`;
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setError('Error al subir la imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      if (isEditing) {
        await articlesAPI.update(id, formData, token);
      } else {
        await articlesAPI.create(formData, token);
      }

      navigate('/admin/articles');
    } catch (err) {
      setError(err.message || 'Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  const insertTemplate = () => {
    const author = prompt('¿Quién es el autor?\n1 - Analía Montenegro\n2 - José Nizzo\n\nEscribe 1 o 2:');

    let template = '';
    let authorName = '';

    if (author === '1') {
      authorName = 'Analía Montenegro';
      template = `<p>Primer párrafo introductorio del artículo...</p>

<figure><a href="https://i0.wp.com/josenizzo.info/wp-content/uploads/2025/09/Analia_photo_JN.jpeg?ssl=1"><img src="https://i0.wp.com/josenizzo.info/wp-content/uploads/2025/09/Analia_photo_JN.jpeg?resize=688%2C840&#038;ssl=1" alt="" /></a></figure>

<p>Por Analía Montenegro | josenizzo.info</p>

`;
    } else if (author === '2') {
      authorName = 'José Nizzo';
      template = `<p>Primer párrafo introductorio del artículo...</p>

<figure><img src="/logos/José_Nizzo.png" alt="José Nizzo" /></figure>

<p>Por José Nizzo | josenizzo.info</p>

`;
    } else {
      alert('Por favor, elige 1 para Analía o 2 para José');
      return;
    }

    setFormData(prev => ({
      ...prev,
      content: template,
      author_name: authorName
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner className="py-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
            </h1>
            <Link
              to="/admin/articles"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Volver a Artículos
            </Link>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa el título del artículo"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="titulo-del-articulo"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se genera automáticamente desde el título, pero puedes editarlo
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Resumen/Extracto *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Breve resumen del artículo (aparecerá en las tarjetas)"
            />
          </div>

          {/* Contenido */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Contenido (HTML) *
              </label>
              <button
                type="button"
                onClick={insertTemplate}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                📋 Insertar template
              </button>
            </div>

            {/* Barra de herramientas estilo WordPress */}
            <div className="bg-gray-50 border border-gray-300 rounded-t-lg px-3 py-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => insertElement('h3')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium"
                title="Insertar subtítulo (H3)"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertElement('p')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar párrafo"
              >
                ¶
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertElement('bold')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold text-sm"
                title="Negrita"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertElement('italic')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 italic text-sm"
                title="Cursiva"
              >
                I
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertElement('link')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar enlace"
              >
                🔗
              </button>
              <button
                type="button"
                onClick={() => insertElement('image')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar imagen"
              >
                🖼️
              </button>
              <button
                type="button"
                onClick={() => insertElement('video')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar video (YouTube, etc.)"
              >
                🎥
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertElement('blockquote')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar cita"
              >
                " "
              </button>
              <button
                type="button"
                onClick={() => insertElement('ul')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Lista sin orden"
              >
                • Lista
              </button>
              <button
                type="button"
                onClick={() => insertElement('ol')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Lista ordenada"
              >
                1. Lista
              </button>
              <button
                type="button"
                onClick={() => insertElement('twitter')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar tweet"
              >
                𝕏
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertElement('hr')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar separador horizontal"
              >
                ─
              </button>
              <button
                type="button"
                onClick={() => insertElement('highlight')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm bg-yellow-100"
                title="Resaltar texto importante"
              >
                ✨
              </button>
              <button
                type="button"
                onClick={() => insertElement('note')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Nota del editor"
              >
                📝
              </button>
              <button
                type="button"
                onClick={() => insertElement('related')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Artículo relacionado"
              >
                🔗📄
              </button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => insertElement('table')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Insertar tabla"
              >
                📊
              </button>
              <button
                type="button"
                onClick={() => insertElement('quote-source')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Declaración con fuente"
              >
                💬
              </button>
              <button
                type="button"
                onClick={() => insertElement('alert')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm bg-red-50"
                title="Alerta/Advertencia"
              >
                ⚠️
              </button>
              <button
                type="button"
                onClick={() => insertElement('location')}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                title="Ubicación geográfica"
              >
                📍
              </button>
            </div>

            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="<p>Contenido del artículo en HTML...</p>"
              style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
            />
            <p className="mt-1 text-xs text-gray-500">
              Usa la barra de herramientas para insertar elementos. Puedes seleccionar texto antes de hacer clic en un botón para aplicar el formato.
            </p>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de Portada *
            </label>

            {/* Vista previa de la imagen */}
            {formData.image && (
              <div className="mb-3">
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {/* Selector de archivo */}
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="imageFile"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </label>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <span className="ml-3 text-sm text-gray-500">
                  o ingresa una URL manualmente
                </span>
              </div>

              {/* Input manual de URL */}
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-gray-500">
                Formatos soportados: JPG, PNG, GIF, WebP (máx. 5MB)
              </p>
            </div>
          </div>

          {/* Grid: Categoría, Autor, Tiempo de Lectura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Sociedad">Sociedad</option>
                <option value="NG Insights">NG Insights</option>
                <option value="Internacional">Internacional</option>
                <option value="Economía">Economía</option>
                <option value="Política">Política</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Cultura">Cultura</option>
                <option value="Deportes">Deportes</option>
                <option value="Desafío Bienestar">Desafío Bienestar</option>
                <option value="Planeta extremo">Planeta extremo</option>
              </select>
            </div>

            <div>
              <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-2">
                Autor *
              </label>
              <input
                type="text"
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del autor"
              />
            </div>

            <div>
              <label htmlFor="read_time" className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de lectura (min)
              </label>
              <input
                type="number"
                id="read_time"
                name="read_time"
                value={formData.read_time}
                onChange={handleChange}
                min="1"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Badge */}
          <div>
            <label htmlFor="badge" className="block text-sm font-medium text-gray-700 mb-2">
              Badge (Opcional)
            </label>
            <select
              id="badge"
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin badge</option>
              <option value="exclusive">Exclusivo</option>
              <option value="analysis">Análisis</option>
              <option value="opinion">Opinión</option>
              <option value="live">En Vivo</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Marcar como destacado (aparecerá en la sección principal)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="breaking"
                name="breaking"
                checked={formData.breaking}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="breaking" className="ml-2 block text-sm text-gray-700">
                Marcar como urgente (aparecerá en la barra de noticias)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Publicar (visible en el sitio)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : (isEditing ? 'Actualizar Artículo' : 'Crear Artículo')}
            </button>
            <Link
              to="/admin/articles"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ArticleEditor;
