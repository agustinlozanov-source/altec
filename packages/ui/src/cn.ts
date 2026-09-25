export type ClassValue = string | false | null | undefined;

/** Une clases descartando falsos. Sin dependencias. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
