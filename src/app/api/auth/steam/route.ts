import { NextResponse } from "next/server";
import { createSteamAuthUrl } from "@/lib/steam";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = process.env.APP_URL || requestUrl.origin;

  return NextResponse.redirect(createSteamAuthUrl(origin));
}
