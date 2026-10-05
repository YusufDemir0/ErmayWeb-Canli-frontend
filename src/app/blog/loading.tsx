import { Skeleton, TextSkeleton } from '../../components/Skeleton';

// Blog listesi ve yazı sayfalarına geçişte
export default function Loading() {
  return (
    <div className="w-full bg-canvas min-h-screen py-12" aria-busy="true" aria-label="Yükleniyor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl mx-auto space-y-3 flex flex-col items-center">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-line rounded-xs overflow-hidden">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <TextSkeleton lines={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
