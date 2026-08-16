export const STORAGE_BUCKETS = {
  PRODUCTOS: process.env.SUPABASE_BUCKET_PRODUCTOS || "productos",
  PEDIDOS_ARCHIVOS: "pedidos-archivos",
  PEDIDOS_COMPROBANTES: "pedidos-comprobantes",
  PEDIDOS_FACTURAS: "pedidos-facturas",
  PRODUCCION_AVANCES: "produccion-avances",
  CONFIGURACION: "configuracion",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const STORAGE_POLICIES: Record<
  StorageBucket,
  { publico: boolean; descripcion: string }
> = {
  [STORAGE_BUCKETS.PRODUCTOS]: {
    publico: true,
    descripcion: "Imágenes de productos visibles en la tienda.",
  },
  [STORAGE_BUCKETS.PEDIDOS_ARCHIVOS]: {
    publico: false,
    descripcion: "Archivos de referencia y producción del pedido (privado).",
  },
  [STORAGE_BUCKETS.PEDIDOS_COMPROBANTES]: {
    publico: false,
    descripcion: "Comprobantes de pago (privado).",
  },
  [STORAGE_BUCKETS.PEDIDOS_FACTURAS]: {
    publico: false,
    descripcion: "Facturas PDF emitidas (privado).",
  },
  [STORAGE_BUCKETS.PRODUCCION_AVANCES]: {
    publico: true,
    descripcion: "Fotos y videos de avance de producción, visibles al cliente.",
  },
  [STORAGE_BUCKETS.CONFIGURACION]: {
    publico: true,
    descripcion: "Logo y banners del negocio.",
  },
};

export const MB = 1024 * 1024;

export const STORAGE_LIMITS: Record<
  StorageBucket,
  { maxBytes: number; allowedTypes: string[] }
> = {
  [STORAGE_BUCKETS.PRODUCTOS]: {
    maxBytes: 5 * MB,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  [STORAGE_BUCKETS.PEDIDOS_ARCHIVOS]: {
    maxBytes: 10 * MB,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },
  [STORAGE_BUCKETS.PEDIDOS_COMPROBANTES]: {
    maxBytes: 5 * MB,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },
  [STORAGE_BUCKETS.PEDIDOS_FACTURAS]: {
    maxBytes: 10 * MB,
    allowedTypes: ["application/pdf"],
  },
  [STORAGE_BUCKETS.PRODUCCION_AVANCES]: {
    maxBytes: 50 * MB,
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
  },
  [STORAGE_BUCKETS.CONFIGURACION]: {
    maxBytes: 5 * MB,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};
