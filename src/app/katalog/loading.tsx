import { Skeleton, TextSkeleton } from '../../components/Skeleton';

export default function Loading() {
  return (
    <div className="w-full bg-paper min-h-screen" aria-busy="true" aria-label="Katalog yükleniyor">
      <div className="bg-white border-b border-line py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-56" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-xs border border-line p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            <Skeleton className="md:col-span-7 aspect-[4/3]" />
            <div className="md:col-span-5 space-y-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-4/5" />
              <TextSkeleton lines={4} />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
