import { z } from "zod";
import type { CartItem } from "@/src/frontend/cart/types";
import { isColombianPhone } from "@/src/shared/lib/checkout";

export const ClienteSchema = z.object({
  nombreCompleto: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede superar los 150 caracteres")
    .regex(/^[^\d]+$/, "El nombre no puede contener números"),

  whatsapp: z
    .string()
    .min(1, "El número de WhatsApp es obligatorio")
    .refine(isColombianPhone, "Formato inválido. Ej: 300 123 4567"),

  ciudad: z
    .string()
    .min(2, "La ciudad es obligatoria")
    .max(100, "La ciudad no puede superar los 100 caracteres"),

  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo electrónico inválido")
    .max(254),

  empresa: z
    .string()
    .max(150, "El nombre de empresa no puede superar los 150 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ClienteInput = z.infer<typeof ClienteSchema>;

export const EnvioSchema = z.discriminatedUnion("metodo", [
  z.object({
    metodo: z.literal("RECOGER"),
  }),
  z.object({
    metodo: z.literal("DOMICILIO"),
    direccion: z
      .string()
      .min(5, "La dirección es obligatoria")
      .max(255, "La dirección no puede superar los 255 caracteres"),
    destinatario: z
      .string()
      .min(3, "Nombre del destinatario obligatorio")
      .max(150, "Destinatario no puede superar 150 caracteres"),
    telefono: z
      .string()
      .min(1, "El teléfono de contacto es obligatorio")
      .refine(isColombianPhone, "Formato inválido. Ej: 300 123 4567"),
  }),
  z.object({
    metodo: z.literal("TRANSPORTADORA"),
    direccion: z
      .string()
      .min(5, "La dirección es obligatoria")
      .max(255, "La dirección no puede superar los 255 caracteres"),
    destinatario: z
      .string()
      .min(3, "Nombre del destinatario obligatorio")
      .max(150, "Destinatario no puede superar 150 caracteres"),
    telefono: z
      .string()
      .min(1, "El teléfono de contacto es obligatorio")
      .refine(isColombianPhone, "Formato inválido. Ej: 300 123 4567"),
    documento: z
      .string()
      .min(5, "El número de documento es obligatorio para transportadora")
      .max(20, "Documento no puede superar 20 caracteres"),
  }),
]);

export type EnvioInput = z.infer<typeof EnvioSchema>;

export const CheckoutSchema = z
  .object({
    cliente: ClienteSchema,
    observaciones: z
      .string()
      .max(2000, "Las observaciones no pueden superar los 2000 caracteres")
      .optional()
      .or(z.literal("")),
    envio: EnvioSchema,
    costoEnvio: z.coerce.number().nonnegative("El costo de envío no puede ser negativo"),
    items: z.array(z.custom<CartItem>()).min(1, "El carrito está vacío"),
  });

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
