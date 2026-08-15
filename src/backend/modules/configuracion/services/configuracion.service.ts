import * as repository from "../repositories/configuracion.repository";
import {
  CONFIG_KEYS,
  EmpresaConfigSchema,
  ContactoConfigSchema,
  type EmpresaConfigInput,
  type ContactoConfigInput,
} from "../schemas/configuracion.schema";

const DEFAULT_EMPRESA: EmpresaConfigInput = {
  nombre: "Creaciones Emaleli",
  email: "",
  direccion: "",
  horario: "",
};

const DEFAULT_CONTACTO: ContactoConfigInput = {
  whatsapp: "",
  instagram: "",
  facebook: "",
  mensajeCheckout: "",
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

export async function guardarConfigEmpresa(data: EmpresaConfigInput) {
  return repository.upsertByClave(
    CONFIG_KEYS.EMPRESA,
    data,
    "Datos generales de la empresa (nombre, contacto, horario).",
  );
}

export async function guardarConfigContacto(data: ContactoConfigInput) {
  return repository.upsertByClave(
    CONFIG_KEYS.CONTACTO,
    data,
    "WhatsApp de contacto, redes sociales y mensaje predeterminado del checkout.",
  );
}
