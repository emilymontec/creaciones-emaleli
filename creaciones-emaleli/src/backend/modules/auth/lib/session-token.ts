import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "../types/session";

export const SESSION_COOKIE = "emaleli_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const SESSION_ISSUER = "emaleli";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET no configurada.");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ nombre: user.nombre, email: user.email, rol: user.rol })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setSubject(user.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: SESSION_ISSUER,
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.nombre !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.rol !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol as SessionUser["rol"],
    };
  } catch {
    return null;
  }
}
