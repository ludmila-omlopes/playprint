import Link from "next/link";
import type { StoredPlayerProfile } from "@/lib/assistant/profile-agent";
import { SyncActionForm } from "@/components/sync-action-form";
import { formatDate } from "@/lib/utils";

export function PlayerProfilePanel({
  profile,
  hasGames,
  aiConfigured,
  action,
}: {
  profile: StoredPlayerProfile | null;
  hasGames: boolean;
  aiConfigured: boolean;
  action: (formData: FormData) => void;
}) {
  return (
    <section className="panel">
      <div className="mb-[22px] flex items-center justify-between gap-3.5 max-lg:flex-col max-lg:items-start">
        <div>
          <span className="section-label">Player profile</span>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Who you are as a player
          </h2>
          <p className="mt-1 text-xs text-ink/65">
            An AI agent reads your library, playtime, reviews, and abandon
            reasons through internal tools, then writes this profile. Regenerate
            it after adding feedback or reviews.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 max-lg:items-start">
          <div className="pill">
            {profile
              ? `Generated ${formatDate(profile.updatedAt)}`
              : "Not generated yet"}
          </div>
          {hasGames && aiConfigured ? (
            <SyncActionForm
              action={action}
              buttonLabel={profile ? "Regenerate profile" : "Generate profile"}
              pendingLabel="Agent analyzing..."
              pendingNotice="The profile agent is querying your library, feedback, and reviews. Keep this page open."
            />
          ) : profile && !aiConfigured ? (
            <p className="text-xs font-bold text-ink/60">
              Set OPENAI_API_KEY to regenerate.
            </p>
          ) : null}
        </div>
      </div>

      {!hasGames ? (
        <div className="rounded-[22px] border-3 border-dashed border-ink/40 bg-paper/80 p-7 text-center">
          <p className="font-bold">No library data to analyze yet.</p>
          <p className="mt-1 leading-relaxed text-ink/70">
            Sync Steam, Xbox, or PlayStation, or import a CSV. The profile agent
            needs at least a few games to say anything honest about you.
          </p>
        </div>
      ) : !profile && !aiConfigured ? (
        <div className="rounded-[22px] border-3 border-ink bg-[#ffd5ca] p-5">
          <p className="font-bold">AI module unavailable.</p>
          <p className="mt-1 text-sm leading-relaxed">
            Player profile generation needs OPENAI_API_KEY. The rest of the
            assistant keeps working with rule-based signals.
          </p>
        </div>
      ) : !profile ? (
        <div className="rounded-[22px] border-3 border-dashed border-ink/40 bg-paper/80 p-7 text-center">
          <p className="font-bold">Your profile has not been written yet.</p>
          <p className="mt-1 leading-relaxed text-ink/70">
            Hit “Generate profile” and the agent will investigate your games,
            playtime, favorites, and written feedback to draft it.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          <p className="rounded-[22px] border-3 border-ink bg-yellow/25 p-5 font-bold leading-relaxed">
            {profile.payload.summary}
          </p>

          {profile.payload.preferredGenres.length ? (
            <div>
              <h3 className="section-label !mb-2">Preferred genres</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {profile.payload.preferredGenres.map((item) => (
                  <div
                    className="rounded-[16px] border-2 border-ink bg-paper/90 px-3.5 py-2.5"
                    key={item.genre}
                  >
                    <strong className="block text-sm uppercase tracking-wide">
                      {item.genre}
                    </strong>
                    <span className="text-xs leading-snug text-ink/70">
                      {item.evidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            {profile.payload.playStyles.length ? (
              <div>
                <h3 className="section-label !mb-2">Play styles</h3>
                <ul className="grid gap-1.5 text-sm leading-relaxed">
                  {profile.payload.playStyles.map((style) => (
                    <li className="flex gap-2" key={style}>
                      <span aria-hidden>▸</span>
                      {style}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {profile.payload.behaviorPatterns.length ? (
              <div>
                <h3 className="section-label !mb-2">Behavior patterns</h3>
                <ul className="grid gap-1.5 text-sm leading-relaxed">
                  {profile.payload.behaviorPatterns.map((pattern) => (
                    <li className="flex gap-2" key={pattern}>
                      <span aria-hidden>▸</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {profile.payload.recommendations.length ? (
            <div>
              <h3 className="section-label !mb-2">From your own shelf</h3>
              <div className="grid gap-2">
                {profile.payload.recommendations.map((recommendation) => (
                  <Link
                    className="rounded-[16px] border-2 border-ink bg-cyan/20 px-3.5 py-2.5 transition-all hover:-translate-y-0.5 hover:bg-cyan/35 hover:shadow-hard-xs"
                    href={`/games/${recommendation.slug}`}
                    key={recommendation.slug}
                  >
                    <strong className="block text-sm">
                      {recommendation.title}
                    </strong>
                    <span className="text-xs leading-snug text-ink/70">
                      {recommendation.reason}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {profile.payload.dataNotes.length ? (
            <ul className="grid gap-1 text-xs text-ink/60">
              {profile.payload.dataNotes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
            </ul>
          ) : null}

          {profile.toolTrace.length ? (
            <details className="text-xs text-ink/60">
              <summary className="cursor-pointer font-bold uppercase tracking-widest">
                How the agent built this ({profile.toolTrace.length} tool calls)
              </summary>
              <ol className="mt-2 grid gap-1">
                {profile.toolTrace.map((step, index) => (
                  <li key={`${step.tool}-${index}`}>
                    {index + 1}. <code>{step.tool}</code>
                    {step.resultSummary ? ` — ${step.resultSummary}` : ""}
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </div>
      )}
    </section>
  );
}
