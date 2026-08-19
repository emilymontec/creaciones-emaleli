import { z } from "zod";

/**
 * `z.string().url()` valida que el string sea una URL bien formada, pero
 * NO restringe el esquema — `new URL("javascript:alert(1)")` es una URL
 * válida según el parser WHATWG. Cualquier campo admin-editable que luego
 * se renderiza como `href` (enlaces de rastreo, redes sociales, botones de
 * banner) debe usar este validador en vez de `.url()` a secas, o un
 * usuario con permisos de escritura sobre ese campo podría inyectar un
 * enlace `javascript:` que se ejecuta al hacer clic en el navegador de
 * quien lo abra (típicamente otro administrador con más privilegios).
 */
export const safeHttpUrl = z
  .string()
  .url("URL inválida.")
  .refine(
    (value) => {
      try {
        const protocolo = new URL(value).protocol;
        return protocolo === "http:" || protocolo === "https:";
      } catch {
        return false;
      }
    },
    { message: "Solo se permiten enlaces http:// o https://." },
  );

/** Igual que safeHttpUrl pero también acepta string vacío (campo opcional). */
export const safeHttpUrlOptional = z.union([safeHttpUrl, z.literal("")]);

/**
 * Para campos que aceptan tanto una ruta interna relativa (p. ej.
 * "/catalogo") como una URL externa completa — como el botón del banner
 * del inicio. Rechaza cualquier esquema que no sea http(s) o una ruta que
 * empiece por "/", incluyendo "javascript:", "data:", "//evil.com"
 * (protocol-relative) u otros intentos de bypass.
 */
export const safeLinkPath = z
  .string()
  .max(200)
  .refine(
    (value) => {
      if (value === "") return true;
      if (value.startsWith("//")) return false;
      if (value.startsWith("/")) return true;
      try {
        const protocolo = new URL(value).protocol;
        return protocolo === "http:" || protocolo === "https:";
      } catch {
        return false;
      }
    },
    { message: "Usa una ruta interna (/catalogo) o un enlace http(s) válido." },
  );
