import type { CartItem } from "@/src/frontend/cart/types";

export const COLOMBIA_AREA_CODES = [
  "300", "301", "302", "303", "304", "305", "310", "311", "312", "313",
  "314", "315", "316", "317", "318", "319", "320", "321", "322", "323",
  "324", "333", "350", "351", "601", "602", "604", "605", "606", "607",
  "608", "609", "610", "612", "613", "614", "615", "616", "617", "618",
  "619", "620", "621", "622", "623", "624", "625", "626", "627", "628",
  "629", "630", "631", "632", "633", "634", "635", "636", "637", "638",
  "639", "640", "641", "642", "643", "644", "645", "646", "647", "648",
  "649", "650", "651", "652", "653", "654", "655", "656", "657", "658",
  "659", "660", "661", "662", "663", "664", "665", "666", "667", "668",
  "669", "670", "671", "672", "673", "674", "675", "676", "677", "678",
  "679", "680", "681", "682", "683", "684", "685", "686", "687", "688",
  "689", "690", "691", "692", "693", "694", "695", "696", "697", "698",
  "699",
] as const;

export function isColombianPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return false;
  const area = digits.slice(0, 3);
  return (COLOMBIA_AREA_CODES as readonly string[]).includes(area);
}

export function normalizarWhatsapp(raw: string): string {
  return raw.replace(/\D/g, "");
}

export const METODOS_ENVIO = ["RECOGER", "DOMICILIO", "TRANSPORTADORA"] as const;
export type MetodoEnvioValue = (typeof METODOS_ENVIO)[number];

export const COSTOS_ENVIO_POR_CIUDAD: Record<string, number> = {
  "Medellín": 8000,
  "Envigado": 8000,
  "Itagüí": 8000,
  "Bello": 8000,
  "Sabaneta": 9000,
  "Bogotá": 12000,
  "Cali": 12000,
  "Barranquilla": 15000,
  "Cartagena": 15000,
};

export function calcularCostoEnvio(
  metodo: MetodoEnvioValue,
  ciudad: string,
): number {
  if (metodo === "RECOGER") return 0;
  if (metodo === "TRANSPORTADORA") return 10000;
  return COSTOS_ENVIO_POR_CIUDAD[ciudad] ?? 12000;
}

export interface ResumenWhatsappParams {
  codigo: string;
  nombreCliente: string;
  items: { nombre: string; cantidad: number; precioUnitario: number }[];
  total: number;
  metodoEnvio: string;
}

export function construirMensajeWhatsapp({
  codigo,
  nombreCliente,
  items,
  total,
  metodoEnvio,
}: ResumenWhatsappParams): string {
  const metodoLabel =
    metodoEnvio === "RECOGER"
      ? "Recoger en tienda"
      : metodoEnvio === "DOMICILIO"
        ? "Domicilio"
        : "Transportadora";

  const lineasItems = items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.nombre} x${it.cantidad} - $${it.precioUnitario.toLocaleString("es-CO")} c/u`,
    )
    .join("\n");

  const totalFormateado = total.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  return (
    `*NUEVO PEDIDO ${codigo}*\n\n` +
    `👤 Cliente: ${nombreCliente}\n` +
    `📦 Envío: ${metodoLabel}\n\n` +
    `*Productos:*\n${lineasItems}\n\n` +
    `💰 *Total: ${totalFormateado}*\n\n` +
    `¡Gracias por tu pedido! Te contactaremos pronto para coordinar los detalles.`
  );
}

export function buildWhatsappLink(numeroDestino: string, mensaje: string): string {
  const clean = numeroDestino.replace(/\D/g, "");
  const full = clean.startsWith("57") ? clean : `57${clean}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(mensaje)}`;
}

export function padNumeroPedido(n: number): string {
  return n.toString().padStart(4, "0");
}

export function personalizacionesItemToJson(item: CartItem) {
  return {
    opciones: item.opciones.map((o) => ({
      opcionId: o.opcionId,
      nombre: o.nombre,
      precioExtra: o.precioExtra,
    })),
    personalizaciones: item.personalizaciones.map((p) => ({
      personalizacionId: p.personalizacionId,
      nombre: p.nombre,
      valor: p.valor,
      precioExtra: p.precioExtra,
    })),
  };
}
