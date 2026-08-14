/**
 * Convierte un texto libre en un slug URL-safe:
 * "Camisetas Oversize #1" -> "camisetas-oversize-1"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes/diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Regex que valida que un slug ya esté en formato correcto (kebab-case). */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
