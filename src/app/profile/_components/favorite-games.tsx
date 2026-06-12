import { EmptyState } from "@/components/ui/empty-state";
import { GameCard } from "@/components/game-card";
import { SectionHeader } from "@/components/ui/section-header";
import { FavoriteButton } from "./favorite-button";
import type { ProfileData } from "./profile-types";

export function FavoriteGames({ profile }: { profile: ProfileData }) {
  return (
    <section className="panel">
      <SectionHeader
        eyebrow="Favorites"
        title="Games you love"
        aside={<div className="pill">{profile.favoriteEntries.length} kept close</div>}
      />

      {profile.favoriteEntries.length ? (
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {profile.favoriteEntries.map((entry) => (
            <div className="grid gap-2" key={`fav-${entry.id}`}>
              <GameCard
                game={entry.game}
                platformName={entry.platformName}
                playtimeMinutes={entry.playtimeMinutes}
                completionPercent={entry.completionPercent}
                status={
                  entry.finishedAt && entry.status !== "COMPLETED"
                    ? "FINISHED"
                    : entry.status
                }
                variant="shelf"
              />
              <FavoriteButton
                entryId={entry.id}
                gameName={entry.game.name}
                isFavorite={entry.isFavorite}
                fullWidth
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No favorites yet, and that is fine.">
          Tap the heart on any game whenever one feels special.
        </EmptyState>
      )}
    </section>
  );
}
