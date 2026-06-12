import Link from "next/link";
import { GameCard, type GameCardGame } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { getProfileData } from "@/lib/catalog";
import { getDatabaseErrorMessage } from "@/lib/database-errors";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { formatNumber } from "@/lib/utils";

const fallbackGames: GameCardGame[] = [
  {
    name: "Neon Drift",
    slug: "neon-drift",
    coverUrl: null,
  },
  {
    name: "Mosslight Valley",
    slug: "mosslight-valley",
    coverUrl: null,
  },
  {
    name: "Station After Rain",
    slug: "station-after-rain",
    coverUrl: null,
  },
  {
    name: "Letters From Low Orbit",
    slug: "letters-from-low-orbit",
    coverUrl: null,
  },
  {
    name: "The Long Garden",
    slug: "the-long-garden",
    coverUrl: null,
  },
  {
    name: "Pocket Harbor",
    slug: "pocket-harbor",
    coverUrl: null,
  },
  {
    name: "Tiny Engines at Dusk",
    slug: "tiny-engines-at-dusk",
    coverUrl: null,
  },
  {
    name: "After the Credits",
    slug: "after-the-credits",
    coverUrl: null,
  },
];

async function getHomeData() {
  const userId = await getSessionUserId();

  try {
    const [catalogStats, enrichedStats, sampleGames, profile] =
      await Promise.all([
        prisma.game.aggregate({ _count: { id: true } }),
        prisma.game.aggregate({ _count: { igdbId: true } }),
        prisma.game.findMany({
          orderBy: { updatedAt: "desc" },
          select: {
            coverUrl: true,
            name: true,
            slug: true,
          },
          take: 8,
        }),
        userId ? getProfileData(userId) : Promise.resolve(null),
      ]);

    return {
      userId,
      profile,
      catalogCount: catalogStats._count.id,
      enrichedCount: enrichedStats._count.igdbId,
      sampleGames,
      databaseError: null,
    };
  } catch (error) {
    console.error("Could not load home catalog data.", error);

    return {
      userId,
      profile: null,
      catalogCount: 0,
      enrichedCount: 0,
      sampleGames: fallbackGames,
      databaseError: getDatabaseErrorMessage(error),
    };
  }
}

