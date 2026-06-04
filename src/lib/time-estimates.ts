import { UserGameStatus } from "@prisma/client";

type CompletionTarget = {
  key: "mainExtra" | "mainStory" | "completionist";
  label: string;
  minutes: number;
};

export type RemainingTimeEstimate = {
  remainingMinutes: number;
  totalMinutes: number;
  targetLabel: string;
  basis: "completed" | "completion-percent" | "playtime" | "full-estimate";
};

type EstimateInput = {
  status: UserGameStatus | `${UserGameStatus}`;
  playtimeMinutes?: number | null;
  completionPercent?: number | null;
  game: {
    hltbMainStoryMinutes?: number | null;
    hltbMainExtraMinutes?: number | null;
    hltbCompletionistMinutes?: number | null;
  };
};

function getDefaultTarget(game: EstimateInput["game"]): CompletionTarget | null {
  if (game.hltbMainExtraMinutes && game.hltbMainExtraMinutes > 0) {
    return {
      key: "mainExtra",
      label: "main + extras",
      minutes: game.hltbMainExtraMinutes,
    };
  }

  if (game.hltbMainStoryMinutes && game.hltbMainStoryMinutes > 0) {
    return {
      key: "mainStory",
      label: "main story",
      minutes: game.hltbMainStoryMinutes,
    };
  }

  if (game.hltbCompletionistMinutes && game.hltbCompletionistMinutes > 0) {
    return {
      key: "completionist",
      label: "completionist",
      minutes: game.hltbCompletionistMinutes,
    };
  }

  return null;
}

export function estimateRemainingTime(
  entry: EstimateInput,
): RemainingTimeEstimate | null {
  const target = getDefaultTarget(entry.game);
  if (!target) {
    return null;
  }

  if (
    entry.status === UserGameStatus.COMPLETED ||
    (entry.completionPercent ?? 0) >= 100
  ) {
    return {
      remainingMinutes: 0,
      totalMinutes: target.minutes,
      targetLabel: target.label,
      basis: "completed",
    };
  }

  const completionPercent = entry.completionPercent;
  if (completionPercent !== null && completionPercent !== undefined) {
    return {
      remainingMinutes: Math.max(
        0,
        Math.round(target.minutes * ((100 - completionPercent) / 100)),
      ),
      totalMinutes: target.minutes,
      targetLabel: target.label,
      basis: "completion-percent",
    };
  }

  const playtimeMinutes = entry.playtimeMinutes ?? 0;
  if (playtimeMinutes > 0) {
    return {
      remainingMinutes: Math.max(0, target.minutes - playtimeMinutes),
      totalMinutes: target.minutes,
      targetLabel: target.label,
      basis: "playtime",
    };
  }

  return {
    remainingMinutes: target.minutes,
    totalMinutes: target.minutes,
    targetLabel: target.label,
    basis: "full-estimate",
  };
}
