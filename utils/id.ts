/**
 * Generate a reasonably-unique id. Uses crypto.randomUUID when available,
 * with a timestamp+random fallback for older environments.
 */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}
