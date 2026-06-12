"use server";

import { UserGameStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setFilazoTheme } from "@/app/theme-actions";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function dimTheLightsAction() {
  await setFilazoTheme("night");
  revalidatePath("/tonight");
}

export async function chooseTonightGameAction(formData: FormData) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/profile");
  }

  const entryId = formData.get("entryId");
  if (typeof entryId !== "string" || !entryId) {
    redirect("/tonight?message=Pick%20another%20save%20when%20you%20are%20ready.");
  }

  const entry = await prisma.userGameEntry.findUnique({
    where: { id: entryId },
    include: { game: true },
  });

  if (!entry || entry.userId !== userId) {
    redirect("/tonight");
  }

  try {
    await prisma.userGameEntry.update({
      where: { id: entry.id },
      data: {
        status: UserGameStatus.PLAYING,
        activeBacklog: true,
        updatedAt: new Date(),
      },
    });
  } catch {
    redirect(
      `/tonight?message=${encodeURIComponent(
        "That save is already close by. Pick another when the room is ready.",
      )}`,
    );
  }

  revalidatePath("/tonight");
  revalidatePath("/profile");
  revalidatePath(`/games/${entry.game.slug}`);
  redirect(
    `/tonight?message=${encodeURIComponent(
      `${entry.game.name} is marked playing now.`,
    )}`,
  );
}
