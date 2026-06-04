import Link from "next/link";
import type { AssistantProfileData } from "@/lib/assistant/queries";
import { estimateRemainingTime } from "@/lib/time-estimates";
import { formatRemainingTime } from "@/lib/utils";

type Insight = AssistantProfileData["insights"][number];

function readReasons(reasons: Insight["reasons"]) {
  return Array.isArray(reasons)
    ? reasons
        .map((reason) =>
          reason && typeof reason === "object" && "evidence" in reason
            ? String(reason.evidence)
            : "",
        )
        .filter(Boolean)
    : [];
}

function readGenres(genres: Insight["userGameEntry"]["game"]["genres"]) {
  if (!genres) {
    return [];
  }

  if (typeof genres === "string") {
    try {
      return readGenres(JSON.parse(genres));
    } catch {
      return [genres];
    }
  }

  if (!Array.isArray(genres)) {
    return [];
  }

  return genres
    .map((genre) => {
      if (typeof genre === "string") {
        return genre;
      }
      if (genre && typeof genre === "object" && "name" in genre) {
        return String((genre as { name?: unknown }).name ?? "");
      }
      return "";
    })
    .filter(Boolean)
    .slice(0, 4);
}

export function GameFrictionCard({ insight }: { insight: Insight }) {
  const reasons = readReasons(insight.reasons);
  const genres = readGenres(insight.userGameEntry.game.genres);
  const remainingTime = estimateRemainingTime(insight.userGameEntry);

  return (
    <Link
      className="block rounded-[22px] border-3 border-ink bg-paper/95 p-4 shadow-hard-xs transition-all hover:-translate-y-0.5 hover:bg-yellow/15 hover:shadow-hard-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
      href={`/profile?tab=games&view=list#entry-${insight.userGameEntry.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="section-label !mb-1">{insight.signalType.toLowerCase()}</p>
          <h3 className="truncate text-lg font-black">
            {insight.userGameEntry.game.name}
          </h3>
        </div>
        <span className="pill">{insight.score}</span>
      </div>
      {genres.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {genres.map((genre) => (
            <span
              className="rounded-full border-2 border-ink bg-cyan/30 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wide"
              key={genre}
            >
              {genre}
            </span>
          ))}
        </div>
      ) : null}
      {remainingTime ? (
        <p
          className="mt-3 inline-flex rounded-full border-2 border-ink bg-lime/30 px-2.5 py-0.5 text-xs font-black uppercase tracking-wide"
          title={`Based on HLTB ${remainingTime.targetLabel}`}
        >
          {formatRemainingTime(remainingTime.remainingMinutes)}
        </p>
      ) : null}
      {reasons.length ? (
        <p className="mt-3 text-sm leading-relaxed text-ink/75">
          {reasons.join(" ")}
        </p>
      ) : null}
      {insight.suggestedAction ? (
        <p className="mt-3 text-sm font-bold">{insight.suggestedAction}</p>
      ) : null}
    </Link>
  );
}
