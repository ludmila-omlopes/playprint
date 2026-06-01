import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseProfileGameSort,
  sortProfileGameEntries,
} from "../src/lib/profile-games.ts";

const entries = [
  createEntry("Older Long Game", "2026-01-01T00:00:00.000Z", 500),
  createEntry("Newest Zero Playtime", "2026-05-22T00:00:00.000Z", 0),
  createEntry("Alphabetical First", "2026-02-01T00:00:00.000Z", 10),
];

test("games default to newest sorting so new zero-playtime games are visible", () => {
  assert.equal(parseProfileGameSort(undefined), "added");

  const sorted = sortProfileGameEntries(entries, "added");

  assert.deepEqual(
    sorted.map((entry) => entry.game.name),
    ["Newest Zero Playtime", "Alphabetical First", "Older Long Game"],
  );
});

test("games can still be sorted by playtime or title", () => {
  assert.deepEqual(
    sortProfileGameEntries(entries, "playtime").map((entry) => entry.game.name),
    ["Older Long Game", "Alphabetical First", "Newest Zero Playtime"],
  );
  assert.deepEqual(
    sortProfileGameEntries(entries, "title").map((entry) => entry.game.name),
    ["Alphabetical First", "Newest Zero Playtime", "Older Long Game"],
  );
});

function createEntry(name, createdAt, playtimeMinutes) {
  return {
    createdAt: new Date(createdAt),
    playtimeMinutes,
    game: {
      name,
    },
  };
}
