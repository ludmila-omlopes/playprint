import type { Prisma } from "@prisma/client";
import { AssistantSignalType } from "@prisma/client";
import { summarizeAssistantInsights } from "@/lib/assistant/ai";
import {
  buildLibrarySummary,
  scoreBacklogEntries,
  type AssistantEntry,
  type AssistantInsight,
} from "@/lib/assistant/scoring";
import { prisma } from "@/lib/prisma";

export type AssistantProfileData = Awaited<ReturnType<typeof getAssistantProfileData>>;

function toAssistantEntry(
  entry: Prisma.UserGameEntryGetPayload<{ include: { game: true } }>,
): AssistantEntry {
  return {
    id: entry.id,
    status: entry.status,
    playtimeMinutes: entry.playtimeMinutes,
    lastPlayedAt: entry.lastPlayedAt,
    completionPercent: entry.completionPercent,
    isFavorite: entry.isFavorite,
    activeBacklog: entry.activeBacklog,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    lastSyncedAt: entry.lastSyncedAt,
    platformName: entry.platformName,
    userIntent: entry.userIntent,
    desiredSessionMin: entry.desiredSessionMin,
    game: {
      id: entry.game.id,
      name: entry.game.name,
      genres: entry.game.genres,
      platforms: entry.game.platforms,
      aggregatedRating: entry.game.aggregatedRating,
    },
  };
}

export async function getAssistantProfileData(userId: string) {
  const [entries, insights, latestRun] = await Promise.all([
    prisma.userGameEntry.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.userGameInsight.findMany({
      where: { userId },
      include: {
        userGameEntry: {
          include: {
            game: true,
          },
        },
      },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.assistantRun.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const assistantEntries = entries.map(toAssistantEntry);
  const librarySummary = buildLibrarySummary(assistantEntries);

  return {
    entries,
    insights,
    latestRun,
    librarySummary,
    generatedInsights: scoreBacklogEntries(assistantEntries).slice(0, 8),
  };
}

export async function getAssistantSignalEntryIds(
  userId: string,
  signalType: AssistantSignalType,
) {
  const insights = await prisma.userGameInsight.findMany({
    where: {
      userId,
      signalType,
    },
    select: {
      userGameEntryId: true,
    },
  });

  return new Set(insights.map((insight) => insight.userGameEntryId));
}

export async function refreshAssistantInsightsForUser(userId: string) {
  const entries = await prisma.userGameEntry.findMany({
    where: { userId },
    include: { game: true },
  });
  const assistantEntries = entries.map(toAssistantEntry);
  const ruleInsights = scoreBacklogEntries(assistantEntries);
  const userLibrarySummary = buildLibrarySummary(assistantEntries);
  const summary = await summarizeAssistantInsights({
    userLibrarySummary,
    ruleInsights: ruleInsights.slice(0, 8),
  });

  for (const insight of ruleInsights) {
    await upsertInsight(userId, insight);
  }

  await prisma.assistantRun.create({
    data: {
      userId,
      inputSummary: {
        userLibrarySummary,
        insightCount: ruleInsights.length,
      } as Prisma.InputJsonValue,
      outputSummary: summary.output as Prisma.InputJsonValue,
      model: summary.model,
      status: summary.usedAi ? "COMPLETED_AI" : "COMPLETED_RULES",
    },
  });

  return {
    insightCount: ruleInsights.length,
    summary: summary.output,
  };
}

async function upsertInsight(userId: string, insight: AssistantInsight) {
  await prisma.userGameInsight.upsert({
    where: {
      userGameEntryId_signalType: {
        userGameEntryId: insight.entryId,
        signalType: insight.signalType,
      },
    },
    update: {
      friction: insight.friction,
      score: insight.score,
      confidence: insight.confidence,
      reasons: insight.reasons as Prisma.InputJsonValue,
      suggestedAction: insight.suggestedAction,
      generatedBy: "rules",
    },
    create: {
      userId,
      userGameEntryId: insight.entryId,
      signalType: insight.signalType,
      friction: insight.friction,
      score: insight.score,
      confidence: insight.confidence,
      reasons: insight.reasons as Prisma.InputJsonValue,
      suggestedAction: insight.suggestedAction,
      generatedBy: "rules",
    },
  });
}

export function selectPlayNext(insights: AssistantProfileData["insights"]) {
  const bySignal = new Map(
    insights.map((insight) => [insight.signalType, insight]),
  );

  return [
    bySignal.get(AssistantSignalType.FINISHABLE_SOON),
    bySignal.get(AssistantSignalType.STALE_PLAYING),
    bySignal.get(AssistantSignalType.SAMPLED_DROPPED),
    bySignal.get(AssistantSignalType.UNTOUCHED),
  ].filter(
    (insight): insight is AssistantProfileData["insights"][number] =>
      insight !== undefined,
  ).slice(0, 3);
}