export default async function Home() {
  const { catalogCount, enrichedCount, sampleGames, databaseError } =
    await getHomeData();
  const shelfGames = sampleGames.length ? sampleGames : fallbackGames;

  return (
    <main
      id="main-content"
      className="mx-auto grid w-full max-w-[1100px] gap-24 overflow-visible pb-20 max-md:gap-16"
    >
      {databaseError ? (
        <Notice tone="error">
          {databaseError} Vercel deployments need a production database
          connection; this repo&apos;s SQLite file setup is intended for local
          development.
        </Notice>
      ) : null}

      <section className="relative overflow-hidden rounded-[36px] bg-dusk-deep text-cream shadow-float">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-glow/25 blur-[110px] animate-breathe"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 right-[18%] h-[420px] w-[420px] rounded-full bg-sage/15 blur-[110px] animate-breathe [animation-delay:-4.5s]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-90px] top-[-60px] h-[300px] w-[300px] rounded-full bg-sky/10 blur-[90px]"
        />

        <div className="relative z-10 grid grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] items-center gap-12 px-14 py-20 max-lg:grid-cols-1 max-lg:gap-14 max-md:px-7 max-md:py-12">
          <div className="flex min-w-0 flex-col items-start gap-7">
            <p className="text-kicker font-bold uppercase tracking-[0.28em] text-glow/90">
              For players with too many games
            </p>
            <h1 className="text-display font-normal leading-[1.04] tracking-normal">
              Make peace with
              <br />
              your shelf.
              <br />
              <em className="serif-accent text-glow">Befriend it.</em>
            </h1>
            <p className="max-w-[40ch] text-lg leading-relaxed text-cream/70">
              filazo turns the games waiting for someday into a quiet library
              and hands you one gentle pick for tonight.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-cream px-7 text-base font-bold text-dusk-deep hover:bg-glow"
              >
                <a href="/api/auth/steam">Connect Steam</a>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-12 rounded-full border border-cream/25 px-7 text-base font-semibold text-cream hover:bg-cream/10 hover:text-cream"
              >
                <Link href="/profile">Bring a CSV instead</Link>
              </Button>
            </div>
            <p className="mt-2 text-sm text-cream/45">
              {formatNumber(catalogCount)} games already rest here. None of
              them are deadlines.
            </p>
          </div>

          <TonightStack games={shelfGames.slice(0, 3)} />
        </div>
      </section>

      <section className="grid gap-8 px-4">
        <p className="text-center text-kicker font-bold uppercase tracking-[0.28em] text-ink-soft">
          An evening with filazo
        </p>

        <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
          <EveningStep
            number="01"
            title="Bring the games over"
            line="Steam can walk in by itself. CSV, PlayStation, and Xbox lists have a place too."
          />
          <EveningStep
            number="02"
            title="Let them settle"
            line="The catalog folds duplicates together and turns scattered lists into one calm shelf."
          />
          <EveningStep
            number="03"
            title="Choose tonight gently"
            line="When the room is quiet, filazo offers one pick that fits the time and mood you have."
          />
        </div>
      </section>

      <section className="grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4 px-4">
          <div>
            <p className="section-label">The shelf</p>
            <h2 className="text-section-title">
              A Day Mode library with room to breathe.
            </h2>
          </div>
          <p className="max-w-[40ch] text-sm leading-relaxed text-ink-soft">
            {formatNumber(catalogCount)} games already rest here. A few of them
            are enough to show the shape of the room.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-md:grid-cols-2">
          {shelfGames.slice(0, 8).map((game) => (
            <GameCard
              game={game}
              key={game.slug}
              platformName="Catalog"
              status="OWNED"
              variant="shelf"
            />
          ))}
        </div>
      </section>

      <section className="relative px-4 py-6 text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none font-display text-[clamp(5rem,16vw,11rem)] font-medium italic leading-none text-ink/4"
        >
          breathe
        </span>
        <blockquote className="relative mx-auto max-w-[24ch] font-display text-quote font-normal italic leading-snug">
          Your backlog isn&apos;t a debt.
          <br />
          It&apos;s a library you get to live in.
          <br />
          We&apos;ll never count what&apos;s left.
        </blockquote>
      </section>

      <section className="relative overflow-hidden rounded-[36px] bg-dusk text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-glow/20 blur-[100px] animate-breathe"
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-10 py-16 text-center max-md:px-6">
          <h2 className="max-w-[22ch] text-[clamp(1.6rem,3.4vw,2.4rem)] font-normal leading-snug">
            Bring your games over.
            <br />
            Let the shelf become quiet.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-cream px-7 text-base font-bold text-dusk-deep hover:bg-glow"
            >
              <a href="/api/auth/steam">Connect Steam</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full border border-cream/25 px-7 text-base font-semibold text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Link href="/profile">Bring a CSV instead</Link>
            </Button>
          </div>
          <p className="text-xs text-cream/40">
            {formatNumber(enrichedCount)} games here already carry cover art,
            play times, and stories.
          </p>
        </div>
      </section>
    </main>
  );
}

function TonightStack({ games }: { games: GameCardGame[] }) {
  const stackedGames = [...games, ...fallbackGames].slice(0, 3);
  const [frontGame, secondGame, thirdGame] = stackedGames;

  return (
    <div
      className="relative mx-auto h-[390px] w-[300px] max-lg:h-[360px]"
      aria-label="Example: tonight's gentle pick"
    >
      <div className="absolute left-0 top-9 w-[230px] rotate-[-7deg] opacity-50">
        <GameCard
          className="bg-cream text-dusk-deep"
          game={secondGame}
          variant="slot"
        />
      </div>
      <div className="absolute right-0 top-2 w-[238px] rotate-[5deg] opacity-70">
        <GameCard
          className="bg-cream text-dusk-deep"
          game={thirdGame}
          variant="slot"
        />
      </div>
      <div className="absolute left-1/2 top-1/2 w-[260px] -translate-x-1/2 -translate-y-1/2">
        <GameCard
          chips={["quiet evening", "short return"]}
          className="bg-cream text-dusk-deep shadow-float"
          description="A gentle pick that fits your evening with room to spare."
          eyebrow="Tonight's gentle pick"
          game={frontGame}
          platformName="Your shelf"
          status="PLAYING"
          variant="slot"
        />
      </div>
    </div>
  );
}

function EveningStep({
  number,
  title,
  line,
}: {
  number: string;
  title: string;
  line: string;
}) {
  return (
    <Card tactile className="py-0">
      <CardContent className="flex items-start gap-5 p-6">
        <span className="font-display text-[clamp(3rem,7vw,4.6rem)] font-normal italic leading-none text-sage/70">
          {number}
        </span>
        <div className="pt-2">
          <h2 className="font-display text-2xl font-medium">{title}</h2>
          <p className="mt-2 max-w-[38ch] leading-relaxed text-ink-soft">
            {line}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
