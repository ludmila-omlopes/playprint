import Link from "next/link";
import { MemoryCardIllustration } from "@/components/illustrations";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto grid min-h-[56vh] w-full max-w-[760px] place-items-center"
    >
      <section className="panel text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-inner border border-edge bg-canvas text-ink-soft">
          <MemoryCardIllustration className="h-14 w-14" />
        </div>
        <p className="section-label justify-center">Missing save</p>
        <h1 className="text-page-title leading-tight">
          This save file doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-3 max-w-[44ch] leading-relaxed text-ink-soft">
          The shelf is still here. Step back and pick up from a known slot.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/profile?tab=games">Back to the shelf</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
