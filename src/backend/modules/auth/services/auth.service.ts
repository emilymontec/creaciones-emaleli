import type { SessionUser } from "../types/session";
import { verifyPassword, hashPassword } from "../lib/password";
import {
  findByEmail,
  findByNombre,
  findByUsername,
  findById,
  actualizarPerfil,
  actualizarPassword,
} from "../repositories/usuario.repository";
import type {
  PerfilUpdateInput,
  PasswordChangeInput,
} from "../schemas/perfil.schema";
import { AppError } from "@/src/shared/lib/errors";
import type { Rol } from "@/src/shared/constants/permissions";

export async function authenticate(
  usuario: string,
  password: string,
): Promise<SessionUser | null> {
  const account =
    (await findByEmail(usuario)) ??
    (await findByUsername(usuario)) ??
    (await findByNombre(usuario));

  if (!account || !account.activo) {
    return null;
  }

  const passwordOk = await verifyPassword(password, account.passwordHash);

  if (!passwordOk) {
    return null;
  }

  return {
    sub: account.id,
    nombre: account.nombre,
    email: account.email,
    rol: account.rol as Rol,
  };
}

export async function obtenerPerfilCompleto(id: string) {
  const usuario = await findById(id);
  if (!usuario) {
    throw new AppError("Usuario no encontrado.", {
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  }
  // Se excluye passwordHash deliberadamente: nunca debe salir del backend.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...perfil } = usuario;
  return perfil;
}

export async function actualizarPerfilUsuario(
  id: string,
  input: PerfilUpdateInput,
) {
  const [existingByUser, existingByEmail] = await Promise.all([
    input.username
      ? findByUsername(input.username).then((u) =>
          u && u.id !== id ? u : null,
        )
      : Promise.resolve(null),
    input.email
      ? findByEmail(input.email).then((u) => (u && u.id !== id ? u : null))
      : Promise.resolve(null),
  ]);

  if (existingByUser) {
    throw new AppError("Este nombre de usuario ya está en uso.", {
      statusCode: 409,
      code: "USERNAME_TAKEN",
    });
  }

  if (existingByEmail) {
    throw new AppError("Este correo ya está registrado.", {
      statusCode: 409,
      code: "EMAIL_TAKEN",
    });
  }

  return actualizarPerfil(id, input);
}

export async function cambiarPasswordUsuario(
  id: string,
  input: PasswordChangeInput,
) {
  const usuario = await findById(id);
  if (!usuario) {
    throw new AppError("Usuario no encontrado.", {
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
  }

  const actualOk = await verifyPassword(
    input.passwordActual,
    usuario.passwordHash,
  );
  if (!actualOk) {
    throw new AppError("La contraseña actual es incorrecta.", {
      statusCode: 400,
      code: "WRONG_PASSWORD",
    });
  }

  const nuevoHash = await hashPassword(input.passwordNueva);
  return actualizarPassword(id, nuevoHash);
}
