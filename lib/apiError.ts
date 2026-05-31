/**
 * API error responses — never leak internal details in production.
 */
export function getClientErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : "Failed to fetch bars";
  }
  return "Internal server error";
}

export function logApiError(route: string, error: unknown): void {
  console.error(`[${route}]`, error);
}
