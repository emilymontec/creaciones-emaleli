"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import {
  EmpresaConfigSchema,
  ContactoConfigSchema,
  FaqConfigSchema,
  BannerConfigSchema,
} from "../schemas/configuracion.schema";
import {
  guardarConfigEmpresa,
  guardarConfigContacto,
  guardarConfigFaq,
  guardarConfigBanner,
  obtenerConfigEmpresa,
  obtenerConfigFaq,
  obtenerConfigBanner,
} from "../services/configuracion.service";
import { toErrorMessage } from "@/src/shared/lib/errors";
import { requireAdmin } from "@/src/backend/shared/require-admin";
import { PERMISOS } from "@/src/shared/constants/permissions";
import {
  getOptionalFile,
  uploadConfigImage,
  deleteConfigImageByUrl,
} from "@/src/backend/shared/uploadEntityImage";
import { registrarAuditoria } from "@/src/backend/shared/audit-log";

export type ConfiguracionFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const initialState: ConfiguracionFormState = { success: false };

export async function guardarEmpresaAction(
  _prevState: ConfiguracionFormState,
  formData: FormData,
): Promise<ConfiguracionFormState> {
  const user = await requireAdmin(PERMISOS.CONFIGURACION_GESTIONAR);

  const actual = await obtenerConfigEmpresa();
  const logoFile = getOptionalFile(formData, "logoArchivo");
  const eliminarLogo = formData.get("eliminarLogo") === "true";

  let logoUrl = actual.logoUrl || "";
  if (logoFile) {
    logoUrl = await uploadConfigImage("empresa-logo", logoFile);
  } else if (eliminarLogo) {
    logoUrl = "";
  }

  const result = EmpresaConfigSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email") || "",
    direccion: formData.get("direccion") || "",
    horario: formData.get("horario") || "",
    logoUrl,
  });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    // Si se subió un logo nuevo o se eliminó, se borra el anterior del
    // storage para no dejar archivos huérfanos.
    if (
      (logoFile || eliminarLogo) &&
      actual.logoUrl &&
      actual.logoUrl !== logoUrl
    ) {
      await deleteConfigImageByUrl(actual.logoUrl);
    }

    await guardarConfigEmpresa(result.data);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: "CONFIGURACION_EMPRESA_ACTUALIZADA",
      entidad: "Configuracion",
      entidadId: "empresa",
    });
    revalidatePath("/admin/configuracion");
    revalidatePath("/", "layout");
    return { success: true, message: "Datos de la empresa actualizados." };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function guardarContactoAction(
  _prevState: ConfiguracionFormState,
  formData: FormData,
): Promise<ConfiguracionFormState> {
  const user = await requireAdmin(PERMISOS.CONFIGURACION_GESTIONAR);

  const result = ContactoConfigSchema.safeParse({
    whatsapp: formData.get("whatsapp") || "",
    instagram: formData.get("instagram") || "",
    facebook: formData.get("facebook") || "",
    tiktok: formData.get("tiktok") || "",
    mensajeConsultaGeneral: formData.get("mensajeConsultaGeneral") || "",
    mensajeSeguimiento: formData.get("mensajeSeguimiento") || "",
    mensajeCheckout: formData.get("mensajeCheckout") || "",
  });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await guardarConfigContacto(result.data);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: "CONFIGURACION_CONTACTO_ACTUALIZADA",
      entidad: "Configuracion",
      entidadId: "contacto",
    });
    revalidatePath("/admin/configuracion");
    revalidatePath("/", "layout");
    return {
      success: true,
      message: "WhatsApp y redes sociales actualizados.",
    };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function guardarFaqAction(
  _prevState: ConfiguracionFormState,
  formData: FormData,
): Promise<ConfiguracionFormState> {
  const user = await requireAdmin(PERMISOS.CONFIGURACION_GESTIONAR);

  const actual = await obtenerConfigFaq();
  const accion = String(formData.get("accion") || "");

  let items = actual.items;

  if (accion === "agregar") {
    const pregunta = String(formData.get("pregunta") || "").trim();
    const respuesta = String(formData.get("respuesta") || "").trim();
    items = [...items, { id: randomUUID(), pregunta, respuesta }];
  } else if (accion === "eliminar") {
    const id = String(formData.get("id") || "");
    items = items.filter((item) => item.id !== id);
  } else if (accion === "reordenar") {
    const idsRaw = String(formData.get("ids") || "");
    const ids = idsRaw.split(",").filter(Boolean);
    items = ids
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is (typeof items)[number] => Boolean(item));
  }

  const result = FaqConfigSchema.safeParse({ items });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await guardarConfigFaq(result.data);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: `CONFIGURACION_FAQ_${accion.toUpperCase() || "ACTUALIZADA"}`,
      entidad: "Configuracion",
      entidadId: "faq",
    });
    revalidatePath("/admin/configuracion");
    revalidatePath("/");
    return { success: true, message: "Preguntas frecuentes actualizadas." };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export async function guardarBannerAction(
  _prevState: ConfiguracionFormState,
  formData: FormData,
): Promise<ConfiguracionFormState> {
  const user = await requireAdmin(PERMISOS.CONFIGURACION_GESTIONAR);

  const actual = await obtenerConfigBanner();
  const imagenFile = getOptionalFile(formData, "imagenArchivo");
  const eliminarImagen = formData.get("eliminarImagen") === "true";

  let imagenUrl = actual.imagenUrl || "";
  if (imagenFile) {
    imagenUrl = await uploadConfigImage("banner-inicio", imagenFile);
  } else if (eliminarImagen) {
    imagenUrl = "";
  }

  const result = BannerConfigSchema.safeParse({
    activo: formData.get("activo") === "on",
    titulo: formData.get("titulo") || "",
    subtitulo: formData.get("subtitulo") || "",
    imagenUrl,
    textoBoton: formData.get("textoBoton") || "",
    linkBoton: formData.get("linkBoton") || "",
  });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    if (
      (imagenFile || eliminarImagen) &&
      actual.imagenUrl &&
      actual.imagenUrl !== imagenUrl
    ) {
      await deleteConfigImageByUrl(actual.imagenUrl);
    }

    await guardarConfigBanner(result.data);
    await registrarAuditoria({
      usuarioId: user.sub,
      usuarioNombre: user.nombre,
      accion: "CONFIGURACION_BANNER_ACTUALIZADO",
      entidad: "Configuracion",
      entidadId: "banner",
    });
    revalidatePath("/admin/configuracion");
    revalidatePath("/");
    return { success: true, message: "Banner del inicio actualizado." };
  } catch (error) {
    return { success: false, message: toErrorMessage(error) };
  }
}

export { initialState as configuracionInitialState };
