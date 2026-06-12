import Link from "next/link";
import { Armchair, LibraryBig, Sparkles } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { AssistantData, ProfileData, ProfileTab } from "./profile-types";

const railItems = [
  {
    tab: "overview" as const,
    href: "/profile",
    label: "Overview",
    hint: "Profile and connections",
    icon: Armchair,
  },
  {
    tab: "games" as const,
    href: "/profile?tab=games",
    label: "Shelf",
    hint: "Browse every game",
    icon: LibraryBig,
  },
  {
    tab: "assistant" as const,
    href: "/profile?tab=assistant",
    label: "Assistant",
    hint: "Gentle suggestions",
    icon: Sparkles,
  },
];

export function ProfileRail({
  activeTab,
  assistant,
  profile,
}: {
  activeTab: ProfileTab;
  assistant: AssistantData | null;
  profile: ProfileData;
}) {
  const gamesCount =
    profile.ownedEntries.length + profile.wishlistEntries.length;

  return (
    <aside className="sticky top-28 grid gap-4 self-start max-lg:static">
      <div className="relative overflow-hidden rounded-[28px] bg-dusk-deep p-6 text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-[200px] w-[200px] rounded-full bg-glow/25 blur-[70px] animate-breathe"
        />
        <div className="relative">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-cream/15 font-display text-2xl ring-2 ring-cream/20">
            {profile.user.avatarUrl ? (
              <img
                alt={`${profile.user.displayName ?? "User"} avatar`}
                src={profile.user.avatarUrl}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{(profile.user.displayName ?? "P").slice(0, 1)}</span>
            )}
          </div>
          <h1 className="mt-4 truncate font-display text-xl font-medium">
            {profile.user.displayName ?? "Player"}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-cream/55">
            {formatNumber(profile.ownedEntries.length)} on the shelf {" / "}
            {formatNumber(profile.wishlistEntries.length)} still curious
          </p>
        </div>
      </div>

      <nav
        className="grid gap-1 rounded-[28px] border border-edge bg-surface p-2 shadow-rest"
        aria-label="Profile sections"
      >
        {railItems.map(({ tab, href, label, hint, icon: Icon }) => {
          const count =
            tab === "games"
              ? gamesCount
              : tab === "assistant"
                ? assistant?.insights.length ?? null
                : null;

          return (
            <Link
              href={href}
              key={tab}
              aria-current={activeTab === tab ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[20px] px-4 py-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                activeTab === tab
                  ? "bg-ink text-surface"
                  : "text-ink-soft hover:bg-canvas hover:text-ink",
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-none opacity-80" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-tight">
                  {label}
                </span>
                <span
                  className={cn(
                    "block text-caption leading-tight",
                    activeTab === tab ? "text-surface/60" : "text-ink-soft/70",
                  )}
                >
                  {hint}
                </span>
              </span>
              {count !== null ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.68rem] font-bold",
                    activeTab === tab
                      ? "bg-surface/20 text-surface"
                      : "bg-canvas text-ink-soft",
                  )}
                >
                  {formatNumber(count)}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <p className="px-4 text-center font-display text-sm italic text-ink-soft/80 max-lg:hidden">
        your shelf, your pace
      </p>
    </aside>
  );
}
