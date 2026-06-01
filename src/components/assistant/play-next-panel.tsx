import type { AssistantProfileData } from "@/lib/assistant/queries";
import { selectPlayNext } from "@/lib/assistant/queries";
import { GameFrictionCard } from "@/components/assistant/game-friction-card";

export function PlayNextPanel({
  assistant,
}: {
  assistant: NonNullable<AssistantProfileData>;
}) {
  const playNext = selectPlayNext(assistant.insights);
  const releaseCandidates = assistant.insights
    .filter((insight) => insight.signalType === "RELEASE_CANDIDATE")
    .slice(0, 3);

  return (
    <section className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
      <article className="panel">
        <div className="mb-[22px]">
          <span className="section-label">Play next</span>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Three low-friction picks
          </h2>
        </div>
        {playNext.length ? (
          <div className="grid gap-3">
            {playNext.map((insight) => (
              <GameFrictionCard insight={insight} key={insight.id} />
            ))}
          </div>
        ) : (
          <p className="rounded-[22px] border-3 border-ink bg-paper/95 p-5 font-bold">
            Refresh the assistant to generate play-next picks.
          </p>
        )}
      </article>

      <article className="panel">
        <div className="mb-[22px]">
          <span className="section-label">Ready to release</span>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Clear active backlog space
          </h2>
        </div>
        {releaseCandidates.length ? (
          <div className="grid gap-3">
            {releaseCandidates.map((insight) => (
              <GameFrictionCard insight={insight} key={insight.id} />
            ))}
          </div>
        ) : (
          <p className="rounded-[22px] border-3 border-ink bg-paper/95 p-5 font-bold">
            No strong release candidates yet.
          </p>
        )}
      </article>
    </section>
  );
}
