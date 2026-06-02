import type { Metadata } from "next";
import "@fontsource/bungee";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import Link from "next/link";
import "./globals.css";
import { SignOutForm } from "@/components/sign-out-form";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export const metadata: Metadata = {
  title: "filazo",
  description:
    "A game catalog that syncs Steam libraries, imports CSV data, and enriches titles with IGDB metadata.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getSessionUserId();
  const navigationUser = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        include: {
          externalAccounts: true,
        },
      })
    : null;

  return (
    <html lang="en">
      <body>
        {/* Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 btn btn-primary"
        >
          Skip to content
        </a>

        <div className="min-h-screen p-6 max-md:p-4">
          <header className="w-full max-w-[1200px] mx-auto mb-5 px-6 py-[18px] flex items-center justify-between gap-4 bg-paper/85 border-3 border-ink rounded-pill shadow-header backdrop-blur-[10px] max-lg:flex-col max-lg:rounded-card">
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="px-3.5 py-2.5 bg-yellow border-3 border-ink rounded-pill shadow-hard-xs font-display text-[0.95rem] tracking-wide uppercase">
                filazo
              </span>
              <span className="max-w-[30ch] text-[0.92rem] max-sm:hidden">
                Catalog your library like it deserves a museum wall.
              </span>
            </Link>

            <nav className="flex items-center gap-3.5 flex-wrap" aria-label="Main">
              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/profile" className="nav-link">
                Profile
              </Link>
              {navigationUser ? (
                <div className="inline-flex items-center gap-3">
                  <span className="font-medium max-w-[16ch] truncate">
                    {navigationUser.displayName ?? "Collector"}
                  </span>
                  <SignOutForm />
                </div>
              ) : (
                <a className="btn btn-primary btn-sm" href="/api/auth/steam">
                  Connect Steam
                </a>
              )}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
