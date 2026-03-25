import Link from "next/link";
import { getProfileData } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function Home() {
  const [userId, catalogStats, latestGames] = await Promise.all([
    getSessionUserId(),
    prisma.game.aggregate({
      _count: {
        id: true,
      },
    }),
    prisma.game.findMany({
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);
  const profile = userId ? await getProfileData(userId) : null;

  return (
    <main id="main-content" className="w-full max-w-[1200px] mx-auto grid gap-6 pb-9">
      {/* ── Hero Panel ── */}
      <section className="hero-dashed-inset overflow-hidden grid grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-6 p-8 bg-gradient-to-br from-yellow/95 to-peach/94 border-3 border-ink rounded-[38px] shadow-hard max-lg:grid-cols-1">
        <div className="relative z-10">
          <p className="section-label">Steam sync, CSV import, IGDB enrichment</p>
          <h1 className="max-w-[11ch] font-display text-[clamp(2.9rem,8vw,5.8rem)] leading-[0.95] tracking-wide uppercase max-lg:max-w-none max-lg:text-[clamp(2.4rem,14vw,4rem)]">
            Give your game collection a loud, tactile home.
          </h1>
          <p className="max-w-[34rem] mt-[18px] text-lg leading-relaxed">
            Checkpoint pulls your Steam library, absorbs backlog exports, and
            turns raw rows into a catalog with artwork, platform context, and a
            proper public-facing profile.
          </p>
          <div className="flex items-center gap-3.5 flex-wrap mt-7">
            <Link className="btn btn-primary" href="/profile">
              Open your profile
            </Link>
            <a className="btn btn-ghost" href="/api/auth/steam">
              Connect Steam
            </a>
          </div>
        </div>

        <div className="relative min-h-[430px] max-lg:min-h-[320px]">
          {/* Floating stat cards */}
          <div className="absolute top-[22px] right-[18px] grid gap-2 w-[230px] p-5 border-3 border-ink rounded-[26px] shadow-hard bg-paper animate-float-card max-lg:w-[190px]">
            <span className="text-[0.82rem] uppercase tracking-widest">
              Owned Library
            </span>
            <strong className="font-display text-5xl leading-none">
              {formatNumber(profile?.ownedEntries.length ?? 0)}
            </strong>
          </div>
          <div className="absolute bottom-[72px] left-[18px] grid gap-2 w-[230px] p-5 border-3 border-ink rounded-[26px] shadow-hard bg-lime animate-float-card [animation-delay:0.6s] max-lg:w-[190px]">
            <span className="text-[0.82rem] uppercase tracking-widest">
              IGDB-ready catalog
            </span>
            <strong className="font-display text-5xl leading-none">
              {formatNumber(catalogStats._count.id)}
            </strong>
          </div>

          {/* Marquee */}
          <div className="absolute -right-10 -left-10 bottom-0 flex gap-3.5 overflow-hidden px-3.5 py-3 -rotate-[4deg] bg-ink text-white border-y-[3px] border-ink">
            <span className="flex-none font-display text-lg uppercase animate-marquee">
              retro brutalist catalog
            </span>
            <span className="flex-none font-display text-lg uppercase animate-marquee">
              steam-owned titles
            </span>
            <span className="flex-none font-display text-lg uppercase animate-marquee">
              csv rescue mission
            </span>
            <span className="flex-none font-display text-lg uppercase animate-marquee">
              future ps/xbox adapters
            </span>
          </div>
        </div>
      </section>

      {/* ── Support Grid (3 features) ── */}
      <section className="panel grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        <article className="card card-hover">
          <span className="section-label">Flow one</span>
          <h2 className="mb-2.5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Connect Steam and pull the real library.
          </h2>
          <p className="leading-relaxed">
            Sign in through Steam OpenID, grab owned games and profile basics,
            then keep the local catalog in sync without duplicating titles on
            repeat imports.
          </p>
        </article>
        <article className="card card-hover bg-lime">
          <span className="section-label">Flow two</span>
          <h2 className="mb-2.5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Import any CSV and map it in the browser.
          </h2>
          <p className="leading-relaxed">
            Preview columns, choose title/platform/status fields, and bring
            wishlists or backlog exports into the same profile.
          </p>
        </article>
        <article className="card card-hover bg-[#fff1be]">
          <span className="section-label">Flow three</span>
          <h2 className="mb-2.5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Let IGDB turn plain names into game pages.
          </h2>
          <p className="leading-relaxed">
            Covers, genres, release dates, screenshots, and platform metadata
            get cached locally so future providers can attach to the same
            canonical game records.
          </p>
        </article>
      </section>

      {/* ── Feature Stage ── */}
      <section className="panel grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 items-start max-lg:grid-cols-1">
        <div>
          <span className="section-label">Now playing</span>
          <h2 className="mb-2.5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            A profile built for collectors, not spreadsheets.
          </h2>
          <p className="leading-relaxed">
            Owned games, wishlists, Steam basics, import history, and future
            provider links all sit on one internal model so the product can grow
            without a rewrite.
          </p>
        </div>

        <div className="grid gap-3.5">
          {(latestGames.length ? latestGames : featuredFallbackGames).map(
            (game) => {
              const platforms = Array.isArray(game.platforms)
                ? game.platforms
                : [];

              return (
                <article className="card card-hover" key={game.slug}>
                  <span className="pill">
                    {String(platforms[0] ?? "Catalog")}
                  </span>
                  <h3 className="mt-2.5 mb-2 text-xl font-bold">
                    {game.name}
                  </h3>
                  <p className="leading-relaxed">
                    {game.summary ??
                      "This entry is ready to hold Steam ownership, imported notes, and future store links."}
                  </p>
                  <div className="flex justify-between gap-3.5 mt-[18px] font-bold">
                    <span>{formatDate(game.releaseDate)}</span>
                    <Link
                      href={`/games/${game.slug}`}
                      className="nav-link"
                    >
                      Open page
                    </Link>
                  </div>
                </article>
              );
            },
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="panel flex items-center justify-between gap-6 bg-gradient-to-r from-cyan to-[#dffbff] max-lg:flex-col">
        <div>
          <span className="section-label">V1 launch pad</span>
          <h2 className="mb-2.5 text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
            Start with Steam today. Leave the door open for every store after.
          </h2>
        </div>
        <div className="flex items-center gap-3.5 flex-wrap">
          <Link className="btn btn-primary" href="/profile">
            Go to profile
          </Link>
          <a className="btn btn-ghost" href="/api/auth/steam">
            Link Steam
          </a>
        </div>
      </section>
    </main>
  );
}

const featuredFallbackGames = [
  {
    slug: "hades-fallback",
    name: "Hades",
    summary:
      "Fast, replayable, and exactly the kind of game page this catalog is designed to make feel collectible.",
    releaseDate: new Date("2020-09-17"),
    platforms: ["Steam", "Switch", "PlayStation"],
  },
  {
    slug: "balatro-fallback",
    name: "Balatro",
    summary:
      "A tiny ruleset with huge appetite for metadata, playtime tracking, and backlog bragging rights.",
    releaseDate: new Date("2024-02-20"),
    platforms: ["Steam", "Xbox", "PlayStation"],
  },
  {
    slug: "outer-wilds-fallback",
    name: "Outer Wilds",
    summary:
      "A reminder that the page should feel editorial, atmospheric, and generous with context.",
    releaseDate: new Date("2019-05-28"),
    platforms: ["Steam", "Xbox", "PlayStation"],
  },
];
