import Link from "next/link";
import { redirect } from "next/navigation";
import { CsvImportWidget } from "@/components/csv-import-widget";
import { getProfileData } from "@/lib/catalog";
import { hasIgdbConfig } from "@/lib/igdb";
import { getSessionUserId } from "@/lib/session";
import { isSteamConfigured } from "@/lib/steam";
import { cn, formatDate, formatNumber, formatPlaytime } from "@/lib/utils";
import {
  importCsvAction,
  syncSteamLibraryAction,
  toggleFavoriteAction,
} from "./actions";

type ProfileSearchParams = Promise<{
  tab?: string;
  view?: string;
  connected?: string;
  synced?: string;
  imported?: string;
  error?: string;
}>;

export default async function ProfilePage({
  searchParams,
}: PageProps<"/profile"> & { searchParams: ProfileSearchParams }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return (
      <main id="main-content" className="w-full max-w-[900px] mx-auto">
        <section className="p-7 text-center border-3 border-ink rounded-[30px] bg-paper/95 shadow-hard">
          <p className="section-label">Profile locked behind your library</p>
          <h1 className="mb-3 font-display text-[clamp(2.5rem,6vw,4.4rem)] leading-[0.95] uppercase">
            Connect Steam to build your first shelf.
          </h1>
          <p className="max-w-[36rem] mx-auto leading-relaxed">
            The profile page becomes functional as soon as you link Steam. CSV
            import and IGDB enrichment live here too.
          </p>
          <div className="flex items-center justify-center gap-3.5 flex-wrap mt-7">
            <a className="btn btn-primary" href="/api/auth/steam">
              Connect Steam
            </a>
            <Link className="btn btn-ghost" href="/">
              Back to landing
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const profile = await getProfileData(userId);
  if (!profile) {
    redirect("/");
  }

  const query = await searchParams;
  const activeTab = query.tab === "games" ? "games" : "overview";
  const gamesView = query.view === "grid" ? "grid" : "list";

  const statusMessage = query.error
    ? { tone: "error" as const, message: query.error }
    : query.synced
      ? {
          tone: "success" as const,
          message: `Steam sync finished. ${query.synced} titles refreshed.`,
        }
      : query.imported
        ? {
            tone: "success" as const,
            message: `CSV import finished. ${query.imported} rows were added or updated.`,
          }
        : query.connected
          ? {
              tone: "success" as const,
              message:
                "Steam account connected. Run a sync to pull the library.",
            }
          : null;

  return (
    <main id="main-content" className="w-full max-w-[1200px] mx-auto grid gap-6">
      {/* ── Profile Hero ── */}
      <section className="hero-dashed-inset overflow-hidden p-8 bg-gradient-to-br from-yellow/95 to-peach/94 border-3 border-ink rounded-[38px] shadow-hard">
        {/* Identity row */}
        <div className="relative z-10 flex items-center gap-5 mb-6 max-sm:flex-col max-sm:items-start">
          <div className="w-20 h-20 flex-none overflow-hidden border-3 border-ink rounded-[20px] bg-paper shadow-hard-xs grid place-items-center font-display text-3xl hover:scale-105 transition-transform duration-200">
            {profile.user.avatarUrl ? (
              <img
                alt={`${profile.user.displayName ?? "User"} avatar`}
                src={profile.user.avatarUrl}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{(profile.user.displayName ?? "C").slice(0, 1)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="section-label !mb-1">Collector profile</p>
            <h1 className="font-display text-[clamp(1.6rem,4vw,2.8rem)] leading-tight uppercase truncate">
              {profile.user.displayName ?? "Checkpoint Collector"}
            </h1>
            <p className="text-ink/60 text-sm mt-1">
              Steam connected · Ready for PlayStation, Xbox &amp; future stores
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 gap-3 max-sm:grid-cols-3">
          <div className="p-4 bg-paper/90 border-3 border-ink rounded-[18px] text-center">
            <strong className="block font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
              {formatNumber(profile.ownedEntries.length)}
            </strong>
            <span className="block mt-1.5 text-[0.72rem] uppercase tracking-widest text-ink/70">
              Owned
            </span>
          </div>
          <div className="p-4 bg-paper/90 border-3 border-ink rounded-[18px] text-center">
            <strong className="block font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
              {formatNumber(profile.wishlistEntries.length)}
            </strong>
            <span className="block mt-1.5 text-[0.72rem] uppercase tracking-widest text-ink/70">
              Wishlist
            </span>
          </div>
          <div className="p-4 bg-paper/90 border-3 border-ink rounded-[18px] text-center">
            <strong className="block font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
              {formatNumber(profile.user.externalAccounts.length)}
            </strong>
            <span className="block mt-1.5 text-[0.72rem] uppercase tracking-widest text-ink/70">
              Accounts
            </span>
          </div>
        </div>
      </section>

      {/* ── Status Banner ── */}
      {statusMessage ? (
        <section
          role="status"
          aria-live="polite"
          className={cn(
            "p-4 px-[18px] border-3 border-ink rounded-inner font-bold animate-slide-in",
            statusMessage.tone === "success" && "bg-[#e7ffc2]",
            statusMessage.tone === "error" && "bg-[#ffd5ca]",
          )}
        >
          {statusMessage.message}
        </section>
      ) : null}

      {/* ── Tab Navigation ── */}
      <nav className="flex gap-2" aria-label="Profile sections">
        <Link
          href="/profile"
          className={cn(
            "px-5 py-2.5 border-3 border-ink rounded-pill font-bold text-sm uppercase tracking-wide transition-all duration-150",
            activeTab === "overview"
              ? "bg-ink text-white shadow-hard-xs"
              : "bg-paper/80 hover:bg-paper shadow-[2px_2px_0_rgba(21,21,21,0.12)] hover:shadow-hard-xs hover:-translate-y-0.5",
          )}
        >
          Overview
        </Link>
        <Link
          href="/profile?tab=games"
          className={cn(
            "px-5 py-2.5 border-3 border-ink rounded-pill font-bold text-sm uppercase tracking-wide transition-all duration-150",
            activeTab === "games"
              ? "bg-ink text-white shadow-hard-xs"
              : "bg-paper/80 hover:bg-paper shadow-[2px_2px_0_rgba(21,21,21,0.12)] hover:shadow-hard-xs hover:-translate-y-0.5",
          )}
        >
          Games
          <span className="ml-1.5 text-xs opacity-70">
            {profile.ownedEntries.length + profile.wishlistEntries.length}
          </span>
        </Link>
      </nav>

      {/* ══════════════════════════════════════════════ */}
      {/* ── OVERVIEW TAB ── */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === "overview" ? (
        <>
          {/* Favorite Games */}
          <section className="panel">
            <div className="flex items-center justify-between gap-3.5 mb-[22px] max-lg:flex-col max-lg:items-start">
              <div>
                <span className="section-label">Favorites</span>
                <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
                  Your top picks
                </h2>
              </div>
              <div className="pill">
                {profile.favoriteEntries.length} favorited
              </div>
            </div>

            {profile.favoriteEntries.length ? (
              <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {profile.favoriteEntries.map((entry) => (
                  <div
                    className="relative group border-3 border-ink rounded-[24px] overflow-hidden bg-gradient-to-b from-peach/20 to-yellow/30 shadow-hard-sm hover:shadow-hard hover:-translate-y-1 transition-all duration-200"
                    key={`fav-${entry.id}`}
                  >
                    <Link href={`/games/${entry.game.slug}`}>
                      <div className="aspect-[3/4] overflow-hidden bg-gradient-to-b from-cyan to-yellow">
                        {entry.game.coverUrl ? (
                          <img
                            alt=""
                            src={entry.game.coverUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="grid place-items-center w-full h-full p-4 font-display text-2xl uppercase text-center">
                            {entry.game.name}
                          </div>
                        )}
                      </div>
                      <div className="p-3.5">
                        <h3 className="font-bold text-sm truncate">
                          {entry.game.name}
                        </h3>
                        <p className="text-xs text-ink/60 mt-1">
                          {formatPlaytime(entry.playtimeMinutes)}
                        </p>
                      </div>
                    </Link>
                    <form action={toggleFavoriteAction} className="absolute top-2.5 right-2.5">
                      <input type="hidden" name="entryId" value={entry.id} />
                      <button
                        type="submit"
                        className="w-9 h-9 grid place-items-center rounded-full bg-paper/90 border-2 border-ink shadow-hard-xs hover:bg-peach hover:text-white transition-colors cursor-pointer"
                        aria-label={`Remove ${entry.game.name} from favorites`}
                        title="Remove from favorites"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-peach">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-7 text-center border-3 border-ink rounded-[30px] bg-paper/95 shadow-hard">
                <p className="font-bold">No favorites yet.</p>
                <p className="text-ink/70 leading-relaxed">
                  Hit the heart icon on any game in your library to pin it here.
                </p>
              </div>
            )}
          </section>

          {/* Steam + CSV Panels */}
          <section className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
            <article className="panel">
              <div className="flex items-center justify-between gap-3.5 mb-[22px] max-lg:flex-col max-lg:items-start">
                <div>
                  <span className="section-label">Steam</span>
                  <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
                    Account and sync
                  </h2>
                </div>
                {profile.steamAccount ? (
                  <form action={syncSteamLibraryAction}>
                    <button className="btn btn-primary" type="submit">
                      Sync Steam library
                    </button>
                  </form>
                ) : (
                  <a className="btn btn-primary" href="/api/auth/steam">
                    Connect Steam
                  </a>
                )}
              </div>

              <div className="grid gap-3.5">
                <div className="flex items-center justify-between gap-3.5 pb-3.5 border-b border-dashed border-ink/25 max-lg:flex-col max-lg:items-start">
                  <span>Status</span>
                  <strong>
                    {profile.steamAccount ? "Connected" : "Not connected"}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3.5 pb-3.5 border-b border-dashed border-ink/25 max-lg:flex-col max-lg:items-start">
                  <span>Steam sync</span>
                  <strong>
                    {profile.steamAccount?.lastSyncedAt
                      ? formatDate(profile.steamAccount.lastSyncedAt)
                      : "Not synced yet"}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3.5 pb-3.5 border-b border-dashed border-ink/25 max-lg:flex-col max-lg:items-start">
                  <span>Steam profile</span>
                  <strong>
                    {profile.steamAccount?.profileUrl ? (
                      <a
                        href={profile.steamAccount.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-link"
                      >
                        Open profile
                      </a>
                    ) : (
                      "Unavailable"
                    )}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3.5 max-lg:flex-col max-lg:items-start">
                  <span>Config</span>
                  <strong>
                    Steam API {isSteamConfigured() ? "ready" : "missing key"} / IGDB{" "}
                    {hasIgdbConfig() ? "ready" : "missing keys"}
                  </strong>
                </div>
              </div>
            </article>

            <article className="panel">
              <div className="flex items-center justify-between gap-3.5 mb-[22px] max-lg:flex-col max-lg:items-start">
                <div>
                  <span className="section-label">CSV import</span>
                  <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.05]">
                    Bring in backlog exports
                  </h2>
                </div>
                <div className="pill">
                  {profile.latestImport
                    ? `Latest: ${formatDate(profile.latestImport.createdAt)}`
                    : "No imports yet"}
                </div>
              </div>
              <CsvImportWidget action={importCsvAction} />
            </article>
          </section>
        </>
      ) : null}

      {/* ══════════════════════════════════════════════ */}
      {/* ── GAMES TAB ── */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === "games" ? (
        <>
          {/* View toggle toolbar */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink/60">
              {profile.ownedEntries.length + profile.wishlistEntries.length} games
            </p>
            <div className="flex border-3 border-ink rounded-[14px] overflow-hidden">
              <Link
                href="/profile?tab=games&view=list"
                className={cn(
                  "px-3 py-1.5 grid place-items-center transition-colors",
                  gamesView === "list"
                    ? "bg-ink text-white"
                    : "bg-paper/80 hover:bg-paper",
                )}
                aria-label="List view"
                title="List view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                </svg>
              </Link>
              <Link
                href="/profile?tab=games&view=grid"
                className={cn(
                  "px-3 py-1.5 grid place-items-center transition-colors border-l-3 border-ink",
                  gamesView === "grid"
                    ? "bg-ink text-white"
                    : "bg-paper/80 hover:bg-paper",
                )}
                aria-label="Grid view"
                title="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* ── List View ── */}
          {gamesView === "list" ? (
            <section className="panel !p-0 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,0.4fr)_44px] gap-3 px-5 py-3 bg-ink text-white text-[0.72rem] font-bold uppercase tracking-widest max-md:grid-cols-[1fr_minmax(0,0.5fr)_44px] max-md:gap-2">
                <span>Title</span>
                <span>Platform</span>
                <span className="max-md:hidden">Status</span>
                <span className="max-md:hidden">Playtime</span>
                <span className="sr-only">Favorite</span>
              </div>

              {profile.ownedEntries.length || profile.wishlistEntries.length ? (
                <div className="divide-y divide-ink/10">
                  {[...profile.ownedEntries, ...profile.wishlistEntries].map(
                    (entry) => (
                      <div
                        className="grid grid-cols-[1fr_minmax(0,0.5fr)_minmax(0,0.5fr)_minmax(0,0.4fr)_44px] gap-3 px-5 py-2.5 items-center hover:bg-yellow/10 transition-colors max-md:grid-cols-[1fr_minmax(0,0.5fr)_44px] max-md:gap-2"
                        key={`list-${entry.id}`}
                      >
                        <Link
                          href={`/games/${entry.game.slug}`}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <div className="w-10 h-10 flex-none rounded-[10px] overflow-hidden border-2 border-ink/20 bg-gradient-to-b from-cyan/40 to-yellow/40">
                            {entry.game.coverUrl ? (
                              <img
                                alt=""
                                src={entry.game.coverUrl}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="grid place-items-center w-full h-full font-display text-[0.6rem] uppercase">
                                {entry.game.name.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-sm truncate hover:text-peach transition-colors">
                            {entry.game.name}
                          </span>
                        </Link>

                        <span className="text-xs text-ink/60 truncate">
                          {entry.platformName ?? "—"}
                        </span>

                        <span className="max-md:hidden">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wide border-2",
                              entry.status === "OWNED" &&
                                "bg-lime/40 border-lime text-ink",
                              entry.status === "WISHLIST" &&
                                "bg-yellow/40 border-yellow text-ink",
                              entry.status === "PLAYING" &&
                                "bg-cyan/40 border-cyan text-ink",
                              entry.status === "COMPLETED" &&
                                "bg-peach/30 border-peach text-ink",
                              entry.status === "BACKLOG" &&
                                "bg-paper border-ink/20 text-ink/60",
                            )}
                          >
                            {entry.status.toLowerCase()}
                          </span>
                        </span>

                        <span className="text-xs text-ink/60 max-md:hidden">
                          {formatPlaytime(entry.playtimeMinutes)}
                        </span>

                        <form action={toggleFavoriteAction}>
                          <input type="hidden" name="entryId" value={entry.id} />
                          <button
                            type="submit"
                            className="w-8 h-8 grid place-items-center rounded-full hover:bg-peach/15 transition-colors cursor-pointer"
                            aria-label={
                              entry.isFavorite
                                ? `Remove ${entry.game.name} from favorites`
                                : `Add ${entry.game.name} to favorites`
                            }
                            title={
                              entry.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            {entry.isFavorite ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-peach">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-ink/25">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                              </svg>
                            )}
                          </button>
                        </form>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <p className="font-bold">No games in your library yet.</p>
                  <p className="text-ink/70 leading-relaxed mt-1">
                    Sync Steam or import a CSV from the Overview tab.
                  </p>
                </div>
              )}
            </section>
          ) : null}

          {/* ── Grid View ── */}
          {gamesView === "grid" ? (
            <section>
              {profile.ownedEntries.length || profile.wishlistEntries.length ? (
                <div className="grid grid-cols-5 gap-4 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
                  {[...profile.ownedEntries, ...profile.wishlistEntries].map(
                    (entry) => (
                      <div
                        className="group relative rounded-[20px] overflow-hidden border-3 border-ink bg-white shadow-hard-sm hover:shadow-hard hover:-translate-y-1.5 transition-all duration-200"
                        key={`grid-${entry.id}`}
                      >
                        {/* Cover art */}
                        <Link href={`/games/${entry.game.slug}`}>
                          <div className="aspect-[3/4] overflow-hidden bg-ink/5 flex items-center justify-center">
                            {entry.game.coverUrl ? (
                              <img
                                alt={entry.game.name}
                                src={entry.game.coverUrl}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="grid place-items-center w-full h-full p-3 font-display text-lg uppercase text-center text-ink/50 bg-gradient-to-b from-cyan/30 to-yellow/30">
                                {entry.game.name}
                              </div>
                            )}
                          </div>

                          {/* Info overlay at bottom of cover */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/50 to-transparent pt-10 pb-3 px-3">
                            <h3 className="font-bold text-sm text-white leading-snug line-clamp-2">
                              {entry.game.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={cn(
                                  "inline-block px-2 py-px rounded-full text-[0.6rem] font-bold uppercase tracking-wide",
                                  entry.status === "OWNED" && "bg-lime/80 text-ink",
                                  entry.status === "WISHLIST" && "bg-yellow/80 text-ink",
                                  entry.status === "PLAYING" && "bg-cyan/80 text-ink",
                                  entry.status === "COMPLETED" && "bg-peach/80 text-ink",
                                  entry.status === "BACKLOG" && "bg-white/60 text-ink",
                                )}
                              >
                                {entry.status.toLowerCase()}
                              </span>
                              {entry.playtimeMinutes && entry.playtimeMinutes > 0 ? (
                                <span className="text-[0.65rem] text-white/70">
                                  {formatPlaytime(entry.playtimeMinutes)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Link>

                        {/* Favorite button */}
                        <form action={toggleFavoriteAction} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <input type="hidden" name="entryId" value={entry.id} />
                          <button
                            type="submit"
                            className={cn(
                              "w-8 h-8 grid place-items-center rounded-full border-2 shadow-sm backdrop-blur-sm transition-colors cursor-pointer",
                              entry.isFavorite
                                ? "bg-peach/90 border-white/50 text-white opacity-100!"
                                : "bg-ink/40 border-white/30 text-white hover:bg-peach/80",
                            )}
                            aria-label={
                              entry.isFavorite
                                ? `Remove ${entry.game.name} from favorites`
                                : `Add ${entry.game.name} to favorites`
                            }
                            title={
                              entry.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            {entry.isFavorite ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                              </svg>
                            )}
                          </button>
                        </form>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="panel p-10 text-center">
                  <p className="font-bold">No games in your library yet.</p>
                  <p className="text-ink/70 leading-relaxed mt-1">
                    Sync Steam or import a CSV from the Overview tab.
                  </p>
                </div>
              )}
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
