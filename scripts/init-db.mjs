import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const relativePath = databaseUrl.replace(/^file:/, "");
const databasePath = path.isAbsolute(relativePath)
  ? relativePath
  : path.resolve(process.cwd(), "prisma", relativePath.replace(/^\.\//, ""));
const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "ExternalAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "profileUrl" TEXT,
    "metadata" TEXT,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "summary" TEXT,
    "coverUrl" TEXT,
    "heroUrl" TEXT,
    "releaseDate" DATETIME,
    "aggregatedRating" REAL,
    "totalRatingCount" INTEGER,
    "genres" TEXT,
    "platforms" TEXT,
    "screenshots" TEXT,
    "websites" TEXT,
    "metadataSource" TEXT,
    "igdbId" INTEGER,
    "igdbSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "GameProviderLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerGameId" TEXT NOT NULL,
    "storeUrl" TEXT,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "UserGameEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "provider" TEXT,
    "externalAccountId" TEXT,
    "platformName" TEXT,
    "playtimeMinutes" INTEGER,
    "notes" TEXT,
    "lastSyncedAt" DATETIME,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("externalAccountId") REFERENCES "ExternalAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "ImportJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "columnMapping" TEXT,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "ImportRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "rawData" TEXT NOT NULL,
    "normalizedTitle" TEXT,
    "platformName" TEXT,
    "statusText" TEXT,
    "playtimeMinutes" INTEGER,
    "notes" TEXT,
    "externalId" TEXT,
    "outcome" TEXT,
    "error" TEXT,
    "matchedGameId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("matchedGameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Game_slug_key" ON "Game"("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "Game_igdbId_key" ON "Game"("igdbId");
  CREATE UNIQUE INDEX IF NOT EXISTS "ExternalAccount_provider_providerAccountId_key" ON "ExternalAccount"("provider", "providerAccountId");
  CREATE UNIQUE INDEX IF NOT EXISTS "GameProviderLink_provider_providerGameId_key" ON "GameProviderLink"("provider", "providerGameId");
  CREATE UNIQUE INDEX IF NOT EXISTS "UserGameEntry_userId_gameId_status_key" ON "UserGameEntry"("userId", "gameId", "status");
  CREATE INDEX IF NOT EXISTS "ExternalAccount_userId_provider_idx" ON "ExternalAccount"("userId", "provider");
  CREATE INDEX IF NOT EXISTS "Game_normalizedName_idx" ON "Game"("normalizedName");
  CREATE INDEX IF NOT EXISTS "GameProviderLink_gameId_idx" ON "GameProviderLink"("gameId");
  CREATE INDEX IF NOT EXISTS "UserGameEntry_userId_status_idx" ON "UserGameEntry"("userId", "status");
  CREATE INDEX IF NOT EXISTS "ImportJob_userId_createdAt_idx" ON "ImportJob"("userId", "createdAt");
  CREATE INDEX IF NOT EXISTS "ImportRow_jobId_rowIndex_idx" ON "ImportRow"("jobId", "rowIndex");
`);

console.log(`Initialized SQLite database at ${databasePath}`);