import type { CartItem } from "./types";

export const CART_STORAGE_KEY = "emaleli:carrito";
const CART_VERSION = 1;
const EXPIRATION_DAYS = 14;

interface StoredCart {
  version: number;
  items: CartItem[];
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as StoredCart;
    if (parsed.version !== CART_VERSION || !Array.isArray(parsed.items)) {
      return [];
    }

    const cutoff = Date.now() - EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
    return parsed.items.filter((item) => item.addedAt >= cutoff);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  const payload: StoredCart = { version: CART_VERSION, items };
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));

  // Cookie liviana (solo el conteo de ítems) para que el servidor pueda
  // leerla en SSR si en el futuro se necesita mostrar el badge del
  // carrito sin esperar la hidratación del cliente.
  const cantidad = items.reduce((sum, item) => sum + item.cantidad, 0);
  document.cookie = `emaleli_cart_count=${cantidad}; path=/; max-age=${
    EXPIRATION_DAYS * 24 * 60 * 60
  }`;
}
