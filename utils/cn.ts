/**
 * Tiny className combiner — joins truthy class strings with a space.
 * Kept dependency-free (no clsx / tailwind-merge) to stay lightweight.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
