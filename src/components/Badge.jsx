function Badge({ type = 'default', children }) {
  const styles = {
    breaking: 'bg-red-600 text-white animate-pulse',
    exclusive: 'bg-amber-500 text-white',
    analysis: 'bg-indigo-600 text-white',
    live: 'bg-green-600 text-white',
    opinion: 'bg-purple-600 text-white',
    video: 'bg-pink-600 text-white',
    default: 'bg-gray-800 text-white'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${styles[type] || styles.default}`}>
      {type === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      )}
      {children}
    </span>
  );
}

export default Badge;
