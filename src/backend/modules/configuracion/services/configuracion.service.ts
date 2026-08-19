import * as repository from "../repositories/configuracion.repository";
import {
  CONFIG_KEYS,
  EmpresaConfigSchema,
  ContactoConfigSchema,
  FaqConfigSchema,
  BannerConfigSchema,
  type EmpresaConfigInput,
  type ContactoConfigInput,
  type FaqConfigInput,
  type BannerConfigInput,
} from "../schemas/configuracion.schema";

const DEFAULT_EMPRESA: EmpresaConfigInput = {
  nombre: "Creaciones Emaleli",
  email: "",
  direccion: "",
  horario: "",
  logoUrl: "",
};

const DEFAULT_CONTACTO: ContactoConfigInput = {
  whatsapp: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  mensajeConsultaGeneral: "",
  mensajeSeguimiento: "",
  mensajeCheckout: "",
};

const DEFAULT_FAQ: FaqConfigInput = { items: [] };

const DEFAULT_BANNER: BannerConfigInput = {
  activo: false,
  titulo: "",
  subtitulo: "",
  imagenUrl: "",
  textoBoton: "",
  linkBoton: "",
};

export async function obtenerConfigEmpresa(): Promise<EmpresaConfigInput> {
  const row = await repository.findByClave(CONFIG_KEYS.EMPRESA);
  if (!row) return DEFAULT_EMPRESA;

  const parsed = EmpresaConfigSchema.safeParse(row.valor);
  return parsed.success ? parsed.data : DEFAULT_EMPRESA;
}

export async function obtenerConfigContacto(): Promise<ContactoConfigInput> {
  const row = await repository.findByClave(CONFIG_KEYS.CONTACTO);
  if (!row) return DEFAULT_CONTACTO;

  const parsed = ContactoConfigSchema.safeParse(row.valor);
  return parsed.success ? parsed.data : DEFAULT_CONTACTO;
}

export async function obtenerConfigFaq(): Promise<FaqConfigInput> {
  const row = await repository.findByClave(CONFIG_KEYS.FAQ);
  if (!row) return DEFAULT_FAQ;

  const parsed = FaqConfigSchema.safeParse(row.valor);
  return parsed.success ? parsed.data : DEFAULT_FAQ;
}

export async function obtenerConfigBanner(): Promise<BannerConfigInput> {
  const row = await repository.findByClave(CONFIG_KEYS.BANNER);
  if (!row) return DEFAULT_BANNER;

  const parsed = BannerConfigSchema.safeParse(row.valor);
  return parsed.success ? parsed.data : DEFAULT_BANNER;
}

export async function guardarConfigEmpresa(data: EmpresaConfigInput) {
  return repository.upsertByClave(
    CONFIG_KEYS.EMPRESA,
    data,
    "Datos generales de la empresa (nombre, contacto, horario, logo).",
  );
}

export async function guardarConfigContacto(data: ContactoConfigInput) {
  return repository.upsertByClave(
    CONFIG_KEYS.CONTACTO,
    data,
    "WhatsApp de contacto, redes sociales y mensajes predeterminados por contexto.",
  );
}

export async function guardarConfigFaq(data: FaqConfigInput) {
  return repository.upsertByClave(
    CONFIG_KEYS.FAQ,
    data,
    "Preguntas frecuentes mostradas en la tienda pública.",
  );
}

export async function guardarConfigBanner(data: BannerConfigInput) {
  return repository.upsertByClave(
    CONFIG_KEYS.BANNER,
    data,
    "Banner destacado opcional del inicio de la tienda pública.",
  );
}
