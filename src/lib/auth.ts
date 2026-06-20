import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Auth mínima pero real para /admin: una contraseña en variable de entorno,
 * verificada del lado servidor, con cookie httpOnly firmada (HMAC-SHA256).
 *
 * No hay password en el cliente ni en el bundle. La cookie no se puede falsificar
 * sin conocer ADMIN_PASSWORD (se usa como clave del HMAC).
 */

export const ADMIN_COOKIE = 'rmp_admin';
const SESSION_DAYS = 7;

function getSecret(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.length < 4) return null;
  return pwd;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/** Crea el valor de la cookie: `<expiraMs>.<firma>`. */
export function createSessionToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const exp = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${exp}.${sign(exp, secret)}`;
}

/** Valida un token de sesión (no expirado y firma correcta). */
export function verifySessionToken(token: string | undefined): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(exp, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Compara la contraseña ingresada con ADMIN_PASSWORD (timing-safe). */
export function checkPassword(input: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** ¿La request actual está autenticada como admin? (lee la cookie httpOnly). */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** ¿Está configurada la contraseña de admin en el entorno? */
export function isAdminConfigured(): boolean {
  return getSecret() !== null;
}
