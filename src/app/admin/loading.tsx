import { Skeleton } from '../../components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas lg:flex" aria-busy="true" aria-label="Yönetim paneli yükleniyor">
      <div className="hidden lg:block w-64 bg-ink" />
      <div className="flex-1 p-8 space-y-6 max-w-6xl">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
