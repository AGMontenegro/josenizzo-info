// Skeleton loader para la página Home - muestra placeholders mientras carga

function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );
}

function HomeSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna IZQUIERDA */}
      <div className="lg:col-span-8 lg:border-r border-gray-200 lg:pr-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Imagen central */}
          <div className="md:col-span-4 order-1 md:order-2">
            <SkeletonBox className="aspect-[16/9] w-full" />
          </div>

          {/* Artículos izquierda */}
          <div className="space-y-6 order-2 md:order-1">
            <div className="pb-6 border-b border-gray-200">
              <SkeletonBox className="h-4 w-full mb-2" />
              <SkeletonBox className="h-4 w-3/4 mb-2" />
              <SkeletonBox className="h-3 w-full" />
              <SkeletonBox className="h-3 w-2/3 mt-1" />
            </div>
            <div>
              <SkeletonBox className="h-4 w-full mb-2" />
              <SkeletonBox className="h-4 w-3/4 mb-2" />
              <SkeletonBox className="h-3 w-full" />
            </div>
          </div>
        </div>

        {/* Artículos adicionales */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="pb-6 border-b border-gray-200 md:pb-0 md:border-b-0">
            <SkeletonBox className="h-4 w-full mb-2" />
            <SkeletonBox className="h-4 w-2/3" />
          </div>
          <div className="md:border-l border-gray-200 md:pl-6">
            <SkeletonBox className="h-4 w-full mb-2" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>
        </div>

        <div className="mt-8 border-t-2 border-gray-900"></div>
      </div>

      {/* Columna DERECHA */}
      <div className="lg:col-span-4 space-y-5">
        {/* Artículo superior */}
        <div className="pb-5 border-b border-gray-200">
          <SkeletonBox className="aspect-[16/10] w-full mb-2" />
          <SkeletonBox className="h-4 w-full mb-2" />
          <SkeletonBox className="h-4 w-3/4" />
        </div>

        {/* 2 artículos lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <SkeletonBox className="aspect-square w-full mb-2" />
            <SkeletonBox className="h-3 w-full mb-1" />
            <SkeletonBox className="h-3 w-2/3" />
          </div>
          <div>
            <SkeletonBox className="aspect-square w-full mb-2" />
            <SkeletonBox className="h-3 w-full mb-1" />
            <SkeletonBox className="h-3 w-3/4" />
          </div>
        </div>

        <div className="mt-8 border-t-2 border-gray-900"></div>

        {/* Más artículos skeleton */}
        <div className="pb-5 border-b border-gray-200">
          <SkeletonBox className="aspect-[16/9] w-full mb-2" />
          <SkeletonBox className="h-4 w-full mb-1" />
          <SkeletonBox className="h-4 w-2/3" />
        </div>
        <div className="pb-5 border-b border-gray-200">
          <SkeletonBox className="h-4 w-full mb-1" />
          <SkeletonBox className="h-4 w-3/4" />
        </div>
        <div className="pb-5 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="w-1/2">
              <SkeletonBox className="h-4 w-full mb-1" />
              <SkeletonBox className="h-4 w-full mb-1" />
              <SkeletonBox className="h-4 w-2/3" />
            </div>
            <div className="w-1/2">
              <SkeletonBox className="aspect-square w-full" />
            </div>
          </div>
        </div>

        {/* Newsletter skeleton */}
        <div className="mt-8 pt-4 border-t-2 border-gray-900">
          <SkeletonBox className="h-5 w-32 mb-3" />
          <SkeletonBox className="h-3 w-full mb-2" />
          <SkeletonBox className="h-3 w-3/4 mb-5" />
          <SkeletonBox className="h-12 w-full mb-3" />
          <SkeletonBox className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default HomeSkeleton;
