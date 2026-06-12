import { GameCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      id="main-content"
      className="mx-auto grid w-full max-w-[1100px] gap-7 pb-12"
    >
      <section className="rounded-card border border-edge bg-sage-soft/70 p-8 shadow-soft">
        <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-8 max-md:grid-cols-1">
          <GameCardSkeleton />
          <div className="grid content-center gap-4">
            <Skeleton className="h-20 w-full max-w-[520px]" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-8 w-64 rounded-pill" />
          </div>
        </div>
      </section>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-7 max-lg:grid-cols-1">
        <div className="grid gap-7">
          <Skeleton className="h-52 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
        <Skeleton className="h-72 rounded-card" />
      </div>
    </main>
  );
}
