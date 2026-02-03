import { useState } from 'react';

/**
 * Componente de imagen con blur placeholder.
 * Muestra un blur CSS mientras la imagen real carga.
 */
function BlurImage({ src, alt, className = '', blurData, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden w-full h-full">
      {/* Blur placeholder */}
      {blurData && !loaded && (
        <img
          src={`data:image/webp;base64,${blurData}`}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg ${className}`}
          aria-hidden="true"
        />
      )}
      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}

export default BlurImage;
