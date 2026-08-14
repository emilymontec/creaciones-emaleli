"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, NewCartItem } from "./types";
import { CART_STORAGE_KEY, loadCart, saveCart } from "./cart-storage";

interface CartContextValue {
  items: CartItem[];
  isReady: boolean;
  addItem: (item: NewCartItem) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  tiempoProduccionMax: number | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Dos líneas son "la misma" si el producto, la combinación y las
 * personalizaciones elegidas coinciden: en ese caso solo sumamos cantidad
 * en vez de crear una línea duplicada. */
function mismaConfiguracion(a: NewCartItem, b: CartItem): boolean {
  if (a.productoId !== b.productoId) return false;
  if ((a.combinacionId ?? null) !== (b.combinacionId ?? null)) return false;

  const opcionesA = [...a.opciones.map((o) => o.opcionId)].sort();
  const opcionesB = [...b.opciones.map((o) => o.opcionId)].sort();
  if (opcionesA.join(",") !== opcionesB.join(",")) return false;

  const persA = [...a.personalizaciones]
    .sort((x, y) => x.personalizacionId.localeCompare(y.personalizacionId))
    .map((p) => `${p.personalizacionId}:${p.valor}`)
    .join("|");
  const persB = [...b.personalizaciones]
    .sort((x, y) => x.personalizacionId.localeCompare(y.personalizacionId))
    .map((p) => `${p.personalizacionId}:${p.valor}`)
    .join("|");

  return persA === persB;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Carga inicial (solo en cliente: localStorage no existe en el servidor,
  // así que no se puede leer durante el render sin causar un mismatch de
  // hidratación). Es una sincronización única desde un sistema externo, el
  // caso de uso que un efecto sí debe cubrir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadCart());
    setIsReady(true);
  }, []);

  // Persiste en cada cambio, una vez ya cargamos el estado inicial (evita
  // sobrescribir el carrito guardado con un arreglo vacío en el primer render).
  useEffect(() => {
    if (!isReady) return;
    saveCart(items);
  }, [items, isReady]);

  // Sincronización entre pestañas: otra pestaña escribió en localStorage.
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === CART_STORAGE_KEY) {
        setItems(loadCart());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addItem = useCallback((newItem: NewCartItem) => {
    setItems((prev) => {
      const existente = prev.find((i) => mismaConfiguracion(newItem, i));
      if (existente) {
        return prev.map((i) =>
          i.id === existente.id
            ? { ...i, cantidad: i.cantidad + newItem.cantidad }
            : i,
        );
      }
      const item: CartItem = {
        ...newItem,
        id: crypto.randomUUID(),
        addedAt: Date.now(),
      };
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((id: string, cantidad: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i,
      ),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.cantidad, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0),
    [items],
  );

  const tiempoProduccionMax = useMemo(() => {
    const tiempos = items
      .map((i) => i.tiempoProduccion)
      .filter((t): t is number => t !== null);
    return tiempos.length > 0 ? Math.max(...tiempos) : null;
  }, [items]);

  const value: CartContextValue = {
    items,
    isReady,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    totalItems,
    subtotal,
    tiempoProduccionMax,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
