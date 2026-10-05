import { Skeleton, TextSkeleton } from '../../components/Skeleton';

// Showroom sayfasına geçişte: başlık, bölge seçimi, harita ve mağaza kartları
export default function Loading() {
  return (
    <div className="w-full bg-canvas min-h-screen py-8 sm:py-14" aria-busy="true" aria-label="Showroomlar yükleniyor">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <Skeleton className="h-3 w-40" />
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-10 w-56" />
          <TextSkeleton lines={2} />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40 rounded-full" />
          <Skeleton className="h-9 w-48 rounded-full" />
        </div>
        <div className="bg-white border border-line rounded-xs p-5">
          <Skeleton className="w-full aspect-[2.35/1] max-h-[440px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-line rounded-xs p-3 space-y-4">
              <Skeleton className="aspect-[16/10]" />
              <div className="px-2 pb-3 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <TextSkeleton lines={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
