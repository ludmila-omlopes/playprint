export function getDatabaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Environment variable not found: DATABASE_URL")) {
    return "Database is not configured. Set DATABASE_URL in the deployment environment.";
  }

  if (
    message.includes("no such table") ||
    message.includes("does not exist in the current database") ||
    message.includes("P2021")
  ) {
    return "Database schema is not initialized. Run the database setup before using catalog features.";
  }

  if (
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection") ||
    message.includes("P1001") ||
    message.includes("P2024")
  ) {
    return "Database is unavailable. Check the production database connection and retry.";
  }

  return "Database is unavailable. Check the deployment database configuration.";
}
