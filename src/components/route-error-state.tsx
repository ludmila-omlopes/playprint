"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MemoryCardIllustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";

export function RouteErrorState({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="mx-auto grid min-h-[56vh] w-full max-w-[760px] place-items-center"
    >
      <section className="panel text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-inner border border-edge bg-canvas text-ink-soft">
          <MemoryCardIllustration className="h-14 w-14" />
        </div>
        <p className="section-label justify-center">Save room paused</p>
        <h1 className="text-page-title leading-tight">
          Something jammed.
        </h1>
        <p className="mx-auto mt-3 max-w-[44ch] leading-relaxed text-ink-soft">
          Your library is safe. Try again, or step back to the shelf for a
          moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => unstable_retry()} type="button">
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href="/profile">Back to the shelf</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
