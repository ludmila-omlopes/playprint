import Link from "next/link";
import { AssistantSignalType } from "@prisma/client";
import type { AssistantProfileData } from "@/lib/assistant/queries";
import { formatNumber } from "@/lib/utils";

export function BacklogDiagnosis({
  assistant,
}: {
  assistant: NonNullable<AssistantProfileData>;
}) {
  const counts = new Map<AssistantSignalType, number>();
  for (const insight of assistant.insights) {
    counts.set(insight.signalType, (counts.get(insight.signalType) ?? 0) + 1);
  }

  const items = [
    ["Untouched", AssistantSignalType.UNTOUCHED],
    ["Sampled then cold", AssistantSignalType.SAMPLED_DROPPED],
    ["Stale playing", AssistantSignalType.STALE_PLAYING],
    ["Finishable soon", AssistantSignalType.FINISHABLE_SOON],
    ["Wishlist risk", AssistantSignalType.WISHLIST_RISK],
  ] as const;

  return (
    <section className="panel">
      <div className="mb-[22px] flex items-center justify-between gap-3 max-lg:flex-col max-lg:items-start">
        <div>
          <span className="section-label">Backlog diagnosis</span>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            What is blocking play
          </h2>
        </div>
        <div className="pill">
          {assistant.latestRun
            ? `Last run: ${assistant.latestRun.createdAt.toLocaleDateString()}`
            : "Not refreshed yet"}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 max-lg:grid-cols-3 max-sm:grid-cols-2">
        {items.map(([label, signal]) => (
          <Link
            className="rounded-[18px] border-3 border-ink bg-yellow/25 p-3 text-center transition-all hover:-translate-y-0.5 hover:bg-yellow/45 hover:shadow-hard-xs focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            href={`/profile?tab=games&view=list&signal=${signal}`}
            key={signal}
          >
            <strong className="block font-display text-3xl">
              {formatNumber(counts.get(signal) ?? 0)}
            </strong>
            <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-widest text-ink/65">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink/70">
        Based on {formatNumber(assistant.librarySummary.ownedCount)} owned games,
        {` ${formatNumber(assistant.librarySummary.untouchedCount)} untouched games, `}
        and {formatNumber(assistant.librarySummary.sampledDroppedCount)} short samples.
      </p>
    </section>
  );
}
