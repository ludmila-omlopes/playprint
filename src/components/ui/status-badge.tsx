import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  OWNED: "bg-sage-soft text-ink",
  WISHLIST: "bg-sand-soft text-ink",
  PLAYING: "bg-sky-soft text-ink",
  COMPLETED: "bg-dusk-lavender-soft text-ink",
  FINISHED: "bg-dusk-lavender-soft text-ink",
  BACKLOG: "bg-canvas text-ink-soft",
};

const statusLabels: Record<string, string> = {
  OWNED: "owned",
  WISHLIST: "wishlist",
  PLAYING: "playing",
  COMPLETED: "completed",
  FINISHED: "finished",
  BACKLOG: "resting",
};

/** Soft tinted badge for a UserGameEntry status. */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-caption font-bold lowercase tracking-wide",
        statusStyles[status] ?? "bg-canvas text-ink-soft",
        className,
      )}
    >
      {statusLabels[status] ?? status.toLowerCase()}
    </span>
  );
}
