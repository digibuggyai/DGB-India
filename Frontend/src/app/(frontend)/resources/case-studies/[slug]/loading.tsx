import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="border-b border-border py-20">
      <div className="container-page max-w-3xl">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-2/3" />
        <Skeleton className="mt-6 h-4 w-1/2" />
      </div>
    </section>
  );
}
