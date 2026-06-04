import assert from "node:assert/strict";
import { test } from "node:test";
import { UserGameStatus } from "@prisma/client";
import { estimateRemainingTime } from "../src/lib/time-estimates.ts";

test("remaining time uses completion percent when available", () => {
  const estimate = estimateRemainingTime(
    createEntry({
      completionPercent: 25,
      hltbMainExtraMinutes: 1200,
    }),
  );

  assert.equal(estimate?.remainingMinutes, 900);
  assert.equal(estimate?.basis, "completion-percent");
  assert.equal(estimate?.targetLabel, "main + extras");
});

test("remaining time falls back to playtime against HLTB target", () => {
  const estimate = estimateRemainingTime(
    createEntry({
      playtimeMinutes: 180,
      hltbMainStoryMinutes: 600,
    }),
  );

  assert.equal(estimate?.remainingMinutes, 420);
  assert.equal(estimate?.basis, "playtime");
  assert.equal(estimate?.targetLabel, "main story");
});

test("completed entries have no remaining time", () => {
  const estimate = estimateRemainingTime(
    createEntry({
      status: UserGameStatus.COMPLETED,
      playtimeMinutes: 60,
      hltbMainStoryMinutes: 600,
    }),
  );

  assert.equal(estimate?.remainingMinutes, 0);
  assert.equal(estimate?.basis, "completed");
});

test("missing HLTB data returns no estimate", () => {
  assert.equal(estimateRemainingTime(createEntry({})), null);
});

function createEntry({
  status = UserGameStatus.OWNED,
  playtimeMinutes = null,
  completionPercent = null,
  hltbMainStoryMinutes = null,
  hltbMainExtraMinutes = null,
  hltbCompletionistMinutes = null,
}) {
  return {
    status,
    playtimeMinutes,
    completionPercent,
    game: {
      hltbMainStoryMinutes,
      hltbMainExtraMinutes,
      hltbCompletionistMinutes,
    },
  };
}
