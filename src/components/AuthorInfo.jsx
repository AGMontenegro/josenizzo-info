function AuthorInfo({ author, date, readTime, compact = false }) {
  // Generar iniciales para el avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generar color de avatar basado en el nombre
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="font-medium text-gray-900">{author}</span>
        {date && (
          <>
            <span>•</span>
            <span>{date}</span>
          </>
        )}
        {readTime && (
          <>
            <span>•</span>
            <span>{readTime} min de lectura</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full ${getAvatarColor(author)} flex items-center justify-center text-white font-bold text-sm`}>
        {getInitials(author)}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900">{author}</p>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {date && <span>{date}</span>}
          {readTime && (
            <>
              <span>•</span>
              <span>{readTime} min de lectura</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthorInfo;
