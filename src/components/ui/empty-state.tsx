import type { ReactNode } from "react";

/** Gentle empty placeholder — reassuring instead of alarming. */
export function EmptyState({
  title,
  illustration,
  children,
}: {
  title: string;
  illustration?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="tactile-surface rounded-card border border-dashed border-edge bg-surface/70 p-8 text-center shadow-rest">
      {illustration ? (
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-inner border border-edge bg-canvas text-ink-soft">
          {illustration}
        </div>
      ) : null}
      <p className="font-display text-lg">{title}</p>
      {children ? (
        <div className="mx-auto mt-2 max-w-[44ch] text-sm leading-relaxed text-ink-soft">
          {children}
        </div>
      ) : null}
    </div>
  );
}
