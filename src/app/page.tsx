import Link from "next/link";
import { getProfileData } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { formatDate, formatNumber } from "@/lib/utils";

const sources = [
  {
    label: "Steam",
    line: "Owned games + playtime",
    tone: "bg-cyan",
    icon: <ControllerIcon />,
  },
  {
    label: "CSV",
    line: "Backlog & wishlist exports",
    tone: "bg-lime",
    icon: <SheetIcon />,
  },
  {
    label: "IGDB",
    line: "Cover art & metadata",
    tone: "bg-peach",
    icon: <TagIcon />,
  },
];

export default async function Home() {
  const [userId, catalogStats, enrichedStats] = await Promise.all([
    getSessionUserId(),
    prisma.game.aggregate({ _count: { id: true } }),
    prisma.game.aggregate({ _count: { igdbId: true } }),
  ]);

  const profile = userId ? await getProfileData(userId) : null;
  const wishlistCount = profile?.wishlistEntries.length ?? 0;
  const latestImport = profile?.latestImport ?? null;

  return (
    <main id="main-content" className="w-full max-w-[1200px] mx-auto grid gap-6 overflow-hidden pb-9">
      {/* Hero */}
      <section className="grid grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] items-center gap-8 p-8 bg-yellow border-3 border-ink rounded-card shadow-hard max-lg:grid-cols-1 max-md:p-5">
        <div className="flex min-w-0 flex-col gap-5">
          <span className="pill">Backlog assistant</span>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] tracking-wide uppercase max-w-[14ch]">
            Know what to play next.
          </h1>
          <p className="max-w-[42ch] text-[1.05rem] font-medium leading-relaxed">
            filazo pulls your Steam library, backlog spreadsheets, and IGDB
            metadata into one catalog — then shortlists what&apos;s worth your
            evening.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <a className="btn btn-primary" href="/api/auth/steam">
              Connect Steam
            </a>
            <Link className="btn btn-ghost" href="/profile">
              Import CSV
            </Link>
          </div>
        </div>

        <ShortlistCard />
      </section>

      {/* How it works: 3 sources merge into one catalog */}
      <section className="panel bg-paper grid gap-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="section-label">How it works</span>
            <h2 className="text-[clamp(1.4rem,3vw,2.1rem)] leading-tight max-w-[20ch]">
              Three messy sources, one clean catalog.
            </h2>
          </div>
          <MergeBadge count={formatNumber(catalogStats._count.id)} />
        </div>

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {sources.map((source) => (
            <article className={`card flex items-center gap-4 ${source.tone}`} key={source.label}>
              <span className="shrink-0 grid place-items-center size-12 border-3 border-ink rounded-[16px] bg-paper">
                {source.icon}
              </span>
              <div className="min-w-0">
                <strong className="font-display text-lg uppercase tracking-wide">
                  {source.label}
                </strong>
                <p className="text-sm font-medium leading-snug">{source.line}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Live stats + final CTA */}
      <section className="panel flex items-center justify-between gap-8 bg-peach max-lg:flex-col max-lg:items-start">
        <div className="grid grid-cols-3 gap-4 min-w-0 max-sm:grid-cols-1">
          <Stat label="Catalog" value={formatNumber(catalogStats._count.id)} />
          <Stat label="Wishlist" value={formatNumber(wishlistCount)} />
          <Stat label="Enriched" value={formatNumber(enrichedStats._count.igdbId)} />
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm font-bold uppercase tracking-wide">
            Last import: {latestImport ? formatDate(latestImport.createdAt) : "not yet"}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <a className="btn btn-primary" href="/api/auth/steam">
              Connect Steam
            </a>
            <Link className="btn btn-ghost" href="/profile">
              Import CSV
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ShortlistCard() {
  return (
    <div
      className="relative w-full max-w-[340px] justify-self-end border-3 border-ink rounded-card bg-paper shadow-hard overflow-hidden max-lg:justify-self-start"
      aria-label="Example shortlist recommendation"
    >
      <span className="absolute right-3 top-3 z-10 rotate-[8deg] rounded-pill border-3 border-ink bg-lime px-3 py-1 font-display text-xs uppercase tracking-wide shadow-hard-xs">
        Play next
      </span>
      <GameCover />
      <div className="grid gap-3 border-t-3 border-ink p-5">
        <div>
          <p className="section-label !mb-1">Top of the pile</p>
          <h3 className="font-display text-xl uppercase leading-tight">
            Neon Drift
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
          <span className="rounded-pill border-2 border-ink bg-cyan px-2.5 py-1">
            Owned
          </span>
          <span className="rounded-pill border-2 border-ink bg-yellow px-2.5 py-1">
            12h played
          </span>
          <span className="rounded-pill border-2 border-ink bg-white px-2.5 py-1">
            Backlog
          </span>
        </div>
      </div>
    </div>
  );
}

function GameCover() {
  return (
    <svg
      viewBox="0 0 340 200"
      className="w-full"
      role="img"
      aria-label="Stylized game cover artwork"
    >
      <rect width="340" height="200" fill="var(--color-cyan)" />
      <circle cx="250" cy="62" r="34" fill="var(--color-yellow)" stroke="var(--color-ink)" strokeWidth="4" />
      <path d="M0 200 L70 110 L130 200 Z" fill="var(--color-lime)" stroke="var(--color-ink)" strokeWidth="4" />
      <path d="M95 200 L185 90 L275 200 Z" fill="var(--color-peach)" stroke="var(--color-ink)" strokeWidth="4" />
      <path d="M220 200 L300 130 L340 200 Z" fill="var(--color-lime)" stroke="var(--color-ink)" strokeWidth="4" />
      <rect x="0" y="178" width="340" height="22" fill="var(--color-ink)" />
    </svg>
  );
}

function MergeBadge({ count }: { count: string }) {
  return (
    <div className="flex items-center gap-2 rounded-pill border-3 border-ink bg-lime px-4 py-2 shadow-hard-xs">
      <span className="font-display text-lg leading-none">{count}</span>
      <span className="text-xs font-bold uppercase tracking-wide leading-tight">
        canonical
        <br />
        games
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border-3 border-ink bg-paper p-3.5">
      <span className="stat-label !mb-1">{label}</span>
      <strong className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-none">
        {value}
      </strong>
    </div>
  );
}

function ControllerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="10" rx="5" />
      <line x1="7" y1="11" x2="7" y2="15" />
      <line x1="5" y1="13" x2="9" y2="13" />
      <circle cx="16" cy="12.5" r="1" fill="var(--color-ink)" />
      <circle cx="18.5" cy="14.5" r="1" fill="var(--color-ink)" />
    </svg>
  );
}

function SheetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 L11 3.5 L21 3.5 L21 13.5 L13 21.5 Z" />
      <circle cx="16.5" cy="8" r="1.4" fill="var(--color-ink)" />
    </svg>
  );
}
