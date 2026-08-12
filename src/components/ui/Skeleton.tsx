import { cn } from "../../lib/utils";

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} />
  );
};

export const SkeletonCard = () => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}
