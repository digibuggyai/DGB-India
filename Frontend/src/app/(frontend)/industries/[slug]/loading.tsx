import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="border-b border-border py-20">
      <div className="container-page">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-2/3" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </section>
  );
}
