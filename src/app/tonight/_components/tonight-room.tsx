"use client";

import Link from "next/link";
import { Moon, Sparkles } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  chooseTonightGameAction,
  dimTheLightsAction,
} from "../actions";

export type TonightPick = {
  entryId: string;
  reason: string;
  source: "openai" | "rules";
  entry: {
    completionPercent: number | null;
    finishedAt: Date | null;
    platformName: string | null;
    playtimeMinutes: number | null;
    status: string;
    game: {
      coverUrl?: string | null;
      genres?: unknown;
      name: string;
      slug: string;
    };
  };
};

export type TonightMood = {
  href: string;
  label: string;
  value: string;
};

export function TonightRoom({
  alternatives,
  currentMood,
  isNight,
  message,
  moods,
  offset,
  pick,
  playingPick,
}: {
  alternatives: TonightPick[];
  currentMood: string;
  isNight: boolean;
  message?: string;
  moods: TonightMood[];
  offset: number;
  pick: TonightPick | null;
  playingPick: TonightPick | null;
}) {
  if (!pick) {
    return (
      <div className="relative grid min-h-[62vh] place-items-center overflow-hidden rounded-[36px] border border-edge bg-dusk-deep p-8 text-cream shadow-float">
        <NightGlow />
        <EmptyState title="Your nightstand is quiet.">
          Add a few games to your shelf, then come back when the room is dim.
          <div className="mt-5">
            <Button asChild>
              <Link href="/profile">Bring games to the shelf</Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-edge bg-dusk-deep p-8 text-cream shadow-float max-md:p-5">
      <NightGlow />
      <div className="relative z-10 mx-auto grid max-w-[960px] gap-10">
        {!isNight ? (
          <form
            action={dimTheLightsAction}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-cream/10 bg-cream/8 px-4 py-3 text-sm text-cream/75"
          >
            <span>Dim the lights?</span>
            <Button
              className="border-cream/20 bg-cream/10 text-cream hover:bg-cream/15"
              size="sm"
              type="submit"
              variant="ghost"
            >
              <Moon aria-hidden />
              Night Mode
            </Button>
          </form>
        ) : null}

        {message ? (
          <p className="rounded-card border border-glow/20 bg-glow/10 px-4 py-3 text-sm font-semibold text-cream/85">
            {message}
          </p>
        ) : null}

        {playingPick ? (
          <div className="rounded-card border border-glow/20 bg-glow/10 p-5">
            <p className="section-label !mb-1 text-glow">Back to an old save?</p>
            <p className="text-sm leading-relaxed text-cream/75">
              {playingPick.entry.game.name} is already open on the shelf.
              Continuity beats novelty at night.
            </p>
          </div>
        ) : null}

        <div className="grid gap-5 text-center">
          <p className="text-kicker font-bold uppercase tracking-[0.24em] text-glow/85">
            Tonight
          </p>
          <h1 className="font-display text-[clamp(2.1rem,6vw,4rem)] font-normal leading-none tracking-normal">
            What kind of night is it?
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            {moods.map((mood) => (
              <Link
                className={cn(
                  "rounded-pill border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-dusk-deep",
                  currentMood === mood.value
                    ? "border-glow bg-glow text-dusk-deep"
                    : "border-cream/15 bg-cream/8 text-cream/75 hover:bg-cream/12 hover:text-cream",
                )}
                href={mood.href}
                key={mood.value}
              >
                {mood.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[460px] gap-4">
          <GameCard
            chips={[pick.source === "openai" ? "AI pick" : "shelf signals"]}
            className="bg-cream text-dusk-deep shadow-float"
            completionPercent={pick.entry.completionPercent}
            description={pick.reason}
            eyebrow="The room points here"
            game={pick.entry.game}
            platformName={pick.entry.platformName}
            playtimeMinutes={pick.entry.playtimeMinutes}
            status={
              pick.entry.finishedAt && pick.entry.status !== "COMPLETED"
                ? "FINISHED"
                : pick.entry.status
            }
            variant="slot"
          />

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <form action={chooseTonightGameAction}>
              <input type="hidden" name="entryId" value={pick.entryId} />
              <Button className="w-full" type="submit">
                <Sparkles aria-hidden />
                Sounds right
              </Button>
            </form>
            <Button
              asChild
              className="border-cream/20 bg-cream/10 text-cream hover:bg-cream/15"
              variant="ghost"
            >
              <Link href={`/tonight?mood=${currentMood}&skip=${offset + 1}`}>
                Not tonight
              </Link>
            </Button>
          </div>
        </div>

        {alternatives.length ? (
          <div className="grid gap-3">
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-cream/45">
              also on the nightstand
            </p>
            <div className="grid grid-cols-2 gap-3 opacity-75 max-sm:grid-cols-1">
              {alternatives.map((alternative) => (
                <GameCard
                  className="bg-cream/95 text-dusk-deep"
                  description={alternative.reason}
                  game={alternative.entry.game}
                  key={alternative.entryId}
                  platformName={alternative.entry.platformName}
                  playtimeMinutes={alternative.entry.playtimeMinutes}
                  status={alternative.entry.status}
                  variant="row"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NightGlow() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[420px] rounded-full bg-glow/20 blur-[110px] animate-breathe"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-160px] right-[16%] h-[360px] w-[360px] rounded-full bg-dusk-lavender/10 blur-[100px] animate-breathe [animation-delay:-5s]"
      />
    </>
  );
}
