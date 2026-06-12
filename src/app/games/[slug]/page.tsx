import { notFound } from "next/navigation";
import { GameMemoryCard } from "./_components/game-memory-card";
import { getGameBySlug } from "@/lib/catalog";
import { getSessionUserId } from "@/lib/session";

export async function generateMetadata({
  params,
}: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "Game not found | filazo",
    };
  }

  return {
    title: `${game.name} | filazo`,
    description:
      game.summary ??
      `A filazo memory-card page for ${game.name}, with library context and guide notes.`,
  };
}

export default async function GamePage({
  params,
}: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const [game, sessionUserId] = await Promise.all([
    getGameBySlug(slug),
    getSessionUserId(),
  ]);

  if (!game) {
    notFound();
  }

  return <GameMemoryCard game={game} sessionUserId={sessionUserId} />;
}
