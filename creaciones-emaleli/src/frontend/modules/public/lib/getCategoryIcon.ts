import {
  Baby,
  Gem,
  Home as HomeIcon,
  Package,
  PartyPopper,
  Shirt,
  SprayCan,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

const KEYWORD_ICONS: { keywords: string[]; icon: ComponentType<{ className?: string }> }[] = [
  { keywords: ["camisa", "camiseta", "ropa", "moda", "vestido", "textil"], icon: Shirt },
  { keywords: ["hogar", "casa", "decor"], icon: HomeIcon },
  { keywords: ["bebe", "niño", "niña", "infantil"], icon: Baby },
  { keywords: ["fiesta", "evento", "celebra"], icon: PartyPopper },
  { keywords: ["belleza", "cuidado", "spray", "aroma"], icon: SprayCan },
  { keywords: ["joya", "accesorio", "bisuteria"], icon: Gem },
  { keywords: ["nuevo", "especial", "personalizad"], icon: Sparkles },
];

export function getCategoryIcon(nombre: string) {
  const normalizado = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const match = KEYWORD_ICONS.find((entry) =>
    entry.keywords.some((k) => normalizado.includes(k)),
  );

  return match?.icon ?? Package;
}
