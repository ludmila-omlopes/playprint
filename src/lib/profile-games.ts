export type ProfileGameSort = "added" | "playtime" | "title";

type SortableProfileGameEntry = {
  createdAt: Date;
  playtimeMinutes: number | null;
  game: {
    name: string;
  };
};

export function parseProfileGameSort(value: string | undefined) {
  if (value === "playtime" || value === "title") {
    return value;
  }

  return "added";
}

export function sortProfileGameEntries<Entry extends SortableProfileGameEntry>(
  entries: Entry[],
  sort: ProfileGameSort,
) {
  return [...entries].sort((left, right) => {
    if (sort === "title") {
      return left.game.name.localeCompare(right.game.name);
    }

    if (sort === "playtime") {
      const playtimeDelta =
        (right.playtimeMinutes ?? 0) - (left.playtimeMinutes ?? 0);
      if (playtimeDelta !== 0) {
        return playtimeDelta;
      }
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}
